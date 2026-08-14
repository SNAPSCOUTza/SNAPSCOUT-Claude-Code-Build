"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import { Home, Briefcase, Calendar, MessageCircle, CircleUserRound } from "lucide-react"

type IconComponentType = React.ElementType<{ className?: string }>

export interface InteractiveMenuItem {
  label: string
  icon: IconComponentType
  href?: string
  badgeCount?: number
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[]
  accentColor?: string
  activeHref?: string
}

const defaultItems: InteractiveMenuItem[] = [
  { label: "Explore", icon: Home, href: "/" },
  { label: "Bookings", icon: Calendar, href: "/dashboard" },
  { label: "Hire", icon: Briefcase, href: "/find-crew" },
  { label: "Messages", icon: MessageCircle, href: "/messages" },
  { label: "Profile", icon: CircleUserRound, href: "/profile/preview" },
]

const defaultAccentColor = "var(--component-active-color-default)"

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({ items, accentColor, activeHref }) => {
  const finalItems = useMemo(() => {
    const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 5
    if (!isValid) {
      return defaultItems
    }
    return items
  }, [items])

  const [activeIndex, setActiveIndex] = useState(0)
  const textRefs = useRef<(HTMLElement | null)[]>([])
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    if (!activeHref) return
    const idx = finalItems.findIndex((item) => item.href === activeHref)
    if (idx >= 0 && idx !== activeIndex) setActiveIndex(idx)
  }, [activeHref, finalItems, activeIndex])

  useEffect(() => {
    if (activeIndex >= finalItems.length) {
      setActiveIndex(0)
    }
  }, [finalItems, activeIndex])

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[activeIndex]
      const activeTextElement = textRefs.current[activeIndex]
      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth
        activeItemElement.style.setProperty("--lineWidth", `${textWidth}px`)
      }
    }

    setLineWidth()
    window.addEventListener("resize", setLineWidth)
    return () => window.removeEventListener("resize", setLineWidth)
  }, [activeIndex, finalItems])

  const navStyle = useMemo(() => {
    const activeColor = accentColor || defaultAccentColor
    return { "--component-active-color": activeColor } as React.CSSProperties
  }, [accentColor])

  return (
    <nav className="menu" role="navigation" style={navStyle} aria-label="Mobile Navigation">
      {finalItems.map((item, index) => {
        const isActive = index === activeIndex
        const IconComponent = item.icon
        const href = item.href || "#"
        const badgeCount = Math.max(0, item.badgeCount ?? 0)

        return (
          <Link
            key={`${item.label}-${index}`}
            href={href}
            className={`menu__item ${isActive ? "active" : ""}`}
            ref={(el) => {
              itemRefs.current[index] = el
            }}
            onClick={() => setActiveIndex(index)}
            style={{ "--lineWidth": "0px" } as React.CSSProperties}
          >
            <div className="menu__icon">
              <IconComponent className="icon" />
              {badgeCount > 0 ? <span className="menu__badge">{badgeCount > 99 ? "99+" : badgeCount}</span> : null}
            </div>
            <strong
              className={`menu__text ${isActive ? "active" : ""}`}
              ref={(el) => {
                textRefs.current[index] = el
              }}
            >
              {item.label}
            </strong>
          </Link>
        )
      })}
    </nav>
  )
}

export { InteractiveMenu }
