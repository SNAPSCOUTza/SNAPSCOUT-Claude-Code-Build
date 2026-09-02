"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bookmark, Heart, MapPin, Star } from "lucide-react"
import { LoadingDot } from "@/components/ui/loading-dot"
import MobileShell from "@/components/mobile/mobile-shell"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SnapScoutStateArt } from "@/components/mobile/snapscout-state-art"
import { MotionRevealGroup, MotionRevealItem } from "@/components/ui/motion-reveal"
import { createBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import type { ShootLocation } from "@/lib/locations/types"

export default function SavedLocationsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [locations, setLocations] = useState<ShootLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/auth/login")
      return
    }

    let cancelled = false
    const supabase = createBrowserClient()

    supabase
      .from("shoot_location_saves")
      .select("created_at, shoot_locations(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }: { data: { created_at: string; shoot_locations: ShootLocation | null }[] | null }) => {
        if (cancelled) return
        setLocations((data || []).map((row) => row.shoot_locations).filter((row): row is ShootLocation => Boolean(row)))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user, authLoading, router])

  const removeSave = async (locationId: string) => {
    setRemovingId(locationId)
    try {
      const response = await fetch(`/api/locations/${locationId}/save`, { method: "DELETE" })
      if (!response.ok) throw new Error("Could not remove this location")
      setLocations((current) => current.filter((location) => location.id !== locationId))
    } catch {
      window.alert("Could not remove this location. Please try again.")
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <MobileShell title="Saved Locations">
      <div className="px-4 pb-10 pt-6 md:mx-auto md:max-w-6xl md:px-8">
        <MotionRevealGroup className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[#fff0f0] text-[#f20d14]">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[13px] font-black uppercase tracking-[0.24em] text-[#f20d14]">Your Shortlist</p>
              <h1 className="text-[28px] font-black leading-[0.98] tracking-[-0.03em] text-[#111318] md:text-[38px]">
                Saved Locations
              </h1>
            </div>
          </div>
          <p className="max-w-xl text-[15px] leading-relaxed text-[#666b75]">
            Locations you've saved for future shoots, kept here so you can come back when you're ready to book a
            project.
          </p>
        </MotionRevealGroup>

        {loading || authLoading ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/5] rounded-[28px]" />
            ))}
          </div>
        ) : locations.length > 0 ? (
          <MotionRevealGroup className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => (
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
                          removeSave(location.id)
                        }}
                        disabled={removingId === location.id}
                        aria-label={`Remove ${location.name} from saved locations`}
                        className="grid h-10 w-10 place-items-center rounded-full border border-[#f20d14] bg-white/95 text-[#f20d14] shadow-sm"
                      >
                        {removingId === location.id ? (
                          <LoadingDot />
                        ) : (
                          <Heart className="h-4 w-4 fill-current" />
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

                    <Badge variant="outline" className="rounded-full border-[#e4e0d9] px-3 py-1 text-[12px] font-semibold text-[#111318]">
                      <Star className="mr-1.5 h-3.5 w-3.5 fill-current text-[#111318]" />
                      {location.rating > 0 ? location.rating.toFixed(1) : "New"}
                    </Badge>

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
              You haven't saved any locations yet.{" "}
              <Link href="/locations" className="font-semibold text-[#f20d14]">
                Browse Locations
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </MobileShell>
  )
}
