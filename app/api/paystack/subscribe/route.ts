import { type NextRequest, NextResponse } from "next/server"
import { PAYSTACK_CONFIG, generatePaystackReference, validatePaystackConfig, getPlanById } from "@/lib/paystack"

interface SubscribeRequest {
  planId: string
  email: string
  userId: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeRequest = await request.json()
    const { planId, email, userId } = body

    console.log("[PAYSTACK] Subscription request:", { planId, email, userId })

    // Validate required fields
    if (!planId || !email || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Plan ID, email, and user ID are required",
        },
        { status: 400 },
      )
    }

    // Validate Paystack configuration
    const configValidation = validatePaystackConfig()
    if (!configValidation.isValid) {
      console.error("[PAYSTACK] Configuration errors:", configValidation.errors)
      return NextResponse.json(
        {
          success: false,
          error: "Payment service configuration error",
          message: configValidation.helpText,
          details: configValidation.errors,
        },
        { status: 500 },
      )
    }

    const plan = getPlanById(planId)

    if (!plan) {
      console.error("[PAYSTACK] Invalid plan ID:", planId)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid plan",
          message: `Plan '${planId}' not found`,
        },
        { status: 400 },
      )
    }

    if (!Number.isInteger(plan.amountInKobo) || plan.amountInKobo <= 0) {
      console.error("[PAYSTACK] Invalid amount:", plan.amountInKobo)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid amount",
          message: "Plan amount must be a positive integer in kobo",
        },
        { status: 400 },
      )
    }

    // Generate unique reference
    const reference = generatePaystackReference()

    const paystackPayload = {
      email,
      plan: plan.paystackPlanCode, // Use the PLN_xxx code from plan config
      amount: plan.amountInKobo, // Integer amount in kobo (12900, 48900)
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL}/dashboard?subscription=success&reference=${reference}`,
      metadata: {
        userId,
        user_id: userId,
        planId: plan.id,
        planName: plan.name,
        plan_code: plan.paystackPlanCode,
        custom_fields: [
          {
            display_name: "Plan Name",
            variable_name: "plan_name",
            value: plan.name,
          },
          {
            display_name: "User ID",
            variable_name: "user_id",
            value: userId,
          },
        ],
      },
    }

    console.log("[PAYSTACK] Initializing subscription:", {
      plan: plan.name,
      planCode: plan.paystackPlanCode,
      amount: plan.amountInKobo,
      email,
    })

    // Call Paystack API
    const paystackResponse = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackPayload),
    })

    const responseText = await paystackResponse.text()
    console.log("[PAYSTACK] Response status:", paystackResponse.status)

    if (!paystackResponse.ok) {
      console.error("[PAYSTACK] API error:", {
        status: paystackResponse.status,
        body: responseText,
      })

      let errorMessage = "Payment service error"
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        // Response is not JSON
      }

      return NextResponse.json(
        {
          success: false,
          error: "Payment initialization failed",
          message: errorMessage,
        },
        { status: paystackResponse.status },
      )
    }

    const data = JSON.parse(responseText)

    if (!data.status || !data.data?.authorization_url) {
      console.error("[PAYSTACK] Invalid response:", data)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment response",
          message: data.message || "Failed to get authorization URL",
        },
        { status: 500 },
      )
    }

    console.log("[PAYSTACK] Subscription initialized successfully")

    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    })
  } catch (error) {
    console.error("[PAYSTACK] Subscription error:", error)
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
