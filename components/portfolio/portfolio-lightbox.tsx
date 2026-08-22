"use client"

import { useEffect, useCallback } from "react"
import { X, ChevronLeft, ChevronRight, ExternalLink, Facebook, Instagram } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { LightboxPortfolioItem } from "@/types/portfolio"

interface PortfolioLightboxProps {
  items: LightboxPortfolioItem[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  onHire?: () => void
}

const platformColors: Record<string, string> = {
  instagram: "bg-[#f20d14]",
  youtube: "bg-red-500",
  vimeo: "bg-blue-500",
  facebook: "bg-blue-600",
  imdb: "bg-amber-500",
  external: "bg-slate-700",
  local: "bg-gray-500",
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

const extractYouTubeId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
  return match ? match[1] : null
}

const extractVimeoId = (url: string) => {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

export function PortfolioLightbox({ items, currentIndex, onClose, onNext, onPrev, onHire }: PortfolioLightboxProps) {
  const currentItem = items[currentIndex]
  const displayDate = currentItem.timestamp
    ? new Intl.DateTimeFormat("en-ZA", { month: "short", day: "numeric", year: "numeric" }).format(new Date(currentItem.timestamp))
    : null

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") onNext()
      if (e.key === "ArrowLeft") onPrev()
    },
    [onClose, onNext, onPrev],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [handleKeyDown])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#08090c]/96 px-3 py-[max(14px,env(safe-area-inset-top))]"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-[max(16px,env(safe-area-inset-top))] z-20 grid h-12 w-12 place-items-center rounded-full bg-white text-[#111318] shadow-[0_14px_30px_rgba(0,0,0,0.26)] transition-[transform,background-color] duration-200 hover:bg-white/90 active:scale-[0.96]"
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Previous Button */}
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#111318] shadow-[0_12px_24px_rgba(0,0,0,0.24)] transition-transform duration-200 active:scale-[0.96]"
        aria-label="Previous item"
      >
        <ChevronLeft className="h-7 w-7" />
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#111318] shadow-[0_12px_24px_rgba(0,0,0,0.24)] transition-transform duration-200 active:scale-[0.96]"
        aria-label="Next item"
      >
        <ChevronRight className="h-7 w-7" />
      </button>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex max-h-[92dvh] w-full max-w-5xl flex-col gap-3 px-1 sm:px-16"
      >
        {currentItem.type === "link" ? (
          <div
            className={`aspect-video overflow-hidden rounded-[28px] shadow-[0_22px_52px_rgba(0,0,0,0.35)] outline outline-1 outline-white/10 ${
              currentItem.platform === "facebook" ? "bg-[#1877f2]" : "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]"
            }`}
          >
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white">
              {currentItem.platform === "facebook" ? <Facebook className="h-12 w-12" /> : <Instagram className="h-12 w-12" />}
              <p className="text-sm font-semibold">No preview available for this link</p>
              {currentItem.link && (
                <a
                  href={currentItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white/95 px-5 py-2.5 text-sm font-bold text-[#111318]"
                >
                  View on {currentItem.platform === "facebook" ? "Facebook" : "Instagram"}
                </a>
              )}
            </div>
          </div>
        ) : currentItem.type === "video" ? (
          <div className="aspect-video overflow-hidden rounded-[28px] bg-black shadow-[0_22px_52px_rgba(0,0,0,0.35)] outline outline-1 outline-white/10">
            {currentItem.embedUrl ? (
              <iframe
                src={currentItem.embedUrl}
              className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : currentItem.platform === "youtube" && currentItem.link ? (
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(currentItem.link)}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : currentItem.platform === "vimeo" && currentItem.link ? (
              <iframe
                src={`https://player.vimeo.com/video/${extractVimeoId(currentItem.link)}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={currentItem.fullUrl || currentItem.thumbnail} controls autoPlay className="h-full w-full" />
            )}
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            <Image
              src={currentItem.fullUrl || currentItem.thumbnail}
              alt={currentItem.title || "Portfolio item"}
              width={1200}
              height={800}
              className="max-h-[68dvh] max-w-full rounded-[28px] object-contain shadow-[0_22px_52px_rgba(0,0,0,0.35)] outline outline-1 outline-white/10"
            />
          </div>
        )}

        <div className="rounded-[28px] border border-white/10 bg-white p-4 text-[#111318] shadow-2xl sm:bg-white/95">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
              {currentItem.platform && (
                <Badge className={`${platformColors[currentItem.platform]} border-0 text-white`}>
                  {currentItem.platform}
                </Badge>
              )}
                {currentItem.username && <span className="text-sm font-semibold">@{currentItem.username}</span>}
                {displayDate && <span className="text-xs text-[#667085]">{displayDate}</span>}
              </div>
              {(currentItem.caption || currentItem.title || currentItem.description) && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#303844]">
                  {currentItem.caption || currentItem.title || currentItem.description}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="mr-1 whitespace-nowrap text-sm font-semibold tabular-nums text-[#667085]">
                {currentIndex + 1} / {items.length}
              </span>
              {currentItem.link && (
                <Button variant="outline" size="sm" className="h-10 rounded-full bg-white px-4" asChild>
                  <a href={currentItem.link} target="_blank" rel="noopener noreferrer">
                    {currentItem.platform === "instagram" ? "View on Instagram" : "View Original"} <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
              {onHire && (
                <Button size="sm" className="h-10 rounded-full bg-[#f20d14] px-4 text-white hover:bg-[#d9070d]" onClick={onHire}>
                  Hire Creator
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
