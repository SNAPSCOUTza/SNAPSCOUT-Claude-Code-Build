import crypto from "crypto"

export interface PaystackWebhookEvent {
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
    channel: string
    currency: string
    ip_address: string
    metadata: {
      custom_fields?: Array<{
        display_name: string
        variable_name: string
        value: string
      }>
      user_id?: string
      subscription_plan?: string
    }
    log: {
      start_time: number
      time_spent: number
      attempts: number
      errors: number
      success: boolean
      mobile: boolean
      input: any[]
      history: Array<{
        type: string
        message: string
        time: number
      }>
    }
    fees: number
    fees_split: any
    authorization: {
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
      reusable: boolean
      signature: string
      account_name: string | null
    }
    customer: {
      id: number
      first_name: string | null
      last_name: string | null
      email: string
      customer_code: string
      phone: string | null
      metadata: any
      risk_action: string
      international_format_phone: string | null
    }
    plan: {
      id: number
      name: string
      plan_code: string
      description: string | null
      amount: number
      interval: string
      send_invoices: boolean
      send_sms: boolean
      currency: string
    } | null
    subaccount: any
    split: any
    order_id: any
    paidAt: string
    createdAt: string
    requested_amount: number
    pos_transaction_data: any
    source: any
    fees_breakdown: any
  }
}

export function verifyPaystackSignature(payload: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured")
  }

  const hash = crypto.createHmac("sha512", secret).update(payload, "utf8").digest("hex")

  return hash === signature
}

export function getSubscriptionPlan(amount: number): string {
  // Convert from kobo to naira for comparison
  const nairaAmount = amount / 100

  if (nairaAmount === 129) {
    return "Crew & Creators"
  } else if (nairaAmount === 489) {
    return "Studios & Stores"
  }

  return "Unknown Plan"
}

export function shouldProfileBeVisible(subscriptionStatus: string, accountType: string): boolean {
  // Scout accounts are always visible (free accounts)
  if (accountType === "Scout") {
    return true
  }

  // Paid accounts need active subscriptions
  return subscriptionStatus === "active"
}
