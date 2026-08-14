"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check } from "lucide-react"

export type HireConfirmationVariant =
  | "photographer"
  | "videographer"
  | "makeup"
  | "production-crew"
  | "film-crew"
  | "studio"
  | "store"

const confirmationAssets: Record<HireConfirmationVariant, { src: string; alt: string }> = {
  photographer: {
    src: "/images/loading-states/photographer-booking.jpg",
    alt: "Booking your photographer",
  },
  videographer: {
    src: "/images/loading-states/videographer-booking.jpg",
    alt: "Booking your videographer",
  },
  makeup: {
    src: "/images/loading-states/makeup-booking.jpg",
    alt: "Booking your hair and makeup artist",
  },
  "production-crew": {
    src: "/images/loading-states/production-crew.jpg",
    alt: "Booking your production crew",
  },
  "film-crew": {
    src: "/images/loading-states/film-crew.jpg",
    alt: "Booking your film crew",
  },
  studio: {
    src: "/images/loading-states/studio-booking.jpg",
    alt: "Booking your perfect studio",
  },
  store: {
    src: "/images/loading-states/camera-store.jpg",
    alt: "Reaching out to camera store",
  },
}

export function getHireConfirmationVariant({
  talentType,
  bookingType,
  talentName,
}: {
  talentType: "creator" | "crew" | "studio" | "store"
  bookingType?: string
  talentName?: string
}): HireConfirmationVariant {
  const label = `${bookingType || ""} ${talentName || ""}`.toLowerCase()

  if (talentType === "studio") return "studio"
  if (talentType === "store") return "store"
  if (label.match(/hair|makeup|make-up|beauty|wardrobe|stylist/)) return "makeup"
  if (talentType === "creator" && label.match(/video|film|reel|music video|videographer/)) return "videographer"
  if (talentType === "creator") return "photographer"
  if (label.match(/film|cinema|documentary|commercial|production|crew/)) return "film-crew"
  return "production-crew"
}

export function HireConfirmationOverlay({
  open,
  variant,
  onComplete,
}: {
  open: boolean
  variant: HireConfirmationVariant
  onComplete: () => void
}) {
  const [confirmed, setConfirmed] = useState(false)
  const onCompleteRef = useRef(onComplete)
  const asset = confirmationAssets[variant]

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!open) {
      setConfirmed(false)
      return
    }

    setConfirmed(false)
    const dotsTimer = window.setTimeout(() => setConfirmed(true), 3500)
    const completeTimer = window.setTimeout(() => onCompleteRef.current(), 4300)

    return () => {
      window.clearTimeout(dotsTimer)
      window.clearTimeout(completeTimer)
    }
  }, [open, variant])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key={`${variant}-hire-confirmation`}
          initial={{ clipPath: "circle(0% at 50% 82%)", opacity: 1 }}
          animate={{ clipPath: "circle(150% at 50% 82%)", opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            clipPath: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.34, ease: "easeOut" },
          }}
          className="fixed inset-0 z-[260] overflow-hidden bg-white"
          role="status"
          aria-live="polite"
        >
          <motion.img
            src={asset.src}
            alt={asset.alt}
            className="h-full w-full object-contain"
            initial={{ opacity: 0, scale: 1.03, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-[7.5dvh] flex justify-center">
            <AnimatePresence mode="wait">
              {!confirmed ? (
                <motion.div
                  key="dots"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="flex h-12 items-center gap-2 rounded-full bg-white/92 px-6 shadow-[0_16px_44px_rgba(15,23,42,0.12)] ring-1 ring-[#efe4d7]"
                  aria-label="Loading"
                >
                  {[0, 0.12, 0.24].map((delay) => (
                    <motion.span
                      key={delay}
                      className="h-2.5 w-2.5 rounded-full bg-[#f20d14]"
                      animate={{ y: [0, -6, 0], opacity: [0.45, 1, 0.45] }}
                      transition={{ duration: 0.72, delay, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0, y: 10, scale: 0.72 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.82 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="grid h-14 w-14 place-items-center rounded-full bg-[#31b85b] text-white shadow-[0_18px_46px_rgba(49,184,91,0.35)]"
                  aria-label="Confirmed"
                >
                  <Check className="h-7 w-7 stroke-[3]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
