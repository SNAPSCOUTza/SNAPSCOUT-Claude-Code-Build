export interface PaystackConfig {
  publicKey: string
  secretKey: string
  baseUrl: string
  useSubscriptionPlans: boolean
}

export interface PaystackTransaction {
  reference: string
  amount: number
  email: string
  currency: string
  metadata?: Record<string, any>
}

export interface PaystackResponse {
  status: boolean
  message: string
  data: any
}

console.log("[v0] Environment variables check:", {
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ? "SET" : "NOT SET",
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY ? "SET" : "NOT SET",
})

export const USE_SUBSCRIPTION_PLANS = true // Enable recurring subscriptions with Paystack plans

export const PAYSTACK_CONFIG: PaystackConfig = {
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
  secretKey: process.env.PAYSTACK_SECRET_KEY || "",
  baseUrl: "https://api.paystack.co",
  useSubscriptionPlans: USE_SUBSCRIPTION_PLANS,
}

export function validatePaystackConfig(): { isValid: boolean; errors: string[]; helpText?: string } {
  const errors: string[] = []

  if (!PAYSTACK_CONFIG.publicKey) {
    errors.push("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set")
  }

  if (!PAYSTACK_CONFIG.secretKey) {
    errors.push("PAYSTACK_SECRET_KEY is not set")
  }

  const helpText =
    errors.length > 0
      ? "Please add the missing Paystack API keys to your environment variables in the Vercel dashboard (Settings → Environment Variables) or in your .env file for local development."
      : undefined

  return {
    isValid: errors.length === 0,
    errors,
    helpText,
  }
}

export const SUBSCRIPTION_PLANS = [
  {
    id: "scout",
    name: "Scout",
    description: "Free forever - Browse and discover talent",
    price: 0,
    currency: "ZAR",
    interval: "forever",
    paystackPlanCode: null,
    paystackPaymentUrl: null,
    amountInKobo: 0,
    features: [
      "Browse unlimited creator profiles",
      "View portfolios and rates",
      "Direct messaging with creatives",
      "Basic search and filters",
      "Save favorite profiles",
      "Request quotes",
    ],
  },
  {
    id: "creator-membership",
    name: "Creator Membership",
    description: "Perfect for individual creators",
    price: 129.0,
    currency: "ZAR",
    interval: "monthly",
    paystackPlanCode: "PLN_gwa1ou57v0y52f9",
    paystackPaymentUrl: "https://paystack.shop/pay/pf9ytcte3l",
    amountInKobo: 12900,
    features: [
      "Everything in Scout",
      "Professional profile page",
      "Portfolio showcase",
      "Social media integration",
      "Client discovery",
      "Direct messaging",
      "Profile analytics",
      "Priority support",
    ],
  },
  {
    id: "crew-membership",
    name: "Crew Membership",
    description: "For small teams and crew members",
    price: 129.0,
    currency: "ZAR",
    interval: "monthly",
    paystackPlanCode: "PLN_fqc6pjz44yoxxjt",
    paystackPaymentUrl: "https://paystack.shop/pay/x2cgr11mqs",
    amountInKobo: 12900,
    features: [
      "Everything in Scout",
      "Team collaboration tools",
      "Priority support",
      "Enhanced visibility",
      "Crew networking",
      "Project management",
      "Booking calendar",
      "Client reviews",
    ],
  },
  {
    id: "studio-membership",
    name: "Studio Membership",
    description: "For professional studios",
    price: 489.0,
    currency: "ZAR",
    interval: "monthly",
    paystackPlanCode: "PLN_mwe361yl6kncc9a",
    paystackPaymentUrl: "https://paystack.shop/pay/zqmjtj7zo6",
    amountInKobo: 48900,
    features: [
      "Everything in Scout",
      "Advanced analytics",
      "Custom branding",
      "API access",
      "Priority listing",
      "Dedicated support",
      "Team management",
      "Multiple locations",
    ],
  },
  {
    id: "store-membership",
    name: "Store Membership",
    description: "For e-commerce stores",
    price: 489.0,
    currency: "ZAR",
    interval: "monthly",
    paystackPlanCode: "PLN_l0ye33gc0dmtdpb",
    paystackPaymentUrl: "https://paystack.shop/pay/rnkw0lackt",
    amountInKobo: 48900,
    features: [
      "Everything in Scout",
      "E-commerce integration",
      "Inventory management",
      "Sales analytics",
      "Product showcase",
      "Payment processing",
      "Order management",
      "Customer database",
    ],
  },
] as const

export type PlanId = (typeof SUBSCRIPTION_PLANS)[number]["id"]

export function getPlanById(planId: string) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId)
}

export function getPlanByCode(planCode: string) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.paystackPlanCode === planCode)
}

export function generatePaystackReference(): string {
  return `snapscout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const SUBSCRIPTION_PRICES = {
  scout: 0, // Free
  creator: 12900, // R129 in kobo
  crew: 12900, // R129 in kobo
  studio: 48900, // R489 in kobo
  store: 48900, // R489 in kobo
} as const
