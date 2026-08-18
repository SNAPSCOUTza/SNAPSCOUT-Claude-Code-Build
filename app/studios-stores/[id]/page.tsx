"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  Car,
  CheckCircle2,
  Clock3,
  Coffee,
  Globe,
  Heart,
  Loader2,
  MapPin,
  Package,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trees,
  Wifi,
  Zap,
} from "lucide-react"
import MobileShell from "@/components/mobile/mobile-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HireRequestSheet } from "@/components/booking/hire-request-sheet"
import { getStudioStoreById, type StudioStoreItem } from "@/lib/mock-data/studios-stores-data"
import {
  STUDIO_STORE_DASHBOARD_PREVIEW_KEY,
  applyStudioStoreDashboardPreview,
} from "@/lib/mock-data/studio-store-dashboard-preview"
import { useAuth } from "@/contexts/auth-context"
import { createBrowserClient } from "@/lib/supabase/client"
import { STUDIO_STORE_PROFILE_COLUMNS, mapLiveProfileToStudioStoreItem } from "@/lib/studios-stores/live-data"
import {
  findUploadedShootLocationById,
  hasMockPaidSubscription,
  uploadedLocationToStudioStoreItem,
} from "@/lib/mock-data/uploaded-shoot-locations"

const getAmenityIcon = (amenity: string) => {
  const normalized = amenity.toLowerCase()
  if (normalized.includes("natural") || normalized.includes("light")) return Sun
  if (normalized.includes("wi-fi") || normalized.includes("wifi")) return Wifi
  if (normalized.includes("parking")) return Car
  if (normalized.includes("power")) return Zap
  if (normalized.includes("security")) return ShieldCheck
  if (normalized.includes("restaurant") || normalized.includes("cafe")) return Coffee
  if (normalized.includes("outdoor")) return Trees
  if (normalized.includes("indoor")) return Building2
  if (normalized.includes("load") || normalized.includes("gear")) return Package
  return Sparkles
}

type DetailStudioStore = Omit<StudioStoreItem, "id"> & {
  id: string | number
  isUploadedLocation?: boolean
}

export default function StudioStoreDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { profile } = useAuth()
  const [bookingOpen, setBookingOpen] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0)
  const [dashboardPreviewSettings, setDashboardPreviewSettings] = useState<Record<string, any> | null>(null)
  const carouselRef = useRef<HTMLDivElement | null>(null)

  const canViewUploadedLocations = hasMockPaidSubscription(profile)
  const isUploadedLocationRoute = params.id.startsWith("uploaded-")

  const baseItem = useMemo<DetailStudioStore | null>(() => {
    const existing = getStudioStoreById(params.id)
    if (existing) return existing as DetailStudioStore

    if (!canViewUploadedLocations) return null

    const uploaded = findUploadedShootLocationById(params.id)
    if (!uploaded) return null

    return {
      ...uploadedLocationToStudioStoreItem(uploaded),
      id: uploaded.id,
      isUploadedLocation: true,
    }
  }, [params.id, canViewUploadedLocations])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(STUDIO_STORE_DASHBOARD_PREVIEW_KEY)
      setDashboardPreviewSettings(raw ? JSON.parse(raw) : null)
    } catch {
      setDashboardPreviewSettings(null)
    }
  }, [])

  const [liveItem, setLiveItem] = useState<DetailStudioStore | null>(null)
  const [loadingLive, setLoadingLive] = useState(!baseItem && !isUploadedLocationRoute)

  useEffect(() => {
    if (baseItem || isUploadedLocationRoute) {
      setLoadingLive(false)
      return
    }

    let cancelled = false
    setLoadingLive(true)
    const supabase = createBrowserClient()

    supabase
      .from("user_profiles")
      .select(STUDIO_STORE_PROFILE_COLUMNS)
      .eq("user_id", params.id)
      .in("account_type", ["studio", "store"])
      .maybeSingle()
      .then(({ data }: { data: any }) => {
        if (cancelled) return
        setLiveItem(data ? (mapLiveProfileToStudioStoreItem(data) as DetailStudioStore) : null)
        setLoadingLive(false)
      })

    return () => {
      cancelled = true
    }
  }, [params.id, baseItem, isUploadedLocationRoute])

  const item = useMemo<DetailStudioStore | null>(() => {
    if (!baseItem) return liveItem
    if (baseItem.isUploadedLocation) return baseItem
    return applyStudioStoreDashboardPreview(baseItem as StudioStoreItem, dashboardPreviewSettings) as DetailStudioStore
  }, [baseItem, dashboardPreviewSettings, liveItem])

  if (loadingLive) {
    return (
      <MobileShell title="Studio Details">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#f20d14]" />
        </div>
      </MobileShell>
    )
  }

  if (isUploadedLocationRoute && !canViewUploadedLocations) {
    return (
      <MobileShell title="Studio Details">
        <div className="rounded-[24px] border border-[#f0d9db] bg-white p-5 text-center">
          <p className="text-[16px] font-semibold text-[#101318]">This uploaded shoot location is for paid subscribers.</p>
          <p className="mt-2 text-[13px] text-[#5f6672]">Mock subscription gating is active for user-uploaded locations.</p>
          <Button asChild className="mt-4 rounded-full bg-[#f20d14] text-white hover:bg-[#d80a10]">
            <Link href="/subscribe/plans">Upgrade to View</Link>
          </Button>
        </div>
      </MobileShell>
    )
  }

  if (!item) {
    return (
      <MobileShell title="Studio Details">
        <div className="rounded-[24px] border border-[#e8edf5] bg-white p-5 text-center">
          <p className="text-[16px] font-semibold text-[#101318]">Studio or store not found.</p>
          <Button asChild className="mt-4 rounded-full bg-[#f20d14] text-white hover:bg-[#d80a10]">
            <Link href="/studios-stores">Back to Studios & Stores</Link>
          </Button>
        </div>
      </MobileShell>
    )
  }

  const city = item.location.split(",")[0]?.toUpperCase() || "SOUTH AFRICA"
  const startingRate = item.hourlyRate.split(" - ")[0] || item.hourlyRate
  const bookingOptions = Array.from(
    new Set([
      ...item.services,
      ...(item.type === "store"
        ? ["Camera rental", "Lens rental", "Full kit rental", "Multiple-day rental"]
        : ["Studio booking", "Photo shoot", "Video shoot", "Full-day studio hire"]),
      "Other",
    ]),
  )
  const galleryImages = item.gallery?.length
    ? item.gallery
    : [
        item.image,
        "/images/modern-studio.png",
        "/images/studio-space.png",
        "/images/creator-equipment.png",
        "/images/studio-lighting.png",
        "/images/warehouse-location.png",
        "/images/camera-rental.png",
        "/images/rooftop-location.png",
      ]

  const packageCards = (
    item.packages?.length
      ? item.packages
      : [
          {
            name: item.type === "store" ? "Daily Rental Access" : "Hourly Studio Access",
            price: startingRate,
            description: item.type === "store" ? "Quick access to available rental gear." : "Quick access to the main shooting space.",
          },
        ]
  ).map((pkg, index) => ({
    ...pkg,
    coverImage: pkg.image || galleryImages[(index + 1) % galleryImages.length] || item.image,
    duration:
      pkg.badge ||
      pkg.duration ||
      (index === 0
        ? item.type === "store"
          ? "1 day rental"
          : "2 hr minimum"
        : index === 1
          ? "Up to 5 hours"
          : "Up to 10 hours"),
    included:
      pkg.included?.length
        ? pkg.included
        : item.amenities.slice(index, index + 3).length
          ? item.amenities.slice(index, index + 3)
          : item.amenities.slice(0, 3),
    availability: pkg.availability || (index === 1 && item.availability === "Booked" ? "Limited" : item.availability),
  }))
  const selectedPackage = packageCards[selectedPackageIndex] || packageCards[0]
  const packageBookingOptions = Array.from(new Set([...packageCards.map((pkg) => pkg.name), ...bookingOptions]))

  const openHours = item.operatingHours || (item.type === "store" ? "Mon - Sat · 08:00 - 18:00" : "Daily · 07:00 - 22:00")

  return (
    <MobileShell title="Studios & Stores">
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
            {galleryImages.map((image, index) => (
              <div key={`${image}-${index}`} className="relative h-[330px] min-w-full snap-start">
                <Image src={image} alt={`${item.name} image ${index + 1}`} fill className="object-cover" />
              </div>
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
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-[#111318]" aria-label="Share listing">
                <Share2 className="h-5 w-5" />
              </button>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-[#f20d14]" aria-label="Save listing">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm">
            {galleryImages.map((_, index) => (
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
          <h1 className="mt-2 text-[43px] font-semibold leading-tight text-[#111318]">{item.name}</h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="h-10 rounded-full border-[#e6ebf3] bg-white px-4 text-[13px] text-[#111318]">
              <MapPin className="mr-1.5 h-4 w-4" /> {item.location}
            </Badge>
            {item.isUploadedLocation ? (
              <Badge variant="outline" className="h-10 rounded-full border-[#f7cbce] bg-[#fff2f3] px-4 text-[13px] text-[#bb0f15]">
                Premium uploaded listing
              </Badge>
            ) : null}
            <Badge variant="outline" className="h-10 rounded-full border-[#e6ebf3] bg-white px-4 text-[13px] text-[#111318]">
              <Star className="mr-1.5 h-4 w-4 fill-[#111318] text-[#111318]" /> {item.rating > 0 ? `${item.rating} (${item.reviews})` : "New"}
            </Badge>
            <Badge variant="outline" className="h-10 rounded-full border-[#e6ebf3] bg-white px-4 text-[13px] text-[#111318]">
              {item.availability}
            </Badge>
          </div>

          <div className="no-scrollbar -mx-1 mt-4 flex gap-3 overflow-x-auto px-1 pb-2">
            {item.amenities.map((amenity) => {
              const Icon = getAmenityIcon(amenity)
              return (
                <div key={amenity} className="min-w-[148px] rounded-2xl bg-[#f7f9fc] p-3 text-[#111318]">
                  <Icon className="h-4.5 w-4.5" />
                  <p className="mt-2 text-[13px] font-medium leading-tight">{amenity}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-[13px] text-[#6c7380]">From</p>
              <p className="text-[42px] font-semibold leading-none text-[#111318]">{item.hourlyRate.split(" - ")[0]}</p>
              <p className="text-[15px] text-[#111318]/80">/hr</p>
            </div>
            <Button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="h-14 rounded-full bg-[#f20d14] px-10 text-[18px] font-semibold text-white hover:bg-[#d80a10]"
            >
              Book Now
            </Button>
          </div>

          <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-[#f7f9fc] p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4.5 w-4.5 text-[#4f5867]" />
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Address</p>
                <p className="mt-1 text-[14px] font-medium text-[#111318]">{item.fullAddress || item.location}</p>
              </div>
            </div>
            <div className="mt-3 h-px bg-[#e3e8f0]" />
            <div className="mt-3 flex items-start gap-3">
              <Clock3 className="mt-0.5 h-4.5 w-4.5 text-[#4f5867]" />
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Operating Hours</p>
                <p className="mt-1 text-[14px] font-medium text-[#111318]">{openHours}</p>
              </div>
            </div>
            <div className="mt-3 h-px bg-[#e3e8f0]" />
            <a href={item.contact.website} target="_blank" rel="noreferrer" className="mt-3 flex items-start gap-3 text-[#111318] transition hover:opacity-80">
              <Globe className="mt-0.5 h-4.5 w-4.5 text-[#4f5867]" />
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Website</p>
                <p className="mt-1 text-[14px] font-medium">{item.contact.website.replace(/^https?:\/\//, "")}</p>
              </div>
            </a>
          </div>

          <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-white p-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">About this space</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#2b3340]">{item.about || item.description}</p>
          </div>

          <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Quick package selection</p>
                <p className="mt-1 text-[13px] leading-snug text-[#5b6371]">Pick a room, kit, or package and continue into booking.</p>
              </div>
              <Badge variant="outline" className="rounded-full border-[#e6ebf3] bg-[#f7f9fc] text-[#4f5867]">
                {item.spaceCount ? `${item.spaceCount} spaces` : "Single space"}
              </Badge>
            </div>
            <div className="no-scrollbar -mx-1 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
              {packageCards.map((pkg, index) => {
                const isSelected = index === selectedPackageIndex
                return (
                  <button
                    key={pkg.name}
                    type="button"
                    onClick={() => setSelectedPackageIndex(index)}
                    className={`min-w-[78%] snap-start overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition ${
                      isSelected ? "border-[#f20d14] ring-2 ring-[#f20d14]/10" : "border-[#e6ebf3]"
                    }`}
                  >
                    <div className="relative h-28 w-full overflow-hidden bg-[#f7f9fc]">
                      <Image src={pkg.coverImage} alt={pkg.name} fill className="object-cover" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#111318] shadow-sm">
                        {pkg.duration}
                      </span>
                      <span
                        className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm ${
                          pkg.availability === "Available" ? "bg-[#ecfdf5] text-[#047857]" : "bg-[#fff7ed] text-[#b45309]"
                        }`}
                      >
                        {pkg.availability}
                      </span>
                    </div>
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
                        <div className="flex max-w-[54%] flex-wrap justify-end gap-1">
                          {pkg.included.slice(0, 2).map((feature) => (
                            <span key={feature} className="rounded-full bg-[#f3f5f8] px-2 py-1 text-[10px] font-medium text-[#3e4652]">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-[#f7f9fc] p-3">
                <p className="text-[11px] text-[#6d7480]">Hourly</p>
                <p className="mt-1 text-[14px] font-semibold text-[#111318]">{item.hourlyRate.split(" - ")[0]}</p>
              </div>
              <div className="rounded-xl bg-[#f7f9fc] p-3">
                <p className="text-[11px] text-[#6d7480]">Half day</p>
                <p className="mt-1 text-[14px] font-semibold text-[#111318]">{item.halfDayRate || "On request"}</p>
              </div>
              <div className="rounded-xl bg-[#f7f9fc] p-3">
                <p className="text-[11px] text-[#6d7480]">Full day</p>
                <p className="mt-1 text-[14px] font-semibold text-[#111318]">{item.fullDayRate || "On request"}</p>
              </div>
              <div className="rounded-xl bg-[#f7f9fc] p-3">
                <p className="text-[11px] text-[#6d7480]">Peak / Off-peak</p>
                <p className="mt-1 text-[14px] font-semibold text-[#111318]">{item.peakRate ? `${item.peakRate} · ${item.offPeakRate}` : "On request"}</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="mt-4 h-12 w-full rounded-full bg-[#f20d14] text-[15px] font-semibold text-white hover:bg-[#d80a10]"
            >
              {selectedPackage?.availability === "Available" ? "Book Selected Package" : "Check Availability"}
            </Button>
          </div>

          {item.gearInventory?.length ? (
            <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-white p-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Gear inventory</p>
              <div className="mt-3 space-y-2">
                {item.gearInventory.map((gear) => (
                  <div key={gear.name} className="rounded-xl border border-[#edf1f7] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-semibold text-[#111318]">{gear.name}</p>
                      <Badge variant="outline" className="rounded-full border-[#e6ebf3] bg-[#f7f9fc] text-[#4f5867]">
                        {gear.availability}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[13px] text-[#5b6371]">{gear.rate}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-white p-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Booking terms</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#2b3340]">
              {item.termsSummary || "Deposit and rental terms are shared once a booking request is accepted."}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[13px] text-[#5b6371]">
              {item.depositPolicy ? <Badge variant="outline" className="rounded-full border-[#e6ebf3] bg-[#f7f9fc]">{item.depositPolicy}</Badge> : null}
              {item.rentalTermsLink ? (
                <a href={item.rentalTermsLink} target="_blank" rel="noreferrer" className="rounded-full border border-[#e6ebf3] bg-[#f7f9fc] px-3 py-1.5 hover:opacity-80">
                  View full terms
                </a>
              ) : null}
            </div>
            {item.rules?.length ? (
              <ul className="mt-3 space-y-1 text-[13px] text-[#5b6371]">
                {item.rules.map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#9aa3b2]" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </section>
      <HireRequestSheet
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        talentId={String(item.id)}
        talentName={item.name}
        talentType={item.type}
        priceLabel={selectedPackage?.price || `${startingRate}/hr`}
        bookingTypeOptions={packageBookingOptions}
        bookingTypeLabel={item.type === "store" ? "What are you renting?" : "What are you booking?"}
        bookingTypePlaceholder={item.type === "store" ? "Select rental type" : "Select studio booking type"}
        initialBookingType={selectedPackage?.name}
        durationLabel={item.type === "store" ? "How long do you need the rental?" : "How long do you need the space?"}
        briefPlaceholder={
          item.type === "store"
            ? "Example: camera kit rental, two days, lights, pickup time, Johannesburg..."
            : "Example: studio booking, all day, natural light, parking, changing room, Cape Town..."
        }
      />
    </MobileShell>
  )
}
