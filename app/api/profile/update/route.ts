import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"
import { sanitizeOptionalUrl, sanitizeSingleLineInput, sanitizeTextArray, sanitizeTextInput } from "@/lib/utils/sanitize"

export async function POST(request: Request) {
  try {
    const supabaseAdmin = isAdminClientAvailable() ? createAdminClient() : null

    const body = await request.json()
    const profileData = typeof body === "object" && body !== null ? body : {}
    console.log("[v0] Profile update request received")

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
      console.error("[v0] Profile update - auth error:", authError)
      return NextResponse.json({ error: "Unauthorized - please sign in" }, { status: 401 })
    }

    console.log("[v0] Authenticated user:", user.id)

    const incomingOwnerId = profileData.user_id || profileData.id
    if (incomingOwnerId && incomingOwnerId !== user.id) {
      console.error("[v0] Profile update - ID mismatch")
      return NextResponse.json({ error: "You can only update your own profile" }, { status: 403 })
    }

    const socialLinks = typeof profileData.social_links === "object" && profileData.social_links !== null ? profileData.social_links : {}
    const profilePicture = sanitizeOptionalUrl(profileData.profile_image_url || profileData.profile_picture || profileData.avatar_url, 1000)

    const updateData: any = {
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }

    // Map all possible profile fields
    const profileFields = [
      "full_name",
      "display_name",
      "account_type",
      "email",
      "bio",
      "profession",
      "location",
      "profile_image_url",
      "availability",
      "is_public",
      "pricing",
      "skills",
      "portfolio_images",
      "hourly_rate",
      "daily_rate",
      "project_rate",
    ]

    profileFields.forEach((field) => {
      if (field in profileData && profileData[field] !== undefined) {
        if (["skills", "portfolio_images", "social_links"].includes(field)) {
          if (typeof profileData[field] === "string") {
            try {
              const parsed = JSON.parse(profileData[field])
              updateData[field] = field === "skills" ? sanitizeTextArray(parsed) : parsed
            } catch {
              updateData[field] = field === "skills" ? sanitizeTextArray(profileData[field]) : profileData[field]
            }
          } else {
            updateData[field] = field === "skills" ? sanitizeTextArray(profileData[field]) : profileData[field]
          }
        } else {
          switch (field) {
            case "full_name":
            case "display_name":
            case "account_type":
            case "profession":
            case "availability":
            case "pricing":
              updateData[field] = sanitizeSingleLineInput(profileData[field], 120)
              break
            case "email":
              updateData[field] = sanitizeSingleLineInput(profileData[field], 320).toLowerCase()
              break
            case "bio":
              updateData[field] = sanitizeTextInput(profileData[field], 2000)
              break
            case "location":
              updateData[field] = sanitizeSingleLineInput(profileData[field], 160)
              break
            case "profile_image_url":
              updateData[field] = sanitizeOptionalUrl(profileData[field], 1000)
              break
            default:
              updateData[field] = profileData[field]
          }
        }
      }
    })

    console.log("[v0] Updating profile with fields:", Object.keys(updateData))

    updateData.profile_picture = profilePicture
    updateData.user_type = sanitizeSingleLineInput(profileData.account_type || profileData.user_type, 40) || null
    updateData.is_profile_visible = profileData.is_profile_visible ?? profileData.is_public ?? true
    updateData.availability_status = sanitizeSingleLineInput(profileData.availability_status || profileData.availability, 40) || "available"
    updateData.instagram = sanitizeOptionalUrl(socialLinks.instagram || profileData.instagram) || null
    updateData.linkedin = sanitizeOptionalUrl(socialLinks.linkedin || profileData.linkedin) || null
    updateData.youtube = sanitizeOptionalUrl(socialLinks.youtube || profileData.youtube) || null
    updateData.facebook = sanitizeOptionalUrl(socialLinks.facebook || profileData.facebook) || null
    updateData.vimeo = sanitizeOptionalUrl(socialLinks.vimeo || profileData.vimeo) || null
    updateData.imdb_profile =
      sanitizeOptionalUrl(socialLinks.imdb || socialLinks.imdb_profile || profileData.imdb || profileData.imdb_profile) || null
    updateData.website = sanitizeOptionalUrl(socialLinks.website || profileData.website) || null
    updateData.city = sanitizeSingleLineInput(profileData.city || profileData.location, 120) || null

    const profileClient = supabaseAdmin ?? supabase

    let { data, error } = await profileClient
      .from("user_profiles")
      .upsert(updateData, { onConflict: "user_id" })
      .select()
      .single()

    if (error?.message?.toLowerCase().includes("account_type")) {
      const retry = await profileClient
        .from("user_profiles")
        .upsert({ ...updateData, account_type: null }, { onConflict: "user_id" })
        .select()
        .single()
      data = retry.data
      error = retry.error
    }

    if (error?.message?.toLowerCase().includes("availability_status")) {
      const { availability_status, ...retryPayload } = updateData
      const retry = await profileClient.from("user_profiles").upsert(retryPayload, { onConflict: "user_id" }).select().single()
      data = retry.data
      error = retry.error
    }

    if (error?.message?.toLowerCase().includes("facebook") || error?.message?.toLowerCase().includes("vimeo") || error?.message?.toLowerCase().includes("imdb_profile")) {
      const { facebook, vimeo, imdb_profile, ...retryPayload } = updateData
      const retry = await profileClient.from("user_profiles").upsert(retryPayload, { onConflict: "user_id" }).select().single()
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error("[v0] Profile update error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Profile updated successfully")
    return NextResponse.json({ success: true, profile: data })
  } catch (error: any) {
    console.error("[v0] Profile update unexpected error:", error.message)
    return NextResponse.json({ error: "Failed to update profile: " + error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabaseAdmin = isAdminClientAvailable() ? createAdminClient() : null

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileClient = supabaseAdmin ?? supabase
    const { data: profile, error } = await profileClient
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      console.error("[v0] Profile fetch error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error("[v0] Profile fetch unexpected error:", error.message)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
