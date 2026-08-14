import { type NextRequest, NextResponse } from "next/server"
import {
  sendConfirmationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
} from "@/lib/resend/send-email"
import { sanitizeSingleLineInput } from "@/lib/utils/sanitize"

// This endpoint can be called by Supabase Auth Hook or directly
export async function POST(request: NextRequest) {
  try {
    // Verify the webhook secret if coming from Supabase
    const authHeader = request.headers.get("authorization")
    const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET

    // If hook secret is set, validate it
    if (hookSecret && authHeader !== `Bearer ${hookSecret}`) {
      // Allow requests without auth header for direct API calls from our app
      const origin = request.headers.get("origin")
      const isInternalCall =
        origin?.includes("snapscout") || origin?.includes("localhost") || origin?.includes("vercel.app")

      if (!isInternalCall) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
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
        if (!data?.confirmation_url) {
          return NextResponse.json({ error: "Missing confirmation_url" }, { status: 400 })
        }
        result = await sendConfirmationEmail(email, data.confirmation_url)
        break

      case "recovery":
      case "reset_password":
        // Send password reset email
        if (!data?.reset_url) {
          return NextResponse.json({ error: "Missing reset_url" }, { status: 400 })
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
