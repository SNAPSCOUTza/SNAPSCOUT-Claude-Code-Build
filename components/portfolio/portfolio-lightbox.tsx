"use client"

import { useEffect, useCallback, useMemo, useRef, useState } from "react"
import { X, Facebook, Instagram } from "lucide-react"
import { motion } from "framer-motion"
import DepthCarousel from "@/components/ui/depth-carousel"
import type { LightboxPortfolioItem } from "@/types/portfolio"

interface PortfolioLightboxProps {
  items: LightboxPortfolioItem[]
  initialIndex: number
  onClose: () => void
}

const extractYouTubeId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
  return match ? match[1] : null
}

const extractVimeoId = (url: string) => {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

export function PortfolioLightbox({ items, initialIndex, onClose }: PortfolioLightboxProps) {
  const carouselWrapRef = useRef<HTMLDivElement>(null)

  // DepthCarousel always starts at position 0 with no controlled "start
  // index" prop, so the item the user actually clicked is rotated to the
  // front instead - this keeps the vendored carousel untouched while still
  // opening on the right photo, then wrapping around through the rest.
  const rotatedItems = useMemo(() => {
    const n = items.length
    if (!n) return items
    const start = ((initialIndex % n) + n) % n
    return Array.from({ length: n }, (_, i) => items[(start + i) % n])
  }, [items, initialIndex])

  const carouselSlides = useMemo(
    () => rotatedItems.map((item) => ({ image: item.thumbnail, alt: item.title || item.caption || "" })),
    [rotatedItems],
  )

  const [activeIndex, setActiveIndex] = useState(0)
  const currentItem = rotatedItems[activeIndex] || rotatedItems[0]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [handleKeyDown])

  useEffect(() => {
    carouselWrapRef.current?.querySelector<HTMLDivElement>(".depth-carousel")?.focus()
  }, [])

  if (!currentItem) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#08090c]/97 px-2 py-[max(10px,env(safe-area-inset-top))]"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-[max(16px,env(safe-area-inset-top))] z-20 grid h-12 w-12 place-items-center rounded-full bg-white text-[#111318] shadow-[0_14px_30px_rgba(0,0,0,0.26)] transition-[transform,background-color] duration-200 hover:bg-white/90 active:scale-[0.96]"
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Content - sized to "contain" fit an 0.8 (4:5) aspect ratio inside
          the available viewport, so the DepthCarousel's own width-based
          scaling (see components/ui/depth-carousel.tsx's ResizeObserver)
          fills the box on BOTH axes instead of leaving it width-constrained
          on tall/narrow mobile screens with empty space above/below. */}
      <motion.div
        ref={carouselWrapRef}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto"
        style={{ width: "min(92vw, 85dvh * 0.8)", height: "min(85dvh, 92vw / 0.8)" }}
      >
        <DepthCarousel
          items={carouselSlides}
          cardWidth={640}
          cardHeight={800}
          tint="#08090c"
          spread={20}
          tilt={10}
          depth={110}
          visibleCards={3}
          blur={4}
          onChange={(index) => setActiveIndex(index)}
        />

        {/* Videos and link-out permalinks aren't real images - the depth
            stack still shows their thumbnails for browsing, but the
            actual player/link-card overlays on top once one is centered. */}
        {currentItem.type !== "image" && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4">
            {currentItem.type === "link" ? (
              <div
                className={`pointer-events-auto aspect-video w-full max-w-lg overflow-hidden rounded-[28px] shadow-[0_22px_52px_rgba(0,0,0,0.45)] outline outline-1 outline-white/10 ${
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
            ) : (
              <div className="pointer-events-auto aspect-video w-full max-w-lg overflow-hidden rounded-[28px] bg-black shadow-[0_22px_52px_rgba(0,0,0,0.45)] outline outline-1 outline-white/10">
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
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : currentItem.platform === "vimeo" && currentItem.link ? (
                  <iframe
                    src={`https://player.vimeo.com/video/${extractVimeoId(currentItem.link)}?autoplay=1`}
                    className="h-full w-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={currentItem.fullUrl || currentItem.thumbnail} controls autoPlay className="h-full w-full" />
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
