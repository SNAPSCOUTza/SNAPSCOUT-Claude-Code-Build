"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { OnboardingQuestion } from "@/types/onboarding"
import { ChipSelect } from "@/components/onboarding/ChipSelect"
import { OnboardingOptionIcon } from "@/components/onboarding/OnboardingOptionIcon"

interface QuestionScreenProps {
  question: OnboardingQuestion
  value: string | string[] | undefined
  onChange: (value: string | string[]) => void
  onContinue: () => void
  onBack: () => void
  canContinue: boolean
  primaryButtonClass: string
  roleSelectionClass: string
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] } },
}

export function QuestionScreen({
  question,
  value,
  onChange,
  onContinue,
  onBack,
  canContinue,
  roleSelectionClass,
}: QuestionScreenProps) {
  const isMulti = question.mode === "multi"
  const selectedSingle = typeof value === "string" ? value : ""
  const selectedMulti = Array.isArray(value) ? value : []

  return (
    <motion.section {...fadeUp} className="flex min-h-[calc(100svh-118px)] flex-col">
      <div className="rounded-[30px] border border-[#e0e6ef] bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#dce3ee] text-[#111318]"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff111b]">
          {question.mode === "multi" ? "Pick all that fit" : "Choose one"}
        </p>
        <h2 className="mt-2 text-[32px] font-black leading-[1.02] tracking-tight">{question.prompt}</h2>
      </div>

      <div className="mt-4 flex min-h-[340px] flex-1 flex-col rounded-[30px] border border-[#e0e6ef] bg-white p-4 shadow-sm">
        {question.layout === "chips" ? (
          <ChipSelect
            options={question.options}
            values={selectedMulti}
            onChange={(next) => onChange(next)}
            roleSelectionClass={roleSelectionClass}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option, index) => {
              const selected = isMulti ? selectedMulti.includes(option.value) : selectedSingle === option.value
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.055, duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => {
                    if (isMulti) {
                      const next = selectedMulti.includes(option.value)
                        ? selectedMulti.filter((item) => item !== option.value)
                        : [...selectedMulti, option.value]
                      onChange(next)
                      return
                    }
                    onChange(option.value)
                  }}
                  className={`relative flex h-[76px] w-full items-center rounded-full border px-4 py-3 text-left transition-all duration-200 active:scale-[0.985] ${
                    selected
                      ? "border-[#ff111b] bg-[#fff1f2] shadow-[0_14px_28px_rgba(255,17,27,0.1)]"
                      : "border-[#dce3ee] bg-[#f8fafc]"
                  }`}
                >
                  <OnboardingOptionIcon label={option.label} selected={selected} />
                  <span className="min-w-0 flex-1 pr-8">
                    <span className="block truncate text-[15px] font-extrabold leading-none text-[#111318]">
                      {option.label}
                    </span>
                    {option.description ? <span className="mt-1 block text-[12px] leading-4 text-[#667085]">{option.description}</span> : null}
                  </span>
                  {selected ? (
                    <span className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#ff111b] text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ) : null}
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 -mx-4 mt-auto border-t border-[#e8edf4] bg-[#f5f2ee]/95 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 backdrop-blur">
        <Button
          className="h-14 w-full rounded-full bg-[#ff111b] text-[16px] font-extrabold text-white shadow-[0_18px_36px_rgba(255,17,27,0.22)] hover:bg-[#e60012]"
          disabled={!canContinue}
          onClick={onContinue}
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.section>
  )
}
