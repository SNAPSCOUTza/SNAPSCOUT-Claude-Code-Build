export type SubscriptionStatus = "pending" | "active" | "cancelled" | "expired" | "past_due" | "non-renewing"

export type PaymentStatus = "pending" | "success" | "failed" | "cancelled" | "refunded"

export interface UserSubscription {
  id: string
  user_id: string
  subscription_id?: string
  customer_id?: string
  status: SubscriptionStatus
  current_period_start?: string | null
  current_period_end?: string | null
  amount?: number
  currency?: string
  plan_code?: string
  plan_name?: string
  payment_reference?: string
  metadata?: Record<string, any>
  paystack_subscription_code?: string | null
  paystack_customer_code?: string | null
  start_date?: string | null
  next_payment_date?: string | null
  cancelled_at?: string | null
  plan_id?: string
  user_profile_id?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  payment_reference: string
  amount: number
  status: PaymentStatus
  payment_method: string
  metadata?: Record<string, any>
  paystack_transaction_id?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  email: string | null
  full_name: string | null
  subscription_status: string | null
  account_type: string | null
  created_at: string
  updated_at: string
}
