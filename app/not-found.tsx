import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SnapScoutStateArt } from "@/components/mobile/snapscout-state-art"

export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-white px-5 py-8">
      <SnapScoutStateArt variant="offline">
        <Button asChild className="h-12 rounded-full bg-[#f20d14] px-6 text-white hover:bg-[#d9070d]">
          <Link href="/explore">Return Home</Link>
        </Button>
      </SnapScoutStateArt>
    </main>
  )
}
