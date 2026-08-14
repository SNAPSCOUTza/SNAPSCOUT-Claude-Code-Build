"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ExternalLink, Instagram, Play } from "lucide-react"
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
}

const isUuid = (value?: string) =>
  Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))

export function ProfilePortfolioGallery({
  userId,
  items = [],
  title = "Portfolio",
  previewCount = 9,
  className = "",
  onHire,
}: ProfilePortfolioGalleryProps) {
  const [remoteItems, setRemoteItems] = useState<LightboxPortfolioItem[]>([])
  const [loading, setLoading] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

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
  const visibleItems = galleryItems.slice(0, previewCount)

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
            onClick={() => setLightboxIndex(0)}
            className="min-h-11 rounded-full px-2 text-[13px] font-semibold text-[#f20d14]"
          >
            View all
          </motion.button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2.5 md:gap-3">
        {loading && galleryItems.length === 0
          ? Array.from({ length: previewCount }).map((_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-[22px] bg-[#eef2f6]" />
            ))
          : visibleItems.map((item, index) => (
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
              <Image src={item.thumbnail || "/placeholder.svg"} alt={item.title || "Portfolio item"} fill className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]" />
              <span className="absolute inset-0 grid place-items-center bg-black/0 text-[12px] font-bold text-white opacity-0 transition-[background-color,opacity] duration-300 group-hover:bg-black/35 group-hover:opacity-100">
                View Project
              </span>
              {item.type === "video" && (
                <span className="absolute inset-0 grid place-items-center bg-black/20 text-white">
                  <Play className="h-7 w-7 fill-white" />
                </span>
              )}
              {(item.platform === "external" || item.platform === "imdb") && (
                <span className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-[#111827]">
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
              )}
              {item.platform === "instagram" && (
                <span className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-[#f20d14]">
                  <Instagram className="h-3.5 w-3.5" />
                </span>
              )}
            </motion.button>
          ))}
      </div>

      {lightboxIndex !== null && (
        <PortfolioLightbox
          items={galleryItems}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % galleryItems.length)}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + galleryItems.length) % galleryItems.length)}
          onHire={onHire}
        />
      )}
    </section>
  )
}
