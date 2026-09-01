"use client"

import { motion } from "framer-motion"

export type BillingCycle = "monthly" | "annual"

interface BillingCycleToggleProps {
  cycle: BillingCycle
  onChange: (cycle: BillingCycle) => void
  annualHint?: string
  className?: string
}

/** Modern segmented control with a sliding pill for choosing monthly vs annual billing. */
export function BillingCycleToggle({ cycle, onChange, annualHint, className = "" }: BillingCycleToggleProps) {
  return (
    <div
      className={`relative inline-flex w-[268px] items-center rounded-full border border-border bg-muted p-1 ${className}`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        className="absolute inset-y-1 w-1/2 rounded-full bg-white shadow-sm"
        style={{ left: cycle === "monthly" ? 4 : "50%", width: "calc(50% - 4px)" }}
      />

      <button
        type="button"
        onClick={() => onChange("monthly")}
        aria-pressed={cycle === "monthly"}
        className={`relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          cycle === "monthly" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Monthly
      </button>

      <button
        type="button"
        onClick={() => onChange("annual")}
        aria-pressed={cycle === "annual"}
        className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          cycle === "annual" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Annual
        {annualHint ? (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none transition-colors ${
              cycle === "annual" ? "bg-primary/15 text-primary" : "bg-black/5 text-muted-foreground"
            }`}
          >
            {annualHint}
          </span>
        ) : null}
      </button>
    </div>
  )
}
