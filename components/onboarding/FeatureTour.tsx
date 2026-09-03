"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bookmark,
  Heart,
  MessageCircle,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { featureTourSteps } from "@/lib/onboarding-config"

interface FeatureTourProps {
  step: number
  onNext: () => void
  onSkip: () => void
}

// Miniature "screen inside a screen" frame that every step's live demo sits
// in - a small top bar (the real SnapScout mark + a screen title) so each
// demo reads as an actual app screen, not a floating card.
function MiniAppFrame({
  title,
  trailing,
  children,
}: {
  title: string
  trailing?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
      <div className="flex items-center justify-between border-b border-[#f1ede7] px-3 py-2.5">
        <div className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full border border-[#e7e0d6] bg-[#f8fbff]">
          <Image src="/images/snapscout-studio-add-logo.png" alt="" width={28} height={28} className="h-full w-full object-cover" />
        </div>
        <p className="text-[12px] font-bold text-[#111318]">{title}</p>
        {trailing || <div className="h-7 w-7 shrink-0" />}
      </div>
      {children}
    </div>
  )
}

const pulse = {
  animate: { scale: [1, 1.14, 1] },
  transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.6 },
}

// Static demo data - hoisted so it isn't reallocated on every render of the
// step that uses it.
const SHORTLIST_ROWS = [
  { name: "Naledi M.", role: "Photographer", from: "#e7ccc3", to: "#c9a08f" },
  { name: "Thabo K.", role: "Videographer", from: "#c7d6e8", to: "#93a9c4" },
]
const FILTER_CHIPS = ["All", "Studios", "Rooftops", "Warehouses"]

// Live, code-built miniature of the real Explore screen - hero line, real
// search bar, and a real featured-location card with the actual save/heart
// button, pulsing to draw the eye to the interaction being taught.
function SaveDemo() {
  return (
    <MiniAppFrame
      title="Explore"
      trailing={
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#fff0f0] text-[#f20d14]">
          <Plus className="h-3.5 w-3.5" />
        </div>
      }
    >
      <div className="p-3">
        <p className="text-[16px] font-black leading-[1.05] text-[#111318]">
          Find. Book. Shoot.
          <br />
          <span className="text-[#f20d14]">Done.</span>
        </p>
        <div className="mt-2.5 flex items-center gap-1.5 rounded-full bg-[#f5f7fb] px-3 py-2">
          <Search className="h-3 w-3 shrink-0 text-[#9aa0ab]" />
          <span className="text-[10px] text-[#9aa0ab]">Search locations...</span>
        </div>
        <div className="relative mt-2.5 overflow-hidden rounded-[16px]">
          <div className="h-24 w-full bg-gradient-to-br from-[#e7ccc3] via-[#d9b9ad] to-[#c9a08f]" />
          <motion.div
            animate={pulse.animate}
            transition={pulse.transition}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm"
          >
            <Heart className="h-3.5 w-3.5 fill-[#f20d14] text-[#f20d14]" />
          </motion.div>
          <div className="absolute inset-x-0 bottom-0 bg-white/95 px-2.5 py-1.5">
            <p className="text-[11px] font-bold leading-tight text-[#111318]">Urban Loft Studio</p>
            <p className="text-[9px] text-[#666b75]">Cape Town · R850/hr</p>
          </div>
        </div>
      </div>
    </MiniAppFrame>
  )
}

// Live miniature of the Saved screen - real profile rows with the same
// avatar/name/location layout used across the app.
function ShortlistDemo() {
  return (
    <MiniAppFrame title="Saved">
      <div className="space-y-2 p-3">
        {SHORTLIST_ROWS.map((row) => (
          <div key={row.name} className="flex items-center gap-2.5 rounded-2xl bg-[#f7f9fc] p-2">
            <div
              className="h-9 w-9 shrink-0 rounded-full"
              style={{ background: `linear-gradient(135deg, ${row.from}, ${row.to})` }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold text-[#111318]">{row.name}</p>
              <p className="truncate text-[9px] text-[#666b75]">Cape Town · {row.role}</p>
            </div>
            <Heart className="h-3.5 w-3.5 shrink-0 fill-[#f20d14] text-[#f20d14]" />
          </div>
        ))}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
          className="rounded-full bg-white px-3 py-2 text-center text-[10px] font-bold text-[#111318] shadow-sm"
        >
          12 saved profiles
        </motion.div>
      </div>
    </MiniAppFrame>
  )
}

// Live miniature of a profile screen - real name/rating header and the
// real round Message + Call buttons used on crew/creator detail pages.
function MessageDemo() {
  return (
    <MiniAppFrame title="Profile">
      <div className="p-3">
        <div className="flex items-center gap-2.5">
          <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-[#e7ccc3] to-[#c9a08f]" />
          <div className="min-w-0">
            <p className="truncate text-[12px] font-bold text-[#111318]">Naledi M.</p>
            <p className="flex items-center gap-1 text-[10px] text-[#666b75]">
              <Star className="h-2.5 w-2.5 fill-current text-[#111318]" />
              4.9 · Photographer
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#f20d14] text-[11px] font-semibold text-white"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Message
          </motion.div>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e6ebf3] bg-white">
            <Phone className="h-3.5 w-3.5 text-[#111318]" />
          </div>
        </div>
      </div>
    </MiniAppFrame>
  )
}

// Live miniature of the Explore filters - the real search bar, real
// category-chip row, and the real filter control, pulsing on the chips.
function FilterDemo() {
  return (
    <MiniAppFrame title="Explore">
      <div className="p-3">
        <div className="flex items-center gap-1.5 rounded-full bg-[#f5f7fb] px-3 py-2">
          <Search className="h-3 w-3 shrink-0 text-[#9aa0ab]" />
          <span className="text-[10px] text-[#9aa0ab]">Search locations...</span>
        </div>
        <motion.div
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
          className="no-scrollbar mt-2.5 flex gap-1.5 overflow-hidden"
        >
          {FILTER_CHIPS.map((chip, index) => (
            <span
              key={chip}
              className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${
                index === 0 ? "border-[#0d0f13] bg-[#0d0f13] text-white" : "border-[#e7e0d6] bg-white text-[#20232b]"
              }`}
            >
              {chip}
            </span>
          ))}
        </motion.div>
        <div className="mt-2.5 flex items-center gap-1.5 self-start rounded-full bg-[#fff0f0] px-3 py-2">
          <SlidersHorizontal className="h-3 w-3 shrink-0 text-[#f20d14]" />
          <span className="text-[10px] font-bold text-[#f20d14]">Rate · Availability · Craft</span>
        </div>
      </div>
    </MiniAppFrame>
  )
}

const demoComponents: Record<string, () => ReactNode> = {
  heart: SaveDemo,
  dashboard: ShortlistDemo,
  cta: MessageDemo,
  filters: FilterDemo,
}

const badgeIcons: Record<string, LucideIcon> = {
  heart: Heart,
  dashboard: Bookmark,
  cta: MessageCircle,
  filters: SlidersHorizontal,
}

export function FeatureTour({ step, onNext, onSkip }: FeatureTourProps) {
  const item = featureTourSteps[step] || featureTourSteps[0]
  const isLast = step >= featureTourSteps.length - 1
  const Demo = demoComponents[item.target] || demoComponents.heart
  const Badge = badgeIcons[item.target] || Heart

  return (
    <div className="flex min-h-[calc(100dvh-40px)] flex-col pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-center gap-1.5">
        {featureTourSteps.map((s, index) => (
          <span
            key={s.id}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === step ? "w-7 bg-[#f20d14]" : "w-1.5 bg-[#e4e8ef]"
            }`}
          />
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-[20px] font-black leading-none">
          <span className="text-[#ff111b]">Snap</span>Scout
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a94a6]">Onboarding</p>
      </div>

      <div className="mt-7 text-center">
        <h1 className="text-[32px] font-black leading-[1.05] tracking-[-0.02em] text-[#111318]">Quick tour</h1>
        <p className="mx-auto mt-2 max-w-[300px] text-[15px] leading-6 text-[#8a94a6]">
          We&apos;ll show you how SnapScout helps you find the perfect places to shoot.
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mt-7 rounded-[32px] bg-gradient-to-br from-[#fdeceb] to-[#fbe4de] p-4"
        >
          <Demo />
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex items-start justify-between gap-3 rounded-[24px] border border-[#f0e3e0] bg-[#fdf5f4] p-5">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-[#f20d14]">Step {step + 1}</p>
          <p className="mt-1 text-[19px] font-black leading-snug text-[#111318]">{item.title}</p>
          <p className="mt-1.5 text-[14px] leading-6 text-[#6b7280]">{item.text}</p>
        </div>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white shadow-sm">
          <Badge className="h-6 w-6 text-[#111318]" />
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Button
          onClick={onNext}
          className="h-14 w-full rounded-full bg-[#f20d14] text-[16px] font-bold text-white hover:bg-[#d9070d]"
        >
          {isLast ? "Take me to my dashboard" : "Got it"}
        </Button>
        <button
          type="button"
          onClick={onSkip}
          className="mt-3 w-full text-center text-[14px] font-semibold text-[#8a94a6] hover:text-[#111318]"
        >
          Skip tour
        </button>
        <div className="mx-auto mt-5 h-1 w-32 rounded-full bg-[#111318]/80" />
      </div>
    </div>
  )
}
