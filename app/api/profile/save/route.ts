import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"
import { normalizeProfile, normalizeSocialLinks } from "@/lib/profile-normalization"
import { sanitizeOptionalUrl, sanitizeSingleLineInput, sanitizeTextArray, sanitizeTextInput } from "@/lib/utils/sanitize"

const emptyToNull = (value: any) => {
  if (value === undefined || value === null) return null
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed ? trimmed : null
  }
  return value
}

const rateToNumber = (value: any) => {
  const cleaned = typeof value === "string" ? value.replace(/[^\d.-]/g, "") : value
  if (cleaned === undefined || cleaned === null || cleaned === "") return null
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

const asTextArray = (value: any) => {
  return sanitizeTextArray(value)
}

const getMissingColumn = (message = "") => {
  return (
    message.match(/Could not find the '([^']+)' column/)?.[1] ||
    message.match(/column "([^"]+)"/)?.[1] ||
    null
  )
}

async function upsertProfile(profileClient: any, payload: Record<string, any>) {
  const dataToUpsert = { ...payload }
  let lastError: any = null

  for (let attempt = 0; attempt < 12; attempt++) {
    const { data, error } = await profileClient
      .from("user_profiles")
      .upsert(dataToUpsert, { onConflict: "user_id" })
      .select("*")
      .single()

    if (!error) return { data, error: null }

    lastError = error
    const missingColumn = getMissingColumn(error.message)
    if (!missingColumn || !(missingColumn in dataToUpsert)) break

    console.warn(`[v0] Profile save retrying without missing column: ${missingColumn}`)
    delete dataToUpsert[missingColumn]
  }

  return { data: null, error: lastError }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const profileData = typeof body === "object" && body !== null ? body : {}
    console.log("[v0] Profile save request received for user:", profileData.id || profileData.user_id)

    // Verify the user is authenticated
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      },
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] Profile save - auth error:", authError)
      return NextResponse.json({ error: "Unauthorized - please sign in" }, { status: 401 })
    }

    console.log("[v0] Authenticated user:", user.id)

    // Ensure the profile owner matches the authenticated user when ids are provided.
    const incomingOwnerId = profileData.user_id || profileData.id
    if (incomingOwnerId && incomingOwnerId !== user.id) {
      console.error("[v0] Profile save - owner mismatch:", incomingOwnerId, "vs", user.id)
      return NextResponse.json({ error: "You can only update your own profile" }, { status: 403 })
    }

    const socialLinks = normalizeSocialLinks(profileData)
    const profilePicture = sanitizeOptionalUrl(profileData.profile_image_url || profileData.profile_picture || profileData.avatar_url, 1000)
    const isVisible = profileData.is_profile_visible ?? profileData.is_public ?? true

    const locationParts =
      typeof profileData.location === "string"
        ? sanitizeSingleLineInput(profileData.location, 160)
            .split(",")
            .map((part: string) => part.trim())
        : []
    let city = emptyToNull(sanitizeSingleLineInput(profileData.city || locationParts[0] || profileData.location, 120))
    let province = emptyToNull(sanitizeSingleLineInput(profileData.province || locationParts[1], 120))

    if (typeof city === "string" && city.includes(",")) {
      const [parsedCity, parsedProvince] = city.split(",").map((part: string) => part.trim())
      city = emptyToNull(parsedCity)
      province = province || emptyToNull(parsedProvince)
    }

    const dataToSave: any = {
      user_id: user.id,
      full_name: emptyToNull(sanitizeSingleLineInput(profileData.full_name, 120)),
      display_name: emptyToNull(sanitizeSingleLineInput(profileData.display_name, 120)),
      username: emptyToNull(sanitizeSingleLineInput(profileData.username || profileData.display_name || profileData.full_name, 80)),
      account_type: emptyToNull(sanitizeSingleLineInput(profileData.account_type || profileData.user_type, 40)),
      user_type: emptyToNull(sanitizeSingleLineInput(profileData.account_type || profileData.user_type, 40)),
      talent_type: profileData.talent_type === "crew" ? "crew" : "creator",
      email: sanitizeSingleLineInput(profileData.email || user.email, 320).toLowerCase(),
      bio: emptyToNull(sanitizeTextInput(profileData.bio, 2000)),
      profession: emptyToNull(sanitizeSingleLineInput(profileData.profession, 120)) || "Creative",
      location: emptyToNull(sanitizeSingleLineInput(profileData.location || city, 160)),
      city,
      cities: city,
      province,
      provinces: province,
      profile_picture: profilePicture,
      profile_image_url: profilePicture,
      avatar_url: profilePicture,
      availability: sanitizeSingleLineInput(profileData.availability, 40) || "available",
      availability_status: sanitizeSingleLineInput(profileData.availability_status || profileData.availability, 40) || "available",
      is_public: isVisible,
      is_profile_visible: isVisible,
      social_links: socialLinks,
      instagram: emptyToNull(sanitizeOptionalUrl(socialLinks.instagram)),
      instagram_url: emptyToNull(sanitizeOptionalUrl(socialLinks.instagram)),
      linkedin: emptyToNull(sanitizeOptionalUrl(socialLinks.linkedin)),
      linkedin_url: emptyToNull(sanitizeOptionalUrl(socialLinks.linkedin)),
      youtube: emptyToNull(sanitizeOptionalUrl(socialLinks.youtube)),
      youtube_url: emptyToNull(sanitizeOptionalUrl(socialLinks.youtube)),
      facebook: emptyToNull(sanitizeOptionalUrl(socialLinks.facebook)),
      vimeo: emptyToNull(sanitizeOptionalUrl(socialLinks.vimeo)),
      vimeo_url: emptyToNull(sanitizeOptionalUrl(socialLinks.vimeo)),
      imdb_profile: emptyToNull(sanitizeOptionalUrl(socialLinks.imdb)),
      imdb_url: emptyToNull(sanitizeOptionalUrl(socialLinks.imdb)),
      website: emptyToNull(sanitizeOptionalUrl(socialLinks.website)),
      portfolio_url: emptyToNull(sanitizeOptionalUrl(socialLinks.website)),
      portfolio_images: profileData.portfolio_images || [],
      skills: asTextArray(profileData.skills),
      specializations: asTextArray(profileData.specializations || profileData.skills),
      roles: asTextArray(profileData.roles),
      departments: asTextArray(profileData.departments),
      software_skills: asTextArray(profileData.software_skills),
      technical_skills: asTextArray(profileData.technical_skills),
      photography_skills: asTextArray(profileData.photography_skills),
      videography_skills: asTextArray(profileData.videography_skills),
      hourly_rate: rateToNumber(profileData.hourly_rate),
      daily_rate: rateToNumber(profileData.daily_rate),
      project_rate: rateToNumber(profileData.project_rate),
      pricing: emptyToNull(sanitizeSingleLineInput(profileData.pricing, 120)),
      willing_to_travel: Boolean(profileData.willing_to_travel),
      rate_card_visible: profileData.rate_card_visible ?? true,
      experience_level: emptyToNull(sanitizeSingleLineInput(profileData.experience_level, 80)),
      onboarding_data: profileData.onboarding_data || null,
      updated_at: new Date().toISOString(),
    }

    console.log("[v0] Upserting profile with data:", JSON.stringify(dataToSave, null, 2))

    const profileClient = isAdminClientAvailable() ? createAdminClient() : supabase
    const { data, error: saveError } = await upsertProfile(profileClient, dataToSave)

    if (saveError) {
      console.error("[v0] Profile save error:", saveError.message)
      return NextResponse.json({ error: saveError.message }, { status: 500 })
    }

    const normalized = normalizeProfile(data, { id: user.id, email: user.email })

    console.log("[v0] Profile saved successfully:", normalized?.id)
    return NextResponse.json({ success: true, profile: normalized })
  } catch (error: any) {
    console.error("[v0] Profile save unexpected error:", error)
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 })
  }
}
