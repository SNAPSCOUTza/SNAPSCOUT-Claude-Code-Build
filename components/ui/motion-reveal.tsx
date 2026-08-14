"use client"

import type { ReactNode } from "react"
import { motion, type Variants } from "framer-motion"

export const revealContainer: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.06,
      staggerChildren: 0.045,
    },
  },
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.46,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export function MotionRevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={revealContainer} initial="hidden" animate="show">
      {children}
    </motion.div>
  )
}

export function MotionRevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={revealItem}>
      {children}
    </motion.div>
  )
}

export function MotionRevealSolo({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={revealItem} initial="hidden" animate="show">
      {children}
    </motion.div>
  )
}
