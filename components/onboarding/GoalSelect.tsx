"use client"

import { motion } from "framer-motion"
import { ArrowRight, BriefcaseBusiness, Camera, MapPin, MessageCircle, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export type OnboardingGoal =
  | "find_clients"
  | "book_spaces"
  | "hire_creatives"
  | "rent_gear"
  | "build_team"
  | "grow_business"

interface GoalSelectProps {
  value: OnboardingGoal | null
  onSelect: (goal: OnboardingGoal) => void
  onContinue: () => void
}

const goals: Array<{
  id: OnboardingGoal
  label: string
  detail: string
  icon: typeof Search
}> = [
  { id: "find_clients", label: "Find more clients", detail: "Get seen by people booking shoots.", icon: Camera },
  { id: "book_spaces", label: "Book creative spaces", detail: "Find studios, rooftops, and locations.", icon: MapPin },
  { id: "hire_creatives", label: "Hire creatives", detail: "Find photographers, crew, and specialists.", icon: Search },
  { id: "rent_gear", label: "Rent gear", detail: "Reach stores and kits near your shoot.", icon: BriefcaseBusiness },
  { id: "build_team", label: "Build a team", detail: "Pull the right people into one production.", icon: Users },
  { id: "grow_business", label: "Grow my business", detail: "Turn your profile into steady enquiries.", icon: MessageCircle },
]

const fade = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
}

export function GoalSelect({ value, onSelect, onContinue }: GoalSelectProps) {
  return (
    <motion.section {...fade} className="flex min-h-[calc(100svh-48px)] flex-col">
      <div className="rounded-[32px] bg-[#111318] px-6 pb-7 pt-8 text-white shadow-[0_22px_70px_rgba(17,19,24,0.18)]">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-white" />
            <span className="h-3 w-3 rounded-full bg-[#ff111b]" />
            <span className="h-3 w-3 rounded-full border-2 border-white" />
          </div>
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70">
            1 of 5
          </span>
        </div>

        <p className="text-xs font-black uppercase tracking-[0.26em] text-[#ff111b]">SnapScout setup</p>
        <h1 className="mt-3 text-[38px] font-black leading-[0.93] tracking-tight">
          What brings you to SnapScout?
        </h1>
        <p className="mt-4 max-w-[310px] text-[16px] leading-6 text-white/75">
          Choose the outcome you want first. We will shape the app around it.
        </p>
      </div>

      <div className="-mt-5 flex-1 rounded-t-[34px] border border-[#e3e7ef] bg-white px-4 pb-5 pt-6 shadow-[0_-14px_50px_rgba(15,23,42,0.08)]">
        <div className="grid gap-3">
          {goals.map((goal, index) => {
            const Icon = goal.icon
            const selected = goal.id === value
            return (
              <motion.button
                key={goal.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * index, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => onSelect(goal.id)}
                className={`flex min-h-[78px] items-center gap-4 rounded-[24px] border px-4 text-left transition-all duration-200 ${
                  selected
                    ? "border-[#ff111b] bg-[#fff1f2] shadow-[0_14px_30px_rgba(255,17,27,0.12)]"
                    : "border-[#dde4ef] bg-[#f8fafc] active:scale-[0.99]"
                }`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    selected ? "bg-[#ff111b] text-white" : "bg-white text-[#0f172a]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-extrabold leading-tight text-[#111318]">{goal.label}</span>
                  <span className="mt-1 block text-[13px] leading-5 text-[#667085]">{goal.detail}</span>
                </span>
              </motion.button>
            )
          })}
        </div>

        <Button
          disabled={!value}
          onClick={onContinue}
          className="mt-5 h-14 w-full rounded-full bg-[#ff111b] text-[16px] font-extrabold text-white shadow-[0_18px_36px_rgba(255,17,27,0.22)] hover:bg-[#e60012]"
        >
          Personalise my setup
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.section>
  )
}
