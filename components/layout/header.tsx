"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  LogOut,
  User,
  Users,
  Camera,
  Building2,
  Briefcase,
  Search,
  Home,
  X,
  MessageCircle,
  Heart,
  Bell,
  FolderKanban,
  Compass,
  MapPin,
  MoreHorizontal,
  CalendarDays,
  ShieldCheck,
  Megaphone,
  FileText,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { NavBar } from "@/components/ui/tubelight-navbar"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { HeaderToolbar } from "@/components/ui/header-toolbar"
import { StaggeredMenu, AnimatedMenuIcon } from "@/components/ui/staggered-menu"

export default function Header() {
  const { user, profile, isLoading, signOut: handleAuthSignOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [crewPoolCount, setCrewPoolCount] = useState(0)
  const router = useRouter()
  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin"
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(88)

  useEffect(() => {
    if (!isMoreMenuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMoreMenuOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isMoreMenuOpen])

  useEffect(() => {
    // The "More" panel is fixed-positioned, so it needs the header's real
    // rendered height (not a guessed Tailwind top-N class) to sit flush
    // below it instead of overlapping the toolbar row.
    const measure = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight)
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

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

  const handleSignOut = async () => {
    try {
      await handleAuthSignOut()
      setIsMobileMenuOpen(false)
      // Hard navigation, not router.push - see the matching comment in
      // app/dashboard/page.tsx's handleSignOut for why.
      window.location.href = "/"
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const getNavigationItems = () => {
    const accountType = profile?.account_type

    if (accountType === "film_crew") {
      return [
        { name: "Find Crew", url: "/find-crew", icon: Users },
        { name: "Creators", url: "/creators", icon: Camera },
        { name: "Studios", url: "/studios-stores", icon: Building2 },
        { name: "Locations", url: "/locations", icon: MapPin },
        { name: "Gigs", url: "/marketplace/available-gigs", icon: Briefcase },
      ]
    } else if (accountType === "content_creator") {
      return [
        { name: "Creators", url: "/creators", icon: Camera },
        { name: "Find Crew", url: "/find-crew", icon: Users },
        { name: "Studios", url: "/studios-stores", icon: Building2 },
        { name: "Locations", url: "/locations", icon: MapPin },
        { name: "Gigs", url: "/marketplace/available-gigs", icon: Briefcase },
      ]
    } else if (accountType === "studio") {
      return [
        { name: "Find Crew", url: "/find-crew", icon: Users },
        { name: "Creators", url: "/creators", icon: Camera },
        { name: "Studios", url: "/studios-stores", icon: Building2 },
        { name: "Locations", url: "/locations", icon: MapPin },
        { name: "Gigs", url: "/marketplace/available-gigs", icon: Briefcase },
      ]
    } else if (accountType === "store") {
      return [
        { name: "Creators", url: "/creators", icon: Camera },
        { name: "Studios", url: "/studios-stores", icon: Building2 },
        { name: "Locations", url: "/locations", icon: MapPin },
        { name: "Gigs", url: "/marketplace/available-gigs", icon: Briefcase },
        { name: "Projects", url: "/marketplace/my-projects", icon: Search },
      ]
    } else if (accountType === "scout") {
      return [
        { name: "Talent", url: "/find-crew", icon: Users },
        { name: "Creators", url: "/creators", icon: Camera },
        { name: "Studios", url: "/studios-stores", icon: Building2 },
        { name: "Gigs", url: "/marketplace/available-gigs", icon: Briefcase },
        { name: "Database", url: "/marketplace/talent-database", icon: Search },
      ]
    } else {
      return [
        { name: "Home", url: "/", icon: Home },
        { name: "Find Crew", url: "/find-crew", icon: Users },
        { name: "Creators", url: "/creators", icon: Camera },
        { name: "Studios", url: "/studios-stores", icon: Building2 },
        { name: "Locations", url: "/locations", icon: MapPin },
        { name: "Gigs", url: "/marketplace/available-gigs", icon: Briefcase },
      ]
    }
  }

  const getAccountTypeLabel = () => {
    const accountType = profile?.account_type
    switch (accountType) {
      case "film_crew":
        return "Film Crew Pro"
      case "content_creator":
        return "Creator Pro"
      case "studio":
        return "Studio Client"
      case "store":
        return "Brand Client"
      case "scout":
        return "Scout Client"
      default:
        return "Join as Pro"
    }
  }

  const getDashboardLink = () => {
    const accountType = profile?.account_type
    if (accountType === "studio" || accountType === "store" || accountType === "scout") {
      return "/client-dashboard"
    }
    return "/dashboard"
  }

  if (isLoading) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center space-x-4 animate-pulse">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  const navigationItems = getNavigationItems()

  const toolbarItems = user
    ? [
        { label: "Alerts", icon: Bell, href: "/notifications", hasNotification: true, notificationCount: 2 },
        { label: "Messages", icon: MessageCircle, href: "/messages" },
        { label: "Saved", icon: Heart, href: "/saved-profiles" },
        { label: "Dashboard", icon: User, href: getDashboardLink() },
        { label: "More", icon: MoreHorizontal, onClick: () => setIsMoreMenuOpen((value) => !value) },
        { label: "Sign Out", icon: LogOut, onClick: handleSignOut },
      ]
    : []

  // Desktop has no room for the full mobile bottom nav + hamburger menu, so
  // this fills the gap with the items that only exist there today (see
  // components/mobile/mobile-shell.tsx's menuItems/quickMenuItems). Find
  // Crew/Creators/Studios/Locations/Gigs are already in the center NavBar,
  // and Notifications/Messages/Saved/Dashboard are already in the toolbar
  // above, so neither set is repeated here.
  const moreMenuItems = user
    ? [
        { name: "Crew Pools", url: "/crew-pools", icon: FolderKanban, badgeCount: crewPoolCount },
        { name: "Community", url: "/community", icon: Compass },
        { name: "Hire Requests", url: "/hire-requests", icon: CalendarDays },
        ...(isAdmin
          ? [
              { name: "Admin Console", url: "/admin", icon: ShieldCheck },
              { name: "Sponsored Ads", url: "/admin/ads", icon: Megaphone },
              { name: "Blog Posts", url: "/admin/articles", icon: FileText },
              { name: "Events", url: "/admin/events", icon: CalendarDays },
              { name: "Site Content", url: "/admin/homepage-content", icon: Home },
            ]
          : []),
      ]
    : []

  const actionItems = user
    ? [
        { name: "Crew Pools", url: "/crew-pools", icon: FolderKanban, badgeCount: crewPoolCount },
        { name: "Community", url: "/community", icon: Compass },
        { name: "Messages", url: "/messages", icon: MessageCircle },
        { name: "Saved Profiles", url: "/saved-profiles", icon: Heart },
        { name: "Dashboard", url: getDashboardLink(), icon: User },
      ]
    : []

  return (
    <div className="hidden md:block">
      <header ref={headerRef} className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 py-[7px] my-3">
            {/* Desktop Logo */}
            <Link href="/" className="hidden md:flex items-center space-x-1.5 py-[13px] leading-9">
              <div className="relative leading-10">
                <Image
                  src="/images/snapscout-studio-add-logo.png"
                  alt="SnapScout Logo"
                  width={60}
                  height={60}
                  className="rounded-full"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  <span className="text-red-600">Snap</span>Scout
                </h1>
                <p className="text-xs text-gray-500 -mt-0.5">Your Local Companion</p>
              </div>
            </Link>

            {/* Mobile Logo and Menu */}
            <div className="md:hidden flex items-center justify-between w-full">
              <Link 
                href="/" 
                className={`flex items-center space-x-2 transition-opacity duration-300 ${
                  isMobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <Image
                  src="/images/snapscout-studio-add-logo.png"
                  alt="SnapScout Logo"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <div>
                  <h1 className="text-base font-bold text-gray-900">
                    <span className="text-red-600">Snap</span>Scout
                  </h1>
                  <p className="text-xs text-gray-500 -mt-0.5">Your Local Companion</p>
                </div>
              </Link>
              <AnimatedMenuIcon isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
            </div>

            <div className="hidden md:flex items-center justify-center flex-1 px-8">
              <div className="mt-1.5">
                <NavBar items={navigationItems} />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <HeaderToolbar items={toolbarItems} defaultActiveIndex={3} />
              ) : (
                <div className="flex items-center space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild className="bg-red-700 hover:bg-red-800 text-white">
                    <Link href="/onboarding">
                      <User className="w-4 h-4 mr-2" />
                      {getAccountTypeLabel()}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMoreMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 hidden bg-black/40 backdrop-blur-sm md:block"
              onClick={() => setIsMoreMenuOpen(false)}
            />
            <motion.div
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ top: headerHeight }}
              className="fixed inset-x-0 z-50 hidden max-h-[50vh] overflow-y-auto border-b border-gray-200 bg-white shadow-2xl md:block"
            >
              <div className="container mx-auto px-4 py-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">More tools</p>
                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {moreMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.url}
                        onClick={() => setIsMoreMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-gray-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="font-medium">{item.name}</span>
                        {"badgeCount" in item && item.badgeCount > 0 && (
                          <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                            {item.badgeCount}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 md:hidden overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header with logo and close button */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between p-4 border-b border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", delay: 0.2 }}
                    >
                      <Image
                        src="/images/snapscout-studio-add-logo.png"
                        alt="SnapScout Logo"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </motion.div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        <span className="text-red-600">Snap</span>Scout
                      </h2>
                      <p className="text-xs text-gray-500">Your Local Companion</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </motion.button>
                </motion.div>

                {/* Navigation items with staggered animation */}
                <div className="flex-1 py-6 overflow-y-auto">
                  <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="px-8 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"
                  >
                    Navigation
                  </motion.p>
                  <StaggeredMenu
                    items={navigationItems}
                    isOpen={isMobileMenuOpen}
                    onItemClick={() => setIsMobileMenuOpen(false)}
                  />

                  {/* Action items section */}
                  {user && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="my-6 mx-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"
                      />
                      <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 }}
                        className="px-8 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"
                      >
                        Quick Actions
                      </motion.p>
                      <StaggeredMenu
                        items={actionItems}
                        isOpen={isMobileMenuOpen}
                        onItemClick={() => setIsMobileMenuOpen(false)}
                      />
                    </>
                  )}
                </div>

                {/* Bottom actions */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="border-t border-gray-100 p-4 space-y-3 bg-gray-50"
                >
                  {user ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-red-200 hover:text-red-600 transition-all font-medium shadow-sm"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </motion.button>
                  ) : (
                    <>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          href="/auth/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium shadow-sm"
                        >
                          Sign In
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          href="/onboarding"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 rounded-xl text-white hover:bg-red-700 transition-all font-medium shadow-sm"
                        >
                          <User className="w-5 h-5" />
                          <span>{getAccountTypeLabel()}</span>
                        </Link>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
