"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Search, MapPin, Star, Phone, Mail, Globe, SlidersHorizontal, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import MobileShell from "@/components/mobile/mobile-shell"
import { motion } from "framer-motion"
import { AvailabilityStatusBadge } from "@/components/availability/availability-status-badge"
import { HireRequestSheet } from "@/components/booking/hire-request-sheet"
import { studiosStoresData, type StudioStoreItem } from "@/lib/mock-data/studios-stores-data"
import { DemoCardWrap } from "@/components/ui/demo-card-wrap"
import { DemoProfileBadge } from "@/components/ui/demo-profile-badge"
import { AnimatedCount } from "@/components/ui/animated-count"
import { MotionRevealGroup, MotionRevealItem } from "@/components/ui/motion-reveal"
import { StickyScrollCard } from "@/components/ui/sticky-scroll-card"
import { useAuth } from "@/contexts/auth-context"
import { SnapScoutStateArt } from "@/components/mobile/snapscout-state-art"
import { createBrowserClient } from "@/lib/supabase/client"
import { STUDIO_STORE_PROFILE_COLUMNS, mapLiveProfileToStudioStoreItem } from "@/lib/studios-stores/live-data"
import {
  hasMockPaidSubscription,
  loadUploadedShootLocations,
  uploadedLocationToStudioStoreItem,
} from "@/lib/mock-data/uploaded-shoot-locations"

type DiscoverableStudioStore = Omit<StudioStoreItem, "id"> & {
  id: string | number
  isUploadedLocation?: boolean
  isLiveProfile?: boolean
}

function studioStoreTypeLabel(type: StudioStoreItem["type"]) {
  if (type === "both") return "Studio & Store"
  return type === "studio" ? "Studio" : "Equipment Store"
}

export default function StudiosStoresPage() {
  const { profile } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [bookingItem, setBookingItem] = useState<DiscoverableStudioStore | null>(null)
  const [uploadedLocations, setUploadedLocations] = useState<DiscoverableStudioStore[]>([])
  const [liveListings, setLiveListings] = useState<DiscoverableStudioStore[]>([])

  const canViewUploadedLocations = hasMockPaidSubscription(profile)

  useEffect(() => {
    if (!canViewUploadedLocations) {
      setUploadedLocations([])
      return
    }

    const uploaded = loadUploadedShootLocations().map((location) => ({
      ...uploadedLocationToStudioStoreItem(location),
      id: location.id,
      isUploadedLocation: true,
    }))

    setUploadedLocations(uploaded)
  }, [canViewUploadedLocations])

  useEffect(() => {
    let cancelled = false
    const supabase = createBrowserClient()

    supabase
      .from("user_profiles")
      .select(STUDIO_STORE_PROFILE_COLUMNS)
      .in("account_type", ["studio", "store"])
      .eq("is_profile_visible", true)
      .eq("subscription_status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }: { data: any[] | null }) => {
        if (cancelled) return
        setLiveListings((data || []).map(mapLiveProfileToStudioStoreItem))
      })

    return () => {
      cancelled = true
    }
  }, [])

  const studiosStores = useMemo(() => {
    const base = studiosStoresData as DiscoverableStudioStore[]
    return [...(canViewUploadedLocations ? uploadedLocations : []), ...liveListings, ...base]
  }, [canViewUploadedLocations, uploadedLocations, liveListings])

  const filteredStudiosStores = studiosStores.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.services.some((service) => service.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesLocation = selectedLocation === "all" || item.location.includes(selectedLocation)
    const matchesType = selectedType === "all" || item.type === selectedType || item.type === "both"

    return matchesSearch && matchesLocation && matchesType
  })

  const getBookingOptions = (item: DiscoverableStudioStore) =>
    Array.from(
      new Set([
        ...item.services,
        ...(item.type === "store"
          ? ["Camera rental", "Lens rental", "Full kit rental", "Multiple-day rental"]
          : ["Studio booking", "Photo shoot", "Video shoot", "Full-day studio hire"]),
        "Other",
      ]),
    )

  const bookingStartingRate = bookingItem?.hourlyRate.split(" - ")[0] || bookingItem?.hourlyRate || "Rate on request"

  return (
    <div className="min-h-screen bg-gray-50">
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
                { label: "Stores", value: "store" },
              ].map((chip) => (
                <motion.button
                  key={chip.value}
                  type="button"
                  onClick={() => setSelectedType(chip.value)}
                  whileTap={{ scale: 0.96 }}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                    selectedType === chip.value
                      ? "border-[#0d0f13] bg-[#0d0f13] text-white"
                      : "border-[#e7e0d6] bg-white text-[#20232b]"
                  }`}
                >
                  {chip.label}
                </motion.button>
              ))}
            </MotionRevealItem>

            <MotionRevealGroup className="mt-4 space-y-3">
              {filteredStudiosStores.map((item, index) => {
                const isDemo = !item.isLiveProfile && !item.isUploadedLocation
                return (
                <StickyScrollCard key={item.id} top="88px" delay={0.1 + index * 0.08}>
                  <DemoCardWrap isDemo={isDemo} borderRadius={22}>
                  <Card className="overflow-hidden rounded-[22px] border-[#eee6db] bg-white">
                    <CardContent className="p-0">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.38, ease: "easeOut" }}>
                        <Link href={`/studios-stores/${item.id}`} className="relative block h-40">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#111318]">
                            {item.isUploadedLocation ? "Shoot Location" : studioStoreTypeLabel(item.type)}
                          </span>
                          {isDemo && <DemoProfileBadge variant="white" className="absolute right-3 top-3" />}
                        </Link>
                      </motion.div>
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[16px] font-semibold text-[#0d0f13]">{item.name}</p>
                            <div className="mt-1 flex items-center gap-1 text-[12px] text-[#666b75]">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{item.location}</span>
                            </div>
                            <div className="mt-2">
                              <AvailabilityStatusBadge ownerId={String(item.id)} ownerType={item.type === "studio" ? "studio" : "store"} />
                            </div>
                          </div>
                          {item.isUploadedLocation ? (
                            <Badge className="bg-[#fff1f1] text-[#c10d12] hover:bg-[#fff1f1]">Premium listing</Badge>
                          ) : item.verified ? (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          ) : null}
                        </div>
                          <div className="mt-2 flex items-center justify-between text-[12px]">
                            <div className="flex items-center gap-1">
                              {!isDemo && (
                                <>
                                  <Star className="h-3.5 w-3.5 fill-current text-[#0d0f13]" />
                                  {item.rating > 0 ? (
                                    <>
                                      <span className="font-semibold">{item.rating}</span>
                                      <span className="text-[#666b75]">(<AnimatedCount value={item.reviews} />)</span>
                                    </>
                                  ) : (
                                    <span className="font-semibold">New</span>
                                  )}
                                </>
                              )}
                            </div>
                            <span className="font-semibold text-[#0d0f13]">{item.hourlyRate}</span>
                          </div>
                        <p className="mt-2 line-clamp-2 text-[12px] text-[#666b75]">{item.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.services.slice(0, 2).map((service, idx) => (
                            <Badge key={`${item.id}-service-${idx}`} variant="secondary" className="text-[10px]">
                              {service}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <motion.a
                            href={`tel:${item.contact.phone}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.45, delay: 0.22 + index * 0.1 }}
                          >
                            <Button variant="outline" className="h-9 w-full rounded-full border-[#e7e0d6] bg-white text-[12px]">
                              <Phone className="mr-1 h-3.5 w-3.5" />
                              Call
                            </Button>
                          </motion.a>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.45, delay: 0.26 + index * 0.1 }}
                          >
                            <Button
                              type="button"
                              disabled={isDemo}
                              onClick={() => setBookingItem(item)}
                              className="h-9 w-full rounded-full bg-[#f20d14] text-[12px] text-white hover:bg-[#d80a10] disabled:bg-[#f20d14]/40"
                            >
                              {isDemo ? "Not bookable" : "Book"}
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </DemoCardWrap>
                </StickyScrollCard>
                )
              })}
            </MotionRevealGroup>

            {filteredStudiosStores.length === 0 && (
              <div className="py-8">
                <SnapScoutStateArt variant="empty">
                <Button
                  variant="outline"
                  className="mt-3 rounded-full border-[#e7e0d6] bg-white"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedLocation("all")
                    setSelectedType("all")
                  }}
                >
                  Reset
                </Button>
                </SnapScoutStateArt>
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
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-full border-[#e7e0d6] bg-white">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="studio">Studios</SelectItem>
                        <SelectItem value="store">Equipment Stores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#f20d14]">Location</p>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="w-full border-[#e7e0d6] bg-white">
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="Cape Town">Cape Town</SelectItem>
                        <SelectItem value="Johannesburg">Johannesburg</SelectItem>
                        <SelectItem value="Durban">Durban</SelectItem>
                        <SelectItem value="Pretoria">Pretoria</SelectItem>
                        <SelectItem value="Port Elizabeth">Port Elizabeth</SelectItem>
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Studios & Stores</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find professional studios and equipment rental stores for your next project
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search studios, stores, or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Cape Town">Cape Town</SelectItem>
                  <SelectItem value="Johannesburg">Johannesburg</SelectItem>
                  <SelectItem value="Durban">Durban</SelectItem>
                  <SelectItem value="Pretoria">Pretoria</SelectItem>
                  <SelectItem value="Port Elizabeth">Port Elizabeth</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="studio">Studios</SelectItem>
                  <SelectItem value="store">Equipment Stores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-gray-600">Showing {filteredStudiosStores.length} results</p>
        </div>

        <div className="grid gap-6">
          {filteredStudiosStores.map((item, index) => {
            const isDemo = !item.isLiveProfile && !item.isUploadedLocation
            return (
            <StickyScrollCard key={item.id} top="116px" delay={0.08 + index * 0.06}>
              <DemoCardWrap isDemo={isDemo} borderRadius={12}>
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <div className="relative h-48 md:h-full">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      <div className="absolute top-4 left-4">
                        <Badge className="border-none bg-[#111318] text-white [a&]:hover:bg-[#111318]">
                          {item.isUploadedLocation ? "Shoot Location" : studioStoreTypeLabel(item.type)}
                        </Badge>
                      </div>
                      {isDemo ? (
                        <div className="absolute top-4 right-4">
                          <DemoProfileBadge variant="white" />
                        </div>
                      ) : item.isUploadedLocation ? (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-red-100 text-red-700 border-none">Premium listing</Badge>
                        </div>
                      ) : item.verified ? (
                        <div className="absolute top-4 right-4">
                          <Badge variant="success" className="text-white border-none">
                            Verified
                          </Badge>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <CardContent className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <CardTitle className="text-xl mb-2">{item.name}</CardTitle>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{item.location}</span>
                        </div>
                        <div className="flex items-center mb-3">
                          {!isDemo && (
                            <>
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              {item.rating > 0 ? (
                                <>
                                  <span className="font-medium">{item.rating}</span>
                                  <span className="text-gray-600 ml-1">({item.reviews} reviews)</span>
                                </>
                              ) : (
                                <span className="font-medium">New</span>
                              )}
                            </>
                          )}
                          <Badge
                            className={`${isDemo ? "" : "ml-3"} border-none text-white ${
                              item.availability === "Available" ? "bg-emerald-600 [a&]:hover:bg-emerald-600" : "bg-[#111318] [a&]:hover:bg-[#111318]"
                            }`}
                          >
                            {item.availability}
                          </Badge>
                        </div>
                        <AvailabilityStatusBadge ownerId={String(item.id)} ownerType={item.type === "studio" ? "studio" : "store"} />
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-red-600">{item.hourlyRate}</p>
                        <p className="text-sm text-gray-600">per hour</p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{item.description}</p>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Services:</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.services.map((service, index) => (
                          <Badge key={index} variant="outline">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Equipment:</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.equipment.map((equipment, index) => (
                          <Badge key={index} variant="secondary">
                            {equipment}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          <span>{item.contact.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          <span>{item.contact.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-1" />
                          <span>{item.contact.website}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/studios-stores/${item.id}`}>View Details</Link>
                        </Button>
                        <Button
                          type="button"
                          disabled={isDemo}
                          onClick={() => setBookingItem(item)}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-red-600/40"
                          size="sm"
                        >
                          {isDemo ? "Not bookable" : "Book Now"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
              </DemoCardWrap>
            </StickyScrollCard>
            )
          })}
        </div>

        {filteredStudiosStores.length === 0 && (
          <div className="py-10">
            <SnapScoutStateArt variant="empty" />
          </div>
        )}
      </div>
      </div>
      {bookingItem && (
        <HireRequestSheet
          open={!!bookingItem}
          onOpenChange={(open) => {
            if (!open) setBookingItem(null)
          }}
          talentId={String(bookingItem.id)}
          talentName={bookingItem.name}
          talentType={bookingItem.type}
          priceLabel={`${bookingStartingRate}/hr`}
          bookingTypeOptions={getBookingOptions(bookingItem)}
          bookingTypeLabel={bookingItem.type === "store" ? "What are you renting?" : "What are you booking?"}
          bookingTypePlaceholder={bookingItem.type === "store" ? "Select rental type" : "Select studio booking type"}
          durationLabel={bookingItem.type === "store" ? "How long do you need the rental?" : "How long do you need the space?"}
          briefPlaceholder={
            bookingItem.type === "store"
              ? "Example: camera kit rental, two days, lights, pickup time, Johannesburg..."
              : "Example: studio booking, all day, natural light, parking, changing room, Cape Town..."
          }
        />
      )}
    </div>
  )
}
