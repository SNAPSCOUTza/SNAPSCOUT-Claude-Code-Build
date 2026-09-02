"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const dotVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" as const },
  },
}

interface LoadingDotProps {
  className?: string
  size?: number
}

/**
 * The same pulsing-dot motif as the homepage's RedPreloader splash, scaled down
 * for inline use (buttons, inline status text) so loading feedback stays
 * consistent across the app instead of every button rolling its own spinner.
 */
export function LoadingDot({ className, size = 8 }: LoadingDotProps) {
  return (
    <motion.span
      aria-hidden="true"
      className={cn("inline-block shrink-0 rounded-full bg-current", className)}
      style={{ width: size, height: size }}
      variants={dotVariants}
      animate="animate"
    />
  )
}
