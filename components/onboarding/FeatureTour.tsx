"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { featureTourSteps } from "@/lib/onboarding-config"

interface FeatureTourProps {
  step: number
  onNext: () => void
  onSkip: () => void
}

const fadeUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } }

export function FeatureTour({ step, onNext, onSkip }: FeatureTourProps) {
  const item = featureTourSteps[step] || featureTourSteps[0]
  const isLast = step >= featureTourSteps.length - 1

  return (
    <motion.div {...fadeUp}>
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle>Quick tour</CardTitle>
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
