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
      <motion.div
        key={pathname}
        className="flex min-h-[100dvh] flex-col"
        initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </MobilePreviewFrame>
  )
}
