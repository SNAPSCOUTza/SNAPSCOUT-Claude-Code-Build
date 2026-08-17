"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  User,
  Camera,
  Briefcase,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  Settings,
  CreditCard,
  LogOut,
  Eye,
  EyeOff,
  Upload,
  X,
  Check,
  AlertCircle,
  Loader2,
  Save,
  Lock,
  Mail,
  ImageIcon,
  ExternalLink,
  PlayCircle,
  FolderKanban,
  Compass,
  Package,
  Bell,
  ClipboardList,
  FileText,
  MapPin,
  Clock3,
  Warehouse,
  Home,
  Wifi,
  Zap,
  Car,
  ShieldCheck,
  Coffee,
  Sun,
  Trees,
  Building2,
  CalendarDays,
  Megaphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, signOut } from "@/lib/auth"
import { SubscriptionCard } from "@/components/dashboard/subscription-card"
import { PortfolioManager } from "@/components/dashboard/portfolio-manager"
import { calculateProfileCompleteness } from "@/lib/profile-utils"
import { resizeImageFile } from "@/lib/image-resize"
import { CREATOR_SPECIALIZATION_OPTIONS } from "@/lib/creator-specializations"
import { AvailabilityManager } from "@/components/availability/availability-manager"
import type { AvailabilityOwnerType } from "@/lib/availability"
import { IncomingAvailabilityRequests } from "@/components/crew/IncomingAvailabilityRequests"
import type { PortfolioSourcePlatform, ProfilePortfolioItem } from "@/types/portfolio"
import {
  DEFAULT_STUDIO_STORE_PACKAGES,
  STUDIO_STORE_DASHBOARD_PREVIEW_KEY,
  normalizeStudioStorePackages,
  type StudioStorePackageDraft,
} from "@/lib/mock-data/studio-store-dashboard-preview"

interface UserProfile {
  id?: string
  full_name: string
  display_name?: string
  account_type?: string
  email?: string
  bio: string
  profession: string
  location: string
  profile_image_url: string
  availability: string
  is_public: boolean
  social_links: {
    instagram?: string
    linkedin?: string
    youtube?: string
    website?: string
    twitter?: string
    vimeo?: string
    facebook?: string
    imdb?: string
    imdb_profile?: string
  }
  portfolio_images: string[]
  skills?: string[]
  specializations?: string[]
  roles?: string[]
  departments?: string[]
  software_skills?: string[]
  technical_skills?: string[]
  photography_skills?: string[]
  videography_skills?: string[]
  willing_to_travel?: boolean
  hourly_rate?: string
  daily_rate?: string
  project_rate?: string
  rate_card_visible?: boolean
  experience_level?: string
  pricing?: string
  subscription_status?: string
  role?: string
  onboarding_data?: Record<string, any>
}

interface UserSubscription {
  status: string
  next_payment_date?: string
}

interface StudioStoreDashboardSettings {
  business_name: string
  logo_url: string
  showroom_photo_url: string
  map_link: string
  location_address: string
  operating_hours: string
  day_rate: string
  half_day_rate: string
  hourly_rate: string
  full_day_rate: string
  peak_rate: string
  off_peak_rate: string
  custom_packages: string
  listing_description: string
  listing_features: string
  selected_amenities: string[]
  indoor_outdoor_type: string
  listing_rules: string
  multiple_spaces: string
  package_items: StudioStorePackageDraft[]
  owned_gear_list: string
  rentable_gear_list: string
  inventory_items: string
  credits: string
  rental_terms_summary: string
  full_terms: string
  deposit_tracking_notes: string
  rental_request_notes: string
  notifications_notes: string
}

const DEFAULT_STUDIO_STORE_SETTINGS: StudioStoreDashboardSettings = {
  business_name: "",
  logo_url: "",
  showroom_photo_url: "",
  map_link: "",
  location_address: "",
  operating_hours: "",
  day_rate: "",
  half_day_rate: "",
  hourly_rate: "",
  full_day_rate: "",
  peak_rate: "",
  off_peak_rate: "",
  custom_packages: "",
  listing_description: "",
  listing_features: "",
  selected_amenities: ["Natural Light", "Wi-Fi", "Backup Power", "Parking"],
  indoor_outdoor_type: "Indoor",
  listing_rules: "",
  multiple_spaces: "",
  package_items: DEFAULT_STUDIO_STORE_PACKAGES,
  owned_gear_list: "",
  rentable_gear_list: "",
  inventory_items: "",
  credits: "",
  rental_terms_summary: "",
  full_terms: "",
  deposit_tracking_notes: "",
  rental_request_notes: "",
  notifications_notes: "",
}

const SOUTH_AFRICA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
]

const PROVINCE_CITIES: Record<string, string[]> = {
  "Eastern Cape": ["Port Elizabeth", "East London", "Makhanda", "Bhisho", "Mthatha"],
  "Free State": ["Bloemfontein", "Welkom", "Bethlehem", "Kroonstad", "Sasolburg"],
  Gauteng: ["Johannesburg", "Pretoria", "Sandton", "Soweto", "Midrand", "Centurion"],
  "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Newcastle", "Richards Bay", "Ballito"],
  Limpopo: ["Polokwane", "Tzaneen", "Thohoyandou", "Musina", "Mokopane"],
  Mpumalanga: ["Mbombela", "Witbank", "Secunda", "Middelburg", "Ermelo"],
  "North West": ["Rustenburg", "Mahikeng", "Klerksdorp", "Potchefstroom", "Brits"],
  "Northern Cape": ["Kimberley", "Upington", "Springbok", "De Aar", "Kuruman"],
  "Western Cape": ["Cape Town", "Stellenbosch", "Paarl", "George", "Knysna", "Worcester"],
}

const ACCOUNT_TYPE_OPTIONS = [
  { value: "creator", label: "Creator / Freelancer" },
  { value: "scout", label: "Scout / Client" },
  { value: "studio", label: "Studio Owner" },
  { value: "store", label: "Equipment Store" },
]

const CREW_ROLE_OPTIONS = [
  "Director",
  "Producer",
  "Director of Photography",
  "Cinematographer / DOP",
  "Camera Operator",
  "Sound Engineer",
  "Boom Operator",
  "Gaffer",
  "Editor",
  "Script Supervisor",
  "Makeup Artist",
]

const DEPARTMENT_OPTIONS = [
  "Camera",
  "Audio",
  "Lighting",
  "Production",
  "Art",
  "Hair & Makeup",
  "Post-Production",
  "Grip",
  "Directing",
  "Editing",
]

const SKILL_OPTIONS = [
  "Natural Light",
  "Color Grading",
  "Drone Operations",
  "Location Recording",
  "Post-Production Mixing",
  "Foley Design",
  "Portrait Lighting",
  "Studio Lighting",
  "Commercial Beauty",
  "Brand Campaigns",
  "Product Retouching",
  "Client Direction",
]

const STUDIO_STORE_AMENITY_OPTIONS = [
  { label: "Natural Light", icon: Sun },
  { label: "Wi-Fi", icon: Wifi },
  { label: "Backup Power", icon: Zap },
  { label: "Parking", icon: Car },
  { label: "Security", icon: ShieldCheck },
  { label: "Restaurant / Cafe", icon: Coffee },
  { label: "Indoor", icon: Building2 },
  { label: "Outdoor", icon: Trees },
  { label: "Makeup Room", icon: Camera },
  { label: "Editing Bay", icon: PlayCircle },
  { label: "Client Lounge", icon: Home },
  { label: "Load-in Access", icon: Package },
]

const STUDIO_STORE_AMENITY_LABELS = STUDIO_STORE_AMENITY_OPTIONS.map((option) => option.label)
const INDOOR_OUTDOOR_OPTIONS = ["Indoor", "Outdoor", "Indoor / Outdoor"]
const PACKAGE_AVAILABILITY_OPTIONS = ["Available", "Limited", "Booked", "On request"]

const GALLERY_PLATFORM_META: Record<
  PortfolioSourcePlatform | "linkedin" | "website",
  {
    label: string
    description: string
    accent: string
    Icon: typeof Globe
  }
> = {
  local: {
    label: "Uploaded images",
    description: "Images saved directly to your SnapScout profile.",
    accent: "bg-slate-100 text-slate-700",
    Icon: ImageIcon,
  },
  instagram: {
    label: "Instagram",
    description: "Posts, reels, or profile links imported from Instagram.",
    accent: "bg-rose-50 text-rose-700",
    Icon: Instagram,
  },
  facebook: {
    label: "Facebook",
    description: "Facebook pages, videos, and public portfolio links.",
    accent: "bg-blue-50 text-blue-700",
    Icon: Globe,
  },
  youtube: {
    label: "YouTube",
    description: "Video embeds and channel links from YouTube.",
    accent: "bg-red-50 text-red-700",
    Icon: Youtube,
  },
  vimeo: {
    label: "Vimeo",
    description: "Vimeo reels, profile links, and video embeds.",
    accent: "bg-cyan-50 text-cyan-700",
    Icon: PlayCircle,
  },
  imdb: {
    label: "IMDb",
    description: "Credits and profile links saved as external portfolio proof.",
    accent: "bg-amber-50 text-amber-700",
    Icon: Globe,
  },
  external: {
    label: "External links",
    description: "Portfolio pages and media from other trusted sources.",
    accent: "bg-gray-100 text-gray-700",
    Icon: ExternalLink,
  },
  linkedin: {
    label: "LinkedIn",
    description: "Professional credits and profile links from LinkedIn.",
    accent: "bg-sky-50 text-sky-700",
    Icon: Linkedin,
  },
  website: {
    label: "Website",
    description: "Your own website or portfolio destination.",
    accent: "bg-emerald-50 text-emerald-700",
    Icon: Globe,
  },
}

function isEqual(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

function normalizeTextArray(value: any): string[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean)
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function rateToString(value: any) {
  if (value === undefined || value === null || value === "") return ""
  return String(value)
}

function normalizeProfileUrl(platform: string, value?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return ""

  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const handle = trimmed.replace(/^@/, "")
  if (platform === "instagram") return `https://instagram.com/${handle}`
  if (platform === "linkedin") return `https://linkedin.com/in/${handle}`
  if (platform === "youtube") return `https://youtube.com/${handle}`
  if (platform === "vimeo") return `https://vimeo.com/${handle}`
  if (platform === "facebook") return `https://facebook.com/${handle}`
  if (platform === "imdb") return `https://imdb.com/name/${handle}`
  return `https://${trimmed}`
}

function getReadableUrl(url?: string | null) {
  if (!url) return "Saved portfolio item"
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

type DashboardGalleryItem = {
  id: string
  title: string
  url: string
  thumbnail?: string | null
  embedUrl?: string | null
  mediaType?: string | null
}

function isUsablePreviewImage(url?: string | null) {
  if (!url) return false
  return !String(url).includes("placeholder")
}

function isDirectImageUrl(url?: string | null) {
  if (!url) return false
  return /\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(url)
}

function getYouTubeEmbedUrl(url?: string | null) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^"&?/\s]{11})/)
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null
}

function getVimeoEmbedUrl(url?: string | null) {
  if (!url) return null
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match?.[1] ? `https://player.vimeo.com/video/${match[1]}` : null
}

function getMediaEmbedUrl(platform: string, item: DashboardGalleryItem) {
  if (item.embedUrl) return item.embedUrl
  if (platform === "youtube") return getYouTubeEmbedUrl(item.url)
  if (platform === "vimeo") return getVimeoEmbedUrl(item.url)
  return null
}

function GalleryPreviewTile({
  item,
  platform,
  index,
}: {
  item: DashboardGalleryItem
  platform: PortfolioSourcePlatform | "linkedin" | "website"
  index: number
}) {
  const embedUrl = getMediaEmbedUrl(platform, item)
  const previewImage = isUsablePreviewImage(item.thumbnail)
    ? item.thumbnail
    : isDirectImageUrl(item.url)
      ? item.url
      : null
  const isInstagramPost = platform === "instagram" && /instagram\.com\/(p|reel|tv)\//i.test(item.url)
  const isFacebookPost = platform === "facebook" && /(facebook\.com|fb\.watch)/i.test(item.url)

  return (
    <motion.article
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, delay: index * 0.04, ease: "easeOut" }}
      className="overflow-hidden rounded-[22px] border border-gray-100 bg-gray-50 shadow-sm"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={item.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : isInstagramPost ? (
          <div className="h-full overflow-y-auto bg-white p-2">
            <blockquote
              className="instagram-media !min-w-0 !w-full"
              data-instgrm-permalink={item.url}
              data-instgrm-version="14"
              style={{
                background: "#fff",
                border: 0,
                margin: "0 auto",
                maxWidth: "100%",
                minWidth: "0",
                width: "100%",
              }}
            >
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                View Instagram post
              </a>
            </blockquote>
          </div>
        ) : isFacebookPost ? (
          <div className="grid h-full place-items-center bg-white p-3">
            <div className="fb-post" data-href={item.url} data-width="420" data-show-text="true" />
            <a className="mt-3 text-sm font-semibold text-blue-700" href={item.url} target="_blank" rel="noopener noreferrer">
              Open Facebook post
            </a>
          </div>
        ) : previewImage ? (
          <img src={previewImage} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center bg-white p-6 text-center">
            <div>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-gray-500">
                <ExternalLink className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-950">{getReadableUrl(item.url)}</p>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                This source is saved as an external portfolio reference.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-white p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-950">{item.title}</p>
          <p className="mt-0.5 truncate text-xs text-gray-500">{getReadableUrl(item.url)}</p>
        </div>
        {item.url && (
          <motion.a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.94 }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:text-red-500"
            aria-label={`Open ${item.title}`}
          >
            <ExternalLink className="h-4 w-4" />
          </motion.a>
        )}
      </div>
    </motion.article>
  )
}

function ChipPicker({
  label,
  description,
  options,
  value,
  onChange,
}: {
  label: string
  description?: string
  options: string[]
  value?: string[]
  onChange: (value: string[]) => void
}) {
  const selected = normalizeTextArray(value)
  const selectedSummary =
    selected.length > 0
      ? `${selected.slice(0, 3).join(", ")}${selected.length > 3 ? ` +${selected.length - 3} more` : ""}`
      : `Select ${label.toLowerCase()}`

  const toggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>{label}</Label>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm transition hover:border-red-200 [&::-webkit-details-marker]:hidden">
          <span className="min-w-0">
            <span className="block truncate font-semibold text-gray-900">{selectedSummary}</span>
            <span className="mt-1 block text-xs text-gray-500">
              {selected.length ? `${selected.length} selected` : "Tap to choose"}
            </span>
          </span>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 transition group-open:bg-red-50 group-open:text-red-600">
            {selected.length}
          </span>
        </summary>
        <div className="border-t border-gray-100 p-3">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mb-3 text-xs font-semibold text-red-600 hover:text-red-700"
            >
              Clear selections
            </button>
          )}
          <div className="grid max-h-60 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {options.map((option) => {
              const isSelected = selected.includes(option)
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggle(option)}
                  className={`flex min-h-11 items-center justify-between gap-3 rounded-full border px-4 py-2 text-left text-sm font-semibold transition ${
                    isSelected
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-gray-200 bg-gray-50 text-gray-800 hover:border-red-200 hover:bg-red-50"
                  }`}
                >
                  <span>{option}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      </details>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error" | "unsaved">("idle")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null)
  const [uploadingPackageImageIndex, setUploadingPackageImageIndex] = useState<number | null>(null)
  const [packageImageUploadError, setPackageImageUploadError] = useState<{ index: number; message: string } | null>(null)

  const initialProfileRef = useRef<UserProfile | null>(null)
  const initialStudioStoreSettingsRef = useRef<StudioStoreDashboardSettings>(DEFAULT_STUDIO_STORE_SETTINGS)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [profileData, setProfileData] = useState<UserProfile>({
    full_name: "",
    bio: "",
    profession: "",
    location: "",
    profile_image_url: "",
    availability: "available",
    is_public: false,
    social_links: {},
    portfolio_images: [],
    skills: [],
    specializations: [],
    roles: [],
    departments: [],
    software_skills: [],
    technical_skills: [],
    photography_skills: [],
    videography_skills: [],
    willing_to_travel: false,
    hourly_rate: "",
    daily_rate: "",
    project_rate: "",
    rate_card_visible: true,
    experience_level: "",
    role: "user",
  })
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)

  const [selectedProvince, setSelectedProvince] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [activeSection, setActiveSection] = useState("profile")
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)

  useEffect(() => {
    const requestedSection = searchParams.get("section")
    const instagramState = searchParams.get("instagram")
    if (requestedSection) {
      setActiveSection(requestedSection)
      return
    }
    if (instagramState) setActiveSection("portfolio")
  }, [searchParams])

  const [passwordResetLoading, setPasswordResetLoading] = useState(false)
  const [passwordResetSent, setPasswordResetSent] = useState(false)
  const [passwordResetError, setPasswordResetError] = useState("")
  const [portfolioImportUrl, setPortfolioImportUrl] = useState("")
  const [portfolioImportStatus, setPortfolioImportStatus] = useState<"idle" | "importing" | "success" | "error">("idle")
  const [portfolioImportMessage, setPortfolioImportMessage] = useState("")
  const [instagramImportUrls, setInstagramImportUrls] = useState("")
  const [instagramImportStatus, setInstagramImportStatus] = useState<"idle" | "importing" | "success" | "error">("idle")
  const [instagramImportMessage, setInstagramImportMessage] = useState("")
  const [portfolioItems, setPortfolioItems] = useState<ProfilePortfolioItem[]>([])
  const [portfolioItemsLoading, setPortfolioItemsLoading] = useState(false)
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({})
  const [studioStoreSettings, setStudioStoreSettings] = useState<StudioStoreDashboardSettings>(
    DEFAULT_STUDIO_STORE_SETTINGS,
  )

  const [profileCompleteness, setProfileCompleteness] = useState(0)

  const dashboardOwnerType: AvailabilityOwnerType =
    profileData.account_type === "studio"
      ? "studio"
      : profileData.account_type === "store"
        ? "store"
        : profileData.profession?.toLowerCase().includes("photo")
          ? "photographer"
          : profileData.profession?.toLowerCase().includes("video")
            ? "videographer"
            : "crew"
  const isStudioOrStoreAccount = profileData.account_type === "studio" || profileData.account_type === "store"
  const isCreatorDashboard = !isStudioOrStoreAccount && profileData.account_type !== "scout"
  const isAdminDashboard = profileData.role === "admin" || profileData.role === "super_admin"

  const hasUnsavedChanges = useCallback(() => {
    if (!initialProfileRef.current) return false

    const currentProfile = {
      ...profileData,
      location: selectedProvince && selectedCity ? `${selectedCity}, ${selectedProvince}` : profileData.location,
    }

    const profileChanged = !isEqual(currentProfile, initialProfileRef.current)
    const studioSettingsChanged =
      isStudioOrStoreAccount && !isEqual(studioStoreSettings, initialStudioStoreSettingsRef.current)

    return profileChanged || studioSettingsChanged
  }, [isStudioOrStoreAccount, profileData, selectedProvince, selectedCity, studioStoreSettings])

  const gallerySections = useMemo(() => {
    const sections: Array<{
      id: string
      platform: PortfolioSourcePlatform | "linkedin" | "website"
      items: Array<{
        id: string
        title: string
        url: string
        thumbnail?: string | null
        embedUrl?: string | null
        mediaType?: string | null
      }>
    }> = []

    const grouped = portfolioItems.reduce<Record<string, typeof sections[number]["items"]>>((acc, item, index) => {
      const platform = item.source_platform || item.platform || (item.source === "instagram" ? "instagram" : "external")
      const key = platform in GALLERY_PLATFORM_META ? platform : "external"
      const url =
        item.permalink ||
        item.source_url ||
        item.link ||
        item.mediaUrl ||
        item.media_url ||
        item.image_url ||
        item.full_media_url ||
        item.fullUrl ||
        item.thumbnailUrl ||
        item.thumbnail_url ||
        item.thumbnail ||
        ""
      if (!acc[key]) acc[key] = []
      acc[key].push({
        id: item.id || `${key}-${index}`,
        title: item.title || item.caption || item.description || getReadableUrl(url),
        url,
        thumbnail:
          item.thumbnailUrl ||
          item.thumbnail_url ||
          item.thumbnail ||
          item.mediaUrl ||
          item.media_url ||
          item.image_url ||
          item.full_media_url ||
          item.fullUrl,
        embedUrl: item.embed_url || item.embedUrl,
        mediaType: item.media_type || item.mediaType || item.type,
      })
      return acc
    }, {})

    Object.entries(grouped).forEach(([platform, items]) => {
      sections.push({ id: platform, platform: platform as PortfolioSourcePlatform, items })
    })

    if (profileData.portfolio_images.length) {
      sections.push({
        id: "uploaded-fallback",
        platform: "local",
        items: profileData.portfolio_images.map((image, index) => ({
          id: `uploaded-${index}`,
          title: `Uploaded image ${index + 1}`,
          url: image,
          thumbnail: image,
          mediaType: "image",
        })),
      })
    }

    const socialSources: Array<{
      platform: PortfolioSourcePlatform | "linkedin" | "website"
      value?: string
    }> = [
      { platform: "youtube", value: profileData.social_links.youtube },
      { platform: "vimeo", value: profileData.social_links.vimeo },
      { platform: "facebook", value: profileData.social_links.facebook },
      { platform: "linkedin", value: profileData.social_links.linkedin },
      { platform: "imdb", value: profileData.social_links.imdb || profileData.social_links.imdb_profile },
      { platform: "website", value: profileData.social_links.website },
    ]

    socialSources.forEach(({ platform, value }) => {
      const url = normalizeProfileUrl(platform, value)
      if (!url) return
      sections.push({
        id: `social-${platform}`,
        platform,
        items: [
          {
            id: `social-${platform}-profile`,
            title: `${GALLERY_PLATFORM_META[platform].label} profile`,
            url,
            mediaType: "external",
          },
        ],
      })
    })

    return sections
  }, [portfolioItems, profileData.portfolio_images, profileData.social_links])

  useEffect(() => {
    if (initialProfileRef.current && hasUnsavedChanges()) {
      setSaveStatus("unsaved")
    }
  }, [profileData, selectedProvince, selectedCity, hasUnsavedChanges])

  useEffect(() => {
    if (initialProfileRef.current && hasUnsavedChanges()) {
      setSaveStatus("unsaved")
    }
  }, [hasUnsavedChanges, studioStoreSettings])

  const loadProfile = async (userId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/profile/load", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const result = await response.json()

      if (!response.ok || result.error) {
        console.error("[v0] Dashboard: Error loading profile:", result.error)
        console.error("[v0] Dashboard: Response status:", response.status)
        setLoading(false)
        return
      }

      if (result.profile) {
        const profile = result.profile
        const socialLinks = profile.social_links || {}
        const location = typeof profile.location === "string" ? profile.location : ""
        let loadedCity = profile.city || ""
        let loadedProvince = profile.province || profile.provinces || ""

        if (location.includes(",")) {
          const [locationCity, locationProvince] = location.split(",").map((s: string) => s.trim())
          loadedCity = !loadedCity || loadedCity.includes(",") ? locationCity : loadedCity
          loadedProvince = loadedProvince || locationProvince
        }

        const newProfileData = {
          full_name: profile.full_name || profile.display_name || "",
          display_name: profile.display_name || profile.full_name || "",
          account_type: profile.account_type || profile.user_type || "creator",
          bio: profile.bio || "",
          profession: profile.profession || "",
          location: location || [loadedCity, loadedProvince].filter(Boolean).join(", "),
          profile_image_url: profile.profile_image_url || profile.profile_picture || profile.avatar_url || "",
          availability: profile.availability || profile.availability_status || "available",
          pricing: profile.pricing || "",
          is_public: profile.is_public ?? profile.is_profile_visible ?? true,
          skills: normalizeTextArray(profile.skills || profile.specializations || profile.roles),
          specializations: normalizeTextArray(profile.specializations || profile.skills),
          roles: normalizeTextArray(profile.roles),
          departments: normalizeTextArray(profile.departments),
          software_skills: normalizeTextArray(profile.software_skills),
          technical_skills: normalizeTextArray(profile.technical_skills),
          photography_skills: normalizeTextArray(profile.photography_skills),
          videography_skills: normalizeTextArray(profile.videography_skills),
          willing_to_travel: Boolean(profile.willing_to_travel),
          hourly_rate: rateToString(profile.hourly_rate),
          daily_rate: rateToString(profile.daily_rate),
          project_rate: rateToString(profile.project_rate),
          rate_card_visible: profile.rate_card_visible ?? true,
          experience_level: profile.experience_level || "",
          social_links: {
            website: socialLinks.website || profile.website || profile.website_url || profile.portfolio_url || "",
            instagram: socialLinks.instagram || profile.instagram || profile.instagram_url || "",
            twitter: socialLinks.twitter || profile.twitter || profile.twitter_url || "",
            linkedin: socialLinks.linkedin || profile.linkedin || profile.linkedin_url || "",
            youtube: socialLinks.youtube || profile.youtube || profile.youtube_url || "",
            vimeo: socialLinks.vimeo || profile.vimeo || profile.vimeo_url || "",
            facebook: socialLinks.facebook || profile.facebook || profile.facebook_url || "",
            imdb:
              socialLinks.imdb ||
              socialLinks.imdb_profile ||
              profile.imdb_profile ||
              profile.imdb ||
              profile.imdb_url ||
              "",
          },
          portfolio_images: profile.portfolio_images || [],
          subscription_status: profile.subscription_status || (profile.user_type === "scout" ? "active" : "free"),
          role: profile.role || "user",
        }

        setProfileData(newProfileData)
        initialProfileRef.current = newProfileData
        const loadedOnboardingData =
          profile.onboarding_data && typeof profile.onboarding_data === "object" ? profile.onboarding_data : {}
        setOnboardingData(loadedOnboardingData)
        const loadedStudioStoreSettings = {
          ...DEFAULT_STUDIO_STORE_SETTINGS,
          ...(loadedOnboardingData?.studio_store_dashboard || {}),
          selected_amenities: normalizeTextArray(
            loadedOnboardingData?.studio_store_dashboard?.selected_amenities ||
              loadedOnboardingData?.studio_store_dashboard?.listing_features ||
              DEFAULT_STUDIO_STORE_SETTINGS.selected_amenities,
          ),
          package_items: normalizeStudioStorePackages(loadedOnboardingData?.studio_store_dashboard?.package_items),
        }
        setStudioStoreSettings(loadedStudioStoreSettings)
        initialStudioStoreSettingsRef.current = loadedStudioStoreSettings

        const completeness = calculateProfileCompleteness(profile)
        setProfileCompleteness(completeness)

        setSelectedCity(loadedCity)
        setSelectedProvince(loadedProvince)
      }
    } catch (error) {
      console.error("[v0] Dashboard: Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadPortfolioItems = async () => {
    if (!user?.id) return

    setPortfolioItemsLoading(true)
    try {
      const response = await fetch("/api/portfolio", {
        method: "GET",
        credentials: "include",
      })
      const payload = await response.json()
      if (response.ok && Array.isArray(payload.items)) {
        setPortfolioItems(payload.items)
      }
    } catch (error) {
      console.error("[v0] Dashboard: Error loading portfolio items:", error)
    } finally {
      setPortfolioItemsLoading(false)
    }
  }

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true)

      const currentUser = await getCurrentUser()

      if (!currentUser) {
        router.push("/auth/login")
        return
      }

      setUser(currentUser)

      await loadProfile(currentUser.id)

      // Fetch subscription
      const { data: subData } = await supabase
        .from("user_subscriptions")
        .select("status, next_payment_date")
        .eq("user_id", currentUser.id)
        .maybeSingle()

      if (subData) {
        setSubscription(subData)
      }
    }

    initializeDashboard()
  }, [router])

  useEffect(() => {
    if (user?.id) {
      loadPortfolioItems()
    }
  }, [user?.id])

  useEffect(() => {
    if (activeSection !== "gallery") return

    const hasInstagramEmbeds = gallerySections.some((section) => section.platform === "instagram")
    const hasFacebookEmbeds = gallerySections.some((section) => section.platform === "facebook")

    if (hasInstagramEmbeds) {
      const processInstagramEmbeds = () => (window as any).instgrm?.Embeds?.process?.()
      const existingInstagramScript = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.instagram.com/embed.js"]',
      )

      if (existingInstagramScript) {
        processInstagramEmbeds()
      } else {
        const script = document.createElement("script")
        script.src = "https://www.instagram.com/embed.js"
        script.async = true
        script.onload = processInstagramEmbeds
        document.body.appendChild(script)
      }
    }

    if (hasFacebookEmbeds) {
      if (!document.getElementById("fb-root")) {
        const fbRoot = document.createElement("div")
        fbRoot.id = "fb-root"
        document.body.appendChild(fbRoot)
      }

      const processFacebookEmbeds = () => (window as any).FB?.XFBML?.parse?.()
      const existingFacebookScript = document.querySelector<HTMLScriptElement>(
        'script[src*="connect.facebook.net"][src*="sdk.js"]',
      )

      if (existingFacebookScript) {
        processFacebookEmbeds()
      } else {
        const script = document.createElement("script")
        script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v20.0"
        script.async = true
        script.defer = true
        script.crossOrigin = "anonymous"
        script.onload = processFacebookEmbeds
        document.body.appendChild(script)
      }
    }
  }, [activeSection, gallerySections])

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value },
    }))
  }

  const handleStudioStoreSettingChange = (
    field: keyof StudioStoreDashboardSettings,
    value: string | string[] | StudioStorePackageDraft[],
  ) => {
    setStudioStoreSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleStudioAmenityToggle = (amenity: string) => {
    const current = normalizeTextArray(studioStoreSettings.selected_amenities)
    const next = current.includes(amenity)
      ? current.filter((item) => item !== amenity)
      : [...current, amenity]
    handleStudioStoreSettingChange("selected_amenities", next)
    handleStudioStoreSettingChange("listing_features", next.join(", "))
  }

  const handleStudioPackageChange = (
    index: number,
    field: keyof StudioStorePackageDraft,
    value: string | string[],
  ) => {
    const nextPackages = studioStoreSettings.package_items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    )
    handleStudioStoreSettingChange("package_items", nextPackages)
  }

  const handleStudioPackageAmenityToggle = (index: number, amenity: string) => {
    const packageItem = studioStoreSettings.package_items[index]
    const current = normalizeTextArray(packageItem?.included)
    const next = current.includes(amenity)
      ? current.filter((item) => item !== amenity)
      : [...current, amenity]
    handleStudioPackageChange(index, "included", next)
  }

  const addStudioPackage = () => {
    handleStudioStoreSettingChange("package_items", [
      ...studioStoreSettings.package_items,
      {
        id: `package-${Date.now()}`,
        name: "New Package",
        price: studioStoreSettings.hourly_rate || "R950/hr",
        description: "Describe what this room, kit, or booking package includes.",
        image: studioStoreSettings.showroom_photo_url || "/images/studio-space.png",
        badge: "Available",
        availability: "Available",
        included: normalizeTextArray(studioStoreSettings.selected_amenities).slice(0, 2),
      },
    ])
  }

  const removeStudioPackage = (index: number) => {
    const nextPackages = studioStoreSettings.package_items.filter((_, itemIndex) => itemIndex !== index)
    handleStudioStoreSettingChange("package_items", nextPackages.length ? nextPackages : DEFAULT_STUDIO_STORE_PACKAGES)
  }

  const handleImageUpload = async (file: File, field: "profile_image_url" | "portfolio_images") => {
    if (field !== "profile_image_url") {
      // Dead path - no UI element calls handleImageUpload with "portfolio_images".
      // Real portfolio uploads go through the Portfolio tab's own R2-backed flow.
      return
    }

    setAvatarUploadError(null)
    setAvatarUploading(true)
    try {
      const resized = await resizeImageFile(file, { maxDimension: 512, quality: 0.85 })

      const formData = new FormData()
      formData.append("file", resized)

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      })

      const result = await response.json().catch(() => null)

      if (!response.ok || !result?.url) {
        throw new Error(result?.error || "Failed to upload profile picture")
      }

      handleInputChange("profile_image_url", result.url)
    } catch (error: any) {
      setAvatarUploadError(error?.message || "Failed to upload profile picture")
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleStudioPackageImageUpload = async (index: number, file: File) => {
    setPackageImageUploadError(null)
    setUploadingPackageImageIndex(index)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/dashboard/studio-package-image", {
        method: "POST",
        body: formData,
      })

      const result = await response.json().catch(() => null)

      if (!response.ok || !result?.url) {
        throw new Error(result?.error || "Failed to upload room image")
      }

      handleStudioPackageChange(index, "image", result.url)
    } catch (error: any) {
      setPackageImageUploadError({ index, message: error?.message || "Failed to upload room image" })
    } finally {
      setUploadingPackageImageIndex(null)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) {
      setSaveError("You must be logged in to save your profile")
      setSaveStatus("error")
      return
    }

    // Check if there are actual changes
    if (!hasUnsavedChanges()) {
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
      return
    }

    setSaveStatus("saving")
    setSaveError(null)

    try {
      const location = selectedProvince && selectedCity ? `${selectedCity}, ${selectedProvince}` : profileData.location
      const mergedOnboardingData = {
        ...(onboardingData || {}),
        ...(isStudioOrStoreAccount ? { studio_store_dashboard: studioStoreSettings } : {}),
      }

      const profileToSave = {
        id: user.id,
        user_id: user.id,
        full_name: profileData.full_name,
        display_name: profileData.display_name,
        account_type: profileData.account_type,
        user_type: profileData.account_type,
        email: user.email,
        bio: profileData.bio,
        profession: profileData.profession || "Creative",
        location,
        city: selectedCity || null,
        cities: selectedCity || null,
        province: selectedProvince || null,
        provinces: selectedProvince || null,
        profile_image_url: profileData.profile_image_url,
        profile_picture: profileData.profile_image_url,
        avatar_url: profileData.profile_image_url,
        availability: profileData.availability,
        availability_status: profileData.availability,
        is_public: profileData.is_public,
        is_profile_visible: profileData.is_public,
        social_links: profileData.social_links,
        instagram: profileData.social_links.instagram || "",
        instagram_url: profileData.social_links.instagram || "",
        linkedin: profileData.social_links.linkedin || "",
        linkedin_url: profileData.social_links.linkedin || "",
        youtube: profileData.social_links.youtube || "",
        youtube_url: profileData.social_links.youtube || "",
        facebook: profileData.social_links.facebook || "",
        facebook_url: profileData.social_links.facebook || "",
        vimeo: profileData.social_links.vimeo || "",
        vimeo_url: profileData.social_links.vimeo || "",
        imdb_profile: profileData.social_links.imdb || profileData.social_links.imdb_profile || "",
        imdb_url: profileData.social_links.imdb || profileData.social_links.imdb_profile || "",
        website: profileData.social_links.website || "",
        portfolio_url: profileData.social_links.website || "",
        portfolio_images: profileData.portfolio_images,
        pricing: profileData.pricing,
        skills: normalizeTextArray(profileData.skills),
        specializations: normalizeTextArray(profileData.specializations || profileData.skills),
        roles: normalizeTextArray(profileData.roles),
        departments: normalizeTextArray(profileData.departments),
        software_skills: normalizeTextArray(profileData.software_skills),
        technical_skills: normalizeTextArray(profileData.technical_skills),
        photography_skills: normalizeTextArray(profileData.photography_skills),
        videography_skills: normalizeTextArray(profileData.videography_skills),
        willing_to_travel: Boolean(profileData.willing_to_travel),
        hourly_rate: profileData.hourly_rate || "",
        daily_rate: profileData.daily_rate || "",
        project_rate: profileData.project_rate || "",
        rate_card_visible: profileData.rate_card_visible ?? true,
        experience_level: profileData.experience_level || "",
        onboarding_data: mergedOnboardingData,
        updated_at: new Date().toISOString(),
      }

      const response = await fetch("/api/profile/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileToSave),
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        console.error("[v0] Dashboard: Save error:", result.error)
        setSaveError(result.error || "Failed to save profile")
        setSaveStatus("error")
      } else {
        initialProfileRef.current = {
          ...profileData,
          location,
          onboarding_data: mergedOnboardingData,
        }
        setOnboardingData(mergedOnboardingData)
        initialStudioStoreSettingsRef.current = studioStoreSettings
        if (isStudioOrStoreAccount && typeof window !== "undefined") {
          window.localStorage.setItem(STUDIO_STORE_DASHBOARD_PREVIEW_KEY, JSON.stringify(studioStoreSettings))
        }
        setSaveStatus("saved")

        const completeness = calculateProfileCompleteness(result.profile)
        setProfileCompleteness(completeness)

        // Reset status after 3 seconds
        setTimeout(() => setSaveStatus("idle"), 3000)
      }
    } catch (error: any) {
      console.error("[v0] Dashboard: Unexpected error:", error)
      setSaveError("Could not connect to database")
      setSaveStatus("error")
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const removePortfolioImage = (index: number) => {
    const updatedImages = profileData.portfolio_images.filter((_, i) => i !== index)
    handleInputChange("portfolio_images", updatedImages)
  }

  const handleImportPortfolioLink = async () => {
    if (!portfolioImportUrl.trim()) {
      setPortfolioImportStatus("error")
      setPortfolioImportMessage("Paste a portfolio, video, social, or credit URL first.")
      return
    }

    setPortfolioImportStatus("importing")
    setPortfolioImportMessage("")

    try {
      const response = await fetch("/api/portfolio/import-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url: portfolioImportUrl }),
      })
      const payload = await response.json()

      if (!response.ok || payload.error) {
        throw new Error(payload.error || "Could not import this link.")
      }

      const previewImage = payload.item?.thumbnail_url || payload.item?.full_media_url
      if (previewImage && !String(previewImage).includes("placeholder")) {
        setProfileData((prev) => ({
          ...prev,
          portfolio_images: prev.portfolio_images.includes(previewImage)
            ? prev.portfolio_images
            : [...prev.portfolio_images, previewImage],
        }))
      }
      if (payload.item) {
        setPortfolioItems((current) => [payload.item, ...current.filter((item) => item.id !== payload.item.id)])
      }

      setPortfolioImportUrl("")
      setPortfolioImportStatus("success")
      setPortfolioImportMessage("Portfolio link imported. It will now appear on your public profile.")
    } catch (error: any) {
      setPortfolioImportStatus("error")
      setPortfolioImportMessage(error?.message || "Could not import this link.")
    }
  }

  const handleImportInstagramPosts = async () => {
    const urls = Array.from(
      new Set(
        instagramImportUrls
          .split(/[\n,]+/)
          .map((value) => value.trim())
          .filter(Boolean)
          .filter((value) => /instagram\.com\/(p|reel|tv)\//i.test(value)),
      ),
    )

    if (!urls.length) {
      setInstagramImportStatus("error")
      setInstagramImportMessage("Paste one or more public Instagram post or reel URLs.")
      return
    }

    setInstagramImportStatus("importing")
    setInstagramImportMessage("")

    try {
      const importedItems: ProfilePortfolioItem[] = []
      const failures: string[] = []

      for (const url of urls) {
        const response = await fetch("/api/portfolio/import-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ url, title: "Instagram post" }),
        })
        const payload = await response.json()

        if (!response.ok || payload.error || !payload.item) {
          failures.push(url)
        } else {
          importedItems.push(payload.item)
        }
      }

      if (importedItems.length) {
        setPortfolioItems((current) => [
          ...importedItems,
          ...current.filter((item) => !importedItems.some((imported) => imported.id === item.id)),
        ])
      }

      setInstagramImportUrls("")
      setInstagramImportStatus(failures.length ? "error" : "success")
      setInstagramImportMessage(
        failures.length
          ? `Imported ${importedItems.length} post${importedItems.length === 1 ? "" : "s"}. ${failures.length} URL${failures.length === 1 ? "" : "s"} could not be imported.`
          : `Imported ${importedItems.length} Instagram post${importedItems.length === 1 ? "" : "s"} into your gallery preview.`,
      )
    } catch (error: any) {
      setInstagramImportStatus("error")
      setInstagramImportMessage(error?.message || "Could not import Instagram posts.")
    }
  }

  const handleRequestPasswordReset = async () => {
    if (!user?.email) return

    setPasswordResetLoading(true)
    setPasswordResetError("")
    setPasswordResetSent(false)

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email")
      }

      setPasswordResetSent(true)
    } catch (err) {
      setPasswordResetError(err instanceof Error ? err.message : "Failed to send reset email")
    } finally {
      setPasswordResetLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const SaveStatusIndicator = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Saving...</span>
          </div>
        )
      case "saved":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-sm">All changes saved</span>
          </div>
        )
      case "error":
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{saveError || "Error saving"}</span>
          </div>
        )
      case "unsaved":
        return (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Unsaved changes</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 flex-wrap justify-between gap-3 py-2">
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <SaveStatusIndicator />
            </div>
            <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-full md:hidden">
              <Link href="/" aria-label="Return to home page">
                <Home className="h-4 w-4" />
              </Link>
            </Button>
            <div className="hidden items-center gap-4 md:flex">
              <Button asChild variant="outline">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Link>
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={saveStatus === "saving"}
                variant={saveStatus === "unsaved" ? "default" : "outline"}
                className={saveStatus === "unsaved" ? "bg-red-500 hover:bg-red-600 text-white" : ""}
              >
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                {/* Profile Preview */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profileData.profile_image_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-red-100 text-red-600 text-2xl">
                        {profileData.display_name?.charAt(0) ||
                          profileData.full_name?.charAt(0) ||
                          user?.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {avatarUploading && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 p-1 bg-red-500 rounded-full cursor-pointer hover:bg-red-600">
                      <Camera className="h-4 w-4 text-white" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        disabled={avatarUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, "profile_image_url")
                          e.target.value = ""
                        }}
                      />
                    </label>
                  </div>
                  {avatarUploadError && <p className="mt-2 text-sm text-red-600">{avatarUploadError}</p>}
                  <h2 className="mt-4 font-semibold text-gray-900">
                    {profileData.display_name || profileData.full_name || "Your Name"}
                  </h2>
                  <p className="text-sm text-gray-500">{profileData.profession || "Your Profession"}</p>
                  {profileData.account_type && (
                    <Badge variant="outline" className="mt-2 mr-2 capitalize">
                      {ACCOUNT_TYPE_OPTIONS.find((opt) => opt.value === profileData.account_type)?.label ||
                        profileData.account_type}
                    </Badge>
                  )}
                  <Badge variant={profileData.is_public ? "default" : "secondary"} className="mt-2">
                    {profileData.is_public ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" /> Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" /> Hidden
                      </>
                    )}
                  </Badge>
                  {/* Profile Completeness */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Profile Completeness: {profileCompleteness}%</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {[
                    { id: "profile", icon: User, label: "Profile" },
                    { id: "portfolio", icon: Briefcase, label: "Portfolio" },
                    { id: "gallery", icon: ImageIcon, label: "Gallery" },
                    ...(isStudioOrStoreAccount
                      ? [
                          { id: "business", icon: Warehouse, label: "Studio / Store Ops" },
                          { id: "packages", icon: Package, label: "Packages" },
                        ]
                      : []),
                    { id: "settings", icon: Settings, label: "Settings" },
                    { id: "subscription", icon: CreditCard, label: "Subscription" },
                    { id: "crew-pools", icon: FolderKanban, label: "Crew Pools", href: "/crew-pools" },
                    { id: "community", icon: Compass, label: "Community", href: "/community" },
                    ...(isAdminDashboard
                      ? [
                          { id: "admin-overview", icon: ShieldCheck, label: "Admin Console", href: "/admin" },
                          { id: "admin-ads", icon: Megaphone, label: "Sponsored Ads", href: "/admin/ads" },
                          { id: "admin-articles", icon: FileText, label: "Blog Posts", href: "/admin/articles" },
                          { id: "admin-events", icon: CalendarDays, label: "Events", href: "/admin/events" },
                          { id: "admin-community", icon: Compass, label: "Community Editor", href: "/admin/articles" },
                          { id: "admin-site-content", icon: Home, label: "Site Content", href: "/admin/homepage-content" },
                        ]
                      : []),
                  ].map((item) =>
                    item.href ? (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left transition-colors ${
                          item.id.startsWith("admin-")
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                          activeSection === item.id ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </button>
                    ),
                  )}
                </nav>

                <div className="mt-6 space-y-2 border-t border-gray-100 pt-4 md:hidden">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saveStatus === "saving"}
                    variant={saveStatus === "unsaved" ? "default" : "outline"}
                    className={`h-11 w-full rounded-full ${saveStatus === "unsaved" ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
                  >
                    {saveStatus === "saving" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleSignOut} className="h-11 w-full rounded-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {user?.id && <IncomingAvailabilityRequests />}

            {user?.id && (
              <AvailabilityManager ownerId={user.id} ownerType={dashboardOwnerType} />
            )}

            {activeSection === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your profile details to help clients find you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Display Name and Account Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={profileData.display_name || ""}
                        onChange={(e) => handleInputChange("display_name", e.target.value)}
                        placeholder="How you want to be known"
                      />
                      <p className="text-xs text-gray-500 mt-1">This name will be shown on your public profile</p>
                    </div>
                    <div>
                      <Label htmlFor="account_type">Account Type</Label>
                      <Select
                        value={profileData.account_type || "creator"}
                        onValueChange={(value) => handleInputChange("account_type", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {ACCOUNT_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">Determines how you appear in search results</p>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => handleInputChange("full_name", e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profession">Profession</Label>
                      <Input
                        id="profession"
                        value={profileData.profession}
                        onChange={(e) => handleInputChange("profession", e.target.value)}
                        placeholder="e.g. Cinematographer, Sound Engineer"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Brief description of your skills and experience..."
                      rows={4}
                    />
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Province</Label>
                      <Select
                        value={selectedProvince}
                        onValueChange={(value) => {
                          setSelectedProvince(value)
                          setSelectedCity("")
                        }}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select Province" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {SOUTH_AFRICA_PROVINCES.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>City</Label>
                      <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedProvince}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {selectedProvince &&
                            PROVINCE_CITIES[selectedProvince]?.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Availability</Label>
                      <Select
                        value={profileData.availability}
                        onValueChange={(value) => handleInputChange("availability", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="unavailable">Unavailable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-gray-500">Make your profile visible to clients</p>
                      </div>
                      <Switch
                        checked={profileData.is_public}
                        onCheckedChange={(checked) => handleInputChange("is_public", checked)}
                      />
                    </div>
                  </div>

                  {isCreatorDashboard && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <div className="mb-5">
                        <h3 className="text-lg font-semibold text-gray-950">Creator Discovery</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Keep these details current so clients can filter and book the right profile.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <Label>Experience Level</Label>
                          <Select
                            value={profileData.experience_level || ""}
                            onValueChange={(value) => handleInputChange("experience_level", value)}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Professional">Professional</SelectItem>
                              <SelectItem value="Expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="hourly_rate">Hourly Rate</Label>
                          <Input
                            id="hourly_rate"
                            inputMode="numeric"
                            value={profileData.hourly_rate || ""}
                            onChange={(e) => handleInputChange("hourly_rate", e.target.value)}
                            placeholder="e.g. 950"
                          />
                        </div>
                        <div>
                          <Label htmlFor="daily_rate">Day Rate</Label>
                          <Input
                            id="daily_rate"
                            inputMode="numeric"
                            value={profileData.daily_rate || ""}
                            onChange={(e) => handleInputChange("daily_rate", e.target.value)}
                            placeholder="e.g. 4500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="project_rate">Project Rate</Label>
                          <Input
                            id="project_rate"
                            inputMode="numeric"
                            value={profileData.project_rate || ""}
                            onChange={(e) => handleInputChange("project_rate", e.target.value)}
                            placeholder="Optional package rate"
                          />
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4 md:col-span-1">
                          <div>
                            <Label>Willing to Travel</Label>
                            <p className="mt-1 text-xs text-gray-500">Show clients you can travel for work.</p>
                          </div>
                          <Switch
                            checked={Boolean(profileData.willing_to_travel)}
                            onCheckedChange={(checked) => handleInputChange("willing_to_travel", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4 md:col-span-1">
                          <div>
                            <Label>Show Rate Card</Label>
                            <p className="mt-1 text-xs text-gray-500">Turn off if rates are only by inquiry.</p>
                          </div>
                          <Switch
                            checked={profileData.rate_card_visible ?? true}
                            onCheckedChange={(checked) => handleInputChange("rate_card_visible", checked)}
                          />
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <ChipPicker
                          label="Specializations"
                          description="These power creator filters and the tags shown on your profile."
                          options={CREATOR_SPECIALIZATION_OPTIONS}
                          value={profileData.specializations}
                          onChange={(value) => handleInputChange("specializations", value)}
                        />
                        <ChipPicker
                          label="Skills"
                          description="Choose the skills clients should recognize immediately."
                          options={SKILL_OPTIONS}
                          value={profileData.skills}
                          onChange={(value) => handleInputChange("skills", value)}
                        />
                        <ChipPicker
                          label="Roles"
                          description="Useful for film crew and production searches."
                          options={CREW_ROLE_OPTIONS}
                          value={profileData.roles}
                          onChange={(value) => handleInputChange("roles", value)}
                        />
                        <ChipPicker
                          label="Departments"
                          description="Helps production teams filter crew by department."
                          options={DEPARTMENT_OPTIONS}
                          value={profileData.departments}
                          onChange={(value) => handleInputChange("departments", value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  <div>
                    <Label className="mb-4 block">Social Links</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Instagram className="h-5 w-5 text-gray-400" />
                        <Input
                          value={profileData.social_links.instagram || ""}
                          onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                          placeholder="Instagram username"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-gray-400" />
                        <Input
                          value={profileData.social_links.linkedin || ""}
                          onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
                          placeholder="LinkedIn profile URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-gray-400" />
                        <Input
                          value={profileData.social_links.youtube || ""}
                          onChange={(e) => handleSocialLinkChange("youtube", e.target.value)}
                          placeholder="YouTube channel URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <Input
                          value={profileData.social_links.website || ""}
                          onChange={(e) => handleSocialLinkChange("website", e.target.value)}
                          placeholder="Website URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <Input
                          value={profileData.social_links.facebook || ""}
                          onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
                          placeholder="Facebook profile or page URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <Input
                          value={profileData.social_links.vimeo || ""}
                          onChange={(e) => handleSocialLinkChange("vimeo", e.target.value)}
                          placeholder="Vimeo profile URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <Input
                          value={profileData.social_links.imdb || ""}
                          onChange={(e) => handleSocialLinkChange("imdb", e.target.value)}
                          placeholder="IMDb profile or credit URL"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "portfolio" && (
              <PortfolioManager
                items={portfolioItems}
                loading={portfolioItemsLoading}
                onItemsLoaded={setPortfolioItems}
                onRefresh={loadPortfolioItems}
                onPreviewGallery={() => setActiveSection("gallery")}
              />
            )}

            {activeSection === "gallery" && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>Gallery Preview</CardTitle>
                      <CardDescription>
                        Check how uploaded media and imported social links will be grouped on your public profile.
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-full"
                      onClick={() => setActiveSection("portfolio")}
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Manage Portfolio
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-[24px] border border-rose-100 bg-rose-50/60 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-700">
                          <Instagram className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-950">Show real Instagram posts</h3>
                          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                            Instagram profile links cannot expose your full feed by themselves. Paste public post or reel
                            URLs here and SnapScout will render them as actual embedded posts in this gallery preview.
                          </p>
                          {profileData.social_links.instagram && (
                            <a
                              href={normalizeProfileUrl("instagram", profileData.social_links.instagram)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-rose-700"
                            >
                              Connected profile: {getReadableUrl(normalizeProfileUrl("instagram", profileData.social_links.instagram))}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="w-full lg:max-w-md">
                        <Textarea
                          value={instagramImportUrls}
                          onChange={(event) => setInstagramImportUrls(event.target.value)}
                          placeholder={"Paste Instagram post/reel URLs, one per line\nhttps://www.instagram.com/p/...\nhttps://www.instagram.com/reel/..."}
                          className="min-h-28 rounded-2xl border-rose-100 bg-white"
                        />
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Button
                            type="button"
                            onClick={handleImportInstagramPosts}
                            disabled={instagramImportStatus === "importing"}
                            className="h-11 rounded-full bg-red-600 px-5 text-white hover:bg-red-700"
                          >
                            {instagramImportStatus === "importing" ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importing
                              </>
                            ) : (
                              <>
                                <Instagram className="mr-2 h-4 w-4" />
                                Import Posts
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-11 rounded-full bg-white"
                            onClick={() => setActiveSection("profile")}
                          >
                            Edit Instagram Handle
                          </Button>
                        </div>
                        {instagramImportMessage && (
                          <p
                            className={`mt-2 text-sm ${
                              instagramImportStatus === "error" ? "text-red-700" : "text-emerald-700"
                            }`}
                          >
                            {instagramImportMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {portfolioItemsLoading ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {[0, 1, 2, 3].map((item) => (
                        <div key={item} className="h-40 animate-pulse rounded-2xl border bg-gray-100" />
                      ))}
                    </div>
                  ) : gallerySections.length ? (
                    <div className="grid gap-4 xl:grid-cols-2">
                      {gallerySections.map((section, sectionIndex) => {
                        const meta = GALLERY_PLATFORM_META[section.platform]
                        const Icon = meta.Icon
                        return (
                          <motion.section
                            key={section.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: sectionIndex * 0.05, ease: "easeOut" }}
                            className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                          >
                            <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-4">
                              <div className="flex items-start gap-3">
                                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${meta.accent}`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-950">{meta.label}</h3>
                                  <p className="mt-1 text-sm leading-5 text-gray-500">{meta.description}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="rounded-full">
                                {section.items.length}
                              </Badge>
                            </div>

                            <div className="grid gap-3 p-4 sm:grid-cols-2">
                              {section.items.map((item, itemIndex) => (
                                <GalleryPreviewTile
                                  key={item.id}
                                  item={item}
                                  platform={section.platform}
                                  index={sectionIndex * 2 + itemIndex}
                                />
                              ))}
                            </div>
                          </motion.section>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
                      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gray-100 text-gray-500">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-gray-950">No gallery sources yet</h3>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                        Add social links in Profile or import portfolio links in Portfolio. SnapScout will group them
                        here by source so you can confirm embeds and previews before your profile goes live.
                      </p>
                      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                        <Button className="h-11 rounded-full bg-red-600 text-white hover:bg-red-700" onClick={() => setActiveSection("portfolio")}>
                          Import Portfolio Link
                        </Button>
                        <Button variant="outline" className="h-11 rounded-full" onClick={() => setActiveSection("profile")}>
                          Add Social Links
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Section */}
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email || ""} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Password Reset Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock className="h-5 w-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Password & Security</h3>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      Need to change your password? We'll send a secure reset link to your email address.
                    </p>

                    {passwordResetSent && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4">
                        <Check className="h-4 w-4 flex-shrink-0" />
                        <span>Password reset email sent! Check your inbox for the reset link.</span>
                      </div>
                    )}

                    {passwordResetError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{passwordResetError}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <Button
                        variant="default"
                        onClick={() => router.push("/dashboard/change-password")}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                      <span className="text-gray-400 text-sm">or</span>
                      <Button
                        variant="outline"
                        onClick={handleRequestPasswordReset}
                        disabled={passwordResetLoading || passwordResetSent}
                        className="border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent"
                      >
                        {passwordResetLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : passwordResetSent ? (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Email Sent
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Reset via Email
                          </>
                        )}
                      </Button>
                      {passwordResetSent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPasswordResetSent(false)}
                          className="text-gray-500"
                        >
                          Send Again
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "business" && isStudioOrStoreAccount && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Store / Studio Identity</CardTitle>
                    <CardDescription>Brand details shown to clients browsing your listing.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label>Business name</Label>
                      <Input
                        value={studioStoreSettings.business_name}
                        onChange={(e) => handleStudioStoreSettingChange("business_name", e.target.value)}
                        placeholder="Cape Town Film Studios"
                      />
                    </div>
                    <div>
                      <Label>Logo URL</Label>
                      <Input
                        value={studioStoreSettings.logo_url}
                        onChange={(e) => handleStudioStoreSettingChange("logo_url", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label>Showroom / space photo</Label>
                      <Input
                        value={studioStoreSettings.showroom_photo_url}
                        onChange={(e) => handleStudioStoreSettingChange("showroom_photo_url", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label>Map link</Label>
                      <Input
                        value={studioStoreSettings.map_link}
                        onChange={(e) => handleStudioStoreSettingChange("map_link", e.target.value)}
                        placeholder="Google Maps link"
                      />
                    </div>
                    <div>
                      <Label>Location address</Label>
                      <Input
                        value={studioStoreSettings.location_address}
                        onChange={(e) => handleStudioStoreSettingChange("location_address", e.target.value)}
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <Label>Operating hours</Label>
                      <Input
                        value={studioStoreSettings.operating_hours}
                        onChange={(e) => handleStudioStoreSettingChange("operating_hours", e.target.value)}
                        placeholder="Mon-Fri 08:00-18:00"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Rates Management</CardTitle>
                    <CardDescription>Set your base rates and optional package pricing.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <Label>Hourly rate</Label>
                      <Input
                        value={studioStoreSettings.hourly_rate}
                        onChange={(e) => handleStudioStoreSettingChange("hourly_rate", e.target.value)}
                        placeholder="R450/hr"
                      />
                    </div>
                    <div>
                      <Label>Half day rate</Label>
                      <Input
                        value={studioStoreSettings.half_day_rate}
                        onChange={(e) => handleStudioStoreSettingChange("half_day_rate", e.target.value)}
                        placeholder="R2,000"
                      />
                    </div>
                    <div>
                      <Label>Full day rate</Label>
                      <Input
                        value={studioStoreSettings.full_day_rate}
                        onChange={(e) => handleStudioStoreSettingChange("full_day_rate", e.target.value)}
                        placeholder="R3,500"
                      />
                    </div>
                    <div>
                      <Label>Day rate</Label>
                      <Input
                        value={studioStoreSettings.day_rate}
                        onChange={(e) => handleStudioStoreSettingChange("day_rate", e.target.value)}
                        placeholder="R3,000"
                      />
                    </div>
                    <div>
                      <Label>Peak rate</Label>
                      <Input
                        value={studioStoreSettings.peak_rate}
                        onChange={(e) => handleStudioStoreSettingChange("peak_rate", e.target.value)}
                        placeholder="Weekend/holiday premium"
                      />
                    </div>
                    <div>
                      <Label>Off-peak rate</Label>
                      <Input
                        value={studioStoreSettings.off_peak_rate}
                        onChange={(e) => handleStudioStoreSettingChange("off_peak_rate", e.target.value)}
                        placeholder="Weekday discount"
                      />
                    </div>
                    <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4 md:col-span-3">
                      <Label>Quick package selection</Label>
                      <p className="mt-1 text-sm text-gray-600">
                        Package cards now live in their own dashboard tab so you can add room photos, prices,
                        descriptions, and availability.
                      </p>
                      <Button
                        type="button"
                        onClick={() => setActiveSection("packages")}
                        className="mt-3 rounded-full bg-red-500 text-white hover:bg-red-600"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Edit Packages
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Listing Management</CardTitle>
                    <CardDescription>Edit your listing details, features, rules, and multiple spaces.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={studioStoreSettings.listing_description}
                        onChange={(e) => handleStudioStoreSettingChange("listing_description", e.target.value)}
                        placeholder="Describe your space/store, vibe, ideal use cases..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>Features & amenities</Label>
                        <p className="mt-1 text-sm text-gray-500">
                          Choose the amenities shown as scrollable buttons on your public studio/store page.
                        </p>
                      </div>
                      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
                        {STUDIO_STORE_AMENITY_OPTIONS.map(({ label, icon: Icon }) => {
                          const isSelected = normalizeTextArray(studioStoreSettings.selected_amenities).includes(label)
                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() => handleStudioAmenityToggle(label)}
                              className={`flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
                                isSelected
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              {label}
                              {isSelected ? <Check className="h-4 w-4" /> : null}
                            </button>
                          )
                        })}
                      </div>
                      <div className="max-w-sm">
                        <Label>Indoor / outdoor setup</Label>
                        <Select
                          value={studioStoreSettings.indoor_outdoor_type}
                          onValueChange={(value) => handleStudioStoreSettingChange("indoor_outdoor_type", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select setup type" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDOOR_OUTDOOR_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Rules</Label>
                      <Textarea
                        value={studioStoreSettings.listing_rules}
                        onChange={(e) => handleStudioStoreSettingChange("listing_rules", e.target.value)}
                        placeholder="Noise restrictions, overtime policy, cleaning expectations..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Multiple space management</Label>
                      <Textarea
                        value={studioStoreSettings.multiple_spaces}
                        onChange={(e) => handleStudioStoreSettingChange("multiple_spaces", e.target.value)}
                        placeholder="Room A, Room B, Rooftop deck, blackout stage..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gear & Inventory</CardTitle>
                    <CardDescription>
                      Manage owned gear, rentable equipment, and store inventory pricing/availability.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Owned equipment list</Label>
                      <Textarea
                        value={studioStoreSettings.owned_gear_list}
                        onChange={(e) => handleStudioStoreSettingChange("owned_gear_list", e.target.value)}
                        placeholder="Sony FX6, Aputure 600D, Sennheiser wireless kit..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Gear available for hire</Label>
                      <Textarea
                        value={studioStoreSettings.rentable_gear_list}
                        onChange={(e) => handleStudioStoreSettingChange("rentable_gear_list", e.target.value)}
                        placeholder="Item + daily rate + availability notes..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Inventory management</Label>
                      <Textarea
                        value={studioStoreSettings.inventory_items}
                        onChange={(e) => handleStudioStoreSettingChange("inventory_items", e.target.value)}
                        placeholder="Add gear items with specs, photos, rates, and stock counts..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Credits, Deposits & Requests</CardTitle>
                    <CardDescription>
                      Track social proof, rental terms, deposits, incoming requests, and notification notes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Credits section</Label>
                      <Textarea
                        value={studioStoreSettings.credits}
                        onChange={(e) => handleStudioStoreSettingChange("credits", e.target.value)}
                        placeholder="Past clients, campaigns, productions worked on..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Rental terms summary</Label>
                      <Textarea
                        value={studioStoreSettings.rental_terms_summary}
                        onChange={(e) => handleStudioStoreSettingChange("rental_terms_summary", e.target.value)}
                        placeholder="Short terms summary shown on listing..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Full terms and conditions</Label>
                      <Textarea
                        value={studioStoreSettings.full_terms}
                        onChange={(e) => handleStudioStoreSettingChange("full_terms", e.target.value)}
                        placeholder="Paste or write full booking/rental terms..."
                        rows={5}
                      />
                    </div>
                    <div>
                      <Label>Deposit tracking</Label>
                      <Textarea
                        value={studioStoreSettings.deposit_tracking_notes}
                        onChange={(e) => handleStudioStoreSettingChange("deposit_tracking_notes", e.target.value)}
                        placeholder="Booking #, deposit paid, outstanding deposit, due date..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Rental request management</Label>
                      <Textarea
                        value={studioStoreSettings.rental_request_notes}
                        onChange={(e) => handleStudioStoreSettingChange("rental_request_notes", e.target.value)}
                        placeholder="Incoming requests, approve/decline outcomes, active rentals..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Notification centre notes</Label>
                      <Textarea
                        value={studioStoreSettings.notifications_notes}
                        onChange={(e) => handleStudioStoreSettingChange("notifications_notes", e.target.value)}
                        placeholder="Missed alerts, follow-ups, payment reminders..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "packages" && isStudioOrStoreAccount && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <CardTitle>Packages</CardTitle>
                        <CardDescription>
                          Build the quick package cards clients see on your studio or store listing.
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        onClick={addStudioPackage}
                        className="h-11 rounded-full bg-red-500 px-5 text-white hover:bg-red-600"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Add Package
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {studioStoreSettings.package_items.map((packageItem, index) => (
                      <div key={packageItem.id} className="rounded-[24px] border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-500">Package {index + 1}</p>
                            <h3 className="text-xl font-bold text-gray-950">{packageItem.name || "Untitled package"}</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeStudioPackage(index)}
                            className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            aria-label={`Remove package ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
                          <div>
                            <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-gray-200 bg-gray-100">
                              {packageItem.image ? (
                                <img src={packageItem.image} alt={packageItem.name} loading="lazy" className="h-full w-full object-cover" />
                              ) : (
                                <div className="grid h-full place-items-center text-gray-400">
                                  <ImageIcon className="h-8 w-8" />
                                </div>
                              )}
                              {uploadingPackageImageIndex === index && (
                                <div className="absolute inset-0 grid place-items-center bg-white/70">
                                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
                                </div>
                              )}
                            </div>
                            <label className="mt-3 flex h-11 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:text-red-600">
                              <Upload className="mr-2 h-4 w-4" />
                              {uploadingPackageImageIndex === index ? "Uploading..." : "Upload room image"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingPackageImageIndex === index}
                                onChange={(event) => {
                                  const file = event.target.files?.[0]
                                  if (file) handleStudioPackageImageUpload(index, file)
                                  event.target.value = ""
                                }}
                              />
                            </label>
                            {packageImageUploadError?.index === index && (
                              <p className="mt-2 text-xs font-semibold text-red-600">{packageImageUploadError.message}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <Label>Package name</Label>
                              <Input
                                value={packageItem.name}
                                onChange={(event) => handleStudioPackageChange(index, "name", event.target.value)}
                                placeholder="Hourly Studio Access"
                              />
                            </div>
                            <div>
                              <Label>Price</Label>
                              <Input
                                value={packageItem.price}
                                onChange={(event) => handleStudioPackageChange(index, "price", event.target.value)}
                                placeholder="R2,500/hr"
                              />
                            </div>
                            <div>
                              <Label>Badge / timing</Label>
                              <Input
                                value={packageItem.badge}
                                onChange={(event) => handleStudioPackageChange(index, "badge", event.target.value)}
                                placeholder="2 hr minimum"
                              />
                            </div>
                            <div>
                              <Label>Availability</Label>
                              <Select
                                value={packageItem.availability}
                                onValueChange={(value) => handleStudioPackageChange(index, "availability", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select availability" />
                                </SelectTrigger>
                                <SelectContent>
                                  {PACKAGE_AVAILABILITY_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="md:col-span-2">
                              <Label>Room / package image URL</Label>
                              <Input
                                value={packageItem.image}
                                onChange={(event) => handleStudioPackageChange(index, "image", event.target.value)}
                                placeholder="https://..."
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Description</Label>
                              <Textarea
                                value={packageItem.description}
                                onChange={(event) => handleStudioPackageChange(index, "description", event.target.value)}
                                placeholder="Tell clients what this room, kit, or package includes."
                                rows={3}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Package amenities</Label>
                              <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-2">
                                {STUDIO_STORE_AMENITY_LABELS.map((amenity) => {
                                  const selected = normalizeTextArray(packageItem.included).includes(amenity)
                                  return (
                                    <button
                                      key={`${packageItem.id}-${amenity}`}
                                      type="button"
                                      onClick={() => handleStudioPackageAmenityToggle(index, amenity)}
                                      className={`h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
                                        selected
                                          ? "border-red-200 bg-red-50 text-red-700"
                                          : "border-gray-200 bg-gray-50 text-gray-700 hover:border-red-200"
                                      }`}
                                    >
                                      {amenity}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "subscription" && (
              <SubscriptionCard
                subscription={subscription as any}
                userEmail={user?.email || ""}
                onSubscriptionChange={() => {
                  // Refresh subscription data
                  window.location.reload()
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
