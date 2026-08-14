"use client"

export type AvailabilityOwnerType = "photographer" | "videographer" | "crew" | "studio" | "store" | "gear"
export type AvailabilityStatus = "available" | "booked" | "blocked"

export type AvailabilityEntry = {
  id?: string
  owner_id: string
  owner_type: AvailabilityOwnerType
  date: string
  status: AvailabilityStatus
  booking_id?: string | null
  note?: string | null
}

export function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function getMonthDays(month: Date) {
  const first = startOfMonth(month)
  const startOffset = first.getDay()
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const cells: Array<Date | null> = Array.from({ length: startOffset }, () => null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), day))
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

export function getAvailabilityMap(entries: AvailabilityEntry[]) {
  return new Map(entries.map((entry) => [entry.date, entry]))
}

export function buildMockAvailability(ownerId: string, ownerType: AvailabilityOwnerType, month = new Date()) {
  const entries: AvailabilityEntry[] = []
  const first = startOfMonth(month)

  for (let day = 1; day <= 28; day += 1) {
    const date = new Date(first.getFullYear(), first.getMonth(), day)
    const key = formatDateKey(date)
    const mod = (day + ownerId.length) % 9

    if (mod === 0) {
      entries.push({ owner_id: ownerId, owner_type: ownerType, date: key, status: "booked", note: "Confirmed booking" })
    } else if (mod === 4) {
      entries.push({ owner_id: ownerId, owner_type: ownerType, date: key, status: "blocked", note: "Owner hold" })
    } else if (mod === 2 || mod === 6) {
      entries.push({ owner_id: ownerId, owner_type: ownerType, date: key, status: "available" })
    }
  }

  return entries
}

export function getAvailabilitySummary(entries: AvailabilityEntry[], from = new Date()) {
  const byDate = getAvailabilityMap(entries)
  const nextSeven = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(from)
    date.setDate(from.getDate() + index)
    return formatDateKey(date)
  })

  const availableInWeek = nextSeven.some((date) => byDate.get(date)?.status !== "booked" && byDate.get(date)?.status !== "blocked")

  if (availableInWeek) {
    return { label: "Available this week", tone: "available" as const }
  }

  const nextAvailable = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(from)
    date.setDate(from.getDate() + index)
    return date
  }).find((date) => byDate.get(formatDateKey(date))?.status === "available")

  if (nextAvailable) {
    return {
      label: `Booked until ${nextAvailable.toLocaleDateString("en-ZA", { day: "2-digit", month: "short" })}`,
      tone: "booked" as const,
    }
  }

  return { label: "Check availability", tone: "unknown" as const }
}

export function buildIcsCalendar(entries: AvailabilityEntry[], title = "SnapScout availability") {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SnapScout//Availability//EN",
    `X-WR-CALNAME:${title}`,
    ...entries
      .filter((entry) => entry.status !== "available")
      .flatMap((entry) => [
        "BEGIN:VEVENT",
        `UID:${entry.owner_id}-${entry.date}@snapscout`,
        `DTSTAMP:${entry.date.replaceAll("-", "")}T000000Z`,
        `DTSTART;VALUE=DATE:${entry.date.replaceAll("-", "")}`,
        `SUMMARY:${entry.status === "booked" ? "Booked" : "Blocked"}`,
        entry.note ? `DESCRIPTION:${entry.note}` : "DESCRIPTION:SnapScout availability hold",
        "END:VEVENT",
      ]),
    "END:VCALENDAR",
  ]

  return lines.join("\r\n")
}
