import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/resend/send-email"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const type = searchParams.get("type") // 'signup', 'recovery', 'magiclink'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // If this is a new signup confirmation, send welcome email
      if (type === "signup" || type === "email_confirmation") {
        const email = data.user.email
        const name = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "there"

        if (email) {
          // Send welcome email asynchronously (don't block redirect)
          sendWelcomeEmail(email, name).catch(console.error)
        }
      }

      // Redirect to the intended destination
      const redirectUrl = `${origin}${next}`
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Return to error page if something went wrong
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
