import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"
import { PORTFOLIO_BUCKET, PORTFOLIO_DISPLAY_LIMIT, normalizeUploadItem } from "@/lib/portfolio/portfolio-service"

export const runtime = "nodejs"

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
}

function safeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
  return `${crypto.randomUUID()}.${extension.slice(0, 8)}`
}

function getPublicUrls(supabase: any, path: string) {
  const { data } = supabase.storage.from(PORTFOLIO_BUCKET).getPublicUrl(path)
  const publicUrl = data.publicUrl
  return {
    imageUrl: publicUrl,
    thumbnailUrl: `${publicUrl}?width=600&height=600&resize=cover&quality=75`,
  }
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

  const { count, error: countError } = await supabase
    .from("portfolio_uploads")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "visible")

  if (countError) return apiError(countError.message, 500, "PORTFOLIO_UPLOAD_COUNT_FAILED")
  if ((count || 0) >= PORTFOLIO_DISPLAY_LIMIT) {
    return apiError(`You can feature up to ${PORTFOLIO_DISPLAY_LIMIT} portfolio images.`, 400, "PORTFOLIO_UPLOAD_LIMIT_REACHED")
  }

  const storagePath = `${user.id}/${safeFileName(file.name)}`
  const { error: uploadError } = await supabase.storage.from(PORTFOLIO_BUCKET).upload(storagePath, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  })

  if (uploadError) return apiError(uploadError.message, 500, "PORTFOLIO_STORAGE_UPLOAD_FAILED")

  const { imageUrl, thumbnailUrl } = getPublicUrls(supabase, storagePath)
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
    await supabase.storage.from(PORTFOLIO_BUCKET).remove([storagePath])
    return apiError(error.message, 500, "PORTFOLIO_UPLOAD_CREATE_FAILED")
  }

  await supabase.from("user_profiles").update({ portfolio_source: "upload" }).eq("user_id", user.id)

  return NextResponse.json({ item: normalizeUploadItem(data) }, { status: 201 })
}
