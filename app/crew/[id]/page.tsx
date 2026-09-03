"use client"

import Image from "next/image"
import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  HeartHandshake,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Sparkles,
  Star,
} from "lucide-react"
import MobileShell from "@/components/mobile/mobile-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HireRequestSheet } from "@/components/booking/hire-request-sheet"
import { DemoProfileBadge } from "@/components/ui/demo-profile-badge"
import { DemoProfileNotice } from "@/components/ui/demo-profile-notice"
import { LeaveReviewButton } from "@/components/reviews/leave-review-button"
import { ProfilePortfolioGallery } from "@/components/portfolio/profile-portfolio-gallery"
import { ShareProfileDrawer } from "@/components/profile/share-profile-drawer"
import { createBrowserClient } from "@/lib/supabase/client"
import { mockCrewMembers, type MockCrewMember } from "@/lib/mock-data/crew-data"
import { parseTalentPackages, normalizeVisiblePackageCount } from "@/lib/mock-data/talent-dashboard-preview"
import type { LightboxPortfolioItem } from "@/types/portfolio"

// Client-only overlay with no SSR value - only mounts once a photo is
// clicked, so it shouldn't be in this page's initial bundle.
const PortfolioLightbox = dynamic(
  () => import("@/components/portfolio/portfolio-lightbox").then((mod) => mod.PortfolioLightbox),
  { ssr: false },
)

interface CrewProfile {
  id: string
  display_name: string
  bio: string
  profession: string
  profile_image_url: string
  location: string
  pricing: string
  skills: string[]
  portfolio_images: string[]
  rating: number
  reviews: number
  projects: string
  years: string
  experienceLevel?: string
  responseRate: string
  memberSince: string
  contactNumber: string
  onboarding_data?: Record<string, any> | null
}

const portfolioFallbacks = [
  "https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=900",
]

function mockToProfile(member: MockCrewMember): CrewProfile {
  const firstTwoProfileTweaks: Record<string, Partial<CrewProfile>> = {
    "crew-001": {
      pricing: "R950/hr",
      projects: "132+",
      years: "12",
      responseRate: "98%",
      memberSince: "Feb 2021",
      reviews: 47,
      contactNumber: "+27825550147",
    },
    "crew-002": {
      pricing: "R1,200/hr",
      projects: "120+",
      years: "8",
      responseRate: "96%",
      memberSince: "Aug 2020",
      reviews: 32,
      contactNumber: "+27825550148",
    },
  }

  const images = [member.recent_work, member.profile_picture, ...portfolioFallbacks].filter(Boolean)

  return {
    id: member.id,
    display_name: member.display_name,
    bio: member.bio,
    profession: member.profession,
    profile_image_url: member.profile_picture,
    location: `${member.city}, ${member.province}`,
    pricing: "R950/hr",
    skills: member.skills,
    portfolio_images: images,
    rating: member.rating,
    reviews: Math.round((member.rating - 4) * 100),
    projects: "120+",
    years: member.years_experience.replace(/\D/g, "").slice(0, 2) || "4",
    responseRate: "98%",
    memberSince: "Feb 2021",
    contactNumber: "+27825550140",
    ...firstTwoProfileTweaks[member.id],
  }
}

function mapLiveProfileToCrewProfile(profile: any): CrewProfile {
  const location = profile.location || [profile.city, profile.province].filter(Boolean).join(", ")
  const skills: string[] = profile.skills || []
  // No fake stock-photo filler here - the hero falls back to the cover/avatar
  // image below when there's no real portfolio_images data, and the actual
  // portfolio grid further down fetches real uploads via ProfilePortfolioGallery.
  const images = profile.portfolio_images?.length ? (profile.portfolio_images as string[]) : []
  const rateValue = profile.hourly_rate || profile.daily_rate
  const rateSuffix = profile.hourly_rate ? "/hr" : "/day"

  return {
    id: profile.user_id,
    display_name: profile.display_name || profile.full_name || profile.username || "SnapScout Creative",
    bio: profile.bio || "This crew member hasn't added a bio yet.",
    profession: profile.profession || "Film Crew",
    profile_image_url:
      profile.cover_image_url || profile.profile_image_url || profile.profile_picture || profile.avatar_url || "/placeholder.svg",
    location: location || "South Africa",
    pricing: rateValue ? `R${rateValue}${rateSuffix}` : "By inquiry",
    skills,
    portfolio_images: images,
    rating: profile.rating || 0,
    reviews: profile.review_count || 0,
    projects: "New",
    years: profile.years_experience ? String(profile.years_experience).replace(/\D/g, "").slice(0, 2) || String(profile.years_experience) : "-",
    experienceLevel: profile.experience_level || undefined,
    responseRate: "95%",
    memberSince: "Recently",
    contactNumber: "",
    onboarding_data: profile.onboarding_data && typeof profile.onboarding_data === "object" ? profile.onboarding_data : null,
  }
}

const getSkillIcon = (skill: string) => {
  const normalized = skill.toLowerCase()
  if (normalized.includes("sound") || normalized.includes("audio")) return Phone
  if (normalized.includes("light")) return Sparkles
  if (normalized.includes("camera") || normalized.includes("focus")) return BriefcaseBusiness
  if (normalized.includes("producer") || normalized.includes("production")) return CalendarDays
  return HeartHandshake
}

export default function CrewProfilePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [hireSheetOpen, setHireSheetOpen] = useState(false)
  const [requestedDate, setRequestedDate] = useState<string | undefined>()
  const [requestOrigin, setRequestOrigin] = useState<"booking" | "availability">("booking")
  const [activeSlide, setActiveSlide] = useState(0)
  const [portfolioGalleryItems, setPortfolioGalleryItems] = useState<LightboxPortfolioItem[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement | null>(null)

  const mockProfile = useMemo(() => {
    const match = mockCrewMembers.find((member) => member.id === params.id || member.user_id === params.id)
    return match ? mockToProfile(match) : null
  }, [params.id])

  const [liveProfile, setLiveProfile] = useState<CrewProfile | null>(null)
  const [loadingLive, setLoadingLive] = useState(!mockProfile)
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0)
  const [showShareDrawer, setShowShareDrawer] = useState(false)

  useEffect(() => {
    if (mockProfile) return

    let cancelled = false
    const supabase = createBrowserClient()

    supabase
      .from("user_profiles")
      .select(
        "user_id, full_name, display_name, username, profession, bio, location, city, province, profile_image_url, profile_picture, avatar_url, cover_image_url, hourly_rate, daily_rate, skills, portfolio_images, rating, review_count, onboarding_data, years_experience, experience_level",
      )
      .eq("user_id", params.id)
      .maybeSingle()
      .then(({ data }: { data: any }) => {
        if (cancelled) return
        setLiveProfile(data ? mapLiveProfileToCrewProfile(data) : null)
        setLoadingLive(false)
      })

    return () => {
      cancelled = true
    }
  }, [params.id, mockProfile, reviewRefreshKey])

  const profile = mockProfile || liveProfile

  const firstName = profile?.display_name.split(" ")[0] || "Crew"
  const services = useMemo(() => profile?.skills?.slice(0, 6) || [], [profile])
  const portfolioPreview = useMemo(() => (profile?.portfolio_images || []).slice(0, 6), [profile])

  const openHireSheet = (date?: string, origin: "booking" | "availability" = "booking") => {
    setRequestedDate(date)
    setRequestOrigin(origin)
    setHireSheetOpen(true)
  }

  if (loadingLive) {
    return (
      <MobileShell title="Find Crew">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#f20d14]" />
        </div>
      </MobileShell>
    )
  }

  if (!profile) {
    return (
      <MobileShell title="Find Crew">
        <div className="rounded-[24px] border border-[#e8edf5] bg-white p-5 text-center">
          <p className="text-[16px] font-semibold text-[#101318]">Crew profile not found.</p>
          <Button type="button" onClick={() => router.push("/find-crew")} className="mt-4 rounded-full bg-[#f20d14] text-white hover:bg-[#d80a10]">
            Back to Find Crew
          </Button>
        </div>
      </MobileShell>
    )
  }

  const city = profile.location.split(",")[0]?.toUpperCase() || "SOUTH AFRICA"
  const pricingValue = profile.pricing.replace("/hr", "")
  // profile.portfolio_images is a legacy column, often empty for real
  // accounts - the actual current uploads live in the portfolio table
  // fetched by ProfilePortfolioGallery further down, so the hero prefers
  // that same live data via onItemsLoaded once it resolves.
  const heroImages = portfolioGalleryItems.length
    ? portfolioGalleryItems.map((item) => item.thumbnail)
    : profile.portfolio_images.length
      ? profile.portfolio_images
      : [profile.profile_image_url]
  const heroLightboxItems: LightboxPortfolioItem[] = portfolioGalleryItems.length
    ? portfolioGalleryItems
    : heroImages.map((image, index) => ({
        id: `${image}-${index}`,
        type: "image",
        thumbnail: image,
        fullUrl: image,
        platform: "local",
      }))
  const heroHighlights = services.slice(0, 3)

  const talentDashboardSettings = profile.onboarding_data?.talent_dashboard
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
  // this crew member's own real rate rather than showing nothing or
  // inventing pricing they never set.
  const packageCards = (
    talentPackages.length
      ? talentPackages
      : [
          {
            id: "default",
            name: "Book a Session",
            price: profile.pricing,
            description: `Get in touch to book ${firstName} for your next shoot.`,
            image: "",
            badge: "",
            availability: "Available",
            included: [] as string[],
          },
        ]
  ).map((pkg) => ({
    ...pkg,
    coverImage: pkg.image || profile.profile_image_url || "/placeholder.svg",
  }))
  const selectedPackage = packageCards[selectedPackageIndex] || packageCards[0]
  const packageBookingOptions = Array.from(new Set([...packageCards.map((pkg) => pkg.name), "Other"]))

  return (
    <MobileShell title="Find Crew">
      <section className="rounded-[34px] border border-[#e8edf5] bg-white p-3 shadow-[0_16px_34px_rgba(0,0,0,0.06)]">
        <div className="relative overflow-hidden rounded-[30px]">
          <div
            ref={carouselRef}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
            onScroll={(event) => {
              const target = event.currentTarget
              if (!target.clientWidth) return
              setActiveSlide(Math.round(target.scrollLeft / target.clientWidth))
            }}
          >
            {heroImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="relative h-[330px] min-w-full snap-start bg-[#f4f6f8]"
              >
                <Image src={image} alt={`${profile.display_name} work ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>

          <div className="absolute left-3 top-3 right-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-[#111318]"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowShareDrawer(true)}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-[#111318]"
                aria-label="Share profile"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-[#f20d14]"
                aria-label={`Save ${profile.display_name}`}
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm">
            {heroImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const width = carouselRef.current?.clientWidth || 0
                  carouselRef.current?.scrollTo({ left: width * index, behavior: "smooth" })
                  setActiveSlide(index)
                }}
                aria-label={`Go to photo ${index + 1}`}
                className={`h-1.5 w-1.5 rounded-full transition-all ${activeSlide === index ? "w-4 bg-white" : "bg-white/55"}`}
              />
            ))}
          </div>
        </div>

        <div className="px-3 pb-2 pt-5">
          <p className="text-[12px] font-bold tracking-[0.14em] text-[#f20d14]">{city}</p>
          <h1 className="mt-2 text-[43px] font-semibold leading-tight text-[#111318]">{profile.display_name}</h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="h-10 rounded-full border-[#e6ebf3] bg-white px-4 text-[13px] text-[#111318]">
              <MapPin className="mr-1.5 h-4 w-4" /> {profile.location}
            </Badge>
            <Badge variant="outline" className="h-10 rounded-full border-[#e6ebf3] bg-white px-4 text-[13px] text-[#111318]">
              <Star className="mr-1.5 h-4 w-4 fill-[#111318] text-[#111318]" /> {profile.rating > 0 ? `${profile.rating} (${profile.reviews})` : "New"}
            </Badge>
            <Badge variant="outline" className="h-10 rounded-full border-[#e6ebf3] bg-white px-4 text-[13px] text-[#111318]">
              {profile.profession}
            </Badge>
            <Badge variant="outline" className="h-10 rounded-full border-[#d8efe3] bg-[#effaf4] px-4 text-[13px] text-[#16794c]">
              Available this week
            </Badge>
            {mockProfile && <DemoProfileBadge className="h-10 px-4 text-[13px]" />}
          </div>

          <div className="no-scrollbar -mx-1 mt-4 flex gap-3 overflow-x-auto px-1 pb-2">
            {heroHighlights.map((highlight) => {
              const Icon = getSkillIcon(highlight)
              return (
                <div key={highlight} className="min-w-[148px] rounded-2xl bg-[#f7f9fc] p-3 text-[#111318]">
                  <Icon className="h-4.5 w-4.5" />
                  <p className="mt-2 text-[13px] font-medium leading-tight">{highlight}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-[13px] text-[#6c7380]">From</p>
              <p className="text-[42px] font-semibold leading-none text-[#111318]">{pricingValue}</p>
              <p className="text-[15px] text-[#111318]/80">/hr</p>
            </div>
            {mockProfile ? (
              <DemoProfileNotice className="w-full sm:max-w-[280px]" />
            ) : (
              <Button
                type="button"
                onClick={() => openHireSheet()}
                className="h-14 rounded-full bg-[#f20d14] px-10 text-[18px] font-semibold text-white hover:bg-[#d80a10]"
              >
                Hire {firstName}
              </Button>
            )}
          </div>

          <div className={`mt-4 grid gap-3 ${profile.contactNumber ? "grid-cols-2" : "grid-cols-1"}`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/messages?mock=1&recipient=${profile.id}`)}
              className="h-12 rounded-full border-[#e6ebf3] bg-white text-[#111318] hover:bg-[#fff7f7] hover:text-[#f20d14]"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Message
            </Button>
            {profile.contactNumber && (
              <Button asChild type="button" variant="outline" className="h-12 rounded-full border-[#e6ebf3] bg-white text-[#111318] hover:bg-[#fff7f7] hover:text-[#f20d14]">
                <a href={`tel:${profile.contactNumber}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </a>
              </Button>
            )}
          </div>

          <LeaveReviewButton
            profileId={profile.id}
            profileName={profile.display_name}
            onReviewChange={() => setReviewRefreshKey((key) => key + 1)}
            className="mt-3 h-12 w-full rounded-full border-[#e6ebf3] bg-white text-[#111318] hover:bg-[#fff7f7] hover:text-[#f20d14]"
          />

          <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-[#f7f9fc] p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4.5 w-4.5 text-[#4f5867]" />
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Based in</p>
                <p className="mt-1 text-[14px] font-medium text-[#111318]">{profile.location}</p>
              </div>
            </div>
            <div className="mt-3 h-px bg-[#e3e8f0]" />
            <div className="mt-3 flex items-start gap-3">
              <Clock3 className="mt-0.5 h-4.5 w-4.5 text-[#4f5867]" />
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Response rate</p>
                <p className="mt-1 text-[14px] font-medium text-[#111318]">{profile.responseRate}</p>
              </div>
            </div>
            <div className="mt-3 h-px bg-[#e3e8f0]" />
            <div className="mt-3 flex items-start gap-3">
              <BriefcaseBusiness className="mt-0.5 h-4.5 w-4.5 text-[#4f5867]" />
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Projects completed</p>
                <p className="mt-1 text-[14px] font-medium text-[#111318]">{profile.projects}</p>
              </div>
            </div>
            <div className="mt-3 h-px bg-[#e3e8f0]" />
            <div className="mt-3 flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4.5 w-4.5 text-[#4f5867]" />
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Experience</p>
                <p className="mt-1 text-[14px] font-medium text-[#111318]">
                  {profile.years !== "-" ? `${profile.years} years` : profile.experienceLevel || "New to SnapScout"} - Member since{" "}
                  {profile.memberSince}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-white p-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">About this crew specialist</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#2b3340]">{profile.bio}</p>
          </div>

          <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-white p-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Core services</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {services.map((service) => (
                <span key={service} className="rounded-full bg-[#f3f5f8] px-3 py-1.5 text-[12px] font-medium text-[#3e4652]">
                  {service}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-white p-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Portfolio</p>
            <div className="mt-3">
              <ProfilePortfolioGallery
                userId={profile.id}
                items={portfolioPreview.map((image, index) => ({ id: `${image}-${index}`, image_url: image }))}
                title={profile.display_name}
                previewCount={6}
                className="[&_h3]:hidden [&_.text-center]:hidden [&_.mt-3]:mt-0"
                onItemsLoaded={setPortfolioGalleryItems}
              />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Quick package selection</p>
                <p className="mt-1 text-[13px] leading-snug text-[#5b6371]">Pick a package and continue into booking.</p>
              </div>
            </div>
            <div className="no-scrollbar -mx-1 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
              {packageCards.map((pkg, index) => {
                const isSelected = index === selectedPackageIndex
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackageIndex(index)}
                    className={`min-w-[78%] snap-start overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition ${
                      isSelected ? "border-[#f20d14] ring-2 ring-[#f20d14]/10" : "border-[#e6ebf3]"
                    }`}
                  >
                    {pkg.coverImage && (
                      <div className="relative h-28 w-full overflow-hidden bg-[#f7f9fc]">
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
                          <p className="mt-1 text-[13px] leading-relaxed text-[#5b6371]">{pkg.description}</p>
                        </div>
                        {isSelected ? <CheckCircle2 className="h-5 w-5 flex-none text-[#f20d14]" /> : null}
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-2">
                        <div>
                          <p className="text-[11px] text-[#6d7480]">Package price</p>
                          <p className="text-[16px] font-semibold text-[#f20d14]">{pkg.price}</p>
                        </div>
                        {pkg.included.length > 0 && (
                          <div className="flex max-w-[54%] flex-wrap justify-end gap-1">
                            {pkg.included.slice(0, 2).map((feature) => (
                              <span key={feature} className="rounded-full bg-[#f3f5f8] px-2 py-1 text-[10px] font-medium text-[#3e4652]">
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
            {mockProfile ? (
              <DemoProfileNotice className="mt-4" />
            ) : (
              <Button
                type="button"
                onClick={() => openHireSheet()}
                className="mt-4 h-12 w-full rounded-full bg-[#f20d14] text-[15px] font-semibold text-white hover:bg-[#d80a10]"
              >
                {selectedPackage?.availability === "Available" ? "Book Selected Package" : "Check Availability"}
              </Button>
            )}
          </div>

          {!mockProfile && (
            <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Live availability</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#2b3340]">
                    Share your date and project details to check whether {firstName} is available for your shoot.
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full border-[#d8efe3] bg-[#effaf4] px-3 py-1 text-[12px] text-[#16794c]">
                  Open
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#f7f9fc] p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Best for</p>
                  <p className="mt-2 text-[15px] font-semibold text-[#111318]">Day shoots, interviews, branded sets</p>
                </div>
                <div className="rounded-2xl bg-[#f7f9fc] p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Response window</p>
                  <p className="mt-2 text-[15px] font-semibold text-[#111318]">Usually within 24 hours</p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => openHireSheet(undefined, "availability")}
                className="mt-4 h-12 w-full rounded-full bg-[#f20d14] text-white hover:bg-[#d80a10]"
              >
                Check Availability
              </Button>
            </div>
          )}
        </div>
      </section>

      {hireSheetOpen ? (
        <HireRequestSheet
          open={hireSheetOpen}
          onOpenChange={setHireSheetOpen}
          talentId={profile.id}
          talentName={profile.display_name}
          talentType="crew"
          priceLabel={selectedPackage?.price || profile.pricing}
          bookingTypeOptions={packageBookingOptions}
          initialBookingType={selectedPackage?.name}
          initialDate={requestedDate}
          requestOrigin={requestOrigin}
          recipientId={profile.id}
          recipientName={profile.display_name}
        />
      ) : null}
      {lightboxIndex !== null && (
        <PortfolioLightbox items={heroLightboxItems} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      <ShareProfileDrawer
        open={showShareDrawer}
        onOpenChange={setShowShareDrawer}
        profileId={profile.id}
        profileName={profile.display_name}
        profileRole={profile.profession}
        profileLocation={profile.location}
        profileImage={profile.profile_image_url}
        profileBio={profile.bio}
        profileHref={`/crew/${profile.id}`}
        stats={[
          { label: "Rating", value: profile.rating > 0 ? profile.rating.toFixed(1) : "New" },
          { label: "Response", value: profile.responseRate || "-" },
          {
            label: "Experience",
            value: profile.years !== "-" ? `${profile.years} yrs` : profile.experienceLevel || "New",
          },
        ]}
      />
    </MobileShell>
  )
}
