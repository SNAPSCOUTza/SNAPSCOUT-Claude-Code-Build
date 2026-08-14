"use client"

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { gsap } from "gsap"
import "./StaggeredMenu.css"

type IconType = React.ComponentType<{ className?: string }>

export interface StaggeredMenuItem {
  label: string
  ariaLabel: string
  link: string
  icon?: IconType
  badgeCount?: number
}

export interface StaggeredMenuSocialItem {
  label: string
  link: string
}

type LegacyItem = { name: string; url: string; icon?: IconType; badgeCount?: number }

export interface StaggeredMenuProps {
  position?: "left" | "right"
  colors?: string[]
  items?: Array<StaggeredMenuItem | LegacyItem>
  quickItems?: Array<StaggeredMenuItem | LegacyItem>
  socialItems?: StaggeredMenuSocialItem[]
  displaySocials?: boolean
  displayItemNumbering?: boolean
  className?: string
  logoUrl?: string
  logoTitle?: string
  logoSubtitle?: string
  menuButtonColor?: string
  openMenuButtonColor?: string
  accentColor?: string
  changeMenuColorOnOpen?: boolean
  closeOnClickAway?: boolean
  showBackdrop?: boolean
  onMenuOpen?: () => void
  onMenuClose?: () => void
  isFixed?: boolean
  panelFooter?: React.ReactNode
  topOffset?: string
  isOpen?: boolean
  onItemClick?: () => void
}

const isExternal = (url: string) => /^https?:\/\//i.test(url)

const normalizeItems = (items: Array<StaggeredMenuItem | LegacyItem>) =>
  items.map((item) => {
    if ("label" in item) {
      return {
        label: item.label,
        ariaLabel: item.ariaLabel || `Open ${item.label}`,
        link: item.link,
        icon: item.icon,
        badgeCount: item.badgeCount,
      }
    }
    return {
      label: item.name,
      ariaLabel: `Open ${item.name}`,
      link: item.url,
      icon: item.icon,
      badgeCount: item.badgeCount,
    }
  })

const Row = ({
  item,
  isActive = false,
  onClick,
}: {
  item: { label: string; ariaLabel: string; link: string; icon?: IconType; badgeCount?: number }
  isActive?: boolean
  onClick?: () => void
}) => {
  const Icon = item.icon
  const content = (
    <div className={`sm-row${isActive ? " is-active" : ""}`}>
      <div className="sm-row-iconWrap">{Icon ? <Icon className="sm-row-icon" /> : null}</div>
      <span className="sm-row-label">{item.label}</span>
      {typeof item.badgeCount === "number" && item.badgeCount > 0 ? (
        <span className="sm-row-badge">{item.badgeCount}</span>
      ) : null}
    </div>
  )

  return (
    <li className="sm-panel-itemWrap">
      {isExternal(item.link) ? (
        <a href={item.link} aria-label={item.ariaLabel} className="sm-panel-item" onClick={onClick}>
          {content}
        </a>
      ) : (
        <Link href={item.link} aria-label={item.ariaLabel} className="sm-panel-item" onClick={onClick}>
          {content}
        </Link>
      )}
    </li>
  )
}

const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = "right",
  colors = ["#EDEFF4", "#F6F7FA"],
  items = [],
  quickItems = [],
  socialItems = [],
  displaySocials = false,
  displayItemNumbering = false,
  className,
  logoTitle = "SnapScout",
  logoSubtitle = "Your Local Companion",
  menuButtonColor = "#f20d14",
  openMenuButtonColor = "#6b7280",
  accentColor = "#f20d14",
  changeMenuColorOnOpen = true,
  isFixed = false,
  closeOnClickAway = true,
  showBackdrop = false,
  onMenuOpen,
  onMenuClose,
  panelFooter,
  topOffset = "12px",
  isOpen,
  onItemClick,
}) => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const preLayersRef = useRef<HTMLDivElement | null>(null)
  const preLayerElsRef = useRef<HTMLElement[]>([])
  const iconRef = useRef<HTMLSpanElement | null>(null)
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null)
  const openTlRef = useRef<gsap.core.Timeline | null>(null)
  const closeTweenRef = useRef<gsap.core.Tween | null>(null)

  const navItems = useMemo(() => normalizeItems(items || []), [items])
  const quickActionItems = useMemo(() => normalizeItems(quickItems || []), [quickItems])
  const brandTitle = useMemo(() => logoTitle || "SnapScout", [logoTitle])
  const highlightSnap = brandTitle.toLowerCase().startsWith("snap")
  const isRouteActive = useCallback(
    (href: string) => {
      if (!href || /^https?:\/\//i.test(href)) return false
      if (href === "/") return pathname === "/"
      return pathname === href || pathname.startsWith(`${href}/`)
    },
    [pathname],
  )

  if (typeof isOpen === "boolean") {
    if (!isOpen) return null
    return (
      <nav className="sm-compat-nav">
        <ul className="sm-panel-list" role="list">
          {navItems.map((item) => (
            <Row key={`${item.label}-${item.link}`} item={item} isActive={isRouteActive(item.link)} onClick={onItemClick} />
          ))}
        </ul>
      </nav>
    )
  }

  useLayoutEffect(() => {
    const panel = panelRef.current
    const preContainer = preLayersRef.current
    const icon = iconRef.current
    if (!panel || !icon) return

    const preLayers = preContainer ? (Array.from(preContainer.querySelectorAll(".sm-prelayer")) as HTMLElement[]) : []
    preLayerElsRef.current = preLayers

    const offscreen = position === "left" ? -100 : 100
    gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 })
    gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" })
    if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor })
  }, [menuButtonColor, position])

  const playOpen = useCallback(() => {
    const panel = panelRef.current
    if (!panel) return
    openTlRef.current?.kill()
    closeTweenRef.current?.kill()

    const labels = Array.from(panel.querySelectorAll(".sm-row-label")) as HTMLElement[]
    const offscreen = position === "left" ? -100 : 100
    gsap.set(labels, { yPercent: 120, opacity: 0 })

    const tl = gsap.timeline()
    preLayerElsRef.current.forEach((layer, i) => {
      tl.fromTo(layer, { xPercent: offscreen }, { xPercent: 0, duration: 0.45, ease: "power3.out" }, i * 0.06)
    })
    const insert = (preLayerElsRef.current.length - 1) * 0.06 + 0.08
    tl.fromTo(panel, { xPercent: offscreen }, { xPercent: 0, duration: 0.55, ease: "power3.out" }, insert)
    tl.to(labels, { yPercent: 0, opacity: 1, duration: 0.55, ease: "power3.out", stagger: 0.06 }, insert + 0.08)

    openTlRef.current = tl
  }, [position])

  const playClose = useCallback(() => {
    const panel = panelRef.current
    if (!panel) return
    openTlRef.current?.kill()

    const all = [...preLayerElsRef.current, panel]
    const offscreen = position === "left" ? -100 : 100
    closeTweenRef.current?.kill()
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.28,
      ease: "power3.in",
    })
  }, [position])

  const animateIcon = useCallback((opening: boolean) => {
    if (!iconRef.current) return
    gsap.to(iconRef.current, {
      rotate: opening ? 225 : 0,
      duration: opening ? 0.45 : 0.26,
      ease: opening ? "power3.out" : "power2.inOut",
    })
  }, [])

  const animateColor = useCallback(
    (opening: boolean) => {
      if (!toggleBtnRef.current) return
      if (!changeMenuColorOnOpen) {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor })
        return
      }
      gsap.to(toggleBtnRef.current, {
        color: opening ? openMenuButtonColor : menuButtonColor,
        duration: 0.2,
        ease: "power2.out",
      })
    },
    [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor],
  )

  const closeMenu = useCallback(() => {
    if (!openRef.current) return
    openRef.current = false
    setOpen(false)
    onMenuClose?.()
    playClose()
    animateIcon(false)
    animateColor(false)
  }, [animateColor, animateIcon, onMenuClose, playClose])

  const toggleMenu = useCallback(() => {
    const target = !openRef.current
    openRef.current = target
    setOpen(target)
    if (target) {
      onMenuOpen?.()
      playOpen()
    } else {
      onMenuClose?.()
      playClose()
    }
    animateIcon(target)
    animateColor(target)
  }, [animateColor, animateIcon, onMenuClose, onMenuOpen, playClose, playOpen])

  useEffect(() => {
    if (!closeOnClickAway || !open) return
    const onDown = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        closeMenu()
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [closeOnClickAway, closeMenu, open])

  return (
    <div
      className={(className ? `${className} ` : "") + `staggered-menu-wrapper${isFixed ? " fixed-wrapper" : ""}`}
      style={
        {
          ["--sm-accent" as any]: accentColor,
          ["--sm-top-offset" as any]: topOffset,
        } as React.CSSProperties
      }
      data-position={position}
      data-open={open || undefined}
    >
      {open && showBackdrop ? <div className="fixed inset-0 bg-black/35 z-[39]" aria-hidden="true" /> : null}

      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {(colors.length ? colors.slice(0, 4) : ["#EDEFF4", "#F6F7FA"]).map((c, i) => (
          <div key={i} className="sm-prelayer" style={{ background: c }} />
        ))}
      </div>

      <header className="staggered-menu-header" aria-label="Main navigation header">
        <button
          ref={toggleBtnRef}
          className="sm-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="staggered-menu-panel"
          onClick={toggleMenu}
          type="button"
        >
          <span ref={iconRef} className="sm-icon" aria-hidden="true">
            <span className="sm-icon-line" />
            <span className="sm-icon-line sm-icon-line-v" />
          </span>
        </button>
      </header>

      <aside id="staggered-menu-panel" ref={panelRef} className="staggered-menu-panel" aria-hidden={!open}>
        <div className="sm-panel-top">
          <div className="sm-brand">
            <div>
              <p className="sm-brand-title">
                {highlightSnap ? (
                  <>
                    <span>Snap</span>
                    {brandTitle.slice(4)}
                  </>
                ) : (
                    brandTitle
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="sm-panel-inner">
          <p className="sm-section-title">Navigation</p>
          <ul className="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
            {navItems.map((item) => (
              <Row key={`${item.label}-${item.link}`} item={item} isActive={isRouteActive(item.link)} onClick={closeMenu} />
            ))}
          </ul>

          {quickActionItems.length > 0 ? (
            <>
              <p className="sm-section-title sm-section-title-spaced">Quick Actions</p>
              <ul className="sm-panel-list" role="list">
                {quickActionItems.map((item) => (
                  <Row key={`${item.label}-${item.link}`} item={item} isActive={isRouteActive(item.link)} onClick={closeMenu} />
                ))}
              </ul>
            </>
          ) : null}

          {displaySocials && socialItems.length > 0 && (
            <div className="sm-socials" aria-label="Social links">
              <h3 className="sm-socials-title">Socials</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((s, i) => (
                  <li key={`${s.label}-${i}`} className="sm-socials-item">
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="sm-socials-link">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {panelFooter ? <div className="sm-panel-footer">{panelFooter}</div> : null}
        </div>
      </aside>
    </div>
  )
}

export function AnimatedMenuIcon({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <div className="w-6 h-5 relative flex flex-col justify-between">
        <span
          className="w-full h-0.5 bg-gray-800 rounded-full block transition-transform duration-300 ease-in-out"
          style={{ transform: isOpen ? "translateY(9px) rotate(45deg)" : "translateY(0) rotate(0deg)" }}
        />
        <span
          className="w-full h-0.5 bg-gray-800 rounded-full block transition-all duration-200"
          style={{ opacity: isOpen ? 0 : 1, transform: isOpen ? "scaleX(0)" : "scaleX(1)" }}
        />
        <span
          className="w-full h-0.5 bg-gray-800 rounded-full block transition-transform duration-300 ease-in-out"
          style={{ transform: isOpen ? "translateY(-9px) rotate(-45deg)" : "translateY(0) rotate(0deg)" }}
        />
      </div>
    </button>
  )
}

export { StaggeredMenu }
export default StaggeredMenu
