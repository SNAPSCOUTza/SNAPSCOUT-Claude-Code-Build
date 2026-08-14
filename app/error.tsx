"use client"

import { Button } from "@/components/ui/button"
import { SnapScoutStateArt } from "@/components/mobile/snapscout-state-art"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-white px-5 py-8">
      <SnapScoutStateArt variant="offline">
        <Button onClick={reset} className="h-12 rounded-full bg-[#f20d14] px-6 text-white hover:bg-[#d9070d]">
          Try again
        </Button>
      </SnapScoutStateArt>
    </main>
  )
}
