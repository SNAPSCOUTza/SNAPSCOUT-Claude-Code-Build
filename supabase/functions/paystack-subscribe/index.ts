// Ported from app/api/paystack/subscribe/route.ts
//
// The caller's identity (userId) is derived server-side from the verified
// JWT, never trusted from the request body - otherwise anyone could grant a
// paid subscription to an arbitrary victim's account.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"
import { PAYSTACK_CONFIG, generatePaystackReference, validatePaystackConfig, getPlanById } from "../_shared/paystack.ts"

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
      console.error("[paystack-subscribe] Auth error:", authError)
      return json({ error: "Unauthorized" }, 401)
    }

    const body = await req.json()
    const { planId, email } = body || {}
    const userId = user.id

    if (!planId || !email) {
      return json({ success: false, error: "Missing required fields", message: "Plan ID and email are required" }, 400)
    }

    const configValidation = validatePaystackConfig()
    if (!configValidation.isValid) {
      return json({ success: false, error: "Payment service configuration error", details: configValidation.errors }, 500)
    }

    const plan = getPlanById(planId)
    if (!plan) {
      return json({ success: false, error: "Invalid plan", message: `Plan '${planId}' not found` }, 400)
    }

    if (!Number.isInteger(plan.amountInKobo) || plan.amountInKobo <= 0) {
      return json({ success: false, error: "Invalid amount", message: "Plan amount must be a positive integer in kobo" }, 400)
    }

    const reference = generatePaystackReference()

    const paystackPayload = {
      email,
      plan: plan.paystackPlanCode,
      amount: plan.amountInKobo,
      callback_url: `${SITE_URL}/dashboard?subscription=success&reference=${reference}`,
      metadata: {
        userId,
        user_id: userId,
        planId: plan.id,
        planName: plan.name,
        plan_code: plan.paystackPlanCode,
        custom_fields: [
          { display_name: "Plan Name", variable_name: "plan_name", value: plan.name },
          { display_name: "User ID", variable_name: "user_id", value: userId },
        ],
      },
    }

    const paystackResponse = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: { Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(paystackPayload),
    })

    const responseText = await paystackResponse.text()

    if (!paystackResponse.ok) {
      console.error("[paystack-subscribe] Paystack API error:", paystackResponse.status, responseText)
      let errorMessage = "Payment service error"
      try {
        errorMessage = JSON.parse(responseText).message || errorMessage
      } catch {
        // response wasn't JSON
      }
      return json({ success: false, error: "Payment initialization failed", message: errorMessage }, paystackResponse.status)
    }

    const data = JSON.parse(responseText)
    if (!data.status || !data.data?.authorization_url) {
      console.error("[paystack-subscribe] Invalid response:", data)
      return json({ success: false, error: "Invalid payment response", message: data.message || "Failed to get authorization URL" }, 500)
    }

    return json({ success: true, authorization_url: data.data.authorization_url, reference: data.data.reference })
  } catch (error) {
    console.error("[paystack-subscribe] Error:", error)
    return json(
      { success: false, error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      500,
    )
  }
})
