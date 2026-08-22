import { type NextRequest, NextResponse } from "next/server"
import {
  sendConfirmationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
} from "@/lib/resend/send-email"
import { sanitizeSingleLineInput } from "@/lib/utils/sanitize"

// Receives the Supabase Auth "Send Email" hook (server-to-server only - see
// docs/RESEND_SETUP.md). Nothing in this app calls it directly; it exists
// purely for Supabase's Auth service to invoke. The Origin header this used
// to check is attacker-controlled outside a real browser, so it verified
// nothing - the webhook secret is the only real credential here.
function isAllowedRedirect(url: string): boolean {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://snapscout.co.za"
  try {
    return new URL(url).origin === new URL(siteUrl).origin
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET

    if (!hookSecret || authHeader !== `Bearer ${hookSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const type = sanitizeSingleLineInput(body.type, 40)
    const email = sanitizeSingleLineInput(body.email, 320).toLowerCase()
    const data = typeof body.data === "object" && body.data !== null ? body.data : {}
    const safeName = sanitizeSingleLineInput((data as Record<string, unknown>).name || "there", 120)

    let result

    switch (type) {
      case "signup":
      case "confirm":
        // Send confirmation email
        if (!data?.confirmation_url || !isAllowedRedirect(data.confirmation_url)) {
          return NextResponse.json({ error: "Missing or invalid confirmation_url" }, { status: 400 })
        }
        result = await sendConfirmationEmail(email, data.confirmation_url)
        break

      case "recovery":
      case "reset_password":
        // Send password reset email
        if (!data?.reset_url || !isAllowedRedirect(data.reset_url)) {
          return NextResponse.json({ error: "Missing or invalid reset_url" }, { status: 400 })
        }
        result = await sendPasswordResetEmail(email, data.reset_url)
        break

      case "password_change":
        // Send password changed notification
        result = await sendPasswordChangedEmail(email)
        break

      case "welcome":
        // Send welcome email after confirmation
        result = await sendWelcomeEmail(email, safeName)
        break

      default:
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 })
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: result.id })
  } catch (error) {
    console.error("[Auth Email] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
