import {
  Activity,
  BarChart3,
  CalendarDays,
  FileText,
  Flag,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Newspaper,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react"

export const ADMIN_ROLES = ["admin", "super_admin"] as const
export const ADMIN_TABLES = [
  "advertisements",
  "articles",
  "events",
  "featured_creators",
  "featured_jobs",
  "reports",
  "analytics_daily",
  "admin_activity_log",
  "feature_flags",
  "homepage_content",
] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]
export type AdminTable = (typeof ADMIN_TABLES)[number]

export const adminNavItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Ads", href: "/admin/ads", icon: Megaphone },
  { label: "Articles", href: "/admin/articles", icon: FileText },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
  { label: "Site Content", href: "/admin/homepage-content", icon: Newspaper },
  { label: "Featured Creators", href: "/admin/featured-creators", icon: Sparkles },
  { label: "Featured Gigs", href: "/admin/featured-jobs", icon: Star },
  { label: "Locations", href: "/admin/locations", icon: MapPin },
  { label: "Moderation", href: "/admin/moderation", icon: Flag },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Activity", href: "/admin/activity", icon: Activity },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Security", href: "/admin/schema", icon: ShieldCheck },
]

export const adminResourceConfig = {
  advertisements: {
    label: "Advertisements",
    description: "Manage platform ads, placements, and active windows.",
    fields: ["title", "placement", "image_url", "target_url", "description", "start_date", "end_date"],
    toggles: ["active"],
  },
  articles: {
    label: "Articles",
    description: "Publish SnapScout guides, news, and SEO content.",
    fields: ["title", "slug", "excerpt", "body", "cover_image_url", "category", "seo_title", "seo_description"],
    selects: { status: ["draft", "published", "archived"] },
  },
  events: {
    label: "Events",
    description: "Promote industry meetups, workshops, and production events.",
    fields: ["title", "slug", "description", "venue", "city", "starts_at", "ends_at", "image_url", "ticket_url"],
    toggles: ["featured"],
    selects: { status: ["draft", "published", "cancelled", "archived"] },
  },
  featured_creators: {
    label: "Featured Creators",
    description: "Pin creators into discovery placements.",
    fields: ["creator_id", "placement", "label", "rank"],
    toggles: ["active"],
  },
  featured_jobs: {
    label: "Featured Gigs",
    description: "Boost gigs in marketplace discovery.",
    fields: ["gig_id", "placement", "label", "rank"],
    toggles: ["active"],
  },
  reports: {
    label: "Moderation Reports",
    description: "Review reports against users, gigs, listings, and content.",
    fields: ["entity_type", "entity_id", "reason", "notes"],
    selects: { status: ["open", "reviewing", "resolved", "dismissed"] },
  },
  feature_flags: {
    label: "Feature Flags",
    description: "Toggle platform capabilities without redeploying.",
    fields: ["key", "description"],
    toggles: ["enabled"],
  },
  homepage_content: {
    label: "Homepage Content",
    description: "Control reusable public content sections.",
    fields: ["section", "title", "body", "image_url", "cta_label", "cta_url"],
    toggles: ["active"],
  },
} as const

export function isAdminRole(role?: string | null) {
  return role === "admin" || role === "super_admin"
}
