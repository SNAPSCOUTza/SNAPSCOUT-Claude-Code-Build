import type { ReactNode } from "react"
import { BorderGlow } from "@/components/ui/border-glow"

interface DemoCardWrapProps {
  isDemo: boolean
  borderRadius?: number
  className?: string
  children: ReactNode
}

// Only mounts BorderGlow's pointer-tracking + gradient layers when the card
// actually needs the demo-profile marker - real profile cards render with
// no extra wrapper or overhead.
export function DemoCardWrap({ isDemo, borderRadius = 26, className, children }: DemoCardWrapProps) {
  if (!isDemo) return <>{children}</>
  return (
    <BorderGlow persistent borderRadius={borderRadius} className={className}>
      {children}
    </BorderGlow>
  )
}
