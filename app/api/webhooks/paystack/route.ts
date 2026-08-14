import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { getPlanByCode } from "@/lib/paystack"

interface PaystackWebhookEvent {
  event: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string | null
    gateway_response: string
    paid_at: string
    created_at: string
    createdAt?: string
    channel: string
    currency: string
    ip_address: string
    metadata: {
      user_id?: string
      userId?: string
      plan_code?: string
      plan_name?: string
      [key: string]: any
    }
    customer: {
      id: number
      first_name: string
      last_name: string
      email: string
      customer_code: string
      phone: string | null
      metadata: any
    }
    authorization?: {
      authorization_code: string
      bin: string
      last4: string
      exp_month: string
      exp_year: string
      channel: string
      card_type: string
      bank: string
      country_code: string
      brand: string
    }
    plan?: {
      id: number
      name: string
      plan_code: string
      amount: number
      interval: string
      currency: string
    }
    subscription?: {
      subscription_code: string
      email_token: string
      next_payment_date: string
      status: string
    }
    subscription_code?: string
    email_token?: string
    next_payment_date?: string
  }
}

// Verify Paystack webhook signature
function verifyPaystackSignature(body: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY

  if (!secret) {
    console.error("[WEBHOOK] PAYSTACK_SECRET_KEY not configured")
    return false
  }

  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex")
  return hash === signature
}

// Convert amount from kobo/cents to main currency
function convertFromKobo(amount: number): number {
  return amount / 100
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    if (!signature) {
      console.log("[WEBHOOK] Missing Paystack signature")
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    // Verify webhook signature
    if (!verifyPaystackSignature(body, signature)) {
      console.error("[WEBHOOK] Invalid Paystack signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event: PaystackWebhookEvent = JSON.parse(body)
    console.log("[WEBHOOK] Received event:", event.event, "Reference:", event.data.reference)

    // Create admin client for database operations
    const supabase = createAdminClient()

    // Handle different webhook events
    switch (event.event) {
      case "subscription.create":
        await handleSubscriptionCreate(supabase, event)
        break

      case "charge.success":
        await handleChargeSuccess(supabase, event)
        break

      case "subscription.disable":
        await handleSubscriptionDisable(supabase, event)
        break

      case "subscription.not_renew":
        await handleSubscriptionNotRenew(supabase, event)
        break

      case "invoice.create":
      case "invoice.update":
        console.log("[WEBHOOK] Invoice event:", event.event, "Reference:", event.data.reference)
        break

      default:
        console.log("[WEBHOOK] Unhandled event type:", event.event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[WEBHOOK] Processing error:", error)
    // Always return 200 to prevent webhook retries for parsing errors
    return NextResponse.json({ received: true, error: "Processing failed" })
  }
}

async function handleSubscriptionCreate(supabase: any, event: PaystackWebhookEvent) {
  const { data } = event
  const userId = data.metadata?.user_id || data.metadata?.userId

  if (!userId) {
    console.error("[WEBHOOK] No user_id in subscription.create metadata:", data.metadata)
    return
  }

  const plan = getPlanByCode(data.plan?.plan_code || "")

  if (!plan) {
    console.error("[WEBHOOK] Unknown plan code:", data.plan?.plan_code)
    return
  }

  const subscriptionCode = data.subscription_code || data.subscription?.subscription_code
  const nextPaymentDate = data.next_payment_date || data.subscription?.next_payment_date
  const emailToken = data.email_token || data.subscription?.email_token

  console.log("[WEBHOOK] Creating subscription:", {
    userId,
    subscriptionCode,
    planName: plan.name,
    planCode: plan.paystackPlanCode,
    amount: plan.price,
  })

  try {
    const { error: subscriptionError } = await supabase.from("user_subscriptions").insert({
      user_id: userId,
      plan_name: plan.name,
      plan_code: plan.paystackPlanCode,
      amount: plan.price, // Store in main currency (129.00, 489.00)
      currency: plan.currency,
      status: "active",
      reference: data.reference,
      subscription_id: subscriptionCode,
      paystack_subscription_code: subscriptionCode,
      paystack_customer_code: data.customer.customer_code,
      start_date: data.createdAt || data.created_at,
      next_payment_date: nextPaymentDate,
      metadata: {
        email_token: emailToken,
        subscription_code: subscriptionCode,
        plan_id: plan.id,
      },
    })

    if (subscriptionError) {
      console.error("[WEBHOOK] Error creating subscription:", subscriptionError)
      return
    }

    console.log("[WEBHOOK] Subscription created successfully")

    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        subscription_status: "active",
        subscription_plan: plan.id, // Store plan ID (e.g., "creator-membership")
        paystack_customer_code: data.customer.customer_code,
        paystack_subscription_code: subscriptionCode,
        is_profile_visible: true,
        is_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (profileError) {
      console.error("[WEBHOOK] Error updating profile:", profileError)
    } else {
      console.log("[WEBHOOK] Profile updated successfully")
    }
  } catch (error) {
    console.error("[WEBHOOK] Error in handleSubscriptionCreate:", error)
  }
}

async function handleChargeSuccess(supabase: any, event: PaystackWebhookEvent) {
  const { data } = event
  const userId = data.metadata?.user_id || data.metadata?.userId

  if (!userId) {
    console.error("[WEBHOOK] No user_id in charge.success metadata:", data.metadata)
    return
  }

  const amountInRands = convertFromKobo(data.amount)

  console.log("[WEBHOOK] Processing successful charge:", {
    userId,
    amount: amountInRands,
    reference: data.reference,
    planCode: data.plan?.plan_code,
  })

  try {
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: userId,
      reference: data.reference,
      amount: amountInRands, // Amount in ZAR (129.00, 489.00)
      currency: data.currency,
      status: "success",
      paystack_transaction_id: data.id.toString(),
      metadata: {
        channel: data.channel,
        paid_at: data.paid_at,
        customer_code: data.customer.customer_code,
        gateway_response: data.gateway_response,
        plan_code: data.plan?.plan_code,
      },
    })

    if (paymentError) {
      console.error("[WEBHOOK] Error creating payment record:", paymentError)
    } else {
      console.log("[WEBHOOK] Payment record created")
    }

    // Update subscription next payment date if this is a recurring charge
    if (data.subscription?.subscription_code) {
      const nextPaymentDate = data.subscription.next_payment_date

      const { error: updateError } = await supabase
        .from("user_subscriptions")
        .update({
          next_payment_date: nextPaymentDate,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("paystack_subscription_code", data.subscription.subscription_code)

      if (updateError) {
        console.error("[WEBHOOK] Error updating subscription:", updateError)
      } else {
        console.log("[WEBHOOK] Subscription next payment date updated")
      }
    }
  } catch (error) {
    console.error("[WEBHOOK] Error in handleChargeSuccess:", error)
  }
}

async function handleSubscriptionDisable(supabase: any, event: PaystackWebhookEvent) {
  const userId = event.data.metadata?.user_id || event.data.metadata?.userId

  if (!userId) {
    console.error("[WEBHOOK] No user_id in subscription.disable metadata")
    return
  }

  console.log("[WEBHOOK] Disabling subscription for user:", userId)

  try {
    const { error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (subscriptionError) {
      console.error("[WEBHOOK] Error cancelling subscription:", subscriptionError)
      return
    }

    console.log("[WEBHOOK] Subscription cancelled")

    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        subscription_status: "cancelled",
        is_profile_visible: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (profileError) {
      console.error("[WEBHOOK] Error updating profile:", profileError)
    } else {
      console.log("[WEBHOOK] Profile updated for cancelled subscription")
    }
  } catch (error) {
    console.error("[WEBHOOK] Error in handleSubscriptionDisable:", error)
  }
}

async function handleSubscriptionNotRenew(supabase: any, event: PaystackWebhookEvent) {
  const userId = event.data.metadata?.user_id || event.data.metadata?.userId

  if (!userId) {
    console.error("[WEBHOOK] No user_id in subscription.not_renew metadata")
    return
  }

  console.log("[WEBHOOK] Subscription set to not renew for user:", userId)

  try {
    const { error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .update({
        status: "non-renewing",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (subscriptionError) {
      console.error("[WEBHOOK] Error marking subscription as non-renewing:", subscriptionError)
      return
    }

    console.log("[WEBHOOK] Subscription marked as non-renewing")

    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        subscription_status: "expiring",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (profileError) {
      console.error("[WEBHOOK] Error updating profile:", profileError)
    } else {
      console.log("[WEBHOOK] Profile updated for non-renewing subscription")
    }
  } catch (error) {
    console.error("[WEBHOOK] Error in handleSubscriptionNotRenew:", error)
  }
}
