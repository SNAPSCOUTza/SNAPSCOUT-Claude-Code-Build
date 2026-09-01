import { studiosStoresData } from "@/lib/mock-data/studios-stores-data"

export interface StudioData {
  id: string
  user_profile_id: string
  business_name: string
  type: "studio" | "equipment_store"
  location: string
  city: string
  province: string
  bio: string
  services: string[]
  equipment: string[]
  profile_picture: string
  gallery_images: string[]
  rating: number
  total_reviews: number
  price_range: string
  availability_status: string
  is_verified: boolean
  featured: boolean
  phone: string
  email: string
  website: string
  instagram: string
  operating_hours: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  inventory?: {
    category: string
    items: { name: string; price: string; available: boolean }[]
  }[]
}

// Derived from studios-stores-data.ts (the same 3 demo entries the shared
// /studios-stores/[id] detail page resolves) rather than a separate
// hand-written list - a previous standalone array here used ids the detail
// page's lookup didn't recognize, so every mock card on this page 404'd.
export const mockStudios: StudioData[] = studiosStoresData.map((item) => ({
  id: String(item.id),
  user_profile_id: String(item.id),
  business_name: item.name,
  type: item.type === "store" ? "equipment_store" : "studio",
  location: item.location,
  city: item.city || item.location,
  province: item.province || "",
  bio: item.description,
  services: item.services || [],
  equipment: item.equipment || [],
  profile_picture: item.image,
  gallery_images: item.gallery || [],
  rating: item.rating,
  total_reviews: item.reviews,
  price_range: item.hourlyRate || "Rate on request",
  availability_status: item.availability || "Available",
  is_verified: item.verified ?? true,
  featured: false,
  phone: item.contact?.phone || "",
  email: item.contact?.email || "",
  website: item.contact?.website || "",
  instagram: "",
  operating_hours: {
    monday: "09:00 - 17:00",
    tuesday: "09:00 - 17:00",
    wednesday: "09:00 - 17:00",
    thursday: "09:00 - 17:00",
    friday: "09:00 - 17:00",
    saturday: "Closed",
    sunday: "Closed",
  },
}))

export const getStudioById = (id: string): StudioData | undefined => {
  return mockStudios.find((studio) => studio.id === id)
}

export const getStudiosByType = (type: "studio" | "equipment_store"): StudioData[] => {
  return mockStudios.filter((studio) => studio.type === type)
}

export const getStudiosByLocation = (province: string): StudioData[] => {
  return mockStudios.filter((studio) => studio.province.toLowerCase() === province.toLowerCase())
}
