"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Heart, LayoutDashboard, Send, SlidersHorizontal, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { featureTourSteps } from "@/lib/onboarding-config"

interface FeatureTourProps {
  step: number
  onNext: () => void
  onSkip: () => void
}

const fadeUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } }

const targetVisuals: Record<string, { icon: LucideIcon; gradient: string }> = {
  heart: { icon: Heart, gradient: "from-red-500 to-rose-600" },
  dashboard: { icon: LayoutDashboard, gradient: "from-orange-500 to-red-600" },
  cta: { icon: Send, gradient: "from-rose-500 to-red-700" },
  filters: { icon: SlidersHorizontal, gradient: "from-red-600 to-orange-500" },
}

export function FeatureTour({ step, onNext, onSkip }: FeatureTourProps) {
  const item = featureTourSteps[step] || featureTourSteps[0]
  const isLast = step >= featureTourSteps.length - 1
  const visual = targetVisuals[item.target] || targetVisuals.heart
  const Icon = visual.icon

  return (
    <motion.div {...fadeUp}>
      <Card className="overflow-hidden border-2 border-gray-200">
        <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${visual.gradient}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid h-20 w-20 place-items-center rounded-3xl bg-white/15 backdrop-blur-sm"
            >
              <Icon className="h-10 w-10 text-white" strokeWidth={1.75} />
            </motion.div>
          </AnimatePresence>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Quick tour
            <span className="flex gap-1.5">
              {featureTourSteps.map((s, index) => (
                <span
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all ${
                    index === step ? "w-5 bg-red-600" : "w-1.5 bg-gray-200"
                  }`}
                />
              ))}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border-2 border-dashed border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">Step {step + 1}</p>
            <p className="mt-1 text-base font-semibold">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.text}</p>
          </div>
          <Button className="w-full bg-red-700 text-white hover:bg-red-800" onClick={onNext}>
            {isLast ? "Take me to my dashboard" : "Got it"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onSkip}>
            Skip tour
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
