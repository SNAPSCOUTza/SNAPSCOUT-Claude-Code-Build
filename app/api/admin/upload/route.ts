import { NextResponse } from "next/server"
import { getAdminContext, writeAdminActivity } from "@/lib/admin/server"
import { isR2Configured } from "@/lib/r2/client"
import { uploadToR2 } from "@/lib/r2/storage"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function safeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
  return `${crypto.randomUUID()}.${extension.slice(0, 8)}`
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

  if (!isR2Configured()) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 500 })
  }

  const path = `admin/${resource}/${field}/${safeFileName(file.name)}`
  const buffer = Buffer.from(await file.arrayBuffer())

  let url: string
  try {
    url = await uploadToR2(path, buffer, file.type)
  } catch (uploadError: any) {
    return NextResponse.json({ error: uploadError?.message || "Upload failed" }, { status: 500 })
  }

  await writeAdminActivity(supabase, user.id, "uploaded admin image", "r2.objects", null, {
    path,
    resource,
    field,
  })

  return NextResponse.json({ url, path })
}
