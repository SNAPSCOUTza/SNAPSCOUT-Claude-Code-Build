import { type NextRequest, NextResponse } from "next/server"
import {
  PAYSTACK_CONFIG,
  SUBSCRIPTION_PRICES,
  generatePaystackReference,
  validatePaystackConfig,
  USE_SUBSCRIPTION_PLANS,
} from "@/lib/paystack"
import { sanitizeOptionalUrl, sanitizeSingleLineInput } from "@/lib/utils/sanitize"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Handle new subscription format from subscribe page
    const email = sanitizeSingleLineInput(body?.email, 160).toLowerCase()
    const plan = sanitizeSingleLineInput(body?.plan || body?.accountType, 80)
    const planCode = sanitizeSingleLineInput(body?.plan_code, 120)
    // The caller's identity and the price charged are never trusted from the
    // request body - both are derived server-side (verified session, plan
    // config) so a caller can't grant a paid plan to someone else's account
    // or tamper with the amount charged.
    const userId = user.id
    const callbackUrl = sanitizeOptionalUrl(body?.callback_url, 500)

    console.log("[v0] Payment initialization request:", { email, plan, planCode, userId })

    if (!email) {
      console.log("[v0] Missing required fields:", { email: !!email })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const configValidation = validatePaystackConfig()
    if (!configValidation.isValid) {
      console.error("[v0] Paystack configuration errors:", configValidation.errors)
      return NextResponse.json(
        {
          success: false,
          error: "Payment service configuration error",
          message: "Payment service is not properly configured. Please add your Paystack API keys.",
          details: configValidation.errors,
          helpText: configValidation.helpText,
        },
        { status: 500 },
      )
    }

    const paymentAmount = SUBSCRIPTION_PRICES[plan.toLowerCase() as keyof typeof SUBSCRIPTION_PRICES]
    if (paymentAmount === undefined) {
      console.log("[v0] Invalid plan:", { plan })
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    if (paymentAmount === 0) {
      return NextResponse.json({
        success: true,
        isFree: true,
        message: "Free account - no payment required",
      })
    }

    const reference = generatePaystackReference()
    console.log("[v0] Generated reference:", reference)

    const amountInKobo = paymentAmount > 1000 ? paymentAmount : paymentAmount * 100

    const paystackPayload: any = {
      email,
      amount: amountInKobo,
      currency: "ZAR",
      reference,
      metadata: {
        userId,
        accountType: plan,
        planId: plan,
        user_id: userId,
        custom_fields: [
          {
            display_name: "Account Type",
            variable_name: "account_type",
            value: plan,
          },
          {
            display_name: "Plan ID",
            variable_name: "plan_id",
            value: plan,
          },
          {
            display_name: "User ID",
            variable_name: "user_id",
            value: userId,
          },
        ],
      },
      callback_url: callbackUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=cancelled`,
    }

    if (USE_SUBSCRIPTION_PLANS && planCode) {
      paystackPayload.plan = planCode
      paystackPayload.metadata.plan_code = planCode
      paystackPayload.metadata.custom_fields.push({
        display_name: "Plan Code",
        variable_name: "plan_code",
        value: planCode,
      })
      console.log("[v0] Using subscription plan:", planCode)
    } else {
      console.log("[v0] Using one-time payment (no subscription plan)")
    }

    console.log("[v0] Paystack payload:", paystackPayload)
    console.log(
      "[v0] Using secret key:",
      PAYSTACK_CONFIG.secretKey ? "***" + PAYSTACK_CONFIG.secretKey.slice(-4) : "NOT SET",
    )

    const paystackResponse = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(paystackPayload),
    })

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text()
      console.error("[v0] Paystack API error:", {
        status: paystackResponse.status,
        statusText: paystackResponse.statusText,
        body: errorText,
      })
      return NextResponse.json(
        {
          success: false,
          error: "Payment service error",
          message: `Payment service returned ${paystackResponse.status}: ${paystackResponse.statusText}`,
        },
        { status: 500 },
      )
    }

    const data = await paystackResponse.json()
    console.log("[v0] Paystack response:", data.status ? "Authorization URL created" : "Failed")

    if (!data.status) {
      console.error("[v0] Paystack initialization failed:", data)
      return NextResponse.json(
        {
          success: false,
          error: "Payment initialization failed",
          message: data.message || "Payment service rejected the request",
        },
        { status: 500 },
      )
    }

    // The subscription record should only be created when Paystack confirms the subscription
    // via the webhook (subscription.create or charge.success events)
    console.log("[v0] Payment initialized successfully - webhook will create subscription record")

    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    })
  } catch (error) {
    console.error("[v0] Payment initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
