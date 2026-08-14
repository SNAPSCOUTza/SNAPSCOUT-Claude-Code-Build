"use client"

export type LocalSavedProfile = {
  id: string
  name: string
  role?: string
  location?: string
  imageUrl?: string
  href?: string
  category?: "creator" | "crew" | "studio" | "store" | "profile"
  savedAt: string
}

export const LOCAL_SAVED_PROFILES_KEY = "snapscout:saved-profiles:v1"
export const LOCAL_SAVED_PROFILES_EVENT = "snapscout:saved-profiles-updated"

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined"

export function inferProfileHref(profile: Pick<LocalSavedProfile, "id" | "href" | "category">) {
  if (profile.href) return profile.href
  if (profile.category === "crew" || profile.id.startsWith("crew-")) return `/crew/${profile.id}`
  if (profile.category === "creator" || profile.id.startsWith("creator-")) return `/creators/${profile.id}`
  if (profile.category === "studio" || profile.category === "store") return `/studios-stores/${profile.id}`
  return `/profile/${profile.id}`
}

export function loadLocalSavedProfiles(): LocalSavedProfile[] {
  if (!canUseStorage()) return []

  try {
    const raw = window.localStorage.getItem(LOCAL_SAVED_PROFILES_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is LocalSavedProfile => Boolean(item?.id && item?.name))
  } catch {
    return []
  }
}

function writeLocalSavedProfiles(profiles: LocalSavedProfile[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(LOCAL_SAVED_PROFILES_KEY, JSON.stringify(profiles))
  window.dispatchEvent(new CustomEvent(LOCAL_SAVED_PROFILES_EVENT, { detail: profiles }))
}

export function isProfileSavedLocally(profileId: string) {
  return loadLocalSavedProfiles().some((profile) => profile.id === profileId)
}

export function saveProfileLocally(profile: Omit<LocalSavedProfile, "savedAt"> & { savedAt?: string }) {
  const existing = loadLocalSavedProfiles().filter((item) => item.id !== profile.id)
  const nextProfile: LocalSavedProfile = {
    ...profile,
    href: inferProfileHref(profile),
    savedAt: profile.savedAt || new Date().toISOString(),
  }

  writeLocalSavedProfiles([nextProfile, ...existing].slice(0, 80))
  return nextProfile
}

export function removeProfileLocally(profileId: string) {
  const next = loadLocalSavedProfiles().filter((profile) => profile.id !== profileId)
  writeLocalSavedProfiles(next)
  return next
}
