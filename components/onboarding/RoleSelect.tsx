"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Building2, Camera, CheckCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { OnboardingRole } from "@/types/onboarding"
import type { OnboardingGoal } from "@/components/onboarding/GoalSelect"
import { roleCards } from "@/lib/onboarding-config"

interface RoleSelectProps {
  onSelect: (role: OnboardingRole) => void
  onBack: () => void
  selectedGoal: OnboardingGoal | null
}

const goalLabels: Record<OnboardingGoal, string> = {
  find_clients: "finding more clients",
  book_spaces: "booking spaces",
  hire_creatives: "hiring creatives",
  rent_gear: "renting gear",
  build_team: "building teams",
  grow_business: "growing your business",
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } },
}

export function RoleSelect({ onSelect, onBack, selectedGoal }: RoleSelectProps) {
  return (
    <motion.section {...fadeUp} className="w-full">
      <div className="mb-5 rounded-[30px] border border-[#e0e6ef] bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#dce3ee] text-[#111318]"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff111b]">Business context</p>
        <h1 className="mt-2 text-[34px] font-black leading-none tracking-tight">How should SnapScout see you?</h1>
        <p className="mt-3 max-w-[330px] text-[16px] leading-6 text-[#667085]">
          {selectedGoal
            ? `We will tune your setup around ${goalLabels[selectedGoal]}.`
            : "We will tune your setup around what you need most."}
        </p>
      </div>

      <div className="grid gap-3">
        {roleCards.map((role) => {
          const Icon = role.icon === "search" ? Search : role.icon === "camera" ? Camera : Building2
          return (
            <button
              key={role.role}
              type="button"
              onClick={() => onSelect(role.role)}
              className="group rounded-[28px] border border-[#dce3ee] bg-white p-4 text-left shadow-sm transition-all duration-200 active:scale-[0.99] md:p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f3f6fa] text-[#111318] transition-colors group-hover:bg-[#ff111b] group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[20px] font-black leading-tight text-[#111318]">{role.title}</p>
                    <span className="rounded-full bg-[#f5f2ee] px-3 py-1 text-[11px] font-extrabold text-[#475467]">
                      {role.badgeLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-[14px] leading-5 text-[#667085]">{role.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {role.features.slice(0, 2).map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-1 rounded-full border border-[#e0e6ef] bg-white px-3 py-1 text-[12px] font-semibold text-[#344054]"
                      >
                        <CheckCircle className="h-3.5 w-3.5 text-[#ff111b]" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="mt-4 h-5 w-5 shrink-0 text-[#98a2b3] transition-transform group-hover:translate-x-1 group-hover:text-[#ff111b]" />
              </div>
            </button>
          )
        })}
      </div>

      <Button variant="ghost" className="mt-4 h-12 w-full rounded-full text-[#667085]" onClick={onBack}>
        Change my goal
      </Button>
    </motion.section>
  )
}
