"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, CalendarDays, Heart, MessageCircle, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ahaCards } from "@/lib/onboarding-config"

interface AhaMomentProps {
  personaLine: string
  primaryButtonClass: string
  onContinue: () => void
  onBack: () => void
}

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.56, ease: [0.22, 1, 0.36, 1] } },
}

const profileImages: Record<string, string> = {
  a1: "/professional-headshot.png",
  a2: "/placeholder-user.jpg",
  a3: "/images/janelle-hiroshige-gfG_csFvelY-unsplash.jpg",
}

export function AhaMoment({ personaLine, onContinue, onBack }: AhaMomentProps) {
  return (
    <motion.section {...fadeUp} className="space-y-4">
      <div className="rounded-[32px] bg-[#111318] p-6 text-white shadow-[0_22px_70px_rgba(17,19,24,0.18)]">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff111b]">Preview ready</p>
        <h2 className="mt-2 text-[36px] font-black leading-none tracking-tight">Your first matches are taking shape.</h2>
        <p className="mt-4 max-w-[330px] text-[16px] leading-6 text-white/72">{personaLine}</p>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-[#e0e6ef] bg-white shadow-sm">
        <div className="border-b border-[#e8edf4] px-5 py-4">
          <p className="text-[13px] font-black uppercase tracking-[0.18em] text-[#98a2b3]">Matched for you</p>
        </div>
        <div className="grid gap-0">
          {ahaCards.slice(0, 3).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 border-b border-[#eef2f7] px-4 py-4 last:border-b-0"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#f5f2ee] ring-1 ring-[#e6ebf2]">
                <img
                  src={profileImages[item.id] || "/placeholder-user.jpg"}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="truncate text-[16px] font-black leading-tight">{item.name}</p>
                    <p className="mt-0.5 text-[13px] text-[#667085]">{item.subtitle}</p>
                  </div>
                  <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dce3ee]">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-[#ecfdf3] px-3 py-1 text-[11px] font-bold text-[#067647]">
                    {item.availability}
                  </span>
                  <span className="rounded-full bg-[#fff1f2] px-3 py-1 text-[11px] font-bold text-[#ff111b]">
                    {item.badge}
                  </span>
                </div>
                <p className="mt-2 text-[14px] font-extrabold">{item.rate}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: ShieldCheck, label: "Verified" },
          { icon: CalendarDays, label: "Bookable" },
          { icon: MessageCircle, label: "Message" },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-[22px] border border-[#e0e6ef] bg-white p-3 text-center shadow-sm">
              <Icon className="mx-auto h-5 w-5 text-[#ff111b]" />
              <p className="mt-2 text-[12px] font-extrabold text-[#344054]">{item.label}</p>
            </div>
          )
        })}
      </div>

      <div className="sticky bottom-0 -mx-4 border-t border-[#e8edf4] bg-[#f5f2ee]/95 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 backdrop-blur">
        <Button
          className="h-14 w-full rounded-full bg-[#ff111b] text-[16px] font-extrabold text-white shadow-[0_18px_36px_rgba(255,17,27,0.22)] hover:bg-[#e60012]"
          onClick={onContinue}
        >
          Create my account
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="mt-2 text-center text-[12px] font-medium text-[#667085]">No payment info needed to sign up</p>
      </div>
    </motion.section>
  )
}
