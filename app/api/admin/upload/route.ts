import { NextResponse } from "next/server"
import { getAdminContext, writeAdminActivity } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

const ADMIN_ASSET_BUCKET = "admin-assets"

function safeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase() || "jpg"
  const base = name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)

  return `${base || "snapscout-admin-asset"}-${Date.now()}.${extension}`
}

export async function POST(request: Request) {
  const { supabase, user } = await getAdminContext()
  const formData = await request.formData()
  const file = formData.get("file")
  const resource = String(formData.get("resource") || "admin")
  const field = String(formData.get("field") || "image")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 })
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Admin advert assets must be images." }, { status: 400 })
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Please upload an image smaller than 8 MB." }, { status: 400 })
  }

  const path = `${user.id}/${resource}/${field}/${safeFileName(file.name)}`
  const { error: uploadError } = await supabase.storage.from(ADMIN_ASSET_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = supabase.storage.from(ADMIN_ASSET_BUCKET).getPublicUrl(path)

  await writeAdminActivity(supabase, user.id, "uploaded admin image", "storage.objects", null, {
    bucket: ADMIN_ASSET_BUCKET,
    path,
    resource,
    field,
  })

  return NextResponse.json({ url: data.publicUrl, path })
}
