import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sanitizeSingleLineInput } from "@/lib/utils/sanitize"

const RESET_REDIRECT_URL = "https://snapscout.co.za/auth/reset-password"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = sanitizeSingleLineInput(body?.email ?? "").toLowerCase()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration for password reset")
      return NextResponse.json({ error: "Password reset is unavailable" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: RESET_REDIRECT_URL,
    })

    if (error) {
      console.error("Password reset request failed", error)
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    })
  } catch (error) {
    console.error("Unexpected password reset error", error)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
