import { applyStudioStoreDashboardPreview } from "@/lib/mock-data/studio-store-dashboard-preview"
import type { StudioStoreItem } from "@/lib/mock-data/studios-stores-data"

export const STUDIO_STORE_PROFILE_COLUMNS =
  "user_id, full_name, display_name, username, account_type, bio, location, city, province, profile_image_url, profile_picture, avatar_url, cover_image_url, phone, email, social_links, availability, availability_status, onboarding_data, created_at"

export function mapLiveProfileToStudioStoreItem(profile: any) {
  const location = profile.location || [profile.city, profile.province].filter(Boolean).join(", ")
  const settings = profile.onboarding_data?.studio_store_dashboard

  const base: Omit<StudioStoreItem, "id"> = {
    name: profile.display_name || profile.full_name || profile.username || "SnapScout Studio",
    type: profile.account_type === "store" ? "store" : "studio",
    location: location || "South Africa",
    province: profile.province || undefined,
    city: profile.city || undefined,
    rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10,
    reviews: Math.floor(Math.random() * 60) + 10,
    image: profile.cover_image_url || profile.profile_image_url || profile.profile_picture || profile.avatar_url || "/placeholder.svg",
    description: profile.bio || "This SnapScout partner hasn't added a description yet.",
    services: [],
    equipment: [],
    amenities: [],
    hourlyRate: "On request",
    contact: {
      phone: profile.phone || "",
      email: profile.email || "",
      website: profile.social_links?.website || "",
    },
    verified: false,
    availability: profile.availability_status || profile.availability || "Available",
  }

  const withSettings = applyStudioStoreDashboardPreview(base as StudioStoreItem, settings)

  const gearList = [settings?.owned_gear_list, settings?.rentable_gear_list]
    .filter(Boolean)
    .join(",")
    .split(/\n|,/)
    .map((item: string) => item.trim())
    .filter(Boolean)

  return {
    ...withSettings,
    id: profile.user_id as string,
    equipment: gearList.length ? gearList : withSettings.equipment,
    isLiveProfile: true as const,
  }
}
