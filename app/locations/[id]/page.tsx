"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Camera,
  Car,
  Clock3,
  Flag,
  Loader2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Share2,
  Sparkles,
  Star,
  Sun,
  Users,
} from "lucide-react"
import MobileShell from "@/components/mobile/mobile-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SaveProfileButton } from "@/components/messaging/save-profile-button"
import { createBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import type { ShootLocation, ShootLocationPhoto, ShootLocationReview } from "@/lib/locations/types"
import { LocationPhotoUploadSheet } from "@/components/locations/location-photo-upload-sheet"

function formatRelativeDate(value: string) {
  const diffMs = Date.now() - new Date(value).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function LocationDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = useMemo(() => createBrowserClient(), [])

  const [location, setLocation] = useState<ShootLocation | null>(null)
  const [photos, setPhotos] = useState<ShootLocationPhoto[]>([])
  const [reviews, setReviews] = useState<ShootLocationReview[]>([])
  const [names, setNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [activeHero, setActiveHero] = useState(0)
  const heroScrollerRef = useRef<HTMLDivElement>(null)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewBody, setReviewBody] = useState("")
  const [savingReview, setSavingReview] = useState(false)

  const loadLocation = useCallback(async () => {
    const { data } = await supabase.from("shoot_locations").select("*").eq("id", params.id).maybeSingle()
    setLocation(data)
  }, [supabase, params.id])

  const loadPhotos = useCallback(async () => {
    const { data } = await supabase
      .from("shoot_location_photos")
      .select("*")
      .eq("location_id", params.id)
      .order("created_at", { ascending: false })
    setPhotos(data || [])
  }, [supabase, params.id])

  const loadReviews = useCallback(async () => {
    const { data } = await supabase
      .from("shoot_location_reviews")
      .select("*")
      .eq("location_id", params.id)
      .order("created_at", { ascending: false })
    setReviews(data || [])
  }, [supabase, params.id])

  useEffect(() => {
    let cancelled = false

    Promise.all([loadLocation(), loadPhotos(), loadReviews()]).then(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [loadLocation, loadPhotos, loadReviews])

  useEffect(() => {
    const userIds = Array.from(
      new Set([...photos.map((p) => p.uploaded_by), ...reviews.map((r) => r.user_id)].filter(Boolean)),
    )
    if (!userIds.length) return

    let cancelled = false
    supabase
      .from("user_profiles")
      .select("user_id, display_name, full_name")
      .in("user_id", userIds)
      .then(({ data }: { data: { user_id: string; display_name: string | null; full_name: string | null }[] | null }) => {
        if (cancelled || !data) return
        const next: Record<string, string> = {}
        data.forEach((row) => {
          next[row.user_id] = row.display_name || row.full_name || "SnapScout Creative"
        })
        setNames((current) => ({ ...current, ...next }))
      })

    return () => {
      cancelled = true
    }
  }, [photos, reviews, supabase])

  const heroImages = location?.gallery_image_urls?.length
    ? location.gallery_image_urls
    : location?.cover_image_url
      ? [location.cover_image_url]
      : []

  const openHeroAt = (index: number) => {
    setActiveHero(index)
    const scroller = heroScrollerRef.current
    if (!scroller) return
    const child = scroller.children[index] as HTMLElement | undefined
    child?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" })
  }

  const handleBookLocation = () => {
    if (!location) return
    if (!user) {
      router.push("/auth/login")
      return
    }
    router.push(`/messages?recipient=${location.created_by}`)
  }

  const handleReport = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    const notes = window.prompt("What's incorrect about this location listing?")
    if (!notes) return

    await supabase.from("reports").insert({
      entity_type: "listing",
      entity_id: params.id,
      reason: "other",
      notes: `Location report: ${notes}`,
    })
    window.alert("Thanks - our team will take a look.")
  }

  const submitReview = async () => {
    if (!reviewBody.trim()) return
    setSavingReview(true)
    try {
      const response = await fetch(`/api/locations/${params.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, body: reviewBody.trim() }),
      })
      if (!response.ok) throw new Error("Could not save your review")
      setReviewBody("")
      setReviewOpen(false)
      await Promise.all([loadLocation(), loadReviews()])
    } catch {
      window.alert("Could not save your review. Please try again.")
    } finally {
      setSavingReview(false)
    }
  }

  if (loading) {
    return (
      <MobileShell title="Locations">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#f20d14]" />
        </div>
      </MobileShell>
    )
  }

  if (!location) {
    return (
      <MobileShell title="Locations">
        <div className="px-4 py-10">
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-semibold text-slate-900">Location not found</p>
            <p className="mt-2 text-sm text-slate-500">This listing may have been removed.</p>
            <Button
              className="mt-5 h-12 rounded-full bg-[#f20d14] px-6 text-sm font-semibold text-white hover:bg-[#d80a10]"
              onClick={() => router.push("/locations")}
            >
              Back to Locations
            </Button>
          </div>
        </div>
      </MobileShell>
    )
  }

  const firstName = names[location.created_by]?.split(" ")[0] || "the host"

  return (
    <MobileShell title="Locations">
      <div className="px-4 pb-10 pt-4 md:mx-auto md:max-w-3xl md:px-8">
        <section className="rounded-[32px] border border-[#eee6db] bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
          <div className="relative overflow-hidden rounded-[28px]">
            {heroImages.length > 0 ? (
              <div
                ref={heroScrollerRef}
                className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
                onScroll={(event) => {
                  const target = event.currentTarget
                  if (!target.clientWidth) return
                  setActiveHero(Math.round(target.scrollLeft / target.clientWidth))
                }}
              >
                {heroImages.map((image, index) => (
                  <div key={`${image}-${index}`} className="relative aspect-[4/3] min-w-full snap-start bg-[#f4f6f8]">
                    <Image src={image} alt={`${location.name} photo ${index + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-[#f4f6f8] text-[#9aa0ab]">
                <Camera className="h-10 w-10" />
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-white/95 text-[#111318]"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-[#111318]"
                  aria-label="Share location"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <SaveProfileButton
                  profileId={location.id}
                  profileName={location.name}
                  profileLocation={[location.city, location.province].filter(Boolean).join(", ")}
                  profileImage={location.cover_image_url || undefined}
                  profileHref={`/locations/${location.id}`}
                  category="location"
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full bg-white/95 text-[#f20d14]"
                />
              </div>
            </div>

            {heroImages.length > 1 && (
              <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => openHeroAt(index)}
                    aria-label={`Go to photo ${index + 1}`}
                    className={`pointer-events-auto h-1.5 rounded-full transition-all ${
                      activeHero === index ? "w-4 bg-white" : "w-1.5 bg-white/55"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="px-3 pb-2 pt-5">
            <p className="text-[12px] font-bold tracking-[0.14em] text-[#f20d14]">{location.city.toUpperCase()}</p>
            <h1 className="mt-2 text-[36px] font-black leading-[0.98] tracking-[-0.03em] text-[#111318]">
              {location.name}
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="h-10 rounded-full border-[#e6ebf3] bg-white px-4 text-[13px] text-[#111318]">
                <Star className="mr-1.5 h-4 w-4 fill-[#111318] text-[#111318]" />
                {location.rating > 0 ? location.rating.toFixed(1) : "New"} ({location.review_count})
              </Badge>
              <Badge variant="outline" className="h-10 rounded-full border-[#e6ebf3] bg-white px-4 text-[13px] text-[#111318]">
                {location.location_type}
              </Badge>
              {location.safety_rating === "High" && (
                <Badge className="h-10 rounded-full border border-[#d8efe3] bg-[#effaf4] px-4 text-[13px] text-[#16794c] hover:bg-[#effaf4]">
                  <ShieldCheck className="mr-1.5 h-4 w-4" />
                  Safe during daylight
                </Badge>
              )}
              <Badge variant="outline" className="h-10 rounded-full border-[#e6ebf3] bg-white px-4 text-[13px] text-[#111318]">
                <Clock3 className="mr-1.5 h-4 w-4" />
                Best: {location.best_shooting_times}
              </Badge>
            </div>

            {location.description && (
              <p className="mt-5 text-[15px] italic leading-relaxed text-[#2b3340]">"{location.description}"</p>
            )}

            <button
              type="button"
              onClick={() => (user ? setUploadOpen(true) : router.push("/auth/login"))}
              className="mt-5 h-12 w-full rounded-full border border-[#e6ebf3] text-[14px] font-semibold text-[#111318] transition-colors hover:border-[#f20d14] hover:text-[#f20d14]"
            >
              Upload Photos Taken Here
            </button>

            {photos.length > 0 && (
              <div className="mt-6">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6d7480]">
                  Community Photos
                </p>
                <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
                  {photos.slice(0, 8).map((photo) => (
                    <div key={photo.id} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f3f5f8]">
                      <Image src={photo.image_url} alt={photo.caption || location.name} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <Button
                type="button"
                onClick={handleBookLocation}
                className="h-14 w-full rounded-full bg-[#f20d14] text-[17px] font-semibold text-white hover:bg-[#d80a10]"
              >
                Book Location
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => (user ? setUploadOpen(true) : router.push("/auth/login"))}
                className="h-12 w-full rounded-full border-[#e6ebf3] text-[14px] font-semibold text-[#111318] hover:bg-[#fff7f7] hover:text-[#f20d14]"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Share Photos
              </Button>
            </div>
          </div>
        </section>

        {photos.length > 0 && (
          <section className="mt-6 rounded-[28px] border border-[#eee6db] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6d7480]">
                Community Photos ({photos.length})
              </p>
              <button
                type="button"
                onClick={() => (user ? setUploadOpen(true) : router.push("/auth/login"))}
                className="text-[13px] font-semibold text-[#f20d14]"
              >
                + Share Photos
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-1.5">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square overflow-hidden rounded-xl bg-[#f3f5f8]">
                  <Image src={photo.image_url} alt={photo.caption || location.name} fill className="object-cover" />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4">
                      <p className="line-clamp-1 text-[10px] font-medium text-white">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6 rounded-[28px] border border-[#eee6db] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6d7480]">Community Notes</p>
          </div>

          {reviews.length > 0 ? (
            <div className="mt-4 space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl bg-[#f7f9fc] p-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-3.5 w-3.5 ${index < review.rating ? "fill-[#111318] text-[#111318]" : "text-[#d7dce6]"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#2b3340]">"{review.body}"</p>
                  <p className="mt-2 text-[12px] font-semibold text-[#6d7480]">
                    — {names[review.user_id] || "SnapScout Creative"} · {formatRelativeDate(review.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[14px] text-[#6d7480]">No notes yet - be the first to share your experience.</p>
          )}

          {reviewOpen ? (
            <div className="mt-4 rounded-2xl border border-[#e6ebf3] p-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button key={index} type="button" onClick={() => setReviewRating(index + 1)} aria-label={`Rate ${index + 1} stars`}>
                    <Star className={`h-6 w-6 ${index < reviewRating ? "fill-[#f20d14] text-[#f20d14]" : "text-[#d7dce6]"}`} />
                  </button>
                ))}
              </div>
              <Textarea
                value={reviewBody}
                onChange={(event) => setReviewBody(event.target.value)}
                placeholder="Security was good. Shot here until sunset."
                className="mt-3 min-h-24"
              />
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  onClick={submitReview}
                  disabled={savingReview || !reviewBody.trim()}
                  className="h-11 flex-1 rounded-full bg-[#f20d14] text-white hover:bg-[#d80a10]"
                >
                  {savingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Post
                </Button>
                <Button type="button" variant="outline" onClick={() => setReviewOpen(false)} className="h-11 rounded-full">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              onClick={() => (user ? setReviewOpen(true) : router.push("/auth/login"))}
              className="mt-4 h-12 w-full rounded-full bg-[#111318] text-[14px] font-semibold text-white hover:bg-[#20232b]"
            >
              Write Your Experience
            </Button>
          )}
        </section>

        <section className="mt-6 rounded-[28px] border border-[#eee6db] bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6d7480]">Location Information</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoChip icon={ShieldCheck} label="Safety" value={`${location.safety_rating} rated`} />
            <InfoChip
              icon={Flag}
              label="Permit"
              value={location.permit_required ? "Required" : "Not required"}
            />
            <InfoChip icon={Car} label="Parking" value={location.parking_availability} />
            <InfoChip icon={Users} label="Crowd Levels" value={location.crowd_levels} />
            <InfoChip icon={Sun} label="Indoor / Outdoor" value={location.indoor_outdoor} />
            <InfoChip icon={Sparkles} label="Security" value={location.security_level} />
          </div>
          {location.access_rules && (
            <p className="mt-4 text-[13px] leading-relaxed text-[#6d7480]">{location.access_rules}</p>
          )}
        </section>

        <button
          type="button"
          onClick={handleReport}
          className="mt-6 w-full text-center text-[13px] font-medium text-[#9aa0ab] underline-offset-2 hover:text-[#f20d14] hover:underline"
        >
          Report incorrect information
        </button>
      </div>

      <LocationPhotoUploadSheet
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        locationId={location.id}
        onUploaded={loadPhotos}
      />
    </MobileShell>
  )
}

function InfoChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-[#f7f9fc] p-4">
      <Icon className="h-4.5 w-4.5 text-[#4f5867]" />
      <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">{label}</p>
      <p className="mt-1 text-[14px] font-medium text-[#111318]">{value}</p>
    </div>
  )
}
