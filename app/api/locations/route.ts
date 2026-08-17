import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"
import { createServerClient } from "@/lib/supabase/server"
import { isR2Configured } from "@/lib/r2/client"
import { uploadToR2 } from "@/lib/r2/storage"

export const runtime = "nodejs"

function safeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
  return `${crypto.randomUUID()}.${extension.slice(0, 8)}`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")
  const category = searchParams.get("category")

  const supabase = await createServerClient()

  let query = supabase
    .from("shoot_locations")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (city) query = query.eq("city", city)
  if (category) query = query.eq("location_type", category)

  const { data, error } = await query
  if (error) return apiError(error.message, 500, "LOCATIONS_LOAD_FAILED")

  return NextResponse.json({ locations: data || [] })
}

export async function POST(request: Request) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context
  const { supabase, user } = context

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  if (!subscription) {
    return apiError("An active subscription is required to list a shoot location", 403, "SUBSCRIPTION_REQUIRED")
  }

  const formData = await request.formData().catch(() => null)
  if (!formData) return apiError("Invalid form submission", 400, "LOCATION_INVALID_FORM")

  const name = sanitizeText(formData.get("name"), 120)
  const city = sanitizeText(formData.get("city"), 80)
  const province = sanitizeText(formData.get("province"), 80)
  if (!name || !city || !province) {
    return apiError("Name, city, and province are required", 400, "LOCATION_MISSING_FIELDS")
  }

  const photoFiles = formData.getAll("photos").filter((item): item is File => item instanceof File)
  let galleryUrls: string[] = []

  if (photoFiles.length) {
    if (!isR2Configured()) return apiError("Storage is not configured", 500, "LOCATION_STORAGE_NOT_CONFIGURED")

    try {
      galleryUrls = await Promise.all(
        photoFiles.slice(0, 10).map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer())
          const storagePath = `locations/${user.id}/${safeFileName(file.name)}`
          return uploadToR2(storagePath, buffer, file.type || "image/jpeg")
        }),
      )
    } catch (uploadError: any) {
      return apiError(uploadError?.message || "Photo upload failed", 500, "LOCATION_PHOTO_UPLOAD_FAILED")
    }
  }

  const payload = {
    created_by: user.id,
    name,
    city,
    province,
    address: sanitizeText(formData.get("address"), 200) || null,
    description: sanitizeText(formData.get("description"), 2000) || null,
    location_type: sanitizeText(formData.get("location_type"), 60) || "Studio",
    safety_rating: sanitizeText(formData.get("safety_rating"), 20) || "Medium",
    security_level: sanitizeText(formData.get("security_level"), 40) || "Standard",
    best_shooting_times: sanitizeText(formData.get("best_shooting_times"), 40) || "Morning",
    parking_availability: sanitizeText(formData.get("parking_availability"), 40) || "Limited",
    crowd_levels: sanitizeText(formData.get("crowd_levels"), 40) || "Moderate",
    indoor_outdoor: sanitizeText(formData.get("indoor_outdoor"), 20) || "Indoor",
    permit_required: formData.get("permit_required") === "true",
    access_rules: sanitizeText(formData.get("access_rules"), 200) || null,
    cover_image_url: galleryUrls[0] || null,
    gallery_image_urls: galleryUrls,
    status: "published",
  }

  const { data, error } = await supabase.from("shoot_locations").insert(payload).select("*").single()
  if (error) return apiError(error.message, 500, "LOCATION_CREATE_FAILED")

  return NextResponse.json({ location: data }, { status: 201 })
}
