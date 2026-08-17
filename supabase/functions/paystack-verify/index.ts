// Ported from app/api/paystack/verify/route.ts
//
// The original authenticated the caller via a Supabase session cookie
// (next/headers cookies()). Edge Functions live on a different origin, so
// cookies don't travel here - the frontend must call this via
// supabase.functions.invoke() (or an explicit `Authorization: Bearer
// <access_token>` header) while signed in, and this function reads that
// same JWT to identify who's calling.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"
import { PAYSTACK_CONFIG } from "../_shared/paystack.ts"
import { sanitizeSingleLineInput } from "../_shared/sanitize.ts"

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function getSupabaseAdmin(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")!
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  return createClient(url, serviceRoleKey)
}

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
      console.error("[paystack-verify] Auth error:", authError)
      return json({ error: "Unauthorized" }, 401)
    }

    const body = await req.json().catch(() => ({}))
    const reference = sanitizeSingleLineInput(body?.reference, 160)

    if (!reference) return json({ error: "Payment reference is required" }, 400)

    const supabaseAdmin = getSupabaseAdmin()

    const paystackResponse = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transaction/verify/${reference}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`, "Content-Type": "application/json" },
    })

    const data = await paystackResponse.json()
    if (!data.status) return json({ error: "Payment verification failed" }, 400)

    const transaction = data.data

    if (transaction.status === "success") {
      await supabaseAdmin
        .from("user_subscriptions")
        .update({
          status: "active",
          payment_status: "completed",
          paystack_transaction_id: transaction.id,
          updated_at: new Date().toISOString(),
        })
        .eq("payment_reference", reference)

      await supabaseAdmin
        .from("user_profiles")
        .update({ subscription_status: "active", is_profile_visible: true, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)

      return json({ success: true, status: "success", message: "Payment verified successfully" })
    }

    await supabaseAdmin
      .from("user_subscriptions")
      .update({ status: "failed", payment_status: "failed", updated_at: new Date().toISOString() })
      .eq("payment_reference", reference)

    return json({ success: false, status: "failed", message: "Payment was not successful" })
  } catch (error) {
    console.error("[paystack-verify] Error:", error)
    return json({ error: "Internal server error" }, 500)
  }
})
