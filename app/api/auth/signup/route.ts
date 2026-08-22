import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"
import { sanitizeSingleLineInput } from "@/lib/utils/sanitize"
import { sendConfirmationEmail } from "@/lib/resend/send-email"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

// This route calls auth.admin.createUser directly, which bypasses Supabase
// GoTrue's own built-in rate limiting on the normal public signup endpoint -
// so this app has to provide that protection itself.
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

    console.log("[v0] Creating user via admin API:", email)

    // Create user with admin API (bypasses email hook). email_confirm is
    // false so the account isn't usable until the owner actually proves
    // they control the inbox - see the confirmation email sent below.
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    })

    if (createError) {
      console.error("[v0] Admin create user error:", createError)

      if (createError.message?.includes("already been registered")) {
        return NextResponse.json({ error: "This email is already registered. Try signing in." }, { status: 400 })
      }

      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    if (!userData?.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    console.log("[v0] User created and auto-confirmed:", userData.user.id)

    try {
      await prisma.userProfile.create({
        data: {
          user_id: userData.user.id,
          email: email,
          full_name: display_name,
          display_name: display_name,
          account_type: account_type,
          subscription_status: account_type === "scout" ? "active" : "inactive",
        },
      })
      console.log("[v0] user_profiles row created successfully for user:", userData.user.id)
    } catch (profileError: any) {
      console.error("[v0] Profile creation error:", profileError.message)
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
        console.error("[v0] Failed to generate confirmation link:", linkError)
      } else {
        const result = await sendConfirmationEmail(email, linkData.properties.action_link)
        if (result.error) {
          console.error("[v0] Confirmation email error:", result.error)
        } else {
          console.log("[v0] Confirmation email sent successfully")
        }
      }
    } catch (emailError) {
      console.error("[v0] Confirmation email error:", emailError)
      // Don't fail signup if email fails - the account still exists and
      // the user can request another confirmation link later
    }

    return NextResponse.json({
      success: true,
      user: { id: userData.user.id, email: userData.user.email },
      message: "Account created! Check your email to confirm your address before signing in.",
    })
  } catch (error: any) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: error.message || "Signup failed" }, { status: 500 })
  }
}
