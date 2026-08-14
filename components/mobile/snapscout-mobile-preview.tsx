"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Briefcase,
  Building2,
  CalendarDays,
  ChevronRight,
  Compass,
  Download,
  LogIn,
  MapPin,
  MoreHorizontal,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserPlus,
  Users,
  Warehouse,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import MobileShell from "@/components/mobile/mobile-shell"
import { useAuth } from "@/contexts/auth-context"
import { communitySuccessStories, regionalGroups, upcomingCommunityEvents } from "@/lib/community-data"
import { supabase } from "@/lib/supabase"

const featuredCards = [
  {
    title: "Urban Loft Studio",
    city: "Cape Town",
    price: "R850 /hr",
    href: "/studios-stores/1",
    image: "/images/photography-workspace.jpg",
  },
  {
    title: "City View Rooftop",
    city: "Johannesburg",
    price: "R950 /hr",
    href: "/studios-stores/2",
    image: "/images/camera-viewfinder.jpg",
  },
  {
    title: "Warehouse Space",
    city: "Durban",
    price: "R650 /hr",
    href: "/studios-stores/3",
    image: "/images/film-clapperboard.jpg",
  },
]

type FrontPageAd = {
  id: string
  brand: string
  label: string
  headline: string
  image: string
  href: string
}

const frontPageAds: FrontPageAd[] = [
  {
    id: "gearhouse",
    brand: "GearHouse CPT",
    label: "Camera store",
    headline: "RED kits, lenses, and lights ready today.",
    image: "/images/videography-camera.jpg",
    href: "/studios-stores",
  },
  {
    id: "loft-studio",
    brand: "Loft Studio",
    label: "Featured studio",
    headline: "Book a soft-light studio for your next shoot.",
    image: "/images/photography-workspace.jpg",
    href: "/studios-stores/1",
  },
  {
    id: "production-base",
    brand: "Production Base",
    label: "Location partner",
    headline: "Find crew-ready spaces with power and parking.",
    image: "/images/kyle-loftus-FtQE89f3EXA-unsplash.jpg",
    href: "/studios-stores",
  },
]

const previewVideoUrl = "https://www.youtube.com/watch?v=cpQKutRoglo"

const monthlyPlans = [
  {
    name: "Scout",
    price: "Free",
    detail: "Browse profiles, save favorites, and message creatives.",
  },
  {
    name: "Creators & Crew",
    price: "R129",
    detail: "Create a public profile, show rates, portfolio, availability, and reviews.",
  },
  {
    name: "Studios & Stores",
    price: "R489",
    detail: "List bookable spaces, gear, services, and manage high-intent leads.",
  },
]

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

type SnapScoutMobilePreviewProps = {
  entry?: "splash" | "explore"
}

export default function SnapScoutMobilePreview({ entry = "explore" }: SnapScoutMobilePreviewProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [splashState, setSplashState] = useState<"playing" | "done">(entry === "splash" ? "playing" : "done")
  const [splashMenuReady, setSplashMenuReady] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installMessage, setInstallMessage] = useState("")
  const [activeAdIndex, setActiveAdIndex] = useState(0)
  const [sponsoredAds, setSponsoredAds] = useState<FrontPageAd[]>([])
  const splashPlaying = splashState === "playing"
  const displayAds = sponsoredAds.length ? sponsoredAds : frontPageAds
  const activeAd = displayAds[activeAdIndex % displayAds.length]

  useEffect(() => {
    setSplashState(entry === "splash" ? "playing" : "done")
  }, [entry])

  useEffect(() => {
    if (!splashPlaying) {
      setSplashMenuReady(false)
      return
    }

    setSplashMenuReady(false)
    const timer = window.setTimeout(() => {
      setSplashMenuReady(true)
    }, 3500)

    return () => window.clearTimeout(timer)
  }, [splashPlaying])

  useEffect(() => {
    if (entry !== "splash") return
    if (typeof window === "undefined") return

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
      setInstallMessage("")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  }, [entry])

  useEffect(() => {
    if (entry !== "explore") return

    const timer = window.setInterval(() => {
      setActiveAdIndex((current) => (current + 1) % displayAds.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [displayAds.length, entry])

  useEffect(() => {
    if (entry !== "explore") return

    let active = true

    supabase
      .from("advertisements")
      .select("id,title,placement,image_url,target_url,description")
      .eq("active", true)
      .in("placement", ["explore", "home", "front_page"])
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!active || error || !Array.isArray(data)) return

        const nextAds = data
          .filter((ad) => ad.image_url)
          .map((ad) => ({
            id: String(ad.id),
            brand: ad.title || "SnapScout Partner",
            label: ad.placement ? String(ad.placement).replace(/_/g, " ") : "Sponsored",
            headline: ad.description || "A featured SnapScout partner placement.",
            image: ad.image_url,
            href: ad.target_url || "/studios-stores",
          }))

        if (nextAds.length) {
          setSponsoredAds(nextAds)
          setActiveAdIndex(0)
        }
      })

    return () => {
      active = false
    }
  }, [entry])

  const showGuestHero = !isLoading && !isAuthenticated

  const closeSplashTo = useCallback(
    (href: string) => {
      setSplashState("done")
      window.setTimeout(() => {
        router.push(href)
      }, 260)
    },
    [router]
  )

  const handleInstallApp = useCallback(async () => {
    if (installPrompt) {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      setInstallPrompt(null)
      setInstallMessage(
        choice.outcome === "accepted" ? "Install started. You can open SnapScout from your home screen." : "Install dismissed. You can try again from your browser menu."
      )
      return
    }

    const isAppleMobile =
      typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent)

    setInstallMessage(
      isAppleMobile
        ? "On iPhone, tap the Share button in Safari, then choose Add to Home Screen."
        : "Open your browser menu and choose Install app or Add to Home screen."
    )
  }, [installPrompt])

  const splashOverlay = (
    <motion.div
      key="mobile-splash"
      className="fixed inset-0 z-[220] overflow-hidden bg-[#f20d14]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.42, ease: "easeOut" },
      }}
    >
      <motion.div
        initial={{ clipPath: "circle(0% at 50% 22%)" }}
        animate={{
          clipPath: [
            "circle(0% at 50% 22%)",
            "circle(150% at 50% 22%)",
            "circle(140% at 50% 22%)",
          ],
        }}
        transition={{
          clipPath: {
            duration: 2.7,
            times: [0, 0.87, 1],
            ease: [
              [0.42, 0, 0.58, 1],
              [0.34, 1.56, 0.64, 1],
            ],
          },
        }}
        className="absolute inset-0 bg-[#fffaf6] will-change-[clip-path]"
      >
        <Image
          src="/images/snapscout-splash-illustration.png"
          alt="SnapScout mobile splash screen"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      <AnimatePresence>
        {!splashMenuReady && (
          <motion.div
            key="splash-loading-dots"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="absolute inset-x-0 bottom-0 z-10 px-6 pb-[calc(env(safe-area-inset-bottom)+24px)]"
          >
            <div className="flex h-[132px] items-center justify-center rounded-[32px] border border-[#efe4d7] bg-white/95 shadow-[0_24px_70px_rgba(16,24,40,0.18)] backdrop-blur-xl">
              <div className="flex items-center gap-2" aria-label="Loading">
                <motion.span
                  className="h-2.5 w-2.5 rounded-full bg-[#f20d14]"
                  animate={{ y: [0, -6, 0], opacity: [0.45, 1, 0.45] }}
                  transition={{ duration: 0.72, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                />
                <motion.span
                  className="h-2.5 w-2.5 rounded-full bg-[#f20d14]"
                  animate={{ y: [0, -6, 0], opacity: [0.45, 1, 0.45] }}
                  transition={{ duration: 0.72, delay: 0.12, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                />
                <motion.span
                  className="h-2.5 w-2.5 rounded-full bg-[#f20d14]"
                  animate={{ y: [0, -6, 0], opacity: [0.45, 1, 0.45] }}
                  transition={{ duration: 0.72, delay: 0.24, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 34, scale: 0.98 }}
        animate={splashMenuReady ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 34, scale: 0.98 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 bottom-0 z-10 px-6 pb-[calc(env(safe-area-inset-bottom)+24px)]"
      >
        <div className="rounded-[32px] border border-[#efe4d7] bg-white/95 p-4 shadow-[0_24px_70px_rgba(16,24,40,0.18)] backdrop-blur-xl">
          <motion.div
            className="mx-auto w-[299px] max-w-full overflow-hidden rounded-full"
            animate={
              splashMenuReady
                ? {
                    scale: [1, 1.02, 1],
                    boxShadow: [
                      "0 14px 28px rgba(242,13,20,0.24)",
                      "0 18px 34px rgba(242,13,20,0.34)",
                      "0 14px 28px rgba(242,13,20,0.24)",
                    ],
                  }
                : { scale: 1 }
            }
            transition={{ duration: 1.9, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
          >
            <Button
              onClick={() => closeSplashTo("/explore")}
              className="relative flex h-[55px] w-full items-center justify-center rounded-full bg-[#f20d14] px-6 text-[16px] font-semibold text-white hover:bg-[#d9070d]"
            >
              <span className="block w-full text-center">Get Started</span>
              <ChevronRight className="pointer-events-none absolute right-6 h-4.5 w-4.5" />
            </Button>
          </motion.div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleInstallApp}
              className="h-12 rounded-full border-[#111318] bg-white text-[14px] font-semibold text-[#111318]"
            >
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => closeSplashTo("/auth/login")}
              className="h-12 rounded-full border-[#111318] bg-white text-[14px] font-semibold text-[#111318]"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Button>
          </div>

          {installMessage && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-2xl bg-[#f8fafc] px-3 py-2 text-center text-[12px] leading-5 text-[#4d5663]"
            >
              {installMessage}
            </motion.p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )

  if (entry === "splash") {
    return (
      <div className="min-h-[100dvh] bg-white">
        <AnimatePresence>{splashPlaying && splashOverlay}</AnimatePresence>
      </div>
    )
  }

  return (
    <MobileShell title="Explore">
      <>
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.12 }}
          className="will-change-[opacity]"
        >
          <motion.section
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex min-h-[calc(100dvh-190px)] flex-col rounded-[34px] border border-[#ece4da] bg-white p-5 shadow-[0_22px_70px_rgba(0,0,0,0.08)]"
          >
            <h2 className="mt-[3px] mr-[2px] w-full max-w-full pt-[4px] pr-0 pb-[4px] pl-[2px] text-[34px] font-bold leading-[1.02] text-[#0b0b0d] [font-family:system-ui,sans-serif]">
              <span className="-ml-0.5 -mt-px block w-full whitespace-nowrap">Find. Book. Shoot.</span>
              <span className="block font-bold text-[#f20d14]">Done.</span>
            </h2>

            <motion.div whileTap={{ scale: 0.99 }}>
              <Link
                href="/studios-stores"
                className="mt-6 flex items-center gap-3 rounded-2xl border border-[#e7e0d6] bg-white px-4 py-3"
              >
                <Search className="h-4.5 w-4.5 text-[#6f6f73]" />
                <span className="text-[14px] text-[#6f6f73]">Search locations...</span>
                <span className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-[#e7e0d6]">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-[#0b0b0d]" />
                </span>
              </Link>
            </motion.div>

            <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
              {[
                { label: "All", icon: Compass, href: "/explore" },
                { label: "Studios", icon: Briefcase, href: "/studios-stores" },
                { label: "Rooftops", icon: Building2, href: "/studios-stores" },
                { label: "Warehouses", icon: Warehouse, href: "/studios-stores" },
                { label: "More", icon: MoreHorizontal, href: "/studios-stores" },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div key={item.label} whileTap={{ scale: 0.94 }}>
                    <Link
                      href={item.href}
                      className={`flex min-w-[78px] flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium ${
                        index === 0 ? "border-b-2 border-[#f20d14] text-[#0b0b0d]" : "text-[#34353a]"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[18px] font-semibold text-[#0b0b0d]">Featured Locations</h3>
                <Link href="/studios-stores" className="text-[13px] font-medium text-[#f20d14]">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {featuredCards.map((item) => (
                  <motion.div key={item.title} whileTap={{ scale: 0.97 }}>
                    <Link href={item.href}>
                      <div className="relative h-[142px] overflow-hidden rounded-[18px] border border-[#ece4da] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                      <p className="mt-2 text-[12px] font-semibold leading-tight text-[#0b0b0d]">{item.title}</p>
                      <p className="text-[11px] text-[#6f6f73]">{item.city}</p>
                      <p className="mt-0.5 text-[12px] font-semibold text-[#0b0b0d]">{item.price}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeAd.id}
                  initial={{ opacity: 0, y: 12, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.99 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={activeAd.href}
                    aria-label={`${activeAd.brand} advertisement`}
                    className="group relative block aspect-[20/7] w-full overflow-hidden rounded-[24px] border border-[#ece4da] bg-[#111318] shadow-[0_16px_36px_rgba(0,0,0,0.12)]"
                  >
                    <Image
                      src={activeAd.image}
                      alt={`${activeAd.brand} front page advertisement`}
                      fill
                      sizes="(max-width: 520px) 401px, 520px"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/32 to-black/5" />
                    <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/75">{activeAd.label}</p>
                        <p className="mt-1 text-[19px] font-black leading-none">{activeAd.brand}</p>
                      </div>
                      <div className="flex items-end justify-between gap-3">
                        <p className="max-w-[230px] text-[13px] font-semibold leading-5 text-white/90">{activeAd.headline}</p>
                        <span className="shrink-0 rounded-full bg-[#f20d14] px-3 py-1.5 text-[11px] font-black">
                          Sponsored
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>
              <div className="mt-2 flex justify-center gap-1.5">
                {displayAds.map((ad, index) => (
                  <span
                    key={ad.id}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === activeAdIndex ? "w-5 bg-[#f20d14]" : "w-1.5 bg-[#d7dde6]"
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6">
              <Button asChild className="h-14 w-full rounded-full bg-[#f20d14] text-[16px] font-semibold text-white hover:bg-[#d9070d]">
                <Link href="/studios-stores">
                  Find Your Location
                  <ChevronRight className="ml-1.5 h-4.5 w-4.5" />
                </Link>
              </Button>
            </div>
          </motion.section>
        </motion.div>

        <div className="mt-5 space-y-5 pb-3">
          {showGuestHero && (
            <motion.section
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="rounded-[30px] border border-[#e8e4de] bg-white p-5 shadow-[0_18px_44px_rgba(0,0,0,0.06)]"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#fff1f1] px-3 py-1.5 text-[12px] font-semibold text-[#f20d14]">
                <Sparkles className="h-3.5 w-3.5" />
                Join the creative network
              </div>
              <h2 className="text-[28px] font-black leading-[1.05] text-[#0b0b0d]">
                Connect with South Africa's creative community.
              </h2>
              <p className="mt-3 text-[14px] leading-6 text-[#4d5663]">
                Build a profile, share your real work, list your rates, and get discovered by clients looking for shoot-ready talent.
              </p>
              <div className="mt-5 grid gap-3">
                <Button asChild className="h-[52px] rounded-full bg-[#f20d14] text-[15px] font-semibold text-white hover:bg-[#d9070d]">
                  <Link href="/onboarding">
                    <UserPlus className="mr-2 h-4.5 w-4.5" />
                    Create Profile
                  </Link>
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="h-12 rounded-full border-[#e8e4de] bg-white text-[14px] font-semibold">
                    <Link href="/onboarding">Join SnapScout</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-12 rounded-full border-[#e8e4de] bg-white text-[14px] font-semibold">
                    <a href={previewVideoUrl} target="_blank" rel="noopener noreferrer">
                      <Play className="mr-1.5 h-4 w-4 fill-[#f20d14] text-[#f20d14]" />
                      Preview
                    </a>
                  </Button>
                </div>
              </div>
            </motion.section>
          )}

          <section className="rounded-[30px] border border-[#e8e4de] bg-white p-5 shadow-[0_18px_44px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#f20d14]">Community</p>
                <h2 className="mt-1 text-[22px] font-black leading-tight text-[#0b0b0d]">Stories, groups, and events</h2>
              </div>
              <Button asChild variant="ghost" className="h-9 rounded-full px-3 text-[#f20d14]">
                <Link href="/community">Open</Link>
              </Button>
            </div>

            <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
              {communitySuccessStories.slice(0, 2).map((story) => (
                <motion.article
                  key={story.name}
                  whileTap={{ scale: 0.98 }}
                  className="min-w-[248px] rounded-[22px] border border-[#e8edf5] bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-[#ffe7e7] text-[#f20d14]">
                      <Users className="h-5 w-5" />
                    </div>
                    <span className="flex items-center gap-1 text-[12px] font-semibold text-[#111318]">
                      <Star className="h-3.5 w-3.5 fill-[#f2a900] text-[#f2a900]" />
                      {story.rating}
                    </span>
                  </div>
                  <h3 className="mt-3 text-[16px] font-bold text-[#111318]">{story.name}</h3>
                  <p className="text-[12px] text-[#667085]">{story.role}</p>
                  <p className="mt-3 line-clamp-3 text-[13px] leading-5 text-[#4d5663]">"{story.quote}"</p>
                  <p className="mt-3 text-[12px] font-semibold text-[#111318]">{story.projects}</p>
                </motion.article>
              ))}
            </div>

            <div className="mt-4 rounded-[22px] border border-[#e8edf5] bg-[#f8fafc] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-bold text-[#111318]">Regional groups</p>
                <MapPin className="h-4 w-4 text-[#f20d14]" />
              </div>
              <div className="mt-3 grid gap-2">
                {regionalGroups.slice(0, 3).map((group) => (
                  <div key={group.province} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2">
                    <div>
                      <p className="text-[13px] font-semibold">{group.province}</p>
                      <p className="text-[11px] text-[#667085]">{group.city}</p>
                    </div>
                    <span className="rounded-full border border-[#e8edf5] px-2 py-1 text-[11px] text-[#4d5663]">{group.members}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[22px] border border-[#e8edf5] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#eaf1ff] text-[#3366ff]">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[15px] font-bold">{upcomingCommunityEvents[0].title}</p>
                  <p className="text-[12px] text-[#667085]">{upcomingCommunityEvents[0].date}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[12px] text-[#4d5663]">
                <span>{upcomingCommunityEvents[0].type}</span>
                <span>{upcomingCommunityEvents[0].attending}</span>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-[#e8e4de] bg-white p-5 shadow-[0_18px_44px_rgba(0,0,0,0.05)]">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#f20d14]">Simple monthly plans</p>
            <h2 className="mt-1 text-[22px] font-black leading-tight text-[#0b0b0d]">Choose what fits your workflow.</h2>
            <div className="mt-4 grid gap-3">
              {monthlyPlans.map((plan) => (
                <motion.div
                  key={plan.name}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-[22px] border border-[#e8edf5] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[16px] font-bold text-[#111318]">{plan.name}</p>
                      <p className="mt-1 text-[12px] leading-5 text-[#667085]">{plan.detail}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[24px] font-black text-[#111318]">{plan.price}</p>
                      {plan.price !== "Free" && <p className="text-[11px] text-[#667085]">/month</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <Button asChild className="mt-4 h-[52px] w-full rounded-full bg-[#f20d14] text-[15px] font-semibold text-white hover:bg-[#d9070d]">
              <Link href="/onboarding">Start with SnapScout</Link>
            </Button>
          </section>
        </div>

      </>
    </MobileShell>
  )
}
