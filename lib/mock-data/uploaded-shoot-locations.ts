import type { StudioStoreItem } from "@/lib/mock-data/studios-stores-data"

export type UploadedShootLocation = {
  id: string
  createdAt: string
  createdBy: string
  name: string
  details: string
  description: string
  locationType: string
  city: string
  province: string
  safetyRating: string
  securityLevel: string
  bestShootingTimes: string
  parkingAvailability: string
  crowdLevels: string
  indoorOutdoor: string
  accessRules: string
  photos: string[]
}

type ProfileLike = {
  account_type?: string | null
  user_type?: string | null
  subscription_status?: string | null
} | null

const STORAGE_KEY = "snapscout-uploaded-shoot-locations-v1"
const MOCK_PAID_OVERRIDE_KEY = "snapscout-mock-paid-subscriber"

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "paid"])

export function hasMockPaidSubscription(profile: ProfileLike): boolean {
  const subscriptionStatus = (profile?.subscription_status || "").toLowerCase()
  if (ACTIVE_SUBSCRIPTION_STATUSES.has(subscriptionStatus)) return true

  if (typeof window !== "undefined") {
    const forcedPaid = window.localStorage.getItem(MOCK_PAID_OVERRIDE_KEY)
    if (forcedPaid === "1") return true
  }

  return false
}

export function canUploadShootLocations(profile: ProfileLike): boolean {
  return hasMockPaidSubscription(profile)
}

export function createUploadedShootLocationId() {
  return `uploaded-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function loadUploadedShootLocations(): UploadedShootLocation[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item) => item && typeof item === "object" && typeof item.id === "string")
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime()
        const bTime = new Date(b.createdAt || 0).getTime()
        return bTime - aTime
      })
  } catch {
    return []
  }
}

export function saveUploadedShootLocation(location: UploadedShootLocation): UploadedShootLocation[] {
  const next = [location, ...loadUploadedShootLocations()]
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  return next
}

export function findUploadedShootLocationById(id: string): UploadedShootLocation | null {
  return loadUploadedShootLocations().find((item) => item.id === id) || null
}

export function uploadedLocationToStudioStoreItem(location: UploadedShootLocation): StudioStoreItem {
  const primaryImage = location.photos[0] || "/images/photography-workspace.jpg"
  const cityProvince = [location.city, location.province].filter(Boolean).join(", ")

  return {
    id: Number.NaN,
    name: location.name,
    type: "studio",
    location: cityProvince || location.city,
    fullAddress: location.details,
    province: location.province,
    city: location.city,
    rating: location.safetyRating === "High" ? 4.8 : location.safetyRating === "Medium" ? 4.4 : 4.0,
    reviews: 0,
    image: primaryImage,
    gallery: location.photos.length ? location.photos : [primaryImage],
    description: location.description,
    about: `${location.locationType} - ${location.indoorOutdoor} - ${location.accessRules}`,
    services: [location.locationType, location.bestShootingTimes, `${location.crowdLevels} crowd`],
    equipment: ["Bring your own gear"],
    amenities: [
      `${location.securityLevel} security`,
      `${location.parkingAvailability} parking`,
      `${location.indoorOutdoor} setup`,
    ],
    rules: [location.accessRules],
    termsSummary: "Uploaded as a mock premium listing. Confirm details with owner before booking.",
    operatingHours: `Best time: ${location.bestShootingTimes}`,
    hourlyRate: "Rate on request",
    contact: {
      phone: "Provided after booking request",
      email: "Provided after booking request",
      website: "https://snapscout.co.za",
    },
    verified: false,
    availability: "Available",
  }
}
