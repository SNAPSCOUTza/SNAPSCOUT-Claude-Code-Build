"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MobileShell from "@/components/mobile/mobile-shell"
import { MessageButton } from "@/components/messaging/message-button"
import { SaveProfileButton } from "@/components/messaging/save-profile-button"
import { createBrowserClient } from "@/lib/supabase/client"
import { mockStudios, type StudioData } from "@/lib/mock-data/studios-data"
import { DemoCardWrap } from "@/components/ui/demo-card-wrap"
import { DemoProfileBadge } from "@/components/ui/demo-profile-badge"
import { AvailabilityStatusBadge } from "@/components/availability/availability-status-badge"
import { AnimatedCount } from "@/components/ui/animated-count"
import { MotionRevealGroup, MotionRevealItem, MotionRevealSolo } from "@/components/ui/motion-reveal"
import { StickyScrollCard } from "@/components/ui/sticky-scroll-card"

export default function StudiosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [studios, setStudios] = useState<StudioData[]>([])
  const [loading, setLoading] = useState(true)
  const [useMockData, setUseMockData] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("user_profiles")
          .select(`
            id, user_id, full_name, display_name, username, email, account_type, profession, bio,
            location, city, province, profile_image_url, profile_picture, avatar_url,
            availability, availability_status, pricing, hourly_rate, daily_rate, project_rate,
            skills, social_links, portfolio_images, is_public, is_profile_visible, subscription_status, created_at
          `)
          .eq("is_profile_visible", true)
          .eq("subscription_status", "active")
          .order("created_at", { ascending: false })

        if (error) throw error

        const studioProfiles = (data || []).filter((profile: any) => {
          const searchableType = `${profile.account_type || ""} ${profile.profession || ""}`.toLowerCase()
          return searchableType.includes("studio") || searchableType.includes("store") || searchableType.includes("equipment")
        })

        if (studioProfiles.length === 0) {
          setStudios(mockStudios)
          setUseMockData(true)
          return
        }

        const transformed: StudioData[] = studioProfiles.map((profile: any) => {
          const profileId = profile.user_id || profile.id
          const location = profile.location || [profile.city, profile.province].filter(Boolean).join(", ")
          const studioType: StudioData["type"] = `${profile.account_type || profile.profession || ""}`
            .toLowerCase()
            .includes("store")
            ? "equipment_store"
            : "studio"
          const priceRange =
            profile.pricing ||
            (profile.hourly_rate ? `R${profile.hourly_rate}/hr` : profile.daily_rate ? `R${profile.daily_rate}/day` : "")

          return {
          id: profileId,
          user_profile_id: profileId,
          business_name: profile.display_name || profile.full_name || profile.username || "Unnamed Studio",
          type: studioType,
          location,
          city: profile.city || location?.split(",")[0]?.trim() || "",
          province: profile.province || location?.split(",")[1]?.trim() || "",
          bio: profile.bio || "",
          services: profile.skills || [],
          equipment: [],
          profile_picture: profile.profile_image_url || profile.profile_picture || profile.avatar_url || "",
          gallery_images: profile.portfolio_images || [],
          rating: 4.7,
          total_reviews: 18,
          price_range: priceRange,
          availability_status: profile.availability_status || profile.availability || "Available",
          is_verified: true,
          featured: false,
          phone: "",
          email: profile.email || "",
          website: (profile.social_links as any)?.website || "",
          instagram: (profile.social_links as any)?.instagram || "",
          operating_hours: {
            monday: "09:00 - 17:00",
            tuesday: "09:00 - 17:00",
            wednesday: "09:00 - 17:00",
            thursday: "09:00 - 17:00",
            friday: "09:00 - 17:00",
            saturday: "Closed",
            sunday: "Closed",
          },
        }
        })

        setStudios(transformed)
        setUseMockData(false)
      } catch (error: any) {
        console.error("[studios] fetch error:", error?.message || error)
        setStudios(mockStudios)
        setUseMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchStudios()
  }, [supabase])

  const filteredStudios = studios.filter((studio) => {
    const matchesSearch =
      studio.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studio.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studio.services?.some((service) => service.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesLocation = locationFilter === "all" || studio.province === locationFilter
    const matchesType = typeFilter === "all" || studio.type === typeFilter
    return matchesSearch && matchesLocation && matchesType
  })

  const provinces = Array.from(new Set(studios.map((s) => s.province).filter(Boolean)))

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
          title="Studios & Stores"
          rightAction={
            <Button
              variant="outline"
              className="w-full border-[#e8e0d5] bg-white text-[#111318]"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Open Filters
            </Button>
          }
        >
          <MotionRevealGroup className="rounded-[28px] border border-[#ece4da] bg-white p-4 shadow-[0_14px_34px_rgba(0,0,0,0.05)]">
            <MotionRevealItem className="flex items-center gap-2 rounded-2xl border border-[#e7e0d6] bg-white px-3 py-3">
              <Search className="h-4 w-4 text-[#73757d]" />
              <Input
                placeholder="Search studios, stores, services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 border-0 bg-transparent p-0 text-[14px] shadow-none focus-visible:ring-0"
              />
              <motion.button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                whileTap={{ scale: 0.92 }}
                className="grid h-9 w-9 place-items-center rounded-full border border-[#e7e0d6] bg-white"
                aria-label="Open filters"
              >
                <SlidersHorizontal className="h-4 w-4 text-[#111318]" />
              </motion.button>
            </MotionRevealItem>

            <MotionRevealItem className="mt-3 flex gap-2">
              {[
                { label: "All", value: "all" },
                { label: "Studios", value: "studio" },
                { label: "Stores", value: "equipment_store" },
              ].map((chip) => (
                <motion.button
                  key={chip.value}
                  type="button"
                  onClick={() => setTypeFilter(chip.value)}
                  whileTap={{ scale: 0.96 }}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                    typeFilter === chip.value
                      ? "border-[#0d0f13] bg-[#0d0f13] text-white"
                      : "border-[#e7e0d6] bg-white text-[#20232b]"
                  }`}
                >
                  {chip.label}
                </motion.button>
              ))}
            </MotionRevealItem>

            <MotionRevealGroup className="mt-4 space-y-3">
              {filteredStudios.map((studio, index) => (
                <StickyScrollCard key={studio.id} top="88px" delay={0.1 + index * 0.08}>
                  <MotionRevealItem>
                    <DemoCardWrap isDemo={useMockData} borderRadius={22}>
                    <Card className="overflow-hidden rounded-[22px] border-[#eee6db] bg-white">
                      <CardContent className="p-0">
                        <motion.div className="relative h-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.38, ease: "easeOut" }}>
                          <Image
                            src={studio.profile_picture || "/placeholder.svg?height=160&width=320"}
                            alt={studio.business_name}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#111318]">
                            {studio.type === "studio" ? "Studio" : "Equipment Store"}
                          </span>
                          {useMockData && <DemoProfileBadge className="absolute right-3 top-3 bg-white/95 shadow-md" />}
                        </motion.div>
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[16px] font-semibold text-[#0d0f13]">{studio.business_name}</p>
                              <div className="mt-1 flex items-center gap-1 text-[12px] text-[#666b75]">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>
                                  {studio.city}, {studio.province}
                                </span>
                              </div>
                              <div className="mt-2">
                                <AvailabilityStatusBadge ownerId={studio.user_profile_id || studio.id} ownerType={studio.type === "studio" ? "studio" : "store"} />
                              </div>
                            </div>
                            <SaveProfileButton
                              profileId={studio.user_profile_id || studio.id}
                              profileName={studio.business_name}
                              profileRole={studio.type === "studio" ? "Studio" : "Store"}
                              profileLocation={[studio.city, studio.province].filter(Boolean).join(", ")}
                              profileImage={studio.profile_picture || studio.gallery_images?.[0]}
                              profileHref={`/studios-stores/${studio.id}`}
                              category={studio.type === "studio" ? "studio" : "store"}
                              size="sm"
                            />
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[12px]">
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-current text-[#0d0f13]" />
                              <span className="font-semibold">{studio.rating}</span>
                              <span className="text-[#666b75]">(<AnimatedCount value={studio.total_reviews || 0} />)</span>
                            </div>
                            <span className="font-semibold text-[#0d0f13]">{studio.price_range || "Rate on request"}</span>
                          </div>
                          <p className="mt-2 line-clamp-2 text-[12px] text-[#666b75]">{studio.bio}</p>

                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {studio.services.slice(0, 3).map((service, idx) => (
                              <Badge key={`${studio.id}-service-${idx}`} variant="secondary" className="text-[10px]">
                                {service}
                              </Badge>
                            ))}
                          </div>

                          <div className="mt-3 flex gap-2">
                            <motion.div className="flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
                            <Button
                              variant="outline"
                              className="h-9 w-full rounded-full border-[#e7e0d6] bg-white text-[12px]"
                              onClick={() => setExpandedId((prev) => (prev === studio.id ? null : studio.id))}
                            >
                              {expandedId === studio.id ? "Hide Details" : "View Details"}
                            </Button>
                            </motion.div>
                            <MessageButton
                              recipientId={studio.user_profile_id}
                              recipientName={studio.business_name}
                              className="h-9 rounded-full bg-[#f20d14] px-4 text-[12px] text-white hover:bg-[#d80a10]"
                            >
                              Contact
                            </MessageButton>
                          </div>

                          {expandedId === studio.id && (
                            <div className="mt-3 rounded-2xl border border-[#ece4da] bg-white p-3 text-[12px] text-[#666b75]">
                              <p>{studio.email || "No email listed"}</p>
                              <p>{studio.phone || "No phone listed"}</p>
                              {studio.website ? (
                                <Link href={`https://${studio.website}`} className="text-[#f20d14]">
                                  {studio.website}
                                </Link>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    </DemoCardWrap>
                  </MotionRevealItem>
                </StickyScrollCard>
              ))}
            </MotionRevealGroup>

            {filteredStudios.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-[14px] font-medium text-[#1a1d22]">No studios match this search yet.</p>
                <Button
                  variant="outline"
                  className="mt-3 rounded-full border-[#e7e0d6] bg-white"
                  onClick={() => {
                    setSearchTerm("")
                    setLocationFilter("all")
                    setTypeFilter("all")
                  }}
                >
                  Reset
                </Button>
              </div>
            )}
          </MotionRevealGroup>

          {mobileFiltersOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed inset-0 z-50 bg-black/35"
            >
              <motion.div
                initial={{ y: 40, opacity: 0.9 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                className="absolute bottom-0 left-0 right-0 rounded-t-[28px] border-t border-[#e8dfd3] bg-white p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[16px] font-semibold">Filters</p>
                  <motion.button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#e7e0d6] bg-white"
                    aria-label="Close filters"
                    whileTap={{ scale: 0.9, rotate: -8 }}
                  >
                    <X className="h-4.5 w-4.5" />
                  </motion.button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#f20d14]">Type</p>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full border-[#e7e0d6] bg-white">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="studio">Studios</SelectItem>
                        <SelectItem value="equipment_store">Equipment Stores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#f20d14]">Location</p>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="w-full border-[#e7e0d6] bg-white">
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-[#f20d14] text-white hover:bg-[#d80a10]" onClick={() => setMobileFiltersOpen(false)}>
                    Apply
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </MobileShell>
      </div>

      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold">Studios & Stores</h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Find professional studios and equipment rental stores for your next project
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search studios, stores, or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="studio">Studios</SelectItem>
                <SelectItem value="equipment_store">Equipment Stores</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6 flex items-center gap-2">
            <p className="text-muted-foreground">Showing {filteredStudios.length} results</p>
          </div>

          <div className="space-y-5">
            {filteredStudios.map((studio, index) => (
              <StickyScrollCard key={studio.id} top="116px" delay={0.08 + index * 0.06}>
                <DemoCardWrap isDemo={useMockData} borderRadius={12}>
                <Card className="relative overflow-hidden">
                  {useMockData && <DemoProfileBadge className="absolute right-3 top-3 z-10 bg-white/95 shadow-md" />}
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative h-52 w-full shrink-0 md:w-80">
                        <Image
                          src={studio.profile_picture || "/placeholder.svg?height=200&width=320"}
                          alt={studio.business_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold">{studio.business_name}</h3>
                            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {studio.city}, {studio.province}
                              </span>
                            </div>
                          </div>
                          <SaveProfileButton
                            profileId={studio.user_profile_id || studio.id}
                            profileName={studio.business_name}
                            profileRole={studio.type === "studio" ? "Studio" : "Store"}
                            profileLocation={[studio.city, studio.province].filter(Boolean).join(", ")}
                            profileImage={studio.profile_picture || studio.gallery_images?.[0]}
                            profileHref={`/studios-stores/${studio.id}`}
                            category={studio.type === "studio" ? "studio" : "store"}
                            size="sm"
                          />
                        </div>

                        <div className="mb-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-current text-yellow-500" />
                          <span className="font-semibold">{studio.rating}</span>
                          <span className="text-muted-foreground">({studio.total_reviews} reviews)</span>
                        </div>
                        <AvailabilityStatusBadge ownerId={studio.user_profile_id || studio.id} ownerType={studio.type === "studio" ? "studio" : "store"} />
                        <span className="font-semibold">{studio.price_range || "Rate on request"}</span>
                      </div>

                        <p className="mb-3 text-sm text-muted-foreground">{studio.bio}</p>

                        <div className="mb-4 flex flex-wrap gap-2">
                          {studio.services.slice(0, 5).map((service, idx) => (
                            <Badge key={`${studio.id}-desktop-service-${idx}`} variant="secondary">
                              {service}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          {studio.phone && (
                            <a href={`tel:${studio.phone}`} className="flex items-center gap-1 hover:text-foreground">
                              <Phone className="h-4 w-4" />
                              {studio.phone}
                            </a>
                          )}
                          {studio.email && (
                            <a href={`mailto:${studio.email}`} className="flex items-center gap-1 hover:text-foreground">
                              <Mail className="h-4 w-4" />
                              {studio.email}
                            </a>
                          )}
                          {studio.website && (
                            <a
                              href={`https://${studio.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-foreground"
                            >
                              <Globe className="h-4 w-4" />
                              {studio.website}
                            </a>
                          )}
                        </div>

                        <div className="mt-4">
                          <MessageButton
                            recipientId={studio.user_profile_id}
                            recipientName={studio.business_name}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            Contact Now
                          </MessageButton>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </DemoCardWrap>
              </StickyScrollCard>
            ))}
          </div>

          {filteredStudios.length === 0 && (
            <div className="py-12 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No studios or stores found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
