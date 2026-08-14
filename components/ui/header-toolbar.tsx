"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"

const LABEL_WIDTH = 80

type ToolbarItem = {
  label: string
  icon: React.ComponentType<any>
  href?: string
  onClick?: () => void
  hasNotification?: boolean
  notificationCount?: number
}

type HeaderToolbarProps = {
  className?: string
  items: ToolbarItem[]
  defaultActiveIndex?: number
}

export function HeaderToolbar({ className, items, defaultActiveIndex }: HeaderToolbarProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(defaultActiveIndex ?? null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <motion.nav
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      role="navigation"
      aria-label="Header Toolbar"
      className={cn(
        "bg-card border border-border rounded-full flex items-center p-1.5 shadow-sm space-x-1 h-[44px]",
        className,
      )}
    >
      {items.map((item, idx) => {
        const Icon = item.icon
        const isActive = activeIndex === idx
        const isHovered = hoveredIndex === idx
        const showExpanded = isActive || isHovered

        const buttonContent = (
          <motion.div
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex items-center gap-0 px-3 py-2 rounded-full transition-colors duration-200 relative h-9 min-w-[40px]",
              isActive ? "bg-primary/10 text-primary gap-2" : "bg-transparent text-muted-foreground hover:bg-muted",
              "focus:outline-none focus-visible:ring-0 cursor-pointer",
            )}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => {
              setActiveIndex(idx)
              item.onClick?.()
            }}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={2} aria-hidden className="transition-colors duration-200" />
              {item.hasNotification && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />}
              {item.notificationCount && item.notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {item.notificationCount > 9 ? "9+" : item.notificationCount}
                </span>
              )}
            </div>

            <motion.div
              initial={false}
              animate={{
                width: showExpanded ? `${LABEL_WIDTH}px` : "0px",
                opacity: showExpanded ? 1 : 0,
                marginLeft: showExpanded ? "6px" : "0px",
              }}
              transition={{
                width: { type: "spring", stiffness: 350, damping: 32 },
                opacity: { duration: 0.15 },
                marginLeft: { duration: 0.15 },
              }}
              className="overflow-hidden flex items-center"
            >
              <span
                className={cn(
                  "font-medium text-xs whitespace-nowrap select-none transition-opacity duration-200 overflow-hidden text-ellipsis",
                  showExpanded ? (isActive ? "text-primary" : "text-foreground") : "opacity-0",
                )}
                title={item.label}
              >
                {item.label}
              </span>
            </motion.div>
          </motion.div>
        )

        if (item.href) {
          return (
            <Link key={item.label} href={item.href} className="focus:outline-none">
              {buttonContent}
            </Link>
          )
        }

        return (
          <button key={item.label} type="button" className="focus:outline-none">
            {buttonContent}
          </button>
        )
      })}
    </motion.nav>
  )
}

export default HeaderToolbar
