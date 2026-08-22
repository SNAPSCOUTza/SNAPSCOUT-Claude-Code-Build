"use client"

import type React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"
import MobilePreviewFrame from "@/components/mobile/mobile-preview-frame"

export default function SiteWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  return (
    <MobilePreviewFrame>
      {/* No `filter` in the transition below on purpose - even a resting
      blur(0px) establishes a CSS containing block for descendant
      `position: fixed` elements, which broke MobileShell's fixed header
      and bottom nav (they'd pin to the bottom of the full page instead of
      the viewport). Keep this to transform/opacity-only properties. */}
      <motion.div
        key={pathname}
        className="flex min-h-[100dvh] flex-col"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </MobilePreviewFrame>
  )
}
