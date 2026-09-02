"use client"

import Image from "next/image"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Sparkles,
  Star,
  Video,
} from "lucide-react"

import MobileShell from "@/components/mobile/mobile-shell"
import { HireRequestSheet } from "@/components/booking/hire-request-sheet"
import { DemoProfileBadge } from "@/components/ui/demo-profile-badge"
import { DemoProfileNotice } from "@/components/ui/demo-profile-notice"
import { LeaveReviewButton } from "@/components/reviews/leave-review-button"
import { SaveProfileButton } from "@/components/messaging/save-profile-button"
import { ProfilePortfolioGallery } from "@/components/portfolio/profile-portfolio-gallery"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { mockCreators, type MockCreator } from "@/lib/mock-data/portfolio-data"
import { parseTalentPackages, normalizeVisiblePackageCount } from "@/lib/mock-data/talent-dashboard-preview"
import type { LightboxPortfolioItem } from "@/types/portfolio"

// Client-only overlay with no SSR value - only mounts once a photo is
// clicked, so it shouldn't be in this page's initial bundle.
const PortfolioLightbox = dynamic(
  () => import("@/components/portfolio/portfolio-lightbox").then((mod) => mod.PortfolioLightbox),
  { ssr: false },
)

type LiveCreator = MockCreator & {
  user_id: string
  hourly_rate?: string | number | null
  daily_rate?: string | number | null
  pricing?: string | null
  specializations?: string[]
  skills?: string[]
  onboarding_data?: Record<string, any> | null
  years_experience?: string | null
  experience_level?: string | null
}

function mapLiveProfileToCreator(profile: any): LiveCreator {
  const location = profile.location || [profile.city, profile.province].filter(Boolean).join(", ")

  return {
    id: profile.user_id,
    user_id: profile.user_id,
    name: profile.display_name || profile.full_name || profile.username || "SnapScout Creative",
    profession: profile.profession || "Creator",
    location: location || "South Africa",
    bio: profile.bio || "This creator hasn't added a bio yet.",
    avatar: profile.cover_image_url || profile.profile_image_url || profile.profile_picture || profile.avatar_url || "/placeholder.svg",
    rating: profile.rating || 0,
    reviews: profile.review_count || 0,
    portfolioCount: 0,
    portfolioItems: [],
    hourly_rate: profile.hourly_rate,
    daily_rate: profile.daily_rate,
    pricing: profile.pricing,
    specializations: Array.isArray(profile.specializations) ? profile.specializations : [],
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    onboarding_data: profile.onboarding_data && typeof profile.onboarding_data === "object" ? profile.onboarding_data : null,
    years_experience: profile.years_experience || null,
    experience_level: profile.experience_level || null,
  }
}

// The dashboard field just takes a bare number (e.g. "6"), while demo data
// already spells out "12 years" - append the suffix only when it's missing.
function formatYearsExperience(value: string) {
  return /year/i.test(value) ? value : `${value} years`
}

type CreatorDetailDefaults = {
  priceLabel: string
  rateSuffix: string
  responseRate: string
  experienceLabel: string
  memberSince: string
  projectsLabel: string
  services: string[]
  highlights: string[]
  phone: string
}

const creatorDetailDefaults: Record<string, CreatorDetailDefaults> = {
  "creator-1": {
    priceLabel: "R950",
    rateSuffix: "/hr",
    responseRate: "98%",
    experienceLabel: "12 years",
    memberSince: "Feb 2021",
    projectsLabel: "132+",
    services: ["Cinematic Lighting", "Drone Operations", "Color Grading", "ARRI Alexa", "RED Camera"],
    highlights: ["Cinematic Lighting", "Drone Operations", "Color Grading"],
    phone: "+27 72 555 0184",
  },
  "creator-2": {
    priceLabel: "R2,500 - R8,000",
    rateSuffix: "/day",
    responseRate: "98%",
    experienceLabel: "10 years",
    memberSince: "Aug 2020",
    projectsLabel: "207+",
    services: ["Portrait Photography", "Fashion Shoots", "Brand Campaigns", "Lifestyle", "Editorial"],
    highlights: ["Portrait Photography", "Fashion Shoots", "Brand Campaigns"],
    phone: "+27 82 555 0192",
  },
  "creator-3": {
    priceLabel: "R1,850",
    rateSuffix: "/day",
    responseRate: "96%",
    experienceLabel: "8 years",
    memberSince: "Jan 2022",
    projectsLabel: "84+",
    services: ["Documentary", "Events", "Corporate Films", "Interview Lighting", "Post Supervision"],
    highlights: ["Documentary", "Events", "Corporate Films"],
    phone: "+27 73 555 0137",
  },
}

function deriveCityEyebrow(location: string) {
  const city = location.split(",")[0]?.trim() || "South Africa"
  return city.toUpperCase()
}

function inferDefaultServices(profession: string) {
  const label = profession.toLowerCase()

  if (label.includes("director of photography")) {
    return ["Cinematic Lighting", "Drone Operations", "Color Grading", "Commercials", "Documentaries"]
  }

  if (label.includes("photographer")) {
    return ["Portrait Photography", "Fashion Shoots", "Brand Campaigns", "Lifestyle", "Editorial"]
  }

  if (label.includes("videographer")) {
    return ["Music Videos", "Event Coverage", "Brand Films", "Interviews", "Editing"]
  }

  if (label.includes("editor")) {
    return ["Post Production", "Color Assist", "Motion Graphics", "Sound Sync", "Short-form Edits"]
  }

  return ["Brand Campaigns", "Content Creation", "Editorial", "Storytelling", "On-set Support"]
}

function inferHighlightIcon(service: string) {
  const label = service.toLowerCase()
  if (label.includes("drone") || label.includes("video")) return Video
  if (label.includes("color") || label.includes("lighting")) return Sparkles
  return Camera
}

export default function CreatorProfilePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const mockCreator = mockCreators.find((item) => item.id === params.id)

  const [liveCreator, setLiveCreator] = useState<LiveCreator | null>(null)
  const [loadingLive, setLoadingLive] = useState(!mockCreator)
  const [hireSheetOpen, setHireSheetOpen] = useState(false)
  const [requestedDate, setRequestedDate] = useState<string | undefined>()
  const [requestOrigin, setRequestOrigin] = useState<"booking" | "availability">("booking")
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0)
  const [portfolioGalleryItems, setPortfolioGalleryItems] = useState<LightboxPortfolioItem[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0)
  const heroScrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mockCreator) return

    let cancelled = false
    const supabase = createBrowserClient()

    supabase
      .from("user_profiles")
      .select(
        "user_id, full_name, display_name, username, profession, bio, location, city, province, profile_image_url, profile_picture, avatar_url, cover_image_url, pricing, hourly_rate, daily_rate, rating, review_count, specializations, skills, onboarding_data, years_experience, experience_level",
      )
      .eq("user_id", params.id)
      .maybeSingle()
      .then(({ data }: { data: any }) => {
        if (cancelled) return
        setLiveCreator(data ? mapLiveProfileToCreator(data) : null)
        setLoadingLive(false)
      })

    return () => {
      cancelled = true
    }
  }, [params.id, mockCreator, reviewRefreshKey])

  const creator = mockCreator || liveCreator

  if (loadingLive) {
    return (
      <MobileShell title="Browse Creatives">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff1c1c]" />
        </div>
      </MobileShell>
    )
  }

  if (!creator) {
    return (
      <MobileShell title="Browse Creatives">
        <div className="px-4 py-10">
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-semibold text-slate-900">Creator not found</p>
            <p className="mt-2 text-sm text-slate-500">This profile is no longer available in the preview.</p>
            <Button
              className="mt-5 h-12 rounded-full bg-[#ff1c1c] px-6 text-sm font-semibold text-white hover:bg-[#e21818]"
              onClick={() => router.push("/creators")}
            >
              Back to creators
            </Button>
          </div>
        </div>
      </MobileShell>
    )
  }

  const liveRate = liveCreator?.hourly_rate
    ? { priceLabel: `R${liveCreator.hourly_rate}`, rateSuffix: "/hr" }
    : liveCreator?.daily_rate
      ? { priceLabel: `R${liveCreator.daily_rate}`, rateSuffix: "/day" }
      : liveCreator?.pricing
        ? { priceLabel: liveCreator.pricing, rateSuffix: "" }
        : null

  // Prefer what the creator actually picked in their dashboard (specializations,
  // falling back to skills) over the profession-inferred canned list - that
  // list is only a placeholder for profiles that haven't set either yet.
  const realServices = (liveCreator?.specializations?.length ? liveCreator.specializations : liveCreator?.skills) || []
  const inferredServices = inferDefaultServices(creator.profession)
  const resolvedServices = realServices.length > 0 ? realServices : inferredServices

  const realExperienceLabel = liveCreator?.years_experience
    ? formatYearsExperience(liveCreator.years_experience)
    : liveCreator?.experience_level || null

  const defaults = creatorDetailDefaults[creator.id] ?? {
    priceLabel: liveRate?.priceLabel ?? "R1,500",
    rateSuffix: liveRate?.rateSuffix ?? "/day",
    responseRate: "95%",
    experienceLabel: realExperienceLabel ?? "New to SnapScout",
    memberSince: "Mar 2022",
    projectsLabel: creator.portfolioCount > 0 ? `${creator.portfolioCount}+` : "New",
    services: resolvedServices,
    highlights: resolvedServices.slice(0, 3),
    phone: "+27 71 555 0101",
  }

  const portfolioItems = creator.portfolioItems ?? []
  // creator.portfolioItems is always empty (see mapLiveProfileToCreator) -
  // the real portfolio only loads inside ProfilePortfolioGallery further
  // down the page, so the hero reuses that same live data via
  // onItemsLoaded instead of falling back to a single static avatar image.
  const heroImages = portfolioGalleryItems.length
    ? portfolioGalleryItems.map((item) => ({
        src: item.thumbnail || creator.avatar || "/placeholder.svg",
        alt: item.title || creator.name,
      }))
    : [{ src: creator.avatar || "/placeholder.svg", alt: creator.name }]
  const heroLightboxItems: LightboxPortfolioItem[] = portfolioGalleryItems.length
    ? portfolioGalleryItems
    : [
        {
          id: "avatar",
          type: "image",
          thumbnail: creator.avatar || "/placeholder.svg",
          fullUrl: creator.avatar || "/placeholder.svg",
          platform: "local",
        },
      ]

  const highlightCards = defaults.highlights.map((service) => ({
    title: service,
    icon: inferHighlightIcon(service),
  }))

  const talentDashboardSettings = liveCreator?.onboarding_data?.talent_dashboard
  const rawTalentPackages =
    Array.isArray(talentDashboardSettings?.package_items) && talentDashboardSettings.package_items.length > 0
      ? parseTalentPackages(talentDashboardSettings.package_items)
      : []
  const visiblePackageCount = normalizeVisiblePackageCount(
    talentDashboardSettings?.visible_package_count,
    rawTalentPackages.length,
  )
  const talentPackages = rawTalentPackages.slice(0, visiblePackageCount)
  // No custom packages configured - fall back to a single card built from
  // this creator's own real rate rather than showing nothing or inventing
  // pricing they never set.
  const packageCards = (
    talentPackages.length
      ? talentPackages
      : [
          {
            id: "default",
            name: "Book a Session",
            price: `${defaults.priceLabel}${defaults.rateSuffix}`,
            description: `Get in touch to book ${creator.name.split(" ")[0]} for your next shoot.`,
            image: "",
            badge: "",
            availability: "Available",
            included: [] as string[],
          },
        ]
  ).map((pkg) => ({
    ...pkg,
    coverImage: pkg.image || creator.avatar || "/placeholder.svg",
  }))
  const selectedPackage = packageCards[selectedPackageIndex] || packageCards[0]
  const packageBookingOptions = Array.from(new Set([...packageCards.map((pkg) => pkg.name), "Other"]))

  const openHireSheet = (date?: string, origin: "booking" | "availability" = "booking") => {
    setRequestedDate(date)
    setRequestOrigin(origin)
    setHireSheetOpen(true)
  }

  const openHeroAt = (index: number) => {
    setCurrentHeroIndex(index)
    const scroller = heroScrollerRef.current
    if (!scroller) return
    const child = scroller.children[index] as HTMLElement | undefined
    child?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" })
  }

  const renderProfile = () => (
    <div className="px-4 pb-8 pt-4">
      <section className="rounded-[30px] border border-slate-200 bg-white p-3 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
          <div className="relative">
            <div
              ref={heroScrollerRef}
              className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onScroll={(event) => {
                const target = event.currentTarget
                if (!target.clientWidth) return
                setCurrentHeroIndex(Math.round(target.scrollLeft / target.clientWidth))
              }}
            >
              {heroImages.map((image, index) => (
                <div key={`${image.src}-${index}`} className="min-w-full snap-center">
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="relative aspect-[1.08/1] w-full overflow-hidden rounded-[28px] bg-[#f4f6fa]"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="100vw"
                      priority={index === 0}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="pointer-events-auto h-12 w-12 rounded-full bg-white text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.12)] hover:bg-white"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>

              <div className="pointer-events-auto flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.12)] hover:bg-white"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                >
                  <Share2 className="h-5 w-5" />
                  <span className="sr-only">Share</span>
                </Button>
                <SaveProfileButton
                  profileId={creator.id}
                  profileName={creator.name}
                  profileRole={creator.profession}
                  profileLocation={creator.location}
                  profileImage={creator.avatar}
                  profileHref={`/creators/${creator.id}`}
                  category="creator"
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white text-[#ff1c1c] shadow-[0_12px_24px_rgba(15,23,42,0.12)] hover:bg-white"
                  showText={false}
                />
              </div>
            </div>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/45 px-3 py-2 backdrop-blur-sm">
              {heroImages.map((_, index) => (
                <button
                  key={`hero-dot-${index}`}
                  type="button"
                  aria-label={`Go to image ${index + 1}`}
                  className={`h-2.5 rounded-full transition-[width,background-color] duration-200 ${
                    index === currentHeroIndex ? "w-5 bg-white" : "w-2.5 bg-white/65"
                  }`}
                  onClick={() => openHeroAt(index)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-8 px-4 pb-8 pt-5">
            <div className="space-y-5">
              <div className="space-y-4">
                <p className="text-[13px] font-black uppercase tracking-[0.28em] text-[#ff1c1c]">
                  {deriveCityEyebrow(creator.location)}
                </p>
                <h1 className="text-[38px] font-black leading-[0.96] tracking-[-0.04em] text-[#111318]">
                  {creator.name}
                </h1>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge
                  variant="outline"
                  className="h-11 rounded-full border-slate-200 px-4 text-[14px] font-semibold text-[#111318]"
                >
                  <MapPin className="mr-2 h-4 w-4 text-slate-500" />
                  {creator.location}
                </Badge>
                <Badge
                  variant="outline"
                  className="h-11 rounded-full border-slate-200 px-4 text-[14px] font-semibold text-[#111318]"
                >
                  <Star className="mr-2 h-4 w-4 fill-current text-[#111318]" />
                  {creator.rating > 0 ? `${creator.rating.toFixed(1)} (${creator.reviews})` : "New"}
                </Badge>
                <Badge
                  variant="outline"
                  className="h-11 rounded-full border-slate-200 px-4 text-[14px] font-semibold text-[#111318]"
                >
                  {creator.profession}
                </Badge>
                <Badge className="h-11 rounded-full border border-[#d8ece3] bg-[#eefaf3] px-4 text-[14px] font-semibold text-[#2e8f5b] hover:bg-[#eefaf3]">
                  Available this week
                </Badge>
                {mockCreator && <DemoProfileBadge className="h-11 px-4 text-[13px]" />}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {highlightCards.map(({ title, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-[22px] bg-[#f5f7fb] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                >
                  <Icon className="mb-3 h-5 w-5 text-slate-700" />
                  <p className="text-[14px] font-medium leading-snug text-[#111318]">{title}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
              <div className="min-w-0">
                <p className="text-[15px] text-slate-500">From</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-[42px] font-black leading-none tracking-[-0.04em] text-[#111318]">
                    {defaults.priceLabel}
                  </span>
                </div>
                <p className="mt-1 text-[18px] text-slate-600">{defaults.rateSuffix}</p>
              </div>

              {mockCreator ? (
                <DemoProfileNotice className="w-full sm:max-w-[280px]" />
              ) : (
                <Button
                  type="button"
                  className="h-14 shrink-0 rounded-full bg-[#ff1c1c] px-8 text-[18px] font-semibold text-white shadow-[0_18px_40px_rgba(255,28,28,0.28)] hover:bg-[#e21818]"
                  onClick={() => openHireSheet()}
                >
                  Hire {creator.name.split(" ")[0]}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-full border-slate-200 bg-white text-[16px] font-medium text-[#111318] hover:bg-slate-50"
                onClick={() =>
                  router.push(`/messages?mock=1&as=brad-test-user&conversation=thread-brad-test-user-${creator.id}-${Date.now()}`)
                }
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Message
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-full border-slate-200 bg-white text-[16px] font-medium text-[#111318] hover:bg-slate-50"
                onClick={() => {
                  window.location.href = `tel:${defaults.phone}`
                }}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
            </div>

            <LeaveReviewButton
              profileId={creator.id}
              profileName={creator.name}
              onReviewChange={() => setReviewRefreshKey((key) => key + 1)}
              className="h-12 w-full rounded-full border-slate-200 bg-white text-[16px] font-medium text-[#111318] hover:bg-slate-50"
            />

            <div className="rounded-[24px] border border-slate-200 bg-[#f7f9fc] px-4 py-3">
              {[
                { label: "Based in", value: creator.location, icon: MapPin },
                { label: "Response rate", value: defaults.responseRate, icon: Clock3 },
                { label: "Projects completed", value: defaults.projectsLabel, icon: BriefcaseBusiness },
                {
                  label: "Experience",
                  value: `${defaults.experienceLabel} - Member since ${defaults.memberSince}`,
                  icon: CalendarDays,
                },
              ].map(({ label, value, icon: Icon }, index, array) => (
                <div
                  key={label}
                  className={`flex items-start gap-3 px-1 py-4 ${index < array.length - 1 ? "border-b border-slate-200" : ""}`}
                >
                  <Icon className="mt-0.5 h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-[13px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
                    <p className="mt-2 text-[16px] font-medium text-[#111318]">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-5">
              <p className="text-[13px] font-black uppercase tracking-[0.18em] text-slate-500">About this creator</p>
              <p className="mt-3 text-[17px] leading-8 text-[#28303f]">{creator.bio}</p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-5">
              <p className="text-[13px] font-black uppercase tracking-[0.18em] text-slate-500">Core services</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {defaults.services.map((service) => (
                  <Badge
                    key={service}
                    variant="secondary"
                    className="rounded-full bg-[#f1f3f7] px-4 py-2 text-[14px] font-medium text-slate-700 hover:bg-[#f1f3f7]"
                  >
                    {service}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[13px] font-black uppercase tracking-[0.18em] text-slate-500">Portfolio</p>
              </div>
              <ProfilePortfolioGallery
                userId={liveCreator?.user_id}
                items={portfolioItems}
                title={creator.name}
                previewCount={6}
                className="[&_h3]:hidden [&_.text-center]:hidden [&_.mt-3]:mt-0"
                onItemsLoaded={setPortfolioGalleryItems}
              />
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-5">
              <p className="text-[13px] font-black uppercase tracking-[0.18em] text-slate-500">Quick package selection</p>
              <p className="mt-1 text-[14px] leading-snug text-slate-600">Pick a package and continue into booking.</p>

              <div className="no-scrollbar -mx-1 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
                {packageCards.map((pkg, index) => {
                  const isSelected = index === selectedPackageIndex
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackageIndex(index)}
                      className={`min-w-[78%] snap-start overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition ${
                        isSelected ? "border-[#ff1c1c] ring-2 ring-[#ff1c1c]/10" : "border-slate-200"
                      }`}
                    >
                      {pkg.coverImage && (
                        <div className="relative h-28 w-full overflow-hidden bg-slate-100">
                          <Image src={pkg.coverImage} alt={pkg.name} fill className="object-cover" />
                          {pkg.badge && (
                            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#111318] shadow-sm">
                              {pkg.badge}
                            </span>
                          )}
                          <span
                            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm ${
                              pkg.availability === "Available" ? "bg-[#ecfdf5] text-[#047857]" : "bg-[#fff7ed] text-[#b45309]"
                            }`}
                          >
                            {pkg.availability}
                          </span>
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[15px] font-semibold leading-tight text-[#111318]">{pkg.name}</p>
                            <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{pkg.description}</p>
                          </div>
                          {isSelected ? <CheckCircle2 className="h-5 w-5 flex-none text-[#ff1c1c]" /> : null}
                        </div>
                        <div className="mt-3 flex items-end justify-between gap-2">
                          <div>
                            <p className="text-[11px] text-slate-500">Package price</p>
                            <p className="text-[16px] font-semibold text-[#ff1c1c]">{pkg.price}</p>
                          </div>
                          {pkg.included.length > 0 && (
                            <div className="flex max-w-[54%] flex-wrap justify-end gap-1">
                              {pkg.included.slice(0, 2).map((feature) => (
                                <span key={feature} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {mockCreator ? (
                <DemoProfileNotice className="mt-4" />
              ) : (
                <Button
                  type="button"
                  onClick={() => openHireSheet()}
                  className="mt-4 h-12 w-full rounded-full bg-[#ff1c1c] text-[15px] font-semibold text-white hover:bg-[#e21818]"
                >
                  {selectedPackage?.availability === "Available" ? "Book Selected Package" : "Check Availability"}
                </Button>
              )}
            </div>

            {!mockCreator && (
              <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-5">
                <p className="text-[13px] font-black uppercase tracking-[0.18em] text-slate-500">Availability</p>
                <p className="mt-2 text-[16px] leading-7 text-slate-600">
                  Need to check dates or confirm timing? Start the booking flow to request availability.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 h-11 w-full rounded-full border-slate-200 text-[14px] font-semibold text-[#111318] hover:bg-slate-50"
                  onClick={() => openHireSheet(undefined, "availability")}
                >
                  Check Availability
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )

  return (
    <>
      <MobileShell title="Browse Creatives">{renderProfile()}</MobileShell>

      {hireSheetOpen ? (
        <HireRequestSheet
          open={hireSheetOpen}
          onOpenChange={setHireSheetOpen}
          talentId={creator.id}
          talentName={creator.name}
          talentType="creator"
          priceLabel={selectedPackage?.price || `${defaults.priceLabel}${defaults.rateSuffix}`}
          bookingTypeOptions={packageBookingOptions}
          initialBookingType={selectedPackage?.name}
          initialDate={requestedDate}
          requestOrigin={requestOrigin}
          recipientId={creator.id}
          recipientName={creator.name}
        />
      ) : null}

      {lightboxIndex !== null && (
        <PortfolioLightbox items={heroLightboxItems} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  )
}
