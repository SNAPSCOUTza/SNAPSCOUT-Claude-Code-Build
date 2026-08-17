"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, Plus, Search, ShieldCheck, Star } from "lucide-react"
import MobileShell from "@/components/mobile/mobile-shell"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { SaveProfileButton } from "@/components/messaging/save-profile-button"
import { SnapScoutStateArt } from "@/components/mobile/snapscout-state-art"
import { MotionRevealGroup, MotionRevealItem } from "@/components/ui/motion-reveal"
import { createBrowserClient } from "@/lib/supabase/client"
import { LOCATION_TYPE_OPTIONS, type ShootLocation } from "@/lib/locations/types"

export default function LocationsBrowsePage() {
  const [locations, setLocations] = useState<ShootLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState<string>("")

  useEffect(() => {
    let cancelled = false
    const supabase = createBrowserClient()

    supabase
      .from("shoot_locations")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data }: { data: ShootLocation[] | null }) => {
        if (cancelled) return
        setLocations(data || [])
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const matchesCategory = !category || location.location_type === category
      const matchesSearch =
        !searchTerm ||
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.location_type.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [locations, category, searchTerm])

  return (
    <MobileShell
      title="Locations"
      rightAction={
        <Link
          href="/upload-location"
          className="grid h-10 w-10 place-items-center rounded-full bg-[#f20d14] text-white shadow-[0_10px_24px_rgba(242,13,20,0.24)]"
          aria-label="Add a location"
        >
          <Plus className="h-5 w-5" />
        </Link>
      }
    >
      <div className="px-4 pb-10 pt-6 md:mx-auto md:max-w-6xl md:px-8">
        <MotionRevealGroup className="space-y-5">
          <div>
            <p className="text-[13px] font-black uppercase tracking-[0.24em] text-[#f20d14]">Discover</p>
            <h1 className="mt-2 text-[34px] font-black leading-[0.98] tracking-[-0.03em] text-[#111318] md:text-[48px]">
              Discover Locations
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#666b75]">
              Studios, rooftops, warehouses, and hidden gems - scouted and shared by SnapScout's own creative
              community.
            </p>
          </div>

          <MotionRevealItem className="flex items-center gap-3 rounded-[24px] border border-[#eee6db] bg-white px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
            <Search className="h-5 w-5 shrink-0 text-[#9aa0ab]" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Where are you shooting?"
              className="h-9 border-0 bg-transparent p-0 text-[16px] shadow-none focus-visible:ring-0"
            />
          </MotionRevealItem>

          <MotionRevealItem className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setCategory("")}
              className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-[13px] font-semibold transition-colors ${
                category === ""
                  ? "border-[#0d0f13] bg-[#0d0f13] text-white"
                  : "border-[#e7e0d6] bg-white text-[#20232b]"
              }`}
            >
              All
            </button>
            {LOCATION_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategory(option.value)}
                className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-[13px] font-semibold transition-colors ${
                  category === option.value
                    ? "border-[#0d0f13] bg-[#0d0f13] text-white"
                    : "border-[#e7e0d6] bg-white text-[#20232b]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </MotionRevealItem>
        </MotionRevealGroup>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/5] rounded-[28px]" />
            ))}
          </div>
        ) : filteredLocations.length > 0 ? (
          <MotionRevealGroup className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLocations.map((location) => (
              <MotionRevealItem key={location.id}>
                <article className="overflow-hidden rounded-[28px] border border-[#eee6db] bg-white shadow-[0_16px_38px_rgba(15,23,42,0.06)]">
                  <Link href={`/locations/${location.id}`} className="relative block aspect-[4/3] w-full overflow-hidden bg-[#f3f5f8]">
                    <Image
                      src={location.cover_image_url || "/placeholder.svg"}
                      alt={location.name}
                      fill
                      className="object-cover"
                    />
                    <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between">
                      <Badge className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#111318] shadow-sm hover:bg-white/95">
                        {location.location_type}
                      </Badge>
                    </div>
                    <div className="pointer-events-auto absolute right-3 top-3">
                      <SaveProfileButton
                        profileId={location.id}
                        profileName={location.name}
                        profileLocation={[location.city, location.province].filter(Boolean).join(", ")}
                        profileImage={location.cover_image_url || undefined}
                        profileHref={`/locations/${location.id}`}
                        category="location"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full border border-[#e7e0d6] bg-white/95 text-[#111318]"
                      />
                    </div>
                  </Link>

                  <div className="space-y-3 p-4">
                    <div>
                      <p className="truncate text-[17px] font-bold leading-tight text-[#111318]">{location.name}</p>
                      <p className="mt-1 flex items-center gap-1 text-[13px] text-[#666b75]">
                        <MapPin className="h-3.5 w-3.5" />
                        {location.city}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="rounded-full border-[#e4e0d9] px-3 py-1 text-[12px] font-semibold text-[#111318]">
                        <Star className="mr-1.5 h-3.5 w-3.5 fill-current text-[#111318]" />
                        {location.rating > 0 ? location.rating.toFixed(1) : "New"}
                      </Badge>
                      {location.safety_rating === "High" && (
                        <Badge className="rounded-full border border-[#d8efe3] bg-[#effaf4] px-3 py-1 text-[12px] font-semibold text-[#16794c] hover:bg-[#effaf4]">
                          <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                          Safe
                        </Badge>
                      )}
                    </div>

                    <Link
                      href={`/locations/${location.id}`}
                      className="block w-full rounded-full border border-[#e7e0d6] py-3 text-center text-[14px] font-semibold text-[#111318] transition-colors hover:border-[#f20d14] hover:text-[#f20d14]"
                    >
                      View Location
                    </Link>
                  </div>
                </article>
              </MotionRevealItem>
            ))}
          </MotionRevealGroup>
        ) : (
          <div className="py-10">
            <SnapScoutStateArt variant="empty" />
            <p className="mt-4 text-center text-[14px] text-[#666b75]">
              No locations match yet.{" "}
              <Link href="/upload-location" className="font-semibold text-[#f20d14]">
                Be the first to share one
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </MobileShell>
  )
}
