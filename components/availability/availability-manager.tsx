"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, CalendarClock, Download, Lock, Minus, ShieldCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  addMonths,
  buildIcsCalendar,
  buildMockAvailability,
  formatDateKey,
  getAvailabilityMap,
  getMonthDays,
  startOfMonth,
  type AvailabilityEntry,
  type AvailabilityOwnerType,
  type AvailabilityStatus,
} from "@/lib/availability"

type AvailabilityManagerProps = {
  ownerId: string
  ownerType?: AvailabilityOwnerType
}

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"]
const statusOrder: Array<AvailabilityStatus | "reset"> = ["available", "blocked", "reset"]

export function AvailabilityManager({ ownerId, ownerType = "crew" }: AvailabilityManagerProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [entries, setEntries] = useState<AvailabilityEntry[]>(() => buildMockAvailability(ownerId, ownerType))

  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMonth, setEditorMonth] = useState(() => startOfMonth(new Date()))
  const [editorEntries, setEditorEntries] = useState<AvailabilityEntry[]>([])
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkDates, setBulkDates] = useState<string[]>([])

  const [closeFading, setCloseFading] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const entriesByDate = useMemo(() => getAvailabilityMap(entries), [entries])
  const editorEntriesByDate = useMemo(() => getAvailabilityMap(editorEntries), [editorEntries])
  const compactMonthDays = useMemo(() => getMonthDays(month), [month])
  const compactPreviewDays = useMemo(() => compactMonthDays.filter(Boolean).slice(0, 14) as Date[], [compactMonthDays])
  const fullMonthDays = useMemo(() => getMonthDays(editorMonth), [editorMonth])
  const nextBooking = entries.find((entry) => entry.status === "booked" && entry.date >= formatDateKey(new Date()))

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  const openEditor = () => {
    setEditorEntries(entries)
    setEditorMonth(month)
    setBulkMode(false)
    setBulkDates([])
    setEditorOpen(true)
  }

  const closeEditor = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setEditorOpen(false)
    setCloseFading(false)
  }

  const closeEditorWithFade = () => {
    setCloseFading(true)
    closeTimerRef.current = setTimeout(() => {
      setEditorOpen(false)
      setCloseFading(false)
      closeTimerRef.current = null
    }, 140)
  }

  const applyEditor = () => {
    setEntries(editorEntries)
    setMonth(editorMonth)
    closeEditor()
  }

  const updateDate = (date: string) => {
    const current = editorEntriesByDate.get(date)
    if (current?.status === "booked") return

    if (bulkMode) {
      setBulkDates((currentDates) =>
        currentDates.includes(date) ? currentDates.filter((item) => item !== date) : [...currentDates, date],
      )
      return
    }

    const currentIndex = statusOrder.indexOf(current?.status ?? "reset")
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]

    setEditorEntries((prev) => {
      const withoutDate = prev.filter((entry) => entry.date !== date)
      if (nextStatus === "reset") return withoutDate
      return [...withoutDate, { owner_id: ownerId, owner_type: ownerType, date, status: nextStatus }]
    })
  }

  const blockBulkDates = () => {
    setEditorEntries((prev) => {
      const kept = prev.filter((entry) => !bulkDates.includes(entry.date) || entry.status === "booked")
      const blocked = bulkDates.map((date) => ({
        owner_id: ownerId,
        owner_type: ownerType,
        date,
        status: "blocked" as const,
      }))
      return [...kept, ...blocked]
    })
    setBulkDates([])
    setBulkMode(false)
  }

  const exportIcs = () => {
    const blob = new Blob([buildIcsCalendar(entries)], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "snapscout-availability.ics"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="overflow-hidden rounded-2xl border bg-card">
      <CardContent className="grid gap-4 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[24px] font-bold leading-tight">Availability</h2>
            <p className="text-[14px] text-muted-foreground">Compact dashboard view. Open full screen to edit dates.</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={exportIcs}
              className="grid h-11 w-11 place-items-center rounded-full border bg-background"
              aria-label="Export availability calendar"
            >
              <Download className="h-4 w-4" />
            </motion.button>
            <Button className="h-[44px] rounded-full px-5" variant="outline" onClick={openEditor}>
              Open calendar
            </Button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_1.25fr]">
          {nextBooking ? (
            <div className="rounded-2xl border bg-muted p-4 text-[14px]">
              <div className="flex items-center gap-2 font-semibold">
                <CalendarClock className="h-4 w-4 text-primary" />
                Your next booking
              </div>
              <p className="mt-1 text-muted-foreground">
                {new Date(nextBooking.date).toLocaleDateString("en-ZA", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}{" "}
                - Client booking
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border bg-muted p-4 text-[14px]">
              <div className="flex items-center gap-2 font-semibold">
                <CalendarClock className="h-4 w-4 text-primary" />
                No upcoming booking
              </div>
              <p className="mt-1 text-muted-foreground">Use the full calendar to mark available and blocked dates.</p>
            </div>
          )}

          <div className="rounded-2xl border bg-background p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[16px] font-bold">{month.toLocaleDateString("en-ZA", { month: "long" })}</h3>
              <span className="font-mono text-[11px] text-muted-foreground">{month.getFullYear()}</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {compactPreviewDays.map((date) => {
                const key = formatDateKey(date)
                const entry = entriesByDate.get(key)
                const status = entry?.status

                const dayClasses =
                  status === "booked"
                    ? "border-red-500/30 bg-red-500/10 text-red-700"
                    : status === "blocked"
                      ? "border-muted bg-muted text-muted-foreground"
                      : status === "available"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                        : "border-border bg-background"

                return (
                  <div
                    key={key}
                    className={`grid h-10 place-items-center rounded-xl border font-mono text-[11px] ${dayClasses}`}
                  >
                    {date.getDate()}
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Booked
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" /> Blocked
              </span>
            </div>
          </div>
        </div>

        <Dialog open={editorOpen} onOpenChange={(open) => (open ? setEditorOpen(true) : closeEditor())}>
          <DialogContent
            showCloseButton={false}
            className="data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom top-auto bottom-0 left-0 right-0 z-[70] max-h-[92vh] max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-b-none rounded-t-[28px] border-x-0 border-b-0 border-t border-border bg-white p-0 text-[#111318] shadow-[0_-20px_56px_rgba(0,0,0,0.2)] duration-300 sm:left-1/2 sm:top-1/2 sm:max-h-[88vh] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border"
          >
            <DialogHeader className="border-b border-border bg-white px-5 pb-4 pt-4 text-left">
              <div className="mb-3 flex justify-center">
                <span className="h-1.5 w-14 rounded-full bg-[#d4dbe6]" />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-[24px] font-bold leading-tight">Manage availability</DialogTitle>
                  <p className="mt-1 text-[14px] text-[#5d6675]">Tap dates to mark available, blocked, or reset.</p>
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  animate={{ opacity: closeFading ? 0 : 1, scale: closeFading ? 0.9 : 1 }}
                  transition={{ duration: 0.12 }}
                  onClick={closeEditorWithFade}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#e1e7f1] bg-white text-[#111318] shadow-sm"
                  aria-label="Close availability editor"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </DialogHeader>

            <div className="max-h-[calc(92vh-172px)] space-y-4 overflow-y-auto px-5 pb-5 pt-4 sm:max-h-[calc(88vh-172px)]">
              {nextBooking && (
                <div className="rounded-2xl border bg-muted p-4 text-[14px]">
                  <div className="flex items-center gap-2 font-semibold">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    Your next booking
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {new Date(nextBooking.date).toLocaleDateString("en-ZA", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    - Client booking
                  </p>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant={bulkMode ? "default" : "outline"}
                  className="h-[52px] rounded-full"
                  onClick={() => setBulkMode((value) => !value)}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {bulkMode ? "Cancel block mode" : "Block dates"}
                </Button>
                <Button variant="outline" className="h-[52px] rounded-full" disabled={!bulkDates.length} onClick={blockBulkDates}>
                  <Minus className="h-4 w-4" />
                  Apply block {bulkDates.length ? `(${bulkDates.length})` : ""}
                </Button>
              </div>

              <div className="rounded-2xl border bg-background p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[18px] font-bold">{editorMonth.toLocaleDateString("en-ZA", { month: "long" })}</h3>
                  <div className="flex items-center gap-2">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setEditorMonth((current) => addMonths(current, -1))}
                      className="grid h-10 w-10 place-items-center rounded-full border bg-white"
                      aria-label="Previous month"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setEditorMonth((current) => addMonths(current, 1))}
                      className="grid h-10 w-10 place-items-center rounded-full border bg-white"
                      aria-label="Next month"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                <div className="mb-2 grid grid-cols-7 gap-2 text-center text-[12px] font-medium text-muted-foreground">
                  {dayLabels.map((day, index) => (
                    <div key={`editor-${day}-${index}`}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {fullMonthDays.map((date, index) => {
                    if (!date) return <div key={`empty-editor-${index}`} className="aspect-square" />

                    const key = formatDateKey(date)
                    const entry = editorEntriesByDate.get(key)
                    const status = entry?.status
                    const selectedForBulk = bulkDates.includes(key)

                    return (
                      <motion.button
                        key={key}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => updateDate(key)}
                        className={`relative grid aspect-square min-h-11 place-items-center rounded-2xl border font-mono text-[14px] transition-colors ${
                          selectedForBulk
                            ? "border-primary bg-primary text-primary-foreground"
                            : status === "booked"
                              ? "border-red-500/30 bg-red-500/10 text-red-700"
                              : status === "blocked"
                                ? "border-muted bg-muted text-muted-foreground"
                                : status === "available"
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                                  : "border-border bg-background"
                        }`}
                        aria-label={`Set availability for ${key}`}
                      >
                        {status === "booked" && <Lock className="absolute right-1.5 top-1.5 h-3 w-3" />}
                        {date.getDate()}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-[12px] text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Booked
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground" /> Blocked
                </span>
              </div>
            </div>

            <div className="grid gap-3 border-t border-border bg-white px-5 py-4 sm:grid-cols-2">
              <Button variant="outline" className="h-[52px] rounded-full" onClick={closeEditor}>
                Cancel
              </Button>
              <Button className="h-[52px] rounded-full" onClick={applyEditor}>
                Apply
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
