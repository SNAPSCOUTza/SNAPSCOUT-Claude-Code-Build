"use client"

import { useEffect, useCallback, useMemo, useRef, useState } from "react"
import { X, ChevronLeft, ChevronRight, Facebook, Instagram } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import DepthCarousel, { type DepthCarouselHandle } from "@/components/ui/depth-carousel"
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
  const carouselApiRef = useRef<DepthCarouselHandle>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()

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
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key !== "Tab") return
      // Focus trap: keep Tab cycling inside the dialog instead of leaking
      // out to the (still-mounted) page behind the fixed overlay.
      const dialog = dialogRef.current
      if (!dialog) return
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
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
    previousFocusRef.current = document.activeElement as HTMLElement | null
    carouselWrapRef.current?.querySelector<HTMLDivElement>(".depth-carousel")?.focus()
    return () => {
      previousFocusRef.current?.focus?.()
    }
  }, [])

  if (!currentItem) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* The frame - a white rounded sheet matching the app's own card/
          modal language, rather than a full-bleed dark photo lightbox.
          Sized to 80% of the viewport per request, capped so it doesn't
          balloon on very wide desktop screens. */}
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Portfolio image viewer, ${currentItem.title || currentItem.caption || `image ${activeIndex + 1} of ${carouselSlides.length}`}`}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeInOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-[80vw] max-w-[720px] flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl"
        style={{ height: "80dvh" }}
      >
        {/* Top bar - sits below the dynamic island / notch on mobile */}
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-[max(14px,env(safe-area-inset-top))]">
          <span className="h-11 w-11" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Swipe to scroll</p>
          <button
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full bg-gray-100 text-gray-700 outline-none transition-colors hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 active:scale-[0.96]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Screen-reader-only position announcement - the visual dots/nav
            already convey this, but nothing previously told assistive tech
            users which slide they landed on after prev/next. */}
        <p className="sr-only" aria-live="polite">
          {carouselSlides.length > 1 ? `Image ${activeIndex + 1} of ${carouselSlides.length}` : ""}
        </p>

        {/* Carousel */}
        <div ref={carouselWrapRef} className="relative min-h-0 flex-1">
          <DepthCarousel
            ref={carouselApiRef}
            items={carouselSlides}
            cardWidth={640}
            cardHeight={800}
            tint="#0b0d12"
            spread={20}
            tilt={10}
            depth={110}
            visibleCards={3}
            blur={4}
            showControls={false}
            showIndicators={false}
            onChange={(index) => setActiveIndex(index)}
          />

          {/* Videos and link-out permalinks aren't real images - the depth
              stack still shows their thumbnails for browsing, but the
              actual player/link-card overlays on top once one is centered. */}
          {currentItem.type !== "image" && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4">
              {currentItem.type === "link" ? (
                <div
                  className={`pointer-events-auto aspect-video w-full max-w-md overflow-hidden rounded-[24px] shadow-[0_22px_52px_rgba(0,0,0,0.35)] ${
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
                <div className="pointer-events-auto aspect-video w-full max-w-md overflow-hidden rounded-[24px] bg-black shadow-[0_22px_52px_rgba(0,0,0,0.35)]">
                  {currentItem.embedUrl ? (
                    <iframe
                      title={currentItem.title || currentItem.caption || "Embedded video"}
                      src={currentItem.embedUrl}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                    />
                  ) : currentItem.platform === "youtube" && currentItem.link ? (
                    <iframe
                      title={currentItem.title || currentItem.caption || "YouTube video"}
                      src={`https://www.youtube.com/embed/${extractYouTubeId(currentItem.link)}?autoplay=1&mute=1`}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : currentItem.platform === "vimeo" && currentItem.link ? (
                    <iframe
                      title={currentItem.title || currentItem.caption || "Vimeo video"}
                      src={`https://player.vimeo.com/video/${extractVimeoId(currentItem.link)}?autoplay=1&muted=1`}
                      className="h-full w-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={currentItem.fullUrl || currentItem.thumbnail}
                      controls
                      autoPlay
                      muted
                      className="h-full w-full"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom nav - back/forward buttons, matching the app's own
            button language instead of the carousel's built-in edge arrows
            (disabled above via showControls={false}). Glass-pill styling
            adapted from card-fan-carousel's ARROW_CLASSES - opacities bumped
            up from that component's originals since those were tuned to
            float over varied photo backgrounds, not sit in a plain white
            bar the way they do here. */}
        {carouselSlides.length > 1 && (
          <div className="flex shrink-0 items-center justify-center gap-4 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
            <button
              type="button"
              onClick={() => carouselApiRef.current?.prev()}
              className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border-[1.5px] border-black/10 bg-black/[0.06] text-gray-600 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-[16px] outline-none transition-colors duration-300 before:pointer-events-none before:absolute before:inset-[3px] before:rounded-full before:border before:border-black/[0.04] before:content-[''] hover:border-black/20 hover:bg-black/10 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 active:opacity-70"
              aria-label="Previous image"
            >
              <ChevronLeft className="relative z-[2] h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => carouselApiRef.current?.next()}
              className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border-[1.5px] border-black/10 bg-black/[0.06] text-gray-600 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-[16px] outline-none transition-colors duration-300 before:pointer-events-none before:absolute before:inset-[3px] before:rounded-full before:border before:border-black/[0.04] before:content-[''] hover:border-black/20 hover:bg-black/10 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 active:opacity-70"
              aria-label="Next image"
            >
              <ChevronRight className="relative z-[2] h-5 w-5" />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
