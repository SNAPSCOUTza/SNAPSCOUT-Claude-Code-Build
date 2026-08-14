import { createServerClient } from "@/lib/supabase/server"

/**
 * Check if a user has authorization to access features
 * Scout users are automatically authorized (free account)
 * Other account types require an active subscription
 */
export async function checkUserAuthorization() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { authorized: false, user: null, profile: null, reason: "not_authenticated" }
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

  if (!profile) {
    return { authorized: false, user, profile: null, reason: "no_profile" }
  }

  const isScout = profile.account_type?.toLowerCase() === "scout"
  const hasActiveSubscription = profile.subscription_status === "active"

  const authorized = isScout || hasActiveSubscription

  return {
    authorized,
    user,
    profile,
    isScout,
    hasActiveSubscription,
    reason: authorized ? (isScout ? "scout_free" : "subscribed") : "no_subscription",
  }
}

/**
 * Simplified check - returns true if user can access features
 * (Scout account OR active subscription)
 */
export async function isUserAuthorized(): Promise<boolean> {
  const result = await checkUserAuthorization()
  return result.authorized
}
