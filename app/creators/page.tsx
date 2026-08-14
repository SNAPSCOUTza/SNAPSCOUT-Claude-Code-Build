"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Search,
  MapPin,
  Star,
  Calendar,
  Award,
  Loader2,
  ImageIcon,
  SlidersHorizontal,
  X,
  Camera,
  Video,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { MessageButton } from "@/components/messaging/message-button"
import { SaveProfileButton } from "@/components/messaging/save-profile-button"
import { SaveToPoolButton } from "@/components/crew/SaveToPoolButton"
import { createBrowserClient } from "@/lib/supabase/client"
import { mockCreators } from "@/lib/mock-data/creators-data"
import MobileShell from "@/components/mobile/mobile-shell"
import { AvailabilityStatusBadge } from "@/components/availability/availability-status-badge"
import { HireRequestSheet } from "@/components/booking/hire-request-sheet"
import type { AvailabilityOwnerType } from "@/lib/availability"
import { AnimatedCount } from "@/components/ui/animated-count"
import { MotionRevealGroup, MotionRevealItem } from "@/components/ui/motion-reveal"
import { StickyScrollCard } from "@/components/ui/sticky-scroll-card"
import { SnapScoutStateArt } from "@/components/mobile/snapscout-state-art"

function inferCreatorHighlights(creator: any) {
  const services = (creator.specializations || creator.skills || []).slice(0, 3)
  return services.map((label: string) => {
    const lower = label.toLowerCase()
    const Icon =
      lower.includes("video") || lower.includes("drone")
        ? Video
        : lower.includes("light") || lower.includes("color")
          ? Sparkles
          : Camera

    return { label, Icon }
  })
}

type CreatorHighlight = ReturnType<typeof inferCreatorHighlights>[number]

export default function CreatorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")
  const [serviceFilter, setServiceFilter] = useState("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [showMobileSearchFilters, setShowMobileSearchFilters] = useState(true)
  const [creators, setCreators] = useState<any[]>([])
  const [hireRequestCreator, setHireRequestCreator] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [usingMockData, setUsingMockData] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchCreators()
  }, [])

  useEffect(() => {
    let ticking = false

    const syncSearchFiltersVisibility = () => {
      const shouldShow = window.scrollY <= 8
      setShowMobileSearchFilters((current) => (current === shouldShow ? current : shouldShow))
      ticking = false
    }

    const handleScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(syncSearchFiltersVisibility)
    }

    syncSearchFiltersVisibility()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const fetchCreators = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("user_profiles")
        .select(`
          id, user_id, full_name, display_name, username, email, profession, bio, location, city, province,
          profile_image_url, profile_picture, avatar_url, availability, availability_status, pricing,
          hourly_rate, daily_rate, project_rate, skills, social_links, portfolio_images,
          is_public, is_profile_visible, subscription_status, created_at
        `)
        .eq("is_profile_visible", true)
        .order("created_at", { ascending: false })

      if (error) throw error

      const liveProfiles = (data || []).map((profile: any) => {
        const profileId = profile.user_id || profile.id
        const location = profile.location || [profile.city, profile.province].filter(Boolean).join(", ")
        const pricing =
          profile.pricing ||
          (profile.hourly_rate ? `R${profile.hourly_rate}/hr` : profile.daily_rate ? `R${profile.daily_rate}/day` : "")

        return {
          id: profileId,
          user_id: profileId,
          display_name: profile.display_name || profile.full_name || profile.username || "Unknown",
          full_name: profile.full_name || profile.display_name || profile.username || "Unknown",
          profession: profile.profession || "Creator",
          city: profile.city || location?.split(",")[0]?.trim() || "",
          province: profile.province || location?.split(",")[1]?.trim() || "",
          profile_picture: profile.profile_image_url || profile.profile_picture || profile.avatar_url || "",
          bio: profile.bio,
          availability_status: profile.availability_status || profile.availability || "Available",
          skills: profile.skills || [],
          specializations: profile.skills || [],
          is_public: profile.is_profile_visible ?? profile.is_public ?? true,
          rating: 4.5 + Math.random() * 0.5,
          reviews: Math.floor(Math.random() * 100) + 20,
          pricing,
          portfolioImages: profile.portfolio_images || [],
          isLiveProfile: true, // Flag to identify live profiles
        }
      })

      // Live profiles appear first, then mock profiles
      const combinedProfiles = [...liveProfiles, ...mockCreators.map((c) => ({ ...c, isLiveProfile: false }))]

      setCreators(combinedProfiles)
      setUsingMockData(liveProfiles.length === 0)
    } catch (error: any) {
      console.error("[v0] Error fetching creators:", error?.message || error)
      setCreators(mockCreators.map((c) => ({ ...c, isLiveProfile: false })))
      setUsingMockData(true)
    } finally {
      setLoading(false)
    }
  }

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch =
      creator.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.specializations?.some((spec: string) => spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
      creator.city?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterType || creator.profession?.toLowerCase() === filterType.toLowerCase()
    const matchesService =
      !serviceFilter ||
      (creator.specializations || creator.skills || []).some((service: string) =>
        service.toLowerCase() === serviceFilter.toLowerCase(),
      )
    return matchesSearch && matchesFilter && matchesService
  })

  const creatorServices = useMemo(() => {
    const services = new Set<string>()
    creators.forEach((creator) => {
      ;(creator.specializations || creator.skills || []).forEach((service: string) => {
        if (service) services.add(service)
      })
    })
    return Array.from(services).slice(0, 12)
  }, [creators])

  const getOwnerType = (profession?: string): AvailabilityOwnerType => {
    const value = profession?.toLowerCase() || ""
    if (value.includes("photo")) return "photographer"
    if (value.includes("video")) return "videographer"
    return "crew"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="md:hidden">
        <MobileShell
          title="Browse Creatives"
          rightAction={
            <Button
              variant="outline"
              className="w-full border-[#e8e0d5] bg-white text-[#111318]"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          }
        >
          <MotionRevealGroup className="rounded-[30px] border border-[#ece4da] bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <div className="sticky top-[calc(72px+env(safe-area-inset-top))] z-20 -mx-1">
              <motion.div
                initial={false}
                animate={
                  showMobileSearchFilters
                    ? {
                        opacity: 1,
                        y: 0,
                        maxHeight: 220,
                        marginBottom: 12,
                      }
                    : {
                        opacity: 0,
                        y: -18,
                        maxHeight: 0,
                        marginBottom: 0,
                      }
                }
                transition={{
                  duration: 0.42,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="overflow-hidden"
                style={{ pointerEvents: showMobileSearchFilters ? "auto" : "none" }}
              >
                <div className="space-y-3 rounded-[24px] bg-white/92 px-1 pb-3 pt-1 backdrop-blur-md supports-[backdrop-filter]:bg-white/82">
                  <MotionRevealItem className="flex items-center gap-2 rounded-[22px] border border-[#e7e0d6] bg-[#fffdfa] px-3 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                    <Search className="h-4 w-4 text-[#73757d]" />
                    <Input
                      placeholder="Search creatives..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-8 border-0 bg-transparent p-0 text-[16px] shadow-none focus-visible:ring-0 md:text-[14px]"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setMobileFiltersOpen(true)}
                      whileTap={{ scale: 0.92 }}
                      className="grid h-9 w-9 min-w-9 shrink-0 place-items-center rounded-full border border-[#e7e0d6] bg-white"
                      aria-label="Open filters"
                    >
                      <SlidersHorizontal className="h-4 w-4 text-[#111318]" />
                    </motion.button>
                  </MotionRevealItem>

                  <MotionRevealItem className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                    {[
                      { label: "All", value: "" },
                      { label: "Photographers", value: "photographer" },
                      { label: "Videographers", value: "videographer" },
                    ].map((item) => (
                      <motion.button
                        key={item.label}
                        type="button"
                        onClick={() => setFilterType(item.value)}
                        whileTap={{ scale: 0.96 }}
                        className={`whitespace-nowrap rounded-full border px-4 py-2 text-[12px] font-semibold transition-[transform,box-shadow,background-color,color] duration-200 active:scale-[0.96] ${
                          filterType === item.value
                            ? "border-[#0d0f13] bg-[#0d0f13] text-white shadow-[0_10px_24px_rgba(17,19,24,0.14)]"
                            : "border-[#e7e0d6] bg-white text-[#20232b]"
                        }`}
                      >
                        {item.label}
                      </motion.button>
                    ))}
                  </MotionRevealItem>

                  <MotionRevealItem className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                    <motion.button
                      type="button"
                      onClick={() => setServiceFilter("")}
                      whileTap={{ scale: 0.96 }}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-[12px] font-semibold ${
                        serviceFilter === ""
                          ? "border-[#0d0f13] bg-[#0d0f13] text-white"
                          : "border-[#e7e0d6] bg-white text-[#20232b]"
                      }`}
                    >
                      All services
                    </motion.button>
                    {creatorServices.map((service: string) => (
                      <motion.button
                        key={service}
                        type="button"
                        onClick={() => setServiceFilter(service)}
                        whileTap={{ scale: 0.96 }}
                        className={`whitespace-nowrap rounded-full border px-4 py-2 text-[12px] font-semibold ${
                          serviceFilter === service
                            ? "border-[#0d0f13] bg-[#0d0f13] text-white"
                            : "border-[#e7e0d6] bg-white text-[#20232b]"
                        }`}
                      >
                        {service}
                      </motion.button>
                    ))}
                  </MotionRevealItem>
                </div>
              </motion.div>
            </div>

            <div className="space-y-3 pt-px">
              {filteredCreators.map((creator) => (
                <MotionRevealItem key={creator.id}>
                <Card className="overflow-hidden rounded-[26px] border-[#ece4da] bg-white shadow-[0_16px_38px_rgba(15,23,42,0.06)]">
                  <CardContent className="p-0">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.38, ease: "easeOut" }}>
                      <Link href={`/creators/${creator.user_id || creator.id}`} className="relative block overflow-hidden rounded-t-[26px] bg-[#f3f5f8]">
                        <div className="relative aspect-[1.14/1] w-full">
                        <Image
                          src={(creator.portfolioImages && creator.portfolioImages[0]) || creator.profile_picture || "/placeholder.svg?height=176&width=330"}
                          alt={creator.display_name || creator.full_name}
                          fill
                          className="object-cover"
                        />
                        </div>
                        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between">
                          <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#111318] shadow-[0_8px_18px_rgba(15,23,42,0.12)]">
                            {creator.profession || "Creative"}
                          </span>
                          <SaveProfileButton
                            profileId={creator.user_id || creator.id}
                            profileName={creator.display_name || creator.full_name}
                            profileRole={creator.profession}
                            profileLocation={[creator.city, creator.province].filter(Boolean).join(", ") || creator.location}
                            profileImage={(creator.portfolioImages && creator.portfolioImages[0]) || creator.profile_picture}
                            profileHref={`/creators/${creator.user_id || creator.id}`}
                            category="creator"
                            variant="ghost"
                            size="icon"
                            className="pointer-events-auto h-11 w-11 rounded-full border border-[#e7e0d6] bg-white text-[#111318] shadow-[0_12px_26px_rgba(15,23,42,0.12)]"
                          />
                        </div>
                      </Link>
                    </motion.div>
                    <div className="space-y-4 px-4 py-0">
                      <div className="space-y-3">
                        <div className="min-w-0 space-y-2">
                          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff1c1c]">
                            {creator.city || "South Africa"}
                          </p>
                          <p className="text-[18px] font-black leading-tight tracking-[-0.03em] text-[#111318]">
                            {creator.display_name || creator.full_name}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="h-10 rounded-full border-[#e4e0d9] bg-white px-4 text-[13px] font-semibold text-[#111318]"
                          >
                            <MapPin className="mr-2 h-3.5 w-3.5 text-[#6b7280]" />
                            {[creator.city, creator.province].filter(Boolean).join(", ") || "South Africa"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="h-10 rounded-full border-[#e4e0d9] bg-white px-4 text-[13px] font-semibold text-[#111318]"
                          >
                            <Star className="mr-2 h-3.5 w-3.5 fill-current text-[#111318]" />
                            {(creator.rating || 4.8).toFixed(1)} ({creator.reviews || 40})
                          </Badge>
                          <AvailabilityStatusBadge ownerId={creator.user_id || creator.id} ownerType={getOwnerType(creator.profession)} />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {inferCreatorHighlights(creator).map(({ label, Icon }: CreatorHighlight) => (
                            <div
                              key={label}
                              className="rounded-[18px] bg-[#f7f8fb] px-3 py-3 shadow-[inset_0_0_0_1px_rgba(232,228,222,0.8)]"
                            >
                              <Icon className="h-4 w-4 text-[#111318]" />
                              <p className="mt-4 line-clamp-2 text-[12px] font-medium leading-5 text-[#111318]">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[13px] text-[#6b7280]">From</p>
                          <div className="flex items-end gap-1">
                            <span className="text-[18px] font-bold tracking-[-0.02em] text-[#111318]">{creator.pricing || "R950/hr"}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => setHireRequestCreator(creator)}
                          className="h-14 min-w-[146px] rounded-full bg-[#ef1218] px-6 text-[16px] font-semibold text-white shadow-[0_18px_28px_rgba(242,13,20,0.18)] hover:bg-[#d90d12]"
                        >
                          Hire
                        </Button>
                      </div>

                      {creator.bio ? (
                        <div className="rounded-[22px] border border-[#e7e0d6] bg-[#fbfcfe] px-4 py-4">
                          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8a93a3]">About this creator</p>
                          <p className="mt-3 line-clamp-3 text-[14px] leading-7 text-[#444954]">{creator.bio}</p>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-[20px] border border-[#e8edf5] bg-[#fbfcfe] px-2 py-3 text-center">
                          <p className="text-[20px] font-semibold leading-none text-[#111318] tabular-nums">
                            <AnimatedCount value={Math.round((creator.reviews || 40) + 80)} suffix="+" />
                          </p>
                          <p className="mt-1 text-[11px] text-[#676b75]">Projects</p>
                        </div>
                        <div className="rounded-[20px] border border-[#e8edf5] bg-[#fbfcfe] px-2 py-3 text-center">
                          <p className="text-[20px] font-semibold leading-none text-[#111318] tabular-nums">
                            <AnimatedCount value={Math.max(2, Math.round((creator.rating || 4.8) - 0.5))} />
                          </p>
                          <p className="mt-1 text-[11px] text-[#676b75]">Years</p>
                        </div>
                        <div className="rounded-[20px] border border-[#e8edf5] bg-[#fbfcfe] px-2 py-3 text-center">
                          <p className="text-[20px] font-semibold leading-none text-[#111318] tabular-nums">
                            <AnimatedCount value={Math.min(99, Math.round((creator.rating || 4.8) * 20))} suffix="%" />
                          </p>
                          <p className="mt-1 text-[11px] text-[#676b75]">Response</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(creator.specializations || []).slice(0, 4).map((tag: string) => (
                          <Badge key={tag} className="rounded-full border-0 bg-[#111318] px-3 py-1.5 text-[11px] font-medium text-white">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          <MessageButton
                            recipientId={creator.user_id || creator.id}
                            recipientName={creator.display_name || creator.full_name}
                            variant="outline"
                            className="h-12 w-full rounded-full border-[#e7e0d6] bg-white text-[14px] font-medium"
                          />
                          <Button
                            type="button"
                            asChild
                            variant="outline"
                            className="h-12 w-full rounded-full border-[#e7e0d6] bg-white text-[14px] font-medium text-[#111318]"
                          >
                            <Link href={`/creators/${creator.user_id || creator.id}`}>View Profile</Link>
                          </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </MotionRevealItem>
              ))}
            </div>

            {filteredCreators.length === 0 && (
              <div className="py-8">
                <SnapScoutStateArt variant="empty">
                <Button variant="outline" className="mt-3 rounded-full border-[#e7e0d6] bg-white" onClick={() => setFilterType("")}>
                  Reset Filters
                </Button>
                </SnapScoutStateArt>
              </div>
            )}
          </MotionRevealGroup>

          <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <DialogContent
              unstyled
              showCloseButton={false}
              overlayClassName="fixed inset-0 z-[169] bg-white/20 backdrop-blur-[12px] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] supports-[backdrop-filter]:bg-white/14"
              className="fixed inset-x-0 bottom-0 top-auto z-[170] mx-0 w-full max-w-none gap-0 overflow-hidden rounded-b-none rounded-t-[30px] border-x-0 border-b-0 border-t border-[#e8dfd3] bg-white/96 p-0 text-[#111318] shadow-[0_-24px_64px_rgba(15,23,42,0.18)] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 backdrop-blur-xl supports-[backdrop-filter]:bg-white/92"
            >
              <motion.div
                initial={{ y: 48, opacity: 0.94 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 48, opacity: 0.96 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex max-h-[78dvh] flex-col"
              >
                <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-[#d7dce6]" />
                <div className="border-b border-[#e8dfd3] px-5 pb-4 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[18px] font-semibold text-[#111318]">Filter Creatives</p>
                    <motion.button
                      type="button"
                      onClick={() => setMobileFiltersOpen(false)}
                      aria-label="Close filters"
                      whileTap={{ scale: 0.9, rotate: -8 }}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e7e0d6] bg-white shadow-sm"
                    >
                      <X className="h-4.5 w-4.5" />
                    </motion.button>
                  </div>
                </div>

                <div className="no-scrollbar overflow-y-auto px-5 py-5">
                  <div className="grid gap-2">
                    <Button
                      variant={filterType === "" ? "default" : "outline"}
                      className={
                        filterType === ""
                          ? "h-12 rounded-full bg-[#f20d14] text-white shadow-sm transition-transform active:scale-[0.98] hover:bg-[#d80a10]"
                          : "h-12 rounded-full border-[#e7e0d6] bg-white shadow-sm transition-transform active:scale-[0.98]"
                      }
                      onClick={() => {
                        setFilterType("")
                        setMobileFiltersOpen(false)
                      }}
                    >
                      All Creatives
                    </Button>
                    <Button
                      variant={filterType === "photographer" ? "default" : "outline"}
                      className={
                        filterType === "photographer"
                          ? "h-12 rounded-full bg-[#f20d14] text-white shadow-sm transition-transform active:scale-[0.98] hover:bg-[#d80a10]"
                          : "h-12 rounded-full border-[#e7e0d6] bg-white shadow-sm transition-transform active:scale-[0.98]"
                      }
                      onClick={() => {
                        setFilterType("photographer")
                        setMobileFiltersOpen(false)
                      }}
                    >
                      Photographers
                    </Button>
                    <Button
                      variant={filterType === "videographer" ? "default" : "outline"}
                      className={
                        filterType === "videographer"
                          ? "h-12 rounded-full bg-[#f20d14] text-white shadow-sm transition-transform active:scale-[0.98] hover:bg-[#d80a10]"
                          : "h-12 rounded-full border-[#e7e0d6] bg-white shadow-sm transition-transform active:scale-[0.98]"
                      }
                      onClick={() => {
                        setFilterType("videographer")
                        setMobileFiltersOpen(false)
                      }}
                    >
                      Videographers
                    </Button>
                    <SelectServiceButtons
                      services={creatorServices}
                      selectedService={serviceFilter}
                      onSelectService={(service) => {
                        setServiceFilter(service)
                        setMobileFiltersOpen(false)
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        </MobileShell>
      </div>

      <div className="hidden md:block">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Hire Top <span className="text-primary-foreground/80">Videographers</span> &{" "}
              <span className="text-primary-foreground/80">Photographers</span>
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Connect with South Africa's most talented visual creators for your next project
            </p>

            {/* Search Bar */}
            <div className="bg-card rounded-lg p-6 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Search by name, specialty, or skill..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-foreground"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8">
                  <Search className="w-5 h-5 mr-2" />
                  Search Creators
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        {usingMockData && (
          <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-center gap-2 text-warning-foreground">
            <ImageIcon className="w-5 h-5" />
            <span className="text-sm">
              Showing mock data for testing. Real profiles will appear once users sign up.
            </span>
          </div>
        )}

        <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Filters:</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={filterType === "" ? "default" : "outline"}
                onClick={() => setFilterType("")}
                className={`transition-all duration-200 ${
                  filterType === ""
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-primary/20 text-primary hover:bg-primary/10"
                }`}
              >
                All
              </Button>
              <Button
                variant={filterType === "photographer" ? "default" : "outline"}
                onClick={() => setFilterType("photographer")}
                className={`transition-all duration-200 ${
                  filterType === "photographer"
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-primary/20 text-primary hover:bg-primary/10"
                }`}
              >
                Photographers
              </Button>
              <Button
                variant={filterType === "videographer" ? "default" : "outline"}
                onClick={() => setFilterType("videographer")}
                className={`transition-all duration-200 ${
                  filterType === "videographer"
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-primary/20 text-primary hover:bg-primary/10"
                }`}
              >
                Videographers
              </Button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {filteredCreators.length} Creator{filteredCreators.length !== 1 ? "s" : ""} Found
          </h2>
          <div className="flex items-center space-x-4">
            <Link href="/marketplace">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                View Available Projects
              </Button>
            </Link>
            <Link href="/marketplace/post-project">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Post a Project</Button>
            </Link>
          </div>
        </div>

        {/* Creator Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator, index) => (
            <StickyScrollCard key={creator.id} top="116px" delay={0.08 + index * 0.06}>
            <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              {creator.portfolioImages && creator.portfolioImages.length > 0 && (
                <div className="grid grid-cols-4 gap-0.5 h-24">
                  {creator.portfolioImages.slice(0, 4).map((img: string, idx: number) => (
                    <div key={idx} className="relative overflow-hidden">
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`Portfolio ${idx + 1}`}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}

              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Profile Image */}
                  <div className="relative flex-shrink-0 w-20 h-20">
                    <Image
                      src={creator.profile_picture || "/placeholder.svg?height=80&width=80"}
                      alt={creator.display_name || creator.full_name}
                      width={80}
                      height={80}
                      className="rounded-full object-cover w-full h-full"
                    />
                    {creator.is_public && (
                      <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1">
                        <Award className="w-4 h-4 text-success-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Creator Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg truncate text-foreground">
                          {creator.display_name || creator.full_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{creator.profession}</p>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Star className="w-4 h-4 text-warning fill-current" />
                        <span className="text-sm font-medium text-foreground">
                          {creator.rating?.toFixed(1) || "4.5"}
                        </span>
                        <span className="text-xs text-muted-foreground">({creator.reviews || 0})</span>
                      </div>
                    </div>

                    {/* Location */}
                    {creator.city && (
                      <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {creator.city}, {creator.province}
                        </span>
                      </div>
                    )}

                    {/* Specializations */}
                    {creator.specializations && creator.specializations.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {creator.specializations.slice(0, 3).map((spec: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {creator.specializations.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{creator.specializations.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    {creator.bio && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{creator.bio}</p>}

                    {/* Rates and Availability */}
                    <div className="flex items-center justify-between mt-3 text-sm">
                      {creator.pricing && <span className="font-semibold text-success">{creator.pricing}</span>}
                      <AvailabilityStatusBadge ownerId={creator.user_id || creator.id} ownerType={getOwnerType(creator.profession)} />
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex items-center gap-2">
                      <SaveProfileButton
                        profileId={creator.user_id}
                        profileName={creator.display_name || creator.full_name}
                        profileRole={creator.profession}
                        profileLocation={[creator.city, creator.province].filter(Boolean).join(", ") || creator.location}
                        profileImage={(creator.portfolioImages && creator.portfolioImages[0]) || creator.profile_picture}
                        profileHref={`/creators/${creator.user_id || creator.id}`}
                        category="creator"
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 shrink-0 rounded-full"
                      />
                      <SaveToPoolButton
                        profileId={creator.user_id || creator.id}
                        profileName={creator.display_name || creator.full_name}
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 shrink-0 rounded-full"
                      />
                      <Link href={`/creators/${creator.user_id}`} className="flex-1">
                        <Button variant="outline" className="h-11 w-full rounded-full bg-card text-[14px] font-semibold text-card-foreground transition-[transform,box-shadow,background-color] duration-200 ease-out hover:bg-accent active:scale-[0.97]">
                          View Profile
                        </Button>
                      </Link>
                      <MessageButton
                        recipientId={creator.user_id}
                        recipientName={creator.display_name || creator.full_name}
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 shrink-0 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </StickyScrollCard>
          ))}
        </div>

        {/* No Results */}
        {filteredCreators.length === 0 && (
          <div className="py-10">
            <SnapScoutStateArt variant="empty">
            <Button onClick={() => setFilterType("")}>Clear Filters</Button>
            </SnapScoutStateArt>
          </div>
        )}
      </div>
      </div>
      {hireRequestCreator && (
        <HireRequestSheet
          open={!!hireRequestCreator}
          onOpenChange={(open) => {
            if (!open) setHireRequestCreator(null)
          }}
          talentId={hireRequestCreator.user_id || hireRequestCreator.id}
          talentName={hireRequestCreator.display_name || hireRequestCreator.full_name || "Creative"}
          talentType="creator"
          priceLabel={hireRequestCreator.pricing || "R950/hr"}
        />
      )}
    </div>
  )
}

function SelectServiceButtons({
  services,
  selectedService,
  onSelectService,
}: {
  services: string[]
  selectedService: string
  onSelectService: (service: string) => void
}) {
  if (!services.length) return null
  return (
    <div className="mt-1 space-y-2">
      <p className="px-1 text-[12px] font-semibold text-[#555d68]">Services</p>
      {services.slice(0, 10).map((service) => (
        <Button
          key={service}
          variant={selectedService === service ? "default" : "outline"}
          className={
            selectedService === service
              ? "h-11 rounded-full bg-[#f20d14] text-white shadow-sm transition-transform active:scale-[0.98] hover:bg-[#d80a10]"
              : "h-11 rounded-full border-[#e7e0d6] bg-white shadow-sm transition-transform active:scale-[0.98]"
          }
          onClick={() => onSelectService(service)}
        >
          {service}
        </Button>
      ))}
    </div>
  )
}
