import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"
import { isR2Configured } from "@/lib/r2/client"
import { uploadToR2 } from "@/lib/r2/storage"

export const runtime = "nodejs"

function safeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
  return `${crypto.randomUUID()}.${extension.slice(0, 8)}`
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context
  const { supabase, user } = context

  const formData = await request.formData().catch(() => null)
  if (!formData) return apiError("Upload a photo", 400, "LOCATION_PHOTO_INVALID_FORM")

  const file = formData.get("file")
  if (!(file instanceof File)) return apiError("Choose an image to upload", 400, "LOCATION_PHOTO_MISSING_FILE")
  if (!file.type.startsWith("image/")) return apiError("Only images can be shared here", 400, "LOCATION_PHOTO_INVALID_TYPE")
  if (file.size > 8 * 1024 * 1024) return apiError("Photos must be smaller than 8MB", 400, "LOCATION_PHOTO_TOO_LARGE")

  if (!isR2Configured()) return apiError("Storage is not configured", 500, "LOCATION_PHOTO_STORAGE_NOT_CONFIGURED")

  const storagePath = `locations/${params.id}/photos/${safeFileName(file.name)}`
  const buffer = Buffer.from(await file.arrayBuffer())

  let imageUrl: string
  try {
    imageUrl = await uploadToR2(storagePath, buffer, file.type)
  } catch (uploadError: any) {
    return apiError(uploadError?.message || "Upload failed", 500, "LOCATION_PHOTO_UPLOAD_FAILED")
  }

  const { data, error } = await supabase
    .from("shoot_location_photos")
    .insert({
      location_id: params.id,
      uploaded_by: user.id,
      image_url: imageUrl,
      caption: sanitizeText(formData.get("caption"), 300) || null,
      shot_at: sanitizeText(formData.get("shot_at"), 60) || null,
    })
    .select("*")
    .single()

  if (error) return apiError(error.message, 500, "LOCATION_PHOTO_SAVE_FAILED")

  return NextResponse.json({ photo: data }, { status: 201 })
}
