import { createClient } from "@/lib/supabase/server"
import type { UserSubscription } from "@/types/database.types"

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error("[v0] Error fetching subscription:", error)
    return null
  }

  return data
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return subscription !== null && subscription.status === "active"
}

export async function getAllUserSubscriptions(userId: string): Promise<UserSubscription[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching subscriptions:", error)
    return []
  }

  return data || []
}
