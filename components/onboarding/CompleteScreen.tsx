"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Camera, Search } from "lucide-react"
import type { OnboardingRole } from "@/types/onboarding"

interface CompleteScreenProps {
  role: OnboardingRole
  firstName: string
  topSpecialisations: string[]
  primaryButtonClass: string
  onDone: () => void
}

const fadeUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } }

export function CompleteScreen({ role, firstName, topSpecialisations, primaryButtonClass, onDone }: CompleteScreenProps) {
  const Icon = role === "scout" ? Search : role === "creator" ? Camera : Building2

  return (
    <motion.div {...fadeUp}>
      <Card className="border-2 border-gray-200">
        <CardContent className="space-y-5 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-200">
            <Icon className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-semibold">You&apos;re in, {firstName}.</h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge className="border border-red-200 bg-red-50 text-red-700">{role.replace("_", " ")}</Badge>
            {topSpecialisations.map((item) => (
              <Badge key={item} className="border border-red-200 bg-red-50 text-red-700">
                {item}
              </Badge>
            ))}
          </div>
          <Button className={`w-full ${primaryButtonClass}`} onClick={onDone}>
            Go to my dashboard
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
