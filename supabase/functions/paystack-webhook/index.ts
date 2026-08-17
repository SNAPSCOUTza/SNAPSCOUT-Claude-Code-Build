// Ported from app/api/paystack/webhook/route.ts (the confirmed-live handler
// registered in Paystack's dashboard - NOT app/api/webhooks/paystack, which
// is a diverged, unused duplicate left in the Next.js app).
//
// Deploy with: supabase functions deploy paystack-webhook --no-verify-jwt
// (config.toml also sets verify_jwt = false for this function, but pass the
// flag too in case you deploy functions individually).
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"
import { getPlanByCode, SUBSCRIPTION_PLANS } from "../_shared/paystack.ts"

async function computeHmacHex(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

async function verifyPaystackSignature(body: string, signature: string, secret: string): Promise<boolean> {
  if (!secret || !signature) return false
  const hashHex = await computeHmacHex(body, secret)
  return hashHex === signature
}

function getSupabaseAdmin(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!url || !serviceRoleKey) throw new Error("Supabase admin client is not configured")
  return createClient(url, serviceRoleKey)
}

async function handleChargeSuccess(supabaseAdmin: SupabaseClient, data: any) {
  console.log("[paystack-webhook] Processing charge.success:", data.reference)

  const userId = data.metadata?.user_id || data.metadata?.userId
  const planId = data.metadata?.plan_id || data.metadata?.planId || data.metadata?.accountType
  const planCode = data.metadata?.plan_code || data.plan?.plan_code

  if (!userId) {
    console.error("[paystack-webhook] No user ID in charge metadata")
    return
  }

  let plan = planCode ? getPlanByCode(planCode) : null
  if (!plan && planId) {
    plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId || p.id === `${planId}-membership`)
  }

  const planName = plan?.name || data.metadata?.plan_name || "Pro Plan"
  const amount = plan?.price || data.amount / 100

  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1)

  const { error } = await supabaseAdmin.from("user_subscriptions").upsert(
    {
      user_id: userId,
      status: "active",
      plan_type: planId || "creator",
      plan_name: planName,
      amount: amount,
      currency: data.currency || "ZAR",
      paystack_customer_code: data.customer?.customer_code,
      paystack_subscription_code: data.subscription_code,
      paystack_reference: data.reference,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      current_period_start: startDate.toISOString(),
      current_period_end: endDate.toISOString(),
      next_payment_date: endDate.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )

  if (error) {
    console.error("[paystack-webhook] Error creating subscription:", error)
  } else {
    console.log("[paystack-webhook] Subscription created/updated for user:", userId)
  }

  await supabaseAdmin
    .from("user_profiles")
    .update({
      account_type: planId || "creator",
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
}

async function handleSubscriptionCreate(supabaseAdmin: SupabaseClient, data: any) {
  console.log("[paystack-webhook] Processing subscription.create:", data.subscription_code)

  const email = data.customer?.email
  if (!email) {
    console.error("[paystack-webhook] No email in subscription data")
    return
  }

  const { data: profile } = await supabaseAdmin.from("user_profiles").select("user_id").eq("email", email).single()

  if (!profile) {
    console.error("[paystack-webhook] No profile found for email:", email)
    return
  }

  const plan = getPlanByCode(data.plan?.plan_code)
  const planName = plan?.name || data.plan?.name || "Pro Plan"
  const amount = plan?.price || data.amount / 100

  const { error } = await supabaseAdmin.from("user_subscriptions").upsert(
    {
      user_id: profile.user_id,
      status: "active",
      plan_type: plan?.id?.replace("-membership", "") || "creator",
      plan_name: planName,
      amount: amount,
      currency: "ZAR",
      paystack_customer_code: data.customer?.customer_code,
      paystack_subscription_code: data.subscription_code,
      start_date: new Date().toISOString(),
      current_period_start: new Date().toISOString(),
      current_period_end: data.next_payment_date,
      next_payment_date: data.next_payment_date,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )

  if (error) {
    console.error("[paystack-webhook] Error updating subscription:", error)
  } else {
    await supabaseAdmin
      .from("user_profiles")
      .update({ subscription_status: "active", updated_at: new Date().toISOString() })
      .eq("user_id", profile.user_id)
  }
}

async function handleSubscriptionNotRenew(supabaseAdmin: SupabaseClient, data: any) {
  console.log("[paystack-webhook] Processing subscription.not_renew")

  const email = data.customer?.email
  if (!email) return

  const { data: profile } = await supabaseAdmin.from("user_profiles").select("user_id").eq("email", email).single()
  if (!profile) return

  await supabaseAdmin
    .from("user_subscriptions")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("user_id", profile.user_id)
}

async function handleSubscriptionDisable(supabaseAdmin: SupabaseClient, data: any) {
  console.log("[paystack-webhook] Processing subscription.disable")

  const email = data.customer?.email
  if (!email) return

  const { data: profile } = await supabaseAdmin.from("user_profiles").select("user_id").eq("email", email).single()
  if (!profile) return

  await supabaseAdmin
    .from("user_subscriptions")
    .update({ status: "expired", updated_at: new Date().toISOString() })
    .eq("user_id", profile.user_id)

  await supabaseAdmin
    .from("user_profiles")
    .update({ account_type: "scout", subscription_status: "inactive", updated_at: new Date().toISOString() })
    .eq("user_id", profile.user_id)
}

async function handlePaymentFailed(supabaseAdmin: SupabaseClient, data: any) {
  console.log("[paystack-webhook] Processing invoice.payment_failed")

  const email = data.customer?.email
  if (!email) return

  const { data: profile } = await supabaseAdmin.from("user_profiles").select("user_id").eq("email", email).single()
  if (!profile) return

  await supabaseAdmin
    .from("user_subscriptions")
    .update({ status: "past_due", updated_at: new Date().toISOString() })
    .eq("user_id", profile.user_id)
}

Deno.serve(async (req) => {
  try {
    const secret = Deno.env.get("PAYSTACK_SECRET_KEY") || ""
    const body = await req.text()
    const signature = req.headers.get("x-paystack-signature") || ""

    if (!(await verifyPaystackSignature(body, signature, secret))) {
      console.error("[paystack-webhook] Invalid Paystack webhook signature")
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const event = JSON.parse(body)
    console.log("[paystack-webhook] Received:", event.event)

    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(supabaseAdmin, event.data)
        break
      case "subscription.create":
        await handleSubscriptionCreate(supabaseAdmin, event.data)
        break
      case "subscription.not_renew":
        await handleSubscriptionNotRenew(supabaseAdmin, event.data)
        break
      case "subscription.disable":
        await handleSubscriptionDisable(supabaseAdmin, event.data)
        break
      case "invoice.payment_failed":
        await handlePaymentFailed(supabaseAdmin, event.data)
        break
      default:
        console.log("[paystack-webhook] Unhandled event:", event.event)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[paystack-webhook] Error:", error)
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
