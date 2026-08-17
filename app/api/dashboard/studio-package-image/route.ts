import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"
import { isR2Configured } from "@/lib/r2/client"
import { uploadToR2 } from "@/lib/r2/storage"

export const runtime = "nodejs"

function safeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
  return `${crypto.randomUUID()}.${extension.slice(0, 8)}`
}

export async function POST(request: Request) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context
  const { user } = context

  const formData = await request.formData().catch(() => null)
  if (!formData) return apiError("Upload a room image", 400, "STUDIO_PACKAGE_IMAGE_INVALID_FORM")

  const file = formData.get("file")
  if (!(file instanceof File)) return apiError("Choose an image to upload", 400, "STUDIO_PACKAGE_IMAGE_MISSING_FILE")
  if (!file.type.startsWith("image/")) return apiError("Room images must be images", 400, "STUDIO_PACKAGE_IMAGE_INVALID_TYPE")
  if (file.size > 8 * 1024 * 1024) return apiError("Images must be smaller than 8MB", 400, "STUDIO_PACKAGE_IMAGE_TOO_LARGE")

  if (!isR2Configured()) return apiError("Storage is not configured", 500, "STUDIO_PACKAGE_IMAGE_STORAGE_NOT_CONFIGURED")

  const storagePath = `studio-packages/${user.id}/${safeFileName(file.name)}`
  const buffer = Buffer.from(await file.arrayBuffer())

  let imageUrl: string
  try {
    imageUrl = await uploadToR2(storagePath, buffer, file.type)
  } catch (uploadError: any) {
    return apiError(uploadError?.message || "Upload failed", 500, "STUDIO_PACKAGE_IMAGE_UPLOAD_FAILED")
  }

  return NextResponse.json({ url: imageUrl }, { status: 201 })
}
