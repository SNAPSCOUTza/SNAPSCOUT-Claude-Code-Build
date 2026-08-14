import { redirect } from "next/navigation"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { isAdminRole } from "@/lib/admin/admin-config"

export type AdminProfile = {
  id: string
  user_id: string
  email: string | null
  display_name: string | null
  full_name: string | null
  account_type: string | null
  role: string | null
  suspended: boolean | null
}

export async function getAdminContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("id,user_id,email,display_name,full_name,account_type,role,suspended")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error || !profile || !isAdminRole(profile.role) || profile.suspended) {
    redirect("/dashboard")
  }

  return { supabase, user, profile: profile as AdminProfile }
}

export async function requireSuperAdmin() {
  const context = await getAdminContext()
  if (context.profile.role !== "super_admin") {
    redirect("/admin")
  }
  return context
}

export async function writeAdminActivity(
  supabase: SupabaseClient,
  adminId: string,
  action: string,
  entityType?: string,
  entityId?: string | null,
  metadata: Record<string, unknown> = {},
) {
  await supabase.from("admin_activity_log").insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    metadata,
  })
}

export async function getAdminMetrics() {
  const { supabase } = await getAdminContext()

  const [
    users,
    gigs,
    applications,
    reports,
    ads,
    articles,
    events,
    featuredCreators,
    featuredGigs,
    activity,
  ] = await Promise.all([
    supabase.from("user_profiles").select("id, role, account_type, suspended, created_at", { count: "exact" }).limit(500),
    supabase.from("gigs").select("id, status, created_at", { count: "exact" }).limit(500),
    supabase.from("gig_applications").select("id, status, created_at", { count: "exact" }).limit(500),
    supabase.from("reports").select("id, status, reason, created_at", { count: "exact" }).limit(100),
    supabase.from("advertisements").select("id, active, impressions, clicks", { count: "exact" }).limit(100),
    supabase.from("articles").select("id, status, created_at", { count: "exact" }).limit(100),
    supabase.from("events").select("id, status, starts_at", { count: "exact" }).limit(100),
    supabase.from("featured_creators").select("id, active", { count: "exact" }).limit(100),
    supabase.from("featured_jobs").select("id, active", { count: "exact" }).limit(100),
    supabase
      .from("admin_activity_log")
      .select("id, action, entity_type, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ])

  const userRows = users.data || []
  const gigRows = gigs.data || []
  const reportRows = reports.data || []
  const adRows = ads.data || []

  return {
    totalUsers: users.count || userRows.length,
    adminUsers: userRows.filter((profile: any) => isAdminRole(profile.role)).length,
    suspendedUsers: userRows.filter((profile: any) => profile.suspended).length,
    totalGigs: gigs.count || gigRows.length,
    openGigs: gigRows.filter((gig: any) => gig.status === "open").length,
    applications: applications.count || applications.data?.length || 0,
    openReports: reportRows.filter((report: any) => report.status === "open").length,
    activeAds: adRows.filter((ad: any) => ad.active).length,
    totalAdClicks: adRows.reduce((total: number, ad: any) => total + Number(ad.clicks || 0), 0),
    articles: articles.count || articles.data?.length || 0,
    events: events.count || events.data?.length || 0,
    featuredCreators: featuredCreators.count || featuredCreators.data?.length || 0,
    featuredGigs: featuredGigs.count || featuredGigs.data?.length || 0,
    recentActivity: activity.data || [],
  }
}
