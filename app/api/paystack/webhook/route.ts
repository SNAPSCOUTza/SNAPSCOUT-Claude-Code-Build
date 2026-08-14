import { type NextRequest, NextResponse } from "next/server"
import { getPlanByCode, SUBSCRIPTION_PLANS } from "@/lib/paystack"
import crypto from "crypto"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"

function getSupabaseAdmin() {
  if (!isAdminClientAvailable()) {
    throw new Error("Supabase admin client is not configured")
  }
  return createAdminClient()
}

// Verify Paystack webhook signature
function verifyPaystackSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
    .update(body)
    .digest("hex")
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature") || ""

    // Verify webhook signature
    if (!verifyPaystackSignature(body, signature)) {
      console.error("[v0] Invalid Paystack webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    console.log("[v0] Paystack webhook received:", event.event)

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
        console.log("[v0] Unhandled webhook event:", event.event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleChargeSuccess(supabaseAdmin: ReturnType<typeof createAdminClient>, data: any) {
  console.log("[v0] Processing charge.success:", data.reference)

  const userId = data.metadata?.user_id || data.metadata?.userId
  const planId = data.metadata?.plan_id || data.metadata?.planId || data.metadata?.accountType
  const planCode = data.metadata?.plan_code || data.plan?.plan_code

  if (!userId) {
    console.error("[v0] No user ID in charge metadata")
    return
  }

  // Find the plan details
  let plan = planCode ? getPlanByCode(planCode) : null
  if (!plan && planId) {
    plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId || p.id === `${planId}-membership`)
  }

  const planName = plan?.name || data.metadata?.plan_name || "Pro Plan"
  const amount = plan?.price || data.amount / 100

  // Calculate subscription period (1 month from now)
  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1)

  // Upsert subscription record
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
    {
      onConflict: "user_id",
    },
  )

  if (error) {
    console.error("[v0] Error creating subscription:", error)
  } else {
    console.log("[v0] Subscription created/updated for user:", userId)
  }

  // Also update the user's profile account_type
  await supabaseAdmin
    .from("user_profiles")
    .update({
      account_type: planId || "creator",
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
}

async function handleSubscriptionCreate(supabaseAdmin: ReturnType<typeof createAdminClient>, data: any) {
  console.log("[v0] Processing subscription.create:", data.subscription_code)

  const email = data.customer?.email
  if (!email) {
    console.error("[v0] No email in subscription data")
    return
  }

  // Find user by email
  const { data: profile } = await supabaseAdmin.from("user_profiles").select("user_id").eq("email", email).single()

  if (!profile) {
    console.error("[v0] No profile found for email:", email)
    return
  }

  const plan = getPlanByCode(data.plan?.plan_code)
  const planName = plan?.name || data.plan?.name || "Pro Plan"
  const amount = plan?.price || data.amount / 100

  // Update subscription with Paystack subscription code
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
    {
      onConflict: "user_id",
    },
  )

  if (error) {
    console.error("[v0] Error updating subscription:", error)
  } else {
    await supabaseAdmin
      .from("user_profiles")
      .update({
        subscription_status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", profile.user_id)
  }
}

async function handleSubscriptionNotRenew(supabaseAdmin: ReturnType<typeof createAdminClient>, data: any) {
  console.log("[v0] Processing subscription.not_renew")

  const email = data.customer?.email
  if (!email) return

  const { data: profile } = await supabaseAdmin.from("user_profiles").select("user_id").eq("email", email).single()

  if (!profile) return

  await supabaseAdmin
    .from("user_subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", profile.user_id)
}

async function handleSubscriptionDisable(supabaseAdmin: ReturnType<typeof createAdminClient>, data: any) {
  console.log("[v0] Processing subscription.disable")

  const email = data.customer?.email
  if (!email) return

  const { data: profile } = await supabaseAdmin.from("user_profiles").select("user_id").eq("email", email).single()

  if (!profile) return

  await supabaseAdmin
    .from("user_subscriptions")
    .update({
      status: "expired",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", profile.user_id)

  // Reset account type to scout
  await supabaseAdmin
    .from("user_profiles")
    .update({
      account_type: "scout",
      subscription_status: "inactive",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", profile.user_id)
}

async function handlePaymentFailed(supabaseAdmin: ReturnType<typeof createAdminClient>, data: any) {
  console.log("[v0] Processing invoice.payment_failed")

  const email = data.customer?.email
  if (!email) return

  const { data: profile } = await supabaseAdmin.from("user_profiles").select("user_id").eq("email", email).single()

  if (!profile) return

  // Mark as payment failed but don't cancel yet
  await supabaseAdmin
    .from("user_subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", profile.user_id)
}
