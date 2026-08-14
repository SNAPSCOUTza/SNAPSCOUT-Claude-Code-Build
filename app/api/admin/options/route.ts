import { NextResponse } from "next/server"
import { getAdminContext } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

function profileLabel(profile: any) {
  const name = profile.display_name || profile.full_name || profile.username || profile.email || "Unnamed profile"
  const role = profile.profession || profile.account_type || profile.user_type || "Creator"
  return `${name} - ${role}`
}

export async function GET() {
  const { supabase } = await getAdminContext()

  const [profilesResult, subscriptionsResult, gigsResult] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("user_id,display_name,full_name,username,email,profession,account_type,user_type,subscription_status")
      .order("display_name", { ascending: true })
      .limit(200),
    supabase
      .from("user_subscriptions")
      .select("user_id,status,current_period_end")
      .eq("status", "active")
      .limit(500),
    supabase
      .from("gigs")
      .select("id,title,status,location,category,salary_min,salary_max")
      .order("created_at", { ascending: false })
      .limit(200),
  ])

  if (profilesResult.error) return NextResponse.json({ error: profilesResult.error.message }, { status: 500 })
  if (gigsResult.error) return NextResponse.json({ error: gigsResult.error.message }, { status: 500 })

  const activeSubscriberIds = new Set(
    (subscriptionsResult.data || [])
      .filter((subscription: any) => {
        if (!subscription.current_period_end) return true
        return new Date(subscription.current_period_end).getTime() >= Date.now()
      })
      .map((subscription: any) => subscription.user_id),
  )

  const creators = (profilesResult.data || [])
    .filter((profile: any) => {
      const type = String(profile.account_type || profile.user_type || "").toLowerCase()
      const isFeatureableType = !["client", "scout"].includes(type)
      const hasPaidAccess = profile.subscription_status === "active" || activeSubscriberIds.has(profile.user_id)
      return profile.user_id && isFeatureableType && hasPaidAccess
    })
    .map((profile: any) => ({
      value: profile.user_id,
      label: profileLabel(profile),
      description: profile.email || undefined,
    }))

  const gigs = (gigsResult.data || []).map((gig: any) => {
    const budget =
      gig.salary_min || gig.salary_max
        ? `R${Number(gig.salary_min || 0).toLocaleString("en-ZA")} - R${Number(gig.salary_max || 0).toLocaleString("en-ZA")}`
        : "Budget not set"

    return {
      value: gig.id,
      label: gig.title || "Untitled gig",
      description: [gig.category, gig.location, gig.status, budget].filter(Boolean).join(" - "),
    }
  })

  return NextResponse.json({ creators, gigs })
}
