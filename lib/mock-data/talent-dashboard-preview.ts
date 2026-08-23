export type TalentPackageDraft = {
  id: string
  name: string
  price: string
  description: string
  image: string
  badge: string
  availability: string
  // Creator/crew packages advertise deliverables (raw footage, revisions,
  // turnaround, etc.) instead of studio-style physical amenities.
  included: string[]
}

export const MAX_TALENT_PACKAGES = 5

export const TALENT_PACKAGE_ADDON_OPTIONS = [
  "Raw Footage",
  "Edited Footage",
  "Same-Day Turnaround",
  "2 Rounds of Revisions",
  "Travel Included",
  "Drone Footage",
  "Music Licensing",
  "Behind-the-Scenes Content",
  "Social Media Cuts",
  "Rush Delivery",
]

export const DEFAULT_TALENT_PACKAGES: TalentPackageDraft[] = [
  {
    id: "package-half-day",
    name: "Half Day Shoot",
    price: "R2,500",
    description: "Up to 4 hours on location or in studio - ideal for portraits, content days, or short interviews.",
    image: "",
    badge: "Up to 4 hours",
    availability: "Available",
    included: ["Edited Footage", "2 Rounds of Revisions"],
  },
  {
    id: "package-full-day",
    name: "Full Day Shoot",
    price: "R4,500",
    description: "A full production day for commercials, events, or multi-location shoots.",
    image: "",
    badge: "Up to 8 hours",
    availability: "Available",
    included: ["Raw Footage", "Edited Footage"],
  },
]

// Pure parse, no fallback to the canned examples - use this for the public
// profile page, where showing DEFAULT_TALENT_PACKAGES for someone who never
// configured any packages would misrepresent their real rates.
export function parseTalentPackages(value: unknown): TalentPackageDraft[] {
  if (!Array.isArray(value)) return []

  return value
    .slice(0, MAX_TALENT_PACKAGES)
    .map((item, index) => {
      if (!item || typeof item !== "object") return null
      const draft = item as Partial<TalentPackageDraft>
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
    .filter((item): item is TalentPackageDraft => Boolean(item?.name || item?.price || item?.description))
}

// Same parse, but falls back to the canned examples when empty - use this
// for the dashboard editor, which should always show something to edit.
export function normalizeTalentPackages(value: unknown): TalentPackageDraft[] {
  const packages = parseTalentPackages(value)
  return packages.length ? packages : DEFAULT_TALENT_PACKAGES
}

// The dashboard lets an account fill in up to MAX_TALENT_PACKAGES packages
// but choose to only publish a smaller number of them - always clamped to
// however many packages actually exist so a stale count from a previous,
// larger list can't ask for more packages than are currently defined.
export function normalizeVisiblePackageCount(value: unknown, totalPackages: number): number {
  const max = Math.max(1, Math.min(MAX_TALENT_PACKAGES, totalPackages || MAX_TALENT_PACKAGES))
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) return max
  return Math.min(Math.round(parsed), max)
}
