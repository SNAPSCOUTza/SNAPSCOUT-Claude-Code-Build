"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, CalendarCheck, Lock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { createBrowserClient } from "@/lib/supabase/client"
import {
  addMonths,
  buildMockAvailability,
  formatDateKey,
  getAvailabilityMap,
  getMonthDays,
  startOfMonth,
  type AvailabilityEntry,
  type AvailabilityOwnerType,
  type AvailabilityStatus,
} from "@/lib/availability"

type AvailabilityCalendarProps = {
  ownerId: string
  ownerType: AvailabilityOwnerType
  title?: string
  compact?: boolean
  onRequestDate?: (dateKey: string) => void
}

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"]

function statusClasses(status: AvailabilityStatus | "unset") {
  if (status === "booked") return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
  if (status === "blocked") return "border-muted bg-muted text-muted-foreground"
  if (status === "available") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  return "border-border bg-background text-foreground hover:bg-muted"
}

function dotClasses(status: AvailabilityStatus | "unset") {
  if (status === "booked") return "bg-red-500"
  if (status === "blocked") return "bg-muted-foreground"
  if (status === "available") return "bg-emerald-500"
  return "bg-transparent"
}

function MonthGrid({
  month,
  entries,
  onSelectDate,
}: {
  month: Date
  entries: Map<string, AvailabilityEntry>
  onSelectDate: (date: Date, status: AvailabilityStatus | "unset") => void
}) {
  const cells = getMonthDays(month)

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[24px] font-bold leading-none">
          {month.toLocaleDateString("en-ZA", { month: "long" })}
        </h3>
        <span className="font-mono text-[12px] text-muted-foreground">{month.getFullYear()}</span>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-[12px] font-medium text-muted-foreground">
        {dayLabels.map((day, index) => (
          <div key={`${day}-${index}`}>{day}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="aspect-square" />

          const key = formatDateKey(date)
          const entry = entries.get(key)
          const status = entry?.status ?? "unset"
          const isToday = key === formatDateKey(new Date())

          return (
            <motion.button
              key={key}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectDate(date, status)}
              className={`relative grid aspect-square min-h-11 place-items-center rounded-2xl border text-[14px] transition-colors ${statusClasses(status)}`}
            >
              <span className={isToday ? "font-mono font-bold" : "font-mono"}>{date.getDate()}</span>
              <span className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${dotClasses(status)}`} />
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export function AvailabilityCalendar({
  ownerId,
  ownerType,
  title = "Availability",
  compact = false,
  onRequestDate,
}: AvailabilityCalendarProps) {
  const router = useRouter()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [entries, setEntries] = useState<AvailabilityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<{ date: Date; status: AvailabilityStatus | "unset" } | null>(null)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadAvailability() {
      setLoading(true)
      const fallback = buildMockAvailability(ownerId, ownerType, month)

      try {
        const supabase = createBrowserClient()
        const monthEnd = addMonths(month, 2)
        const { data, error } = await supabase
          .from("availability_public")
          .select("owner_id, owner_type, date, status")
          .eq("owner_id", ownerId)
          .eq("owner_type", ownerType)
          .gte("date", formatDateKey(month))
          .lt("date", formatDateKey(monthEnd))

        if (error) throw error
        if (!cancelled) setEntries((data as AvailabilityEntry[])?.length ? (data as AvailabilityEntry[]) : fallback)
      } catch {
        if (!cancelled) setEntries(fallback)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadAvailability()
    return () => {
      cancelled = true
    }
  }, [month, ownerId, ownerType])

  const entriesByDate = useMemo(() => getAvailabilityMap(entries), [entries])
  const selectedKey = selectedDate ? formatDateKey(selectedDate.date) : ""

  const handleSelectDate = (date: Date, status: AvailabilityStatus | "unset") => {
    setSelectedDate({ date, status })
  }

  const handleRequestSelectedDate = () => {
    if (!selectedKey) return
    if (onRequestDate) {
      onRequestDate(selectedKey)
    } else {
      router.push(`/booking/${ownerId}?date=${selectedKey}&origin=availability`)
    }
    setSelectedDate(null)
  }

  const handleTouchEnd = (x: number) => {
    if (touchStartX === null) return
    const delta = x - touchStartX
    if (Math.abs(delta) > 48) {
      setMonth((current) => addMonths(current, delta > 0 ? -1 : 1))
    }
    setTouchStartX(null)
  }

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-11 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square min-h-11 rounded-2xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <section
      className="space-y-4"
      onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[24px] font-bold leading-tight">{title}</h2>
          <p className="text-[14px] text-muted-foreground">Live status for upcoming booking dates.</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setMonth((current) => addMonths(current, -1))}
            className="grid h-11 w-11 place-items-center rounded-full border bg-background"
            aria-label="Previous month"
          >
            <ArrowLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setMonth((current) => addMonths(current, 1))}
            className="grid h-11 w-11 place-items-center rounded-full border bg-background"
            aria-label="Next month"
          >
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      <div className={compact ? "grid gap-4" : "grid gap-4 md:grid-cols-2"}>
        <MonthGrid month={month} entries={entriesByDate} onSelectDate={handleSelectDate} />
        {!compact && <MonthGrid month={addMonths(month, 1)} entries={entriesByDate} onSelectDate={handleSelectDate} />}
      </div>

      <div className="flex flex-wrap gap-3 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Available</span>
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500" /> Booked</span>
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-muted-foreground" /> Blocked</span>
      </div>

      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent
          showCloseButton={false}
          className="top-auto bottom-0 left-0 right-0 z-[70] max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-b-none rounded-t-[28px] border-x-0 border-b-0 border-t border-[#e8edf5] bg-white p-0 text-[#0b0b0d] shadow-[0_-24px_70px_rgba(0,0,0,0.22)] sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border relative"
        >
          <motion.div
            initial={{ clipPath: "circle(0% at 50% 100%)", y: 20, opacity: 0.2, filter: "blur(12px)" }}
            animate={{ clipPath: "circle(160% at 50% 100%)", y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.64, ease: [0.22, 1, 0.36, 1] }}
          >
          <DialogHeader className="border-b border-[#e8edf5] bg-white px-5 pb-4 pt-5 text-left">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-[24px] font-bold">
                  {selectedDate?.date.toLocaleDateString("en-ZA", { day: "numeric", month: "long" })}
                </DialogTitle>
                <DialogDescription>
                  {selectedDate?.status === "booked"
                    ? "Not available - try another date."
                    : selectedDate?.status === "blocked"
                      ? "This date is on hold."
                      : "This date can be requested for booking."}
                </DialogDescription>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedDate(null)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#e1e7f1] bg-white text-[#111318] shadow-sm"
                aria-label="Close date details"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>
          </DialogHeader>
          <div className="grid gap-3 bg-white p-5">
            {selectedDate?.status === "booked" || selectedDate?.status === "blocked" ? (
              <div className="rounded-2xl border border-[#e1e7f1] bg-white p-4 text-[14px] text-[#5f6672]">
                <Lock className="mb-2 h-5 w-5" />
                Try a green date or any empty date with no status marker.
              </div>
            ) : (
              <Button
                className="h-[52px] rounded-full"
                onClick={handleRequestSelectedDate}
              >
                <CalendarCheck className="h-4 w-4" />
                Request this date
              </Button>
            )}
          </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
