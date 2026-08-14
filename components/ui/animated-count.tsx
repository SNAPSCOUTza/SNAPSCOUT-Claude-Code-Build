"use client"

import { useEffect, useMemo, useState } from "react"

type AnimatedCountProps = {
  value: number
  durationMs?: number
  suffix?: string
}

export function AnimatedCount({ value, durationMs = 700, suffix = "" }: AnimatedCountProps) {
  const [display, setDisplay] = useState(0)
  const target = useMemo(() => Math.max(0, Math.round(value)), [value])

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(target * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return (
    <span>
      {display}
      {suffix}
    </span>
  )
}
