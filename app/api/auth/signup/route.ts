import { NextResponse } from "next/server"
import { Resend } from "resend"
import { prisma } from "@/lib/prisma"
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
    const display_name = sanitizeSingleLineInput(body.display_name, 120)
    const account_type = sanitizeSingleLineInput(body.account_type, 40)
    const password = typeof body.password === "string" ? body.password : ""

    // Validate input
    if (!email || !password || !display_name || !account_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Creating user via admin API:", email)

    // Create user with admin API (bypasses email hook)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email immediately
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

    const senderEmail = process.env.SENDER_EMAIL || "noreply@updates.snapscout.co.za"
    const fromEmail = senderEmail.includes("<") ? senderEmail : `SnapScout <${senderEmail}>`
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://snapscout.co.za"}/auth/login`

    try {
      const resendApiKey = process.env.RESEND_API_KEY
      if (!resendApiKey) {
        console.warn("[v0] RESEND_API_KEY is not configured; skipping welcome email")
      } else {
        const resend = new Resend(resendApiKey)

        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: "Welcome to SnapScout!",
          html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0; font-size: 28px;">SnapScout</h1>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">South Africa's Creative Network</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fff 100%); border-radius: 12px; padding: 30px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 22px;">Welcome, ${display_name}!</h2>
              <p style="color: #4b5563; margin: 0 0 20px 0;">
                Your SnapScout account has been created successfully! You're ready to explore South Africa's premier creative network.
              </p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${loginUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Sign In Now
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 13px; margin: 20px 0 0 0;">
                Start building your profile and connect with creative professionals across South Africa.
              </p>
            </div>
            
            <div style="text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} SnapScout. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">South Africa's premier platform for creative professionals.</p>
            </div>
          </body>
          </html>
        `,
        })
        console.log("[v0] Welcome email sent successfully")
      }
    } catch (emailError) {
      console.error("[v0] Welcome email error:", emailError)
      // Don't fail signup if email fails - user can still sign in
    }

    return NextResponse.json({
      success: true,
      user: { id: userData.user.id, email: userData.user.email },
      message: "Account created successfully! You can sign in now.",
    })
  } catch (error: any) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: error.message || "Signup failed" }, { status: 500 })
  }
}
