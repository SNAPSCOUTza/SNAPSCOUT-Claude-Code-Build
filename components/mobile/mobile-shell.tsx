"use client"

import type { ComponentType, ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Briefcase,
  Building2,
  CalendarDays,
  Camera,
  CircleUserRound,
  Compass,
  Bell,
  Heart,
  Home,
  FileText,
  Megaphone,
  MessageCircle,
  Users,
  FolderKanban,
  MapPin,
  ShieldCheck,
} from "lucide-react"
import { motion } from "framer-motion"
import { InteractiveMenu, type InteractiveMenuItem } from "@/components/ui/modern-mobile-menu"
import StaggeredMenu, { type StaggeredMenuItem } from "@/components/ui/staggered-menu"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { MOCK_BRAD_USER_ID, loadMockMessagingState } from "@/lib/mock-data/messaging-test-data"
import { loadMockHireRequests } from "@/lib/mock-data/hire-request-data"

type MobileShellProps = {
  title: string
  rightAction?: ReactNode
  children: ReactNode
  hideBottomNav?: boolean
  disableBottomNavAutoHide?: boolean
  lockToViewport?: boolean
}

type NavItem = {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
}

const bottomNavItems: NavItem[] = [
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Bookings", href: "/dashboard", icon: CalendarDays },
  { label: "Hire", href: "/find-crew", icon: Briefcase },
  { label: "Messages", href: "/messages", icon: MessageCircle },
  { label: "Profile", href: "/dashboard", icon: CircleUserRound },
]

const baseQuickMenuItems: StaggeredMenuItem[] = [
  { label: "Notifications", link: "/notifications", ariaLabel: "Open notifications", icon: Bell },
  { label: "Hire Requests", link: "/hire-requests", ariaLabel: "Open hire requests", icon: CalendarDays },
  { label: "Community", link: "/community", ariaLabel: "Open community page", icon: Compass },
  { label: "Messages", link: "/messages", ariaLabel: "Open messages", icon: MessageCircle },
  { label: "Saved Profiles", link: "/saved-profiles", ariaLabel: "Open saved profiles", icon: Heart },
]

const NOTIFICATIONS_READ_STORAGE_KEY = "snapscout_notifications_read_v1"

function loadNotificationReadState() {
  if (typeof window === "undefined") return {}

  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_READ_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export default function MobileShell({
  title,
  rightAction,
  children,
  hideBottomNav = false,
  disableBottomNavAutoHide = false,
  lockToViewport = false,
}: MobileShellProps) {
  const pathname = usePathname()
  const { user, profile } = useAuth()
  const [crewPoolCount, setCrewPoolCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(0)
  const accountType = (profile?.account_type || profile?.user_type || "").toLowerCase()
  const isScout = accountType === "scout"
  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin"
  const gigsHref = "/marketplace/available-gigs"
  const menuItems = useMemo<StaggeredMenuItem[]>(
    () => [
      { label: "Home", link: "/explore", ariaLabel: "Go to home page", icon: Home },
      ...(isAdmin
        ? [
            { label: "Admin Console", link: "/admin", ariaLabel: "Open admin console", icon: ShieldCheck },
            { label: "Sponsored Ads", link: "/admin/ads", ariaLabel: "Edit sponsored ads", icon: Megaphone },
            { label: "Blog Posts", link: "/admin/articles", ariaLabel: "Edit blog posts and tutorials", icon: FileText },
            { label: "Events", link: "/admin/events", ariaLabel: "Edit event dates and updates", icon: CalendarDays },
            { label: "Community News", link: "/admin/articles", ariaLabel: "Edit community news", icon: Compass },
            { label: "Site Content", link: "/admin/homepage-content", ariaLabel: "Edit site and community content", icon: Home },
          ]
        : []),
      { label: "Find Crew", link: "/find-crew", ariaLabel: "Find crew members", icon: Users },
      { label: "Creators", link: "/creators", ariaLabel: "Browse creators", icon: Camera },
      { label: "Studios", link: "/studios-stores", ariaLabel: "Browse studios and stores", icon: Building2 },
      ...(isScout
        ? []
        : [{ label: "Locations", link: "/locations", ariaLabel: "Browse shoot locations", icon: MapPin }]),
      { label: "Gigs", link: gigsHref, ariaLabel: "Open SnapScout gigs", icon: Briefcase },
    ],
    [isScout, isAdmin, gigsHref],
  )

  useEffect(() => {
    if (!user) {
      setCrewPoolCount(0)
      return
    }

    let active = true
    fetch("/api/crew-pools", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (active) setCrewPoolCount(Array.isArray(payload?.pools) ? payload.pools.length : 0)
      })
      .catch(() => {
        if (active) setCrewPoolCount(0)
      })

    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    const resolveNotificationCount = () => {
      const activeProfileId = profile?.user_id || user?.id || MOCK_BRAD_USER_ID
      const messagingState = loadMockMessagingState()
      const requests = loadMockHireRequests()
      const readState = loadNotificationReadState()
      const profileIds = new Set(messagingState.profiles.map((entry) => entry.user_id))

      if (!profileIds.has(activeProfileId)) {
        setNotificationCount(0)
        return
      }

      let unread = 0

      messagingState.conversations
        .filter((conversation) => conversation.participant_ids.includes(activeProfileId))
        .forEach((conversation) => {
          const incoming = [...conversation.messages]
            .reverse()
            .find((message) => message.sender_id !== activeProfileId)

          if (incoming && !readState[`msg-${conversation.id}-${incoming.id}`]) {
            unread += 1
          }
        })

      requests.forEach((request) => {
        if (request.recipient_id === activeProfileId && !readState[`booking-in-${request.id}`]) unread += 1
        if (request.requester_id === activeProfileId && !readState[`booking-out-${request.id}`]) unread += 1
      })

      setNotificationCount(unread)
    }

    resolveNotificationCount()
    window.addEventListener("storage", resolveNotificationCount)

    return () => {
      window.removeEventListener("storage", resolveNotificationCount)
    }
  }, [profile?.user_id, user?.id])

  useEffect(() => {
    if (typeof document === "undefined") return

    const root = document.documentElement
    const clearStaleHireSheetFlag = () => {
      const isHireSheetOpen = Boolean(document.querySelector('[data-hire-request-sheet-open="true"]'))
      if (!isHireSheetOpen) {
        delete root.dataset.hireSheetOpen
      }
    }

    clearStaleHireSheetFlag()

    const observer = new MutationObserver(clearStaleHireSheetFlag)
    observer.observe(document.body ?? document.documentElement, {
      attributes: true,
      attributeFilter: ["data-hire-request-sheet-open"],
      childList: true,
      subtree: true,
    })

    const staleFlagCheck = window.setTimeout(clearStaleHireSheetFlag, 360)

    return () => {
      observer.disconnect()
      window.clearTimeout(staleFlagCheck)
    }
  }, [pathname])

  const quickMenuItems = useMemo(
    () =>
      user
        ? [
            {
              label: "Crew Pools",
              link: "/crew-pools",
              ariaLabel: "Open crew pools",
              icon: FolderKanban,
              badgeCount: crewPoolCount,
            },
            ...baseQuickMenuItems,
          ]
        : baseQuickMenuItems,
    [crewPoolCount, user],
  )

  const interactiveNavItems = useMemo<InteractiveMenuItem[]>(
    () =>
      bottomNavItems.map((item) => ({
        label: item.label,
        icon: item.icon,
        href: item.href,
        badgeCount: item.href === "/messages" ? notificationCount : undefined,
      })),
    [notificationCount],
  )

  const activeBottomHref = useMemo(() => {
    if (pathname.startsWith("/find-crew") || pathname.startsWith("/creators") || pathname.startsWith("/crew/")) {
      return "/find-crew"
    }
    if (pathname.startsWith("/notifications")) return "/messages"
    if (pathname.startsWith("/messages")) return "/messages"
    if (pathname.startsWith("/profile") || pathname.startsWith("/dashboard")) return "/dashboard"
    return "/explore"
  }, [pathname])

  return (
      <div
        className={
          lockToViewport
            ? "flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden bg-white text-[#0b0b0d]"
            : "flex min-h-[100dvh] flex-col bg-white text-[#0b0b0d]"
        }
      >
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: "easeOut", delay: 0.04 }}
        className="fixed inset-x-0 top-0 z-40 border-b border-[#edf1f7] bg-white/98 px-1.5 pt-[max(6px,env(safe-area-inset-top))] pb-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur supports-[backdrop-filter]:bg-white/90"
      >
        <div className="mt-1 grid grid-cols-[49px_1fr_49px] items-center">
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link
              href="/explore"
              aria-label="SnapScout home"
              className="ml-[15px] grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-[#d9dfeb] bg-[#f8fbff]"
            >
              <Image
                src="/images/snapscout-studio-add-logo.png"
                alt="SnapScout"
                width={56}
                height={56}
                className="h-full w-full scale-[1.75] rounded-full object-cover object-center"
              />
            </Link>
          </motion.div>
          <h1 className="text-center text-[17px] font-semibold">{title}</h1>
          <div className="h-11 w-11" aria-hidden="true" />
        </div>
      </motion.div>

      <div
        className={
          hideBottomNav
            ? "flex h-full min-h-0 flex-1 flex-col overflow-hidden w-full px-1.5 pb-0 pt-[calc(74px+env(safe-area-inset-top))]"
            : "flex min-h-0 flex-1 flex-col w-full px-1.5 pb-[calc(108px+env(safe-area-inset-bottom))] pt-[calc(74px+env(safe-area-inset-top))]"
        }
      >
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut", delay: 0.08 }}
          className={cn(
            "flex min-h-0 flex-1 flex-col [&_button]:transition-transform [&_button]:duration-150 [&_button:active]:scale-[0.97]",
            hideBottomNav ? "mt-4 h-full" : "mt-6",
          )}
        >
          <div className="flex h-full min-h-0 flex-1 flex-col [&_a]:transition-transform [&_a]:duration-150 [&_a:active]:scale-[0.98]">
            {children}
          </div>
        </motion.div>
      </div>

      {!hideBottomNav ? (
        <motion.nav
          initial={false}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="mobile-bottom-nav pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 sm:px-6"
        >
          <div className="pointer-events-auto mx-auto w-full max-w-[520px] rounded-[32px] border border-[#dde6f1] bg-white/95 p-1 shadow-[0_18px_42px_rgba(15,23,42,0.14)] backdrop-blur-xl">
            <InteractiveMenu items={interactiveNavItems} activeHref={activeBottomHref} accentColor="#f20d14" />
          </div>
        </motion.nav>
      ) : null}

      <StaggeredMenu
        className="md:hidden"
        isFixed
        position="right"
        items={menuItems}
        quickItems={quickMenuItems}
        displaySocials={false}
        displayItemNumbering={false}
        menuButtonColor="#f20d14"
        openMenuButtonColor="#6b7280"
        changeMenuColorOnOpen
        colors={["#f3f6fb", "#ffffff"]}
        accentColor="#f20d14"
        showBackdrop={false}
        topOffset="calc(env(safe-area-inset-top) + 10px)"
        panelFooter={rightAction}
      />
    </div>
  )
}
