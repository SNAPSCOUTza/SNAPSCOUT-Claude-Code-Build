import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { PAYSTACK_CONFIG } from "@/lib/paystack"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"
import { sanitizeSingleLineInput } from "@/lib/utils/sanitize"

export async function POST(request: NextRequest) {
  try {
    if (!isAdminClientAvailable()) {
      return NextResponse.json({ error: "Supabase admin client is not configured" }, { status: 500 })
    }
    const supabaseAdmin = createAdminClient()

    const body = await request.json().catch(() => ({}))
    const reference = sanitizeSingleLineInput(body?.reference, 160)

    console.log("[v0] Payment Verify - Reference:", reference)

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

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
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] Payment Verify - Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify transaction with Paystack
    const paystackResponse = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        "Content-Type": "application/json",
      },
    })

    const data = await paystackResponse.json()

    console.log("[v0] Payment Verify - Paystack response:", data)

    if (!data.status) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    const transaction = data.data

    if (transaction.status === "success") {
      console.log("[v0] Payment Verify - Success, updating subscription")

      await supabaseAdmin
        .from("user_subscriptions")
        .update({
          status: "active",
          payment_status: "completed",
          paystack_transaction_id: transaction.id,
          updated_at: new Date().toISOString(),
        })
        .eq("payment_reference", reference)

      // Update user profile subscription visibility state
      await supabaseAdmin
        .from("user_profiles")
        .update({
          subscription_status: "active",
          is_profile_visible: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      console.log("[v0] Payment Verify - Profile updated for user:", user.id)

      return NextResponse.json({
        success: true,
        status: "success",
        message: "Payment verified successfully",
      })
    } else {
      console.log("[v0] Payment Verify - Failed")

      await supabaseAdmin
        .from("user_subscriptions")
        .update({
          status: "failed",
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("payment_reference", reference)

      return NextResponse.json({
        success: false,
        status: "failed",
        message: "Payment was not successful",
      })
    }
  } catch (error) {
    console.error("[v0] Payment verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
