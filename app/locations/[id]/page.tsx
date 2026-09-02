"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { LoadingDot } from "@/components/ui/loading-dot"
import dynamic from "next/dynamic"
import {
  ArrowLeft,
  Bath,
  Camera,
  Car,
  Clock3,
  Crown,
  Flag,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Share2,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Users,
  Utensils,
  X,
  Zap,
} from "lucide-react"
import MobileShell from "@/components/mobile/mobile-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { createBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import type { ShootLocation, ShootLocationPhoto, ShootLocationReview } from "@/lib/locations/types"
import { LocationPhotoUploadSheet } from "@/components/locations/location-photo-upload-sheet"
import type { LightboxPortfolioItem } from "@/types/portfolio"

// Client-only overlay with no SSR value - only mounts once a photo is
// clicked, so it shouldn't be in this page's initial bundle.
const PortfolioLightbox = dynamic(
  () => import("@/components/portfolio/portfolio-lightbox").then((mod) => mod.PortfolioLightbox),
  { ssr: false },
)

function formatRelativeDate(value: string) {
  const diffMs = Date.now() - new Date(value).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

type BlockReason = "signed_out" | "no_subscription" | "scout" | null

export default function LocationDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const supabase = useMemo(() => createBrowserClient(), [])

  const [blockReason, setBlockReason] = useState<BlockReason>(null)
  const [checkingAccess, setCheckingAccess] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setBlockReason("signed_out")
      setCheckingAccess(false)
      return
    }

    const accountType = (profile?.account_type || profile?.user_type || "").toLowerCase()
    if (accountType === "scout") {
      setBlockReason("scout")
      setCheckingAccess(false)
      return
    }

    let cancelled = false
    supabase
      .from("user_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle()
      .then(({ data }: { data: { id: string } | null }) => {
        if (cancelled) return
        setBlockReason(data ? null : "no_subscription")
        setCheckingAccess(false)
      })

    return () => {
      cancelled = true
    }
  }, [authLoading, user, profile, supabase])

  const hasAccess = !checkingAccess && !blockReason

  const [location, setLocation] = useState<ShootLocation | null>(null)
  const [photos, setPhotos] = useState<ShootLocationPhoto[]>([])
  const [reviews, setReviews] = useState<ShootLocationReview[]>([])
  const [names, setNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [activeHero, setActiveHero] = useState(0)
  const heroScrollerRef = useRef<HTMLDivElement>(null)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewBody, setReviewBody] = useState("")
  const [savingReview, setSavingReview] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  // True only right after the user's own click saves this location - not on
  // the initial saved-status fetch - so the pop reads as a response to their
  // tap rather than firing whenever an already-saved location loads.
  const [justSaved, setJustSaved] = useState(false)
  const [savingLocation, setSavingLocation] = useState(false)

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

  const photoItems = useMemo<LightboxPortfolioItem[]>(
    () =>
      photos.map((photo) => ({
        id: photo.id,
        type: "image",
        thumbnail: photo.image_url,
        fullUrl: photo.image_url,
        caption: photo.caption || undefined,
        timestamp: photo.shot_at || photo.created_at,
        platform: "local",
        username: photo.uploader_name || names[photo.uploaded_by] || undefined,
      })),
    [photos, names],
  )

  useEffect(() => {
    if (!user) {
      setIsSaved(false)
      return
    }

    let cancelled = false
    supabase
      .from("shoot_location_saves")
      .select("location_id")
      .eq("location_id", params.id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }: { data: { location_id: string } | null }) => {
        if (!cancelled) setIsSaved(Boolean(data))
      })

    return () => {
      cancelled = true
    }
  }, [user, params.id, supabase])

  const toggleSave = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setSavingLocation(true)
    try {
      const response = await fetch(`/api/locations/${params.id}/save`, {
        method: isSaved ? "DELETE" : "POST",
      })
      if (!response.ok) throw new Error("Could not update saved locations")
      setIsSaved(!isSaved)
      setJustSaved(!isSaved)
      await loadLocation()
    } catch {
      window.alert("Could not update saved locations. Please try again.")
    } finally {
      setSavingLocation(false)
    }
  }

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

  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)

  const deleteReview = async (reviewId: string) => {
    setDeletingReviewId(reviewId)
    try {
      const response = await fetch(`/api/locations/${params.id}/reviews/${reviewId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Could not remove your note")
      setReviews((current) => current.filter((r) => r.id !== reviewId))
      await loadLocation()
    } catch {
      window.alert("Could not remove your note. Please try again.")
    } finally {
      setDeletingReviewId(null)
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
      <div
        className={`px-4 pb-10 pt-4 md:mx-auto md:max-w-3xl md:px-8 ${
          !hasAccess ? "pointer-events-none select-none blur-md" : ""
        }`}
      >
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
                <button
                  type="button"
                  onClick={toggleSave}
                  disabled={savingLocation}
                  aria-label={isSaved ? "Remove from saved locations" : "Save this location"}
                  className={`grid h-11 w-11 place-items-center rounded-full bg-white/95 transition-colors ${
                    isSaved ? "text-[#f20d14]" : "text-[#111318]"
                  }`}
                >
                  {savingLocation ? (
                    <LoadingDot size={10} />
                  ) : (
                    <Heart
                      className={`h-5 w-5 ${isSaved ? "fill-current" : ""} ${isSaved && justSaved ? "animate-heart-pop" : ""}`}
                    />
                  )}
                </button>
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
                  {photos.slice(0, 8).map((photo, index) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setLightboxIndex(index)}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f3f5f8]"
                    >
                      <Image src={photo.image_url} alt={photo.caption || location.name} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <Button
                type="button"
                onClick={toggleSave}
                disabled={savingLocation}
                className="h-14 w-full rounded-full bg-[#f20d14] text-[17px] font-semibold text-white hover:bg-[#d80a10]"
              >
                {savingLocation ? (
                  <LoadingDot className="mr-2" />
                ) : (
                  <Heart
                    className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""} ${isSaved && justSaved ? "animate-heart-pop" : ""}`}
                  />
                )}
                {isSaved ? "Saved" : "Save Location"}
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
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="relative aspect-square overflow-hidden rounded-xl bg-[#f3f5f8]"
                >
                  <Image src={photo.image_url} alt={photo.caption || location.name} fill className="object-cover" />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4">
                      <p className="line-clamp-1 text-[10px] font-medium text-white">{photo.caption}</p>
                    </div>
                  )}
                </button>
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-3.5 w-3.5 ${index < review.rating ? "fill-[#111318] text-[#111318]" : "text-[#d7dce6]"}`}
                        />
                      ))}
                    </div>
                    {user?.id === review.user_id && (
                      <button
                        type="button"
                        onClick={() => deleteReview(review.id)}
                        disabled={deletingReviewId === review.id}
                        aria-label="Delete your note"
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#9aa0ab] hover:bg-red-50 hover:text-[#f20d14] disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
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
                  {savingReview ? <LoadingDot className="mr-2" /> : null}
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
              onClick={() => (!user ? router.push("/auth/login") : hasAccess ? setReviewOpen(true) : null)}
              disabled={!hasAccess && Boolean(user)}
              className="mt-4 h-12 w-full rounded-full bg-[#111318] text-[14px] font-semibold text-white hover:bg-[#20232b] disabled:opacity-50"
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
            <InfoChip icon={Zap} label="Power" value={location.power_access} />
            <InfoChip icon={Bath} label="Bathrooms" value={location.bathroom_access} />
            <InfoChip icon={Utensils} label="Food" value={location.food_nearby} />
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
      {lightboxIndex !== null && (
        <PortfolioLightbox items={photoItems} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      <Dialog open={!checkingAccess && !!blockReason} onOpenChange={() => router.push("/locations")}>
        <DialogContent
          unstyled
          showCloseButton={false}
          overlayClassName="fixed inset-x-0 bottom-0 top-16 z-[169] bg-black/35 backdrop-blur-[6px]"
          className="fixed inset-x-0 bottom-0 top-auto z-[170] mx-0 w-full max-w-none gap-0 overflow-hidden rounded-b-none rounded-t-[30px] border-x-0 border-b-0 border-t border-[#e8dfd3] bg-white p-0 text-[#111318] shadow-[0_-24px_64px_rgba(15,23,42,0.18)] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        >
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-[#d7dce6]" />
          <div className="flex items-center justify-between border-b border-[#e8dfd3] px-5 pb-4 pt-4">
            <p className="text-[18px] font-semibold text-[#111318]">This location</p>
            <button
              type="button"
              onClick={() => router.push("/locations")}
              aria-label="Close"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#e7e0d6] bg-white"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="px-5 py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#f20d14]">
              <Crown className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-black text-black">
              {blockReason === "signed_out"
                ? "Sign in to view this location"
                : blockReason === "scout"
                  ? "Scout & Client accounts can't browse locations"
                  : "Upgrade to view this location"}
            </h2>
            <p className="mt-3 text-[15px] leading-6 text-neutral-600">
              {blockReason === "signed_out"
                ? "Locations are shared by SnapScout's creative community. Sign in with a paid subscription to browse the full library."
                : blockReason === "scout"
                  ? "Scout & Client accounts are free and built for posting gigs to hire talent. Browsing and reviewing locations is available with a Creator, Crew, Studio, or Store subscription."
                  : "Browsing SnapScout's full location library - and leaving your own notes - is available with an active Creator, Crew, Studio, or Store subscription."}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {blockReason === "signed_out" ? (
                <Button asChild className="h-[52px] rounded-full bg-[#f20d14] text-[15px] font-bold text-white hover:bg-[#d9070d]">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              ) : blockReason === "scout" ? (
                <Button asChild className="h-[52px] rounded-full bg-[#f20d14] text-[15px] font-bold text-white hover:bg-[#d9070d]">
                  <Link href="/marketplace/post-gig">Post a Gig Instead</Link>
                </Button>
              ) : (
                <Button asChild className="h-[52px] rounded-full bg-[#f20d14] text-[15px] font-bold text-white hover:bg-[#d9070d]">
                  <Link href="/subscribe/plans">View Plans</Link>
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/locations")}
                className="h-[52px] rounded-full border-neutral-200 text-[15px] font-bold"
              >
                Not Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
