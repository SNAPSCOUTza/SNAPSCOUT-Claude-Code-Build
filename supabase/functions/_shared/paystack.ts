// Ported from lib/paystack.ts - kept in sync manually since Edge Functions
// can't import from the Next.js app's lib/ directory. If you add/change a
// plan there, mirror it here too.
export interface PaystackConfig {
  secretKey: string
  baseUrl: string
}

export const PAYSTACK_CONFIG: PaystackConfig = {
  secretKey: Deno.env.get("PAYSTACK_SECRET_KEY") || "",
  baseUrl: "https://api.paystack.co",
}

export function validatePaystackConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!PAYSTACK_CONFIG.secretKey) errors.push("PAYSTACK_SECRET_KEY is not set")
  return { isValid: errors.length === 0, errors }
}

export const SUBSCRIPTION_PLANS = [
  {
    id: "scout",
    name: "Scout",
    price: 0,
    currency: "ZAR",
    paystackPlanCode: null as string | null,
    amountInKobo: 0,
  },
  {
    id: "creator-membership",
    name: "Creator Membership",
    price: 129.0,
    currency: "ZAR",
    paystackPlanCode: "PLN_gwa1ou57v0y52f9",
    amountInKobo: 12900,
  },
  {
    id: "crew-membership",
    name: "Crew Membership",
    price: 129.0,
    currency: "ZAR",
    paystackPlanCode: "PLN_fqc6pjz44yoxxjt",
    amountInKobo: 12900,
  },
  {
    id: "studio-membership",
    name: "Studio Membership",
    price: 489.0,
    currency: "ZAR",
    paystackPlanCode: "PLN_mwe361yl6kncc9a",
    amountInKobo: 48900,
  },
  {
    id: "store-membership",
    name: "Store Membership",
    price: 489.0,
    currency: "ZAR",
    paystackPlanCode: "PLN_l0ye33gc0dmtdpb",
    amountInKobo: 48900,
  },
] as const

export const SUBSCRIPTION_PRICES: Record<string, number> = {
  scout: 0,
  creator: 12900,
  crew: 12900,
  studio: 48900,
  store: 48900,
}

export function getPlanById(planId: string) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId)
}

export function getPlanByCode(planCode: string) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.paystackPlanCode === planCode)
}

export function generatePaystackReference(): string {
  return `snapscout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
