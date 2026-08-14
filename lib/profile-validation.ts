import { SOUTH_AFRICAN_PROVINCES, type SouthAfricanProvince } from "@/types/database"

export interface ProfileValidationError {
  field: string
  message: string
}

export function validateProvince(province?: string): ProfileValidationError | null {
  if (!province) return null // Province is optional

  if (!SOUTH_AFRICAN_PROVINCES.includes(province as SouthAfricanProvince)) {
    return {
      field: "province",
      message: "Please select a valid South African province",
    }
  }

  return null
}

export function validateProfile(profile: any): ProfileValidationError[] {
  const errors: ProfileValidationError[] = []

  // Validate required fields
  if (!profile.full_name?.trim()) {
    errors.push({ field: "full_name", message: "Full name is required" })
  }

  if (!profile.profession?.trim()) {
    errors.push({ field: "profession", message: "Profession is required" })
  }

  // Validate province if provided
  const provinceError = validateProvince(profile.province)
  if (provinceError) {
    errors.push(provinceError)
  }

  // Validate email format if provided
  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    errors.push({ field: "email", message: "Please enter a valid email address" })
  }

  // Validate phone format if provided (South African format)
  if (profile.phone && !/^(\+27|0)[0-9]{9}$/.test(profile.phone.replace(/\s/g, ""))) {
    errors.push({ field: "phone", message: "Please enter a valid South African phone number" })
  }

  return errors
}

export function isValidSouthAfricanProvince(province: string): province is SouthAfricanProvince {
  return SOUTH_AFRICAN_PROVINCES.includes(province as SouthAfricanProvince)
}
