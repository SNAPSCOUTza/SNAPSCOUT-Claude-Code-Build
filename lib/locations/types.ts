export type ShootLocation = {
  id: string
  created_by: string
  name: string
  address: string | null
  description: string | null
  location_type: string
  city: string
  province: string
  cover_image_url: string | null
  gallery_image_urls: string[]
  safety_rating: "Low" | "Medium" | "High"
  security_level: string
  best_shooting_times: string
  parking_availability: string
  crowd_levels: string
  indoor_outdoor: string
  permit_required: boolean
  power_access: string
  bathroom_access: string
  food_nearby: string
  access_rules: string | null
  status: "draft" | "pending_review" | "published" | "archived"
  rating: number
  review_count: number
  save_count: number
  created_at: string
  updated_at: string
}

export type ShootLocationPhoto = {
  id: string
  location_id: string
  uploaded_by: string
  image_url: string
  caption: string | null
  shot_at: string | null
  camera: string | null
  likes_count: number
  created_at: string
  uploader_name?: string
}

export type ShootLocationReview = {
  id: string
  location_id: string
  user_id: string
  rating: number
  body: string
  created_at: string
  reviewer_name?: string
}

// Single source of truth for the location_type column. `value` is what's stored
// and filtered on; `label` is the plural form shown on browse-page category pills.
export const LOCATION_TYPE_OPTIONS = [
  { value: "Warehouse", label: "Warehouses" },
  { value: "Studio", label: "Studios" },
  { value: "Coffee Shop", label: "Coffee Shops" },
  { value: "Rooftop", label: "Rooftops" },
  { value: "Nature", label: "Nature" },
  { value: "Industrial", label: "Industrial" },
  { value: "Luxury Home", label: "Luxury Homes" },
  { value: "Restaurant", label: "Restaurants" },
] as const

export const LOCATION_PROVINCE_OPTIONS = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
] as const

export const LOCATION_CITY_OPTIONS = [
  "Johannesburg",
  "Cape Town",
  "Durban",
  "Pretoria",
  "Port Elizabeth",
  "Bloemfontein",
  "Nelspruit",
  "Polokwane",
] as const

export const POWER_ACCESS_OPTIONS = ["Unknown", "None", "Nearby", "On-site outlet"] as const
export const BATHROOM_ACCESS_OPTIONS = ["Unknown", "None", "Nearby", "Available"] as const
export const FOOD_NEARBY_OPTIONS = ["Unknown", "None nearby", "Walking distance", "On-site"] as const
