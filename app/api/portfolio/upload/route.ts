import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"
import { getPortfolioItemCount, getPortfolioUploadLimit, normalizeUploadItem } from "@/lib/portfolio/portfolio-service"
import { isR2Configured } from "@/lib/r2/client"
import { deleteFromR2, uploadToR2 } from "@/lib/r2/storage"

export const runtime = "nodejs"

function safeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
  return `${crypto.randomUUID()}.${extension.slice(0, 8)}`
}

export async function POST(request: Request) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const formData = await request.formData().catch(() => null)
  if (!formData) return apiError("Upload a portfolio image", 400, "PORTFOLIO_UPLOAD_INVALID_FORM")

  const file = formData.get("file")
  if (!(file instanceof File)) return apiError("Choose an image to upload", 400, "PORTFOLIO_UPLOAD_MISSING_FILE")
  if (!file.type.startsWith("image/")) return apiError("Portfolio uploads must be images", 400, "PORTFOLIO_UPLOAD_INVALID_TYPE")
  if (file.size > 8 * 1024 * 1024) return apiError("Portfolio images must be smaller than 8MB", 400, "PORTFOLIO_UPLOAD_TOO_LARGE")

  const { data: profileRow } = await supabase
    .from("user_profiles")
    .select("account_type")
    .eq("user_id", user.id)
    .maybeSingle()
  const uploadLimit = getPortfolioUploadLimit(profileRow?.account_type)

  const count = await getPortfolioItemCount(supabase, user.id)
  if (count >= uploadLimit) {
    return apiError(`You can feature up to ${uploadLimit} portfolio images.`, 400, "PORTFOLIO_UPLOAD_LIMIT_REACHED")
  }

  if (!isR2Configured()) return apiError("Storage is not configured", 500, "PORTFOLIO_STORAGE_NOT_CONFIGURED")

  const storagePath = `portfolio/${user.id}/${safeFileName(file.name)}`
  const buffer = Buffer.from(await file.arrayBuffer())

  let imageUrl: string
  try {
    imageUrl = await uploadToR2(storagePath, buffer, file.type)
  } catch (uploadError: any) {
    return apiError(uploadError?.message || "Upload failed", 500, "PORTFOLIO_STORAGE_UPLOAD_FAILED")
  }

  // R2 alone doesn't do on-the-fly resizing (that's the separate Cloudflare
  // Images product), so the thumbnail is the same file as the full image
  // for now - next/image still handles responsive sizing/lazy-loading
  // client-side.
  const thumbnailUrl = imageUrl

  const { data, error } = await supabase
    .from("portfolio_uploads")
    .insert({
      user_id: user.id,
      storage_path: storagePath,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
      title: sanitizeText(formData.get("title"), 120) || null,
      description: sanitizeText(formData.get("description"), 500) || null,
      media_type: "image",
      source: "upload",
      status: "visible",
      sort_order: Number.isFinite(Number(formData.get("sort_order"))) ? Number(formData.get("sort_order")) : count || 0,
    })
    .select("*")
    .single()

  if (error) {
    await deleteFromR2([storagePath]).catch(() => null)
    return apiError(error.message, 500, "PORTFOLIO_UPLOAD_CREATE_FAILED")
  }

  await supabase.from("user_profiles").update({ portfolio_source: "upload" }).eq("user_id", user.id)

  return NextResponse.json({ item: normalizeUploadItem(data) }, { status: 201 })
}
