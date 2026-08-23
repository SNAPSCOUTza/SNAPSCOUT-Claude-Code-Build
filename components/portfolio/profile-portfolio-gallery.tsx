"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ExternalLink, Facebook, Instagram, Play } from "lucide-react"
import { PortfolioLightbox } from "@/components/portfolio/portfolio-lightbox"
import {
  normalizePortfolioItem,
  type LightboxPortfolioItem,
  type ProfilePortfolioItem,
} from "@/types/portfolio"

type ProfilePortfolioGalleryProps = {
  userId?: string
  items?: Array<ProfilePortfolioItem | LightboxPortfolioItem>
  title?: string
  previewCount?: number
  className?: string
  onHire?: () => void
  hireLabel?: string
}

const isUuid = (value?: string) =>
  Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))

// Used for the "link" tile type (no real preview exists - a bare permalink
// with no embeddable player) - a solid branded card reads as "this links
// somewhere" rather than a broken/loading thumbnail.
const linkCardStyles: Record<string, { bg: string; icon: typeof Instagram; label: string }> = {
  instagram: { bg: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]", icon: Instagram, label: "Instagram" },
  facebook: { bg: "bg-[#1877f2]", icon: Facebook, label: "Facebook" },
}

type GalleryTab = "all" | "photos" | "videos"

export function ProfilePortfolioGallery({
  userId,
  items = [],
  title = "Portfolio",
  previewCount = 9,
  className = "",
  onHire,
  hireLabel,
}: ProfilePortfolioGalleryProps) {
  const [remoteItems, setRemoteItems] = useState<LightboxPortfolioItem[]>([])
  const [loading, setLoading] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<GalleryTab>("all")

  const fallbackItems = useMemo(
    () => items.map((item, index) => normalizePortfolioItem(item as ProfilePortfolioItem, index)),
    [items],
  )

  useEffect(() => {
    if (!isUuid(userId)) {
      setRemoteItems([])
      return
    }

    let cancelled = false
    setLoading(true)

    fetch(`/api/portfolio?userId=${encodeURIComponent(userId!)}`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) return []
        const payload = await response.json()
        return Array.isArray(payload.items) ? payload.items : []
      })
      .then((records) => {
        if (!cancelled) {
          setRemoteItems(records.map((item: ProfilePortfolioItem, index: number) => normalizePortfolioItem(item, index)))
        }
      })
      .catch(() => {
        if (!cancelled) setRemoteItems([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const galleryItems = remoteItems.length > 0 ? remoteItems : fallbackItems
  // "link" items (Instagram/Facebook permalinks with no embeddable player)
  // read as video-ish content, not photos, so they group under Videos.
  const photoCount = galleryItems.filter((item) => item.type === "image").length
  const videoCount = galleryItems.filter((item) => item.type !== "image").length
  const showTabs = photoCount > 0 && videoCount > 0
  const filteredItems = !showTabs || activeTab === "all"
    ? galleryItems
    : galleryItems.filter((item) => (activeTab === "photos" ? item.type === "image" : item.type !== "image"))
  const visibleItems = filteredItems.slice(0, previewCount)

  if (!loading && galleryItems.length === 0) {
    return (
      <section className={`border-t border-[#e8edf5] pt-5 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[#0b0f16]">{title}</h3>
        </div>
        <div className="mt-3 rounded-[24px] border border-[#e8edf5] bg-[#fffdf8] px-4 py-6 text-sm text-[#667085]">
          <p className="font-semibold text-[#101318]">No portfolio added yet.</p>
          <p className="mt-1">Portfolio images will appear here once this profile adds work.</p>
        </div>
      </section>
    )
  }

  return (
    <section className={`border-t border-[#e8edf5] pt-5 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-[#0b0f16]">{title}</h3>
        {galleryItems.length > 0 && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              setActiveTab("all")
              setLightboxIndex(0)
            }}
            className="min-h-11 rounded-full px-2 text-[13px] font-semibold text-[#f20d14]"
          >
            View all
          </motion.button>
        )}
      </div>

      {showTabs && (
        <div className="mt-3 flex gap-2">
          {([
            ["all", `All (${galleryItems.length})`],
            ["photos", `Photos (${photoCount})`],
            ["videos", `Videos (${videoCount})`],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                activeTab === tab ? "bg-[#111318] text-white" : "bg-[#f3f5f8] text-[#667085] hover:bg-[#e8edf5]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2.5 md:gap-3">
        {loading && galleryItems.length === 0
          ? Array.from({ length: previewCount }).map((_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-[22px] bg-[#eef2f6]" />
            ))
          : visibleItems.map((item, index) => {
            const linkCard = item.type === "link" ? linkCardStyles[item.platform || ""] : undefined

            return (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2, scale: 1.015 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setLightboxIndex(index)}
              className="group relative aspect-square overflow-hidden rounded-[20px] bg-[#f3f5f8] text-left shadow-[0_12px_28px_rgba(10,15,25,0.08)] outline outline-1 outline-black/10 transition-[transform,box-shadow] duration-200"
            >
              {linkCard ? (
                <div className={`absolute inset-0 grid place-items-center ${linkCard.bg} text-white`}>
                  <div className="flex flex-col items-center gap-2">
                    <linkCard.icon className="h-8 w-8" />
                    <span className="text-[12px] font-bold">View on {linkCard.label}</span>
                  </div>
                </div>
              ) : (
                <>
                  <Image src={item.thumbnail || "/placeholder.svg"} alt={item.title || "Portfolio item"} fill className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]" />
                  {item.type === "video" && (
                    <span className="absolute inset-0 grid place-items-center bg-black/20 text-white">
                      <Play className="h-7 w-7 fill-white" />
                    </span>
                  )}
                </>
              )}
              <span className="absolute inset-0 grid place-items-center bg-black/0 text-[12px] font-bold text-white opacity-0 transition-[background-color,opacity] duration-300 group-hover:bg-black/35 group-hover:opacity-100">
                View Project
              </span>
              {(item.platform === "external" || item.platform === "imdb") && (
                <span className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-[#111827]">
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
              )}
              {item.platform === "instagram" && !linkCard && (
                <span className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-[#f20d14]">
                  <Instagram className="h-3.5 w-3.5" />
                </span>
              )}
            </motion.button>
            )
          })}
      </div>

      {lightboxIndex !== null && (
        <PortfolioLightbox
          items={filteredItems}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onHire={onHire}
          hireLabel={hireLabel}
        />
      )}
    </section>
  )
}
