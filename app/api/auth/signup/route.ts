import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { sanitizeSingleLineInput } from "@/lib/utils/sanitize"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

// Extra IP-based rate limit on top of whatever GoTrue applies natively -
// the admin client below is used only to read/write the rate-limit table,
// which has no anon/authenticated grants (see lib/rate-limit.ts).
const SIGNUP_RATE_LIMIT = { windowMs: 60 * 60 * 1000, max: 8 }

export async function POST(request: Request) {
  try {
    if (!isAdminClientAvailable()) {
      return NextResponse.json({ error: "Supabase admin client is not configured" }, { status: 500 })
    }
    const supabaseAdmin = createAdminClient()

    const ip = getClientIp(request)
    const rateLimit = await checkRateLimit(supabaseAdmin, `signup:ip:${ip}`, SIGNUP_RATE_LIMIT)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      )
    }

    const body = await request.json()
    const email = sanitizeSingleLineInput(body.email, 320).toLowerCase()
    const display_name = sanitizeSingleLineInput(body.display_name, 120)
    const account_type = sanitizeSingleLineInput(body.account_type, 40)
    const password = typeof body.password === "string" ? body.password : ""

    // Validate input
    if (!email || !password || !display_name || !account_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Creating user via Supabase auth:", email)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://snapscout.co.za"
    const supabase = await createServerClient()

    // The public signUp() call (as opposed to admin.createUser) is what
    // makes Supabase's own GoTrue service send the confirmation email
    // itself - no separate email provider or generated link to relay.
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/api/auth/callback?type=signup&next=/dashboard`,
      },
    })

    if (signUpError) {
      console.error("[v0] Sign up error:", signUpError)

      if (signUpError.message?.toLowerCase().includes("already registered")) {
        return NextResponse.json({ error: "This email is already registered. Try signing in." }, { status: 400 })
      }

      return NextResponse.json({ error: signUpError.message }, { status: 400 })
    }

    if (!signUpData?.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Supabase quietly signals "this email already has an account" by
    // returning a user with no identities instead of an error, when email
    // confirmation is required - the same request would otherwise look
    // like a fresh signup and silently re-trigger a confirmation email to
    // an account that isn't theirs to claim.
    if (signUpData.user.identities && signUpData.user.identities.length === 0) {
      return NextResponse.json({ error: "This email is already registered. Try signing in." }, { status: 400 })
    }

    console.log("[v0] User created:", signUpData.user.id)

    try {
      await prisma.userProfile.create({
        data: {
          user_id: signUpData.user.id,
          email: email,
          full_name: display_name,
          display_name: display_name,
          account_type: account_type,
          subscription_status: account_type === "scout" ? "active" : "inactive",
        },
      })
      console.log("[v0] user_profiles row created successfully for user:", signUpData.user.id)
    } catch (profileError: any) {
      console.error("[v0] Profile creation error:", profileError.message)
    }

    return NextResponse.json({
      success: true,
      user: { id: signUpData.user.id, email: signUpData.user.email },
      message: "Account created! Check your email to confirm your address before signing in.",
    })
  } catch (error: any) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: error.message || "Signup failed" }, { status: 500 })
  }
}
