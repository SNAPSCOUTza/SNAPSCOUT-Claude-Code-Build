import { NextResponse } from "next/server"
import { upsertInitialUserProfile } from "@/lib/auth/profile-bootstrap"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"
import { sanitizeSingleLineInput } from "@/lib/utils/sanitize"

export async function POST(request: Request) {
  try {
    if (!isAdminClientAvailable()) {
      return NextResponse.json({ error: "Supabase admin client is not configured" }, { status: 500 })
    }
    const supabaseAdmin = createAdminClient()

    const body = await request.json()
    const email = sanitizeSingleLineInput(body.email, 320).toLowerCase()
    const name = sanitizeSingleLineInput(body.name, 120)
    const user_type = sanitizeSingleLineInput(body.user_type, 40)
    const password = typeof body.password === "string" ? body.password : ""

    console.log("[v0] RegisterUser - Request data:", { email, name, user_type })

    // Validate input
    if (!email || !password || !name || !user_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        display_name: name,
        account_type: user_type,
        full_name: name,
      },
    })

    if (error) {
      console.error("[v0] RegisterUser - Error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    console.log("[v0] RegisterUser - User created:", data.user.id)

    const { error: profileError } = await upsertInitialUserProfile(supabaseAdmin, {
      userId: data.user.id,
      email,
      displayName: name,
      accountType: user_type,
      isProfileVisible: true,
    })

    if (profileError) {
      console.error("[v0] RegisterUser - Profile creation error:", profileError)
      // Don't fail the request if profile creation fails, user is already created
    } else {
      console.log("[v0] RegisterUser - Profile created for user:", data.user.id)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
