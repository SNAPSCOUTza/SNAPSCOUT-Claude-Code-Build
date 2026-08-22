import { NextResponse } from "next/server"
import { upsertInitialUserProfile } from "@/lib/auth/profile-bootstrap"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"
import { sanitizeSingleLineInput } from "@/lib/utils/sanitize"
import { sendConfirmationEmail } from "@/lib/resend/send-email"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

// Same rate-limit key namespace as /api/auth/signup ("signup:ip:...") -
// both routes call auth.admin.createUser directly, so they need to share
// one budget per IP or an attacker could just split traffic between the
// two endpoints to double their effective throughput.
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
      // Not auto-confirmed - the account isn't usable until the owner
      // proves they control the inbox, via the confirmation email below.
      email_confirm: false,
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://snapscout.co.za"

    try {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
        options: {
          redirectTo: `${siteUrl}/api/auth/callback?type=signup&next=/dashboard`,
        },
      })

      if (linkError || !linkData?.properties?.action_link) {
        console.error("[v0] RegisterUser - Failed to generate confirmation link:", linkError)
      } else {
        const result = await sendConfirmationEmail(email, linkData.properties.action_link)
        if (result.error) {
          console.error("[v0] RegisterUser - Confirmation email error:", result.error)
        }
      }
    } catch (emailError) {
      console.error("[v0] RegisterUser - Confirmation email error:", emailError)
      // Don't fail signup if email fails - the account still exists and
      // the user can request another confirmation link later
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      message: "Account created! Check your email to confirm your address before signing in.",
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
