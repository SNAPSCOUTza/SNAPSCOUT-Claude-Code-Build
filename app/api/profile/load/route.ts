import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"
import { normalizeProfile } from "@/lib/profile-normalization"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    console.log("[v0] Profile load request received")
    console.log("[v0] Request URL:", request.url)

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
      console.error("[v0] Profile load - auth error:", authError)
      return NextResponse.json({ error: "Unauthorized - please sign in" }, { status: 401 })
    }

    console.log("[v0] Loading profile for user:", user.id)

    const profileClient = isAdminClientAvailable() ? createAdminClient() : supabase
    const { data: profile, error: profileError } = await profileClient
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("[v0] Profile load - user_profiles error:", profileError.message)
      return NextResponse.json({ error: "Failed to load profile: " + profileError.message }, { status: 500 })
    }

    console.log("[v0] Profile loaded:", profile ? "found" : "null")

    return NextResponse.json({
      success: true,
      profile: normalizeProfile(profile, { id: user.id, email: user.email }),
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error: any) {
    console.error("[v0] Profile load unexpected error:", error.message, error.stack)
    return NextResponse.json({ error: "Failed to load profile: " + error.message }, { status: 500 })
  }
}
