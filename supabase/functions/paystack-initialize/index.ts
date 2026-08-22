// Ported from app/api/paystack/initialize/route.ts
//
// The caller's identity (userId) and the amount charged are both derived
// server-side from the verified JWT / plan config, never trusted from the
// request body - otherwise anyone could grant a paid subscription to an
// arbitrary victim's account for an arbitrary (attacker-chosen) price.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"
import { sanitizeOptionalUrl, sanitizeSingleLineInput } from "../_shared/sanitize.ts"
import { PAYSTACK_CONFIG, SUBSCRIPTION_PRICES, generatePaystackReference, validatePaystackConfig } from "../_shared/paystack.ts"

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

const SITE_URL = Deno.env.get("SITE_URL") || "https://snapscout.co.za"

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders })

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) return json({ error: "Unauthorized" }, 401)

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!
    const supabaseAsCaller = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: authError,
    } = await supabaseAsCaller.auth.getUser()

    if (authError || !user) {
      console.error("[paystack-initialize] Auth error:", authError)
      return json({ error: "Unauthorized" }, 401)
    }

    const body = await req.json()

    const email = sanitizeSingleLineInput(body?.email, 160).toLowerCase()
    const plan = sanitizeSingleLineInput(body?.plan || body?.accountType, 80)
    const planCode = sanitizeSingleLineInput(body?.plan_code, 120)
    const userId = user.id
    const callbackUrl = sanitizeOptionalUrl(body?.callback_url, 500)

    if (!email) {
      return json({ error: "Missing required fields" }, 400)
    }

    const configValidation = validatePaystackConfig()
    if (!configValidation.isValid) {
      return json(
        {
          success: false,
          error: "Payment service configuration error",
          message: "Payment service is not properly configured.",
          details: configValidation.errors,
        },
        500,
      )
    }

    const paymentAmount = SUBSCRIPTION_PRICES[plan.toLowerCase()]
    if (paymentAmount === undefined) {
      return json({ error: "Invalid plan" }, 400)
    }

    if (paymentAmount === 0) {
      return json({ success: true, isFree: true, message: "Free account - no payment required" })
    }

    const reference = generatePaystackReference()
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
          { display_name: "Account Type", variable_name: "account_type", value: plan },
          { display_name: "Plan ID", variable_name: "plan_id", value: plan },
          { display_name: "User ID", variable_name: "user_id", value: userId },
        ],
      },
      callback_url: callbackUrl || `${SITE_URL}/dashboard?payment=success`,
      cancel_url: `${SITE_URL}/dashboard?payment=cancelled`,
    }

    if (planCode) {
      paystackPayload.plan = planCode
      paystackPayload.metadata.plan_code = planCode
      paystackPayload.metadata.custom_fields.push({
        display_name: "Plan Code",
        variable_name: "plan_code",
        value: planCode,
      })
    }

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
      console.error("[paystack-initialize] Paystack API error:", paystackResponse.status, errorText)
      return json(
        { success: false, error: "Payment service error", message: `Payment service returned ${paystackResponse.status}` },
        500,
      )
    }

    const data = await paystackResponse.json()
    if (!data.status) {
      console.error("[paystack-initialize] Paystack initialization failed:", data)
      return json({ success: false, error: "Payment initialization failed", message: data.message }, 500)
    }

    // Subscription record is created by paystack-webhook once Paystack
    // confirms the charge/subscription, not here.
    return json({
      success: true,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    })
  } catch (error) {
    console.error("[paystack-initialize] Error:", error)
    return json(
      { success: false, error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      500,
    )
  }
})
