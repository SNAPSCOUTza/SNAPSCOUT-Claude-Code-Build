"use client"

import { useState } from "react"
import RedPreloader from "@/components/ui/red-preloader"
import DesktopLanding from "@/components/desktop/desktop-landing"

export default function DesktopLandingWithPreloader() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <>
      {isLoading && <RedPreloader onComplete={() => setIsLoading(false)} />}
      <DesktopLanding />
    </>
  )
}
