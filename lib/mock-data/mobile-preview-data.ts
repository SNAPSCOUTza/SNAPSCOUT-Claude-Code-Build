export type MockMessageProfile = {
  user_id: string
  display_name: string
  profile_picture: string
  profession: string
}

export type MockConversationSeed = {
  id: string
  participant: MockMessageProfile
  lastMessage: string
  createdAt: string
  unreadCount?: number
  thread: Array<{
    from: "user" | "participant"
    content: string
    minutesAgo: number
  }>
}

export type MobileAdSegment = {
  id: string
  placement: "homepage" | "community" | "events"
  label: string
  title: string
  description: string
  image: string
  href: string
  cta: string
}

export type MockShootLocation = {
  id: string
  title: string
  city: string
  province: string
  image: string
  type: string
  safetyRating: string
  securityLevel: string
  bestTimes: string
  parking: string
  crowdLevel: string
  indoorOutdoor: string
}

export const mockMessageProfiles: MockMessageProfile[] = [
  {
    user_id: "mock-user-thandi",
    display_name: "Thandi Mokoena",
    profile_picture: "/images/beauty-portrait.jpg",
    profession: "Photographer",
  },
  {
    user_id: "mock-user-alex",
    display_name: "Alex Thompson",
    profile_picture: "/images/professional-headshot.jpg",
    profession: "Director of Photography",
  },
  {
    user_id: "mock-user-sarah",
    display_name: "Sarah Mitchell",
    profile_picture: "/images/sarah-portrait.png",
    profession: "Sound Engineer",
  },
  {
    user_id: "mock-user-lerato",
    display_name: "Lerato Khumalo",
    profile_picture: "/images/janelle-hiroshige-gfG_csFvelY-unsplash.jpg",
    profession: "Videographer",
  },
]

export const mockConversationSeeds: MockConversationSeed[] = [
  {
    id: "mock-convo-thandi",
    participant: mockMessageProfiles[0],
    lastMessage: "I can send a portrait package for Saturday.",
    createdAt: "2026-05-29T12:45:00.000Z",
    unreadCount: 2,
    thread: [
      { from: "participant", content: "Hi, thanks for reaching out. What kind of look are you after?", minutesAgo: 42 },
      { from: "user", content: "Clean studio portraits for a founder profile. Half day should work.", minutesAgo: 35 },
      { from: "participant", content: "I can send a portrait package for Saturday.", minutesAgo: 18 },
    ],
  },
  {
    id: "mock-convo-alex",
    participant: mockMessageProfiles[1],
    lastMessage: "The RED kit is available if the client confirms today.",
    createdAt: "2026-05-29T10:12:00.000Z",
    unreadCount: 0,
    thread: [
      { from: "user", content: "Can you cover a two-camera interview in Woodstock?", minutesAgo: 86 },
      { from: "participant", content: "Yes. I can bring camera, lenses, and a small lighting setup.", minutesAgo: 70 },
      { from: "participant", content: "The RED kit is available if the client confirms today.", minutesAgo: 48 },
    ],
  },
  {
    id: "mock-convo-sarah",
    participant: mockMessageProfiles[2],
    lastMessage: "I can handle location audio and a clean stereo mix.",
    createdAt: "2026-05-28T17:20:00.000Z",
    unreadCount: 1,
    thread: [
      { from: "participant", content: "Is this for podcast audio or a full video shoot?", minutesAgo: 260 },
      { from: "user", content: "Video interview, two speakers, indoor location.", minutesAgo: 228 },
      { from: "participant", content: "I can handle location audio and a clean stereo mix.", minutesAgo: 184 },
    ],
  },
]

export const homepageAdSegments: MobileAdSegment[] = [
  {
    id: "sponsored-creator-thandi",
    placement: "homepage",
    label: "Sponsored Creator",
    title: "Fashion editorials by Thandi",
    description: "Cape Town portrait and fashion packages for brands launching this month.",
    image: "/images/beauty-portrait.jpg",
    href: "/creators/creator-1",
    cta: "View creator",
  },
  {
    id: "gear-promo-red-kit",
    placement: "homepage",
    label: "Gear Rental",
    title: "Weekend camera kits",
    description: "Body, lens, lighting, and audio bundles for lean crews.",
    image: "/images/videography-camera.jpg",
    href: "/studios-stores/2",
    cta: "See gear",
  },
  {
    id: "studio-promo-urban",
    placement: "homepage",
    label: "Studio Promo",
    title: "Natural light spaces",
    description: "Book loft, rooftop, and warehouse looks across Johannesburg and Cape Town.",
    image: "/images/photography-workspace.jpg",
    href: "/studios-stores/1",
    cta: "Explore spaces",
  },
  {
    id: "community-event-mixer",
    placement: "community",
    label: "Community Event",
    title: "Johannesburg Creative Meetup",
    description: "Portfolio reviews, gear swaps, and crew introductions.",
    image: "/images/kyle-loftus-FtQE89f3EXA-unsplash.jpg",
    href: "/community",
    cta: "Open event",
  },
]

export const mockShootLocations: MockShootLocation[] = [
  {
    id: "loc-woodstock-loft",
    title: "Woodstock Loft Windows",
    city: "Cape Town",
    province: "Western Cape",
    image: "/images/photography-workspace.jpg",
    type: "Studio / Loft",
    safetyRating: "High",
    securityLevel: "Controlled access",
    bestTimes: "Morning and golden hour",
    parking: "Street and paid secure parking",
    crowdLevel: "Low",
    indoorOutdoor: "Indoor",
  },
  {
    id: "loc-joburg-rooftop",
    title: "City View Rooftop",
    city: "Johannesburg",
    province: "Gauteng",
    image: "/images/camera-viewfinder.jpg",
    type: "Rooftop",
    safetyRating: "Medium",
    securityLevel: "Building security",
    bestTimes: "Sunset",
    parking: "Basement parking",
    crowdLevel: "Medium",
    indoorOutdoor: "Outdoor",
  },
  {
    id: "loc-durban-warehouse",
    title: "Durban Warehouse Space",
    city: "Durban",
    province: "KwaZulu-Natal",
    image: "/images/film-clapperboard.jpg",
    type: "Warehouse",
    safetyRating: "High",
    securityLevel: "Private lock-up",
    bestTimes: "All day",
    parking: "On-site loading bay",
    crowdLevel: "Low",
    indoorOutdoor: "Indoor",
  },
]

const crewSpecificTerms = [
  "director",
  "producer",
  "cinematographer",
  "dop",
  "camera operator",
  "sound engineer",
  "boom",
  "gaffer",
  "editor",
  "script supervisor",
  "makeup artist",
  "film crew",
  "production crew",
  "production assistant",
  "grip",
  "lighting technician",
  "1st ac",
  "2nd ac",
]

const creatorTerms = [
  "photographer",
  "videographer",
  "portrait",
  "wedding",
  "fashion",
  "product",
  "food",
  "events",
  "corporate",
  "lifestyle",
  "fine art",
  "street",
  "real estate",
  "nature",
  "family",
  "newborn",
  "boudoir",
  "architectural",
  "music videos",
  "social media",
  "commercial",
  "documentary",
  "drone",
  "youtube",
  "tiktok",
  "reels",
  "live streaming",
  "animation",
  "brand story",
]

export const creatorFilterGroups = {
  roles: ["Photographer", "Videographer", "Hybrid Creator"],
  disciplines: ["Photography", "Videography", "Social Media", "Commercial", "Events"],
  specialisations: [
    "Portrait Photography",
    "Fashion Shoots",
    "Product Photography",
    "Food Photography",
    "Wedding Photography",
    "Lifestyle",
    "Corporate",
    "Music Videos",
    "Drone",
    "Documentary",
    "Brand Story",
    "Real Estate",
  ],
}

export function isCrewSpecificTerm(value?: string | null) {
  if (!value) return false
  const normalized = value.toLowerCase()
  return crewSpecificTerms.some((term) => normalized.includes(term))
}

export function isCreatorTerm(value?: string | null) {
  if (!value) return false
  const normalized = value.toLowerCase()
  return creatorTerms.some((term) => normalized.includes(term))
}

export function sanitizeCreatorTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return []
  return Array.from(
    new Set(
      tags
        .filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
        .map((tag) => tag.trim())
        .filter((tag) => !isCrewSpecificTerm(tag)),
    ),
  )
}

export function isCreatorProfileCandidate(profile: { profession?: string; skills?: string[]; specializations?: string[] }) {
  const profession = profile.profession || ""
  if (isCrewSpecificTerm(profession)) return false
  if (isCreatorTerm(profession)) return true
  return sanitizeCreatorTags(profile.specializations || profile.skills).length > 0
}
