"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Clapperboard, Store, Video, Warehouse } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { OnboardingBranch, OnboardingRole } from "@/types/onboarding"
import { branchOptions } from "@/lib/onboarding-config"

interface BranchSelectProps {
  role: Exclude<OnboardingRole, "scout">
  onSelect: (branch: OnboardingBranch) => void
  onBack: () => void
}

const branchIcons: Record<OnboardingBranch, typeof Video> = {
  content_creator: Video,
  film_crew: Clapperboard,
  studio: Warehouse,
  store: Store,
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } },
}

export function BranchSelect({ role, onSelect, onBack }: BranchSelectProps) {
  const options = branchOptions[role]

  return (
    <motion.section {...fadeUp}>
      <div className="mb-5 rounded-[30px] border border-[#e0e6ef] bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#dce3ee] text-[#111318]"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff111b]">Your offer</p>
        <h2 className="mt-2 text-[34px] font-black leading-none tracking-tight">What do you want people to book?</h2>
        <p className="mt-3 max-w-[330px] text-[16px] leading-6 text-[#667085]">
          This helps us shape your profile, rates, and discovery feed.
        </p>
      </div>

      <div className="grid gap-3">
        {options.map((option) => {
          const Icon = branchIcons[option.id]
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className="group flex min-h-[96px] items-center gap-4 rounded-[28px] border border-[#dce3ee] bg-white p-4 text-left shadow-sm transition-all duration-200 active:scale-[0.99]"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f3f6fa] text-[#111318] group-hover:bg-[#ff111b] group-hover:text-white">
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[20px] font-black leading-tight">{option.title}</span>
                <span className="mt-1 block text-[14px] leading-5 text-[#667085]">{option.subtitle}</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-[#98a2b3] group-hover:translate-x-1 group-hover:text-[#ff111b]" />
            </button>
          )
        })}
      </div>

      <Button variant="ghost" className="mt-4 h-12 w-full rounded-full text-[#667085]" onClick={onBack}>
        Back
      </Button>
    </motion.section>
  )
}
