"use client"

import { CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buildMockAvailability, getAvailabilitySummary, type AvailabilityEntry, type AvailabilityOwnerType } from "@/lib/availability"

type AvailabilityStatusBadgeProps = {
  ownerId: string
  ownerType: AvailabilityOwnerType
  entries?: AvailabilityEntry[]
}

export function AvailabilityStatusBadge({ ownerId, ownerType, entries }: AvailabilityStatusBadgeProps) {
  const summary = getAvailabilitySummary(entries ?? buildMockAvailability(ownerId, ownerType))

  const className =
    summary.tone === "available"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : summary.tone === "booked"
        ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
        : "border-border bg-muted text-muted-foreground"

  return (
    <Badge variant="outline" className={`min-h-8 gap-1 rounded-full px-3 text-[12px] ${className}`}>
      <CalendarDays className="h-3.5 w-3.5" />
      {summary.label}
    </Badge>
  )
}
