"use client"

import { useRef, type ReactNode } from "react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface StickyScrollCardProps {
  children: ReactNode
  className?: string
  top?: string
  delay?: number
}

export function StickyScrollCard({ children, className, top = "96px", delay = 0 }: StickyScrollCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 90%", "end 10%"],
  })

  const rawScale = useTransform(scrollYProgress, [0, 0.2, 0.45, 0.75, 1], [0.955, 1.02, 1.004, 1, 0.992])
  const rawY = useTransform(scrollYProgress, [0, 0.22, 0.45, 0.8, 1], [28, -8, 0, -4, -8])
  const scale = useSpring(rawScale, {
    stiffness: 280,
    damping: 22,
    mass: 0.7,
  })

  const y = useSpring(rawY, {
    stiffness: 240,
    damping: 20,
    mass: 0.75,
  })

  return (
    <motion.article
      ref={cardRef}
      className={cn("relative will-change-transform", className)}
      style={{
        top: undefined,
        scale: reduceMotion ? 1 : scale,
        y: reduceMotion ? 0 : y,
        opacity: 1,
        filter: "none",
      }}
      initial={false}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? undefined
          : {
              type: "spring",
              stiffness: 240,
              damping: 20,
              mass: 0.7,
              bounce: 0.35,
              delay,
            }
      }
      whileHover={reduceMotion ? undefined : { y: -2, scale: 1.004 }}
      whileTap={reduceMotion ? undefined : { scale: 0.992 }}
    >
      {children}
    </motion.article>
  )
}
