"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Bookmark, Heart, Loader2, MapPin, Plus, Search, ShieldCheck, Star } from "lucide-react"
import MobileShell from "@/components/mobile/mobile-shell"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { SnapScoutStateArt } from "@/components/mobile/snapscout-state-art"
import { MotionRevealGroup, MotionRevealItem } from "@/components/ui/motion-reveal"
import { createBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { LOCATION_TYPE_OPTIONS, type ShootLocation } from "@/lib/locations/types"

export default function LocationsBrowsePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [locations, setLocations] = useState<ShootLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState<string>("")
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)

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

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set())
      return
    }

    let cancelled = false
    const supabase = createBrowserClient()

    supabase
      .from("shoot_location_saves")
      .select("location_id")
      .eq("user_id", user.id)
      .then(({ data }: { data: { location_id: string }[] | null }) => {
        if (cancelled) return
        setSavedIds(new Set((data || []).map((row) => row.location_id)))
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const toggleSave = async (locationId: string) => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const isSaved = savedIds.has(locationId)
    setSavingId(locationId)
    try {
      const response = await fetch(`/api/locations/${locationId}/save`, {
        method: isSaved ? "DELETE" : "POST",
      })
      if (!response.ok) throw new Error("Could not update saved locations")
      setSavedIds((current) => {
        const next = new Set(current)
        if (isSaved) next.delete(locationId)
        else next.add(locationId)
        return next
      })
    } catch {
      window.alert("Could not update saved locations. Please try again.")
    } finally {
      setSavingId(null)
    }
  }

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
    <MobileShell title="Locations">
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

          <MotionRevealItem className="flex flex-wrap gap-2">
            <Link
              href="/upload-location"
              className="inline-flex items-center gap-2 rounded-full bg-[#f20d14] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(242,13,20,0.24)] transition-colors hover:bg-[#d80a10]"
            >
              <Plus className="h-4 w-4" />
              Add Location
            </Link>
            <Link
              href="/locations/saved"
              className="inline-flex items-center gap-2 rounded-full border border-[#e7e0d6] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#111318] transition-colors hover:border-[#f20d14] hover:text-[#f20d14]"
            >
              <Bookmark className="h-4 w-4" />
              My Saved Locations
            </Link>
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
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          toggleSave(location.id)
                        }}
                        disabled={savingId === location.id}
                        aria-label={savedIds.has(location.id) ? `Remove ${location.name} from saved locations` : `Save ${location.name}`}
                        className={`grid h-10 w-10 place-items-center rounded-full border bg-white/95 shadow-sm transition-colors ${
                          savedIds.has(location.id)
                            ? "border-[#f20d14] text-[#f20d14]"
                            : "border-[#e7e0d6] text-[#111318] hover:text-[#f20d14]"
                        }`}
                      >
                        {savingId === location.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Heart className={`h-4 w-4 ${savedIds.has(location.id) ? "fill-current" : ""}`} />
                        )}
                      </button>
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
