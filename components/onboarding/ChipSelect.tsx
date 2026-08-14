"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OnboardingOptionIcon } from "@/components/onboarding/OnboardingOptionIcon"
import type { QuestionOption } from "@/types/onboarding"

interface ChipSelectProps {
  options: QuestionOption[]
  values: string[]
  onChange: (next: string[]) => void
  roleSelectionClass: string
}

export function ChipSelect({ options, values, onChange }: ChipSelectProps) {
  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value))
      return
    }
    onChange([...values, value])
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {options.map((option, index) => {
        const selected = values.includes(option.value)
        return (
          <motion.div
            key={option.value}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.045, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => toggle(option.value)}
              className={`relative h-[76px] w-full justify-start rounded-full border px-4 py-3 text-left shadow-sm transition-all duration-200 active:scale-[0.98] ${
                selected
                  ? "border-[#ff111b] bg-[#fff1f2] text-[#111318] shadow-[0_12px_26px_rgba(255,17,27,0.1)]"
                  : "border-[#dce3ee] bg-[#f8fafc] text-[#344054] hover:border-[#ff111b]"
              }`}
              title={option.label}
            >
              <OnboardingOptionIcon label={option.label} selected={selected} />
              <span className="min-w-0 flex-1 truncate pr-8 text-[15px] font-extrabold leading-none text-[#111318]">
                {option.label}
              </span>
              {selected ? (
                <span className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#ff111b] text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
              ) : null}
            </Button>
          </motion.div>
        )
      })}
    </div>
  )
}
