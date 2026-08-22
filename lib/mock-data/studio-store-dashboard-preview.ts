import type { StudioStoreItem } from "./studios-stores-data"

export const STUDIO_STORE_DASHBOARD_PREVIEW_KEY = "snapscout-studio-store-dashboard-preview"

export type StudioStorePackageDraft = {
  id: string
  name: string
  price: string
  description: string
  image: string
  badge: string
  availability: string
  included: string[]
}

type StudioStoreDashboardPreviewSettings = {
  business_name?: string
  listing_type?: "studio" | "store" | "both"
  logo_url?: string
  showroom_photo_url?: string
  location_address?: string
  operating_hours?: string
  hourly_rate?: string
  half_day_rate?: string
  full_day_rate?: string
  peak_rate?: string
  off_peak_rate?: string
  listing_description?: string
  listing_features?: string
  listing_rules?: string
  selected_amenities?: string[]
  indoor_outdoor_type?: string
  package_items?: StudioStorePackageDraft[]
}

export const DEFAULT_STUDIO_STORE_PACKAGES: StudioStorePackageDraft[] = [
  {
    id: "package-hourly-access",
    name: "Hourly Studio Access",
    price: "R2,500/hr",
    description: "Ideal for short shoots, interviews, and content days.",
    image: "/images/photography-workspace.jpg",
    badge: "2 hr minimum",
    availability: "Available",
    included: ["Natural Light", "Wi-Fi"],
  },
  {
    id: "package-half-day",
    name: "Half Day Package",
    price: "R9,800",
    description: "Up to 5 hours with base lighting setup and parking.",
    image: "/images/film-clapperboard.jpg",
    badge: "Up to 5 hours",
    availability: "Available",
    included: ["Parking", "Power"],
  },
]

export function normalizeStudioStorePackages(value: unknown): StudioStorePackageDraft[] {
  if (!Array.isArray(value)) return DEFAULT_STUDIO_STORE_PACKAGES

  const packages = value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null
      const draft = item as Partial<StudioStorePackageDraft>
      return {
        id: draft.id || `package-${index + 1}`,
        name: String(draft.name || "").trim(),
        price: String(draft.price || "").trim(),
        description: String(draft.description || "").trim(),
        image: String(draft.image || "").trim(),
        badge: String(draft.badge || "").trim(),
        availability: String(draft.availability || "Available").trim(),
        included: Array.isArray(draft.included)
          ? draft.included.map((feature) => String(feature || "").trim()).filter(Boolean)
          : [],
      }
    })
    .filter((item): item is StudioStorePackageDraft => Boolean(item?.name || item?.price || item?.description))

  return packages.length ? packages : DEFAULT_STUDIO_STORE_PACKAGES
}

export function applyStudioStoreDashboardPreview(
  baseItem: StudioStoreItem,
  settings?: StudioStoreDashboardPreviewSettings | null,
): StudioStoreItem {
  if (!settings) return baseItem

  const selectedAmenities = Array.isArray(settings.selected_amenities)
    ? settings.selected_amenities.map((amenity) => String(amenity || "").trim()).filter(Boolean)
    : []
  const typedAmenities = settings.indoor_outdoor_type
    ? [...selectedAmenities, settings.indoor_outdoor_type].filter((value, index, all) => all.indexOf(value) === index)
    : selectedAmenities
  const packageItems = normalizeStudioStorePackages(settings.package_items)
  const packageImages = packageItems.map((item) => item.image).filter(Boolean)
  const showroomImage = settings.showroom_photo_url?.trim()

  return {
    ...baseItem,
    name: settings.business_name?.trim() || baseItem.name,
    type: settings.listing_type || baseItem.type,
    logo: settings.logo_url?.trim() || baseItem.logo,
    image: showroomImage || baseItem.image,
    gallery: [showroomImage, ...packageImages, ...(baseItem.gallery || [])].filter(Boolean) as string[],
    fullAddress: settings.location_address?.trim() || baseItem.fullAddress,
    operatingHours: settings.operating_hours?.trim() || baseItem.operatingHours,
    description: settings.listing_description?.trim() || baseItem.description,
    about: settings.listing_description?.trim() || baseItem.about,
    amenities: typedAmenities.length ? typedAmenities : baseItem.amenities,
    rules: settings.listing_rules?.trim()
      ? settings.listing_rules
          .split(/\n|,/)
          .map((rule) => rule.trim())
          .filter(Boolean)
      : baseItem.rules,
    packages: packageItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.image,
      badge: item.badge,
      availability: item.availability,
      included: item.included,
    })),
    hourlyRate: settings.hourly_rate?.trim() || baseItem.hourlyRate,
    halfDayRate: settings.half_day_rate?.trim() || baseItem.halfDayRate,
    fullDayRate: settings.full_day_rate?.trim() || baseItem.fullDayRate,
    peakRate: settings.peak_rate?.trim() || baseItem.peakRate,
    offPeakRate: settings.off_peak_rate?.trim() || baseItem.offPeakRate,
  }
}
