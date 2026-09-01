"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Drawer, DrawerContent, DrawerDescription, DrawerHandle, DrawerTitle } from "@/components/ui/drawer"
import { CalendarDays, Check, ChevronLeft, ChevronRight, MapPin, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { prependMockHireRequest, type MockHireRequest, type MockHireRequestOrigin } from "@/lib/mock-data/hire-request-data"
import { MOCK_BRAD_USER_ID } from "@/lib/mock-data/messaging-test-data"
import { cn } from "@/lib/utils"
import {
  HireConfirmationOverlay,
  getHireConfirmationVariant,
  type HireConfirmationVariant,
} from "@/components/booking/hire-confirmation-overlay"

type HireRequestSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  talentId: string
  talentName: string
  talentType: "creator" | "crew" | "studio" | "store"
  priceLabel: string
  initialDate?: string
  bookingTypeOptions?: string[]
  bookingTypeLabel?: string
  bookingTypePlaceholder?: string
  initialBookingType?: string
  durationLabel?: string
  briefLabel?: string
  briefPlaceholder?: string
  requestOrigin?: MockHireRequestOrigin
  requesterId?: string
  requesterName?: string
  recipientId?: string
  recipientName?: string
}

const durationOptions = [
  { value: "2-hours", label: "Two hours" },
  { value: "3-hours", label: "Three hours" },
  { value: "4-hours", label: "Four hours" },
  { value: "all-day", label: "All day" },
  { value: "multiple-days", label: "Multiple days" },
]

const bookingTypeOptionsByTalent: Record<HireRequestSheetProps["talentType"], string[]> = {
  creator: [
    "Wedding",
    "Maternity shoot",
    "Portraits",
    "Event",
    "Brand shoot",
    "Fashion shoot",
    "Product shoot",
    "Music video",
    "Other",
  ],
  crew: [
    "Commercial production",
    "Film production",
    "Music video",
    "Interview setup",
    "Event coverage",
    "Post-production",
    "Documentary",
    "Other",
  ],
  studio: [
    "Studio booking",
    "Photo shoot",
    "Video shoot",
    "Podcast recording",
    "Commercial shoot",
    "Full-day studio hire",
    "Multiple-day booking",
    "Other",
  ],
  store: [
    "Camera rental",
    "Lens rental",
    "Lighting rental",
    "Audio gear rental",
    "Props rental",
    "Full kit rental",
    "Multiple-day rental",
    "Other",
  ],
}

const PROVINCE_CITIES: Record<string, string[]> = {
  "Eastern Cape": ["Port Elizabeth", "East London", "Mthatha"],
  "Free State": ["Bloemfontein", "Welkom", "Bethlehem"],
  Gauteng: ["Johannesburg", "Pretoria", "Sandton"],
  "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Ballito"],
  Limpopo: ["Polokwane", "Tzaneen", "Mokopane"],
  Mpumalanga: ["Mbombela", "Witbank", "Secunda"],
  "North West": ["Rustenburg", "Mahikeng", "Potchefstroom"],
  "Northern Cape": ["Kimberley", "Upington", "Kuruman"],
  "Western Cape": ["Cape Town", "Stellenbosch", "Paarl"],
}

const defaultBriefPlaceholders: Record<HireRequestSheetProps["talentType"], string> = {
  creator: "Example: maternity shoot, 3 hours, natural light, 12 edited photos, Cape Town CBD...",
  crew: "Example: brand shoot, 4 hours, two-camera setup, sound, lighting, Cape Town CBD...",
  studio: "Example: studio booking, all day, natural light, parking, changing area, Cape Town...",
  store: "Example: camera rental, two days, Sony FX kit, tripod, lights, pickup in Johannesburg...",
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseDateKey(key?: string) {
  if (!key) return null
  const [year, month, day] = key.split("-").map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day, 12)
}

function formatShortDate(key?: string) {
  const parsed = parseDateKey(key)
  if (!parsed) return ""
  return parsed.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getInclusiveRangeDays(startKey?: string, endKey?: string) {
  const start = parseDateKey(startKey)
  const end = parseDateKey(endKey || startKey)
  if (!start || !end) return 0
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
}

function isBetweenDateKeys(key: string, startKey?: string, endKey?: string) {
  if (!startKey || !endKey) return false
  return key > startKey && key < endKey
}

function buildDateOption(date: Date) {
  return {
    key: formatDateKey(date),
    day: date.toLocaleDateString("en-ZA", { day: "2-digit" }),
    label: date.toLocaleDateString("en-ZA", { weekday: "short" }),
    month: date.toLocaleDateString("en-ZA", { month: "short" }),
  }
}

function buildMonthCells(monthDate: Date) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1, 12)
  const daysInMonth = new Date(year, month + 1, 0, 12).getDate()
  const cells: Array<ReturnType<typeof buildDateOption> | null> = Array.from({ length: firstDay.getDay() }, () => null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(buildDateOption(new Date(year, month, day, 12)))
  }

  return cells
}

function buildDateOptions(initialDate?: string) {
  const options = Array.from({ length: 14 }).map((_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    return buildDateOption(date)
  })

  if (initialDate && !options.some((option) => option.key === initialDate)) {
    const parsed = new Date(`${initialDate}T12:00:00`)
    if (!Number.isNaN(parsed.getTime())) {
      return [buildDateOption(parsed), ...options]
    }
  }

  return options
}

function parseRateFromLabel(priceLabel: string) {
  const firstCurrencyAmount = priceLabel.match(/\d[\d\s,.]*/)
  const numericPart = firstCurrencyAmount?.[0]?.replace(/[^\d]/g, "") || "0"
  const amount = Number.parseInt(numericPart, 10)
  const normalized = priceLabel.toLowerCase()
  return {
    amount,
    isHourly: normalized.includes("/hr"),
    isDaily: normalized.includes("/day"),
  }
}

function formatCurrency(amount: number) {
  return `R${amount.toLocaleString("en-ZA")}`
}

function getHoursFromDuration(value: string) {
  if (value === "2-hours") return 2
  if (value === "3-hours") return 3
  if (value === "4-hours") return 4
  return 8
}

const flowSteps = [
  { index: 1, label: "Service" },
  { index: 2, label: "Date & Time" },
  { index: 3, label: "Details" },
  { index: 4, label: "Review" },
] as const

export function HireRequestSheet({
  open,
  onOpenChange,
  talentId,
  talentName,
  talentType,
  priceLabel,
  initialDate,
  bookingTypeOptions,
  bookingTypeLabel,
  bookingTypePlaceholder,
  initialBookingType,
  durationLabel,
  briefLabel = "What do you need?",
  briefPlaceholder,
  requestOrigin,
  requesterId,
  requesterName,
  recipientId,
  recipientName,
}: HireRequestSheetProps) {
  const { user, profile } = useAuth()
  const [step, setStep] = useState(1)
  // Which way the step content should slide - mutated right before each
  // setStep call so AnimatePresence's `custom` picks it up for both the
  // entering step and the one that's exiting (see Framer Motion's paginate
  // pattern: exit variants are re-evaluated against the latest `custom`,
  // not the value captured when that step first mounted).
  const stepDirectionRef = useRef(1)
  const prefersReducedMotion = useReducedMotion()
  const stepVariants = {
    enter: (direction: number) => ({ opacity: 0, x: prefersReducedMotion ? 0 : direction > 0 ? 16 : -16 }),
    center: { opacity: 1, x: 0 },
    exit: (direction: number) => ({ opacity: 0, x: prefersReducedMotion ? 0 : direction > 0 ? -16 : 16 }),
  }
  const stepTransition = { duration: prefersReducedMotion ? 0.15 : 0.28, ease: [0.22, 1, 0.36, 1] as const }
  const dateOptions = useMemo(() => buildDateOptions(initialDate), [initialDate])
  const finalBookingTypeOptions = useMemo(
    () => bookingTypeOptions?.filter(Boolean) || bookingTypeOptionsByTalent[talentType],
    [bookingTypeOptions, talentType],
  )
  const [selectedStartDate, setSelectedStartDate] = useState(initialDate || dateOptions[0]?.key || "")
  const [selectedEndDate, setSelectedEndDate] = useState("")
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [monthCursor, setMonthCursor] = useState(() => parseDateKey(initialDate || dateOptions[0]?.key) || new Date())
  const [bookingType, setBookingType] = useState("")
  const [duration, setDuration] = useState("all-day")
  const [province, setProvince] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [brief, setBrief] = useState("")
  const [sent, setSent] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationVariant, setConfirmationVariant] = useState<HireConfirmationVariant>("photographer")
  // Below lg we render the sheet in a native vaul Drawer for real drag-to-dismiss
  // physics; at lg+ it stays the centered Dialog. Both share the same body JSX.
  const [isDesktop, setIsDesktop] = useState(false)
  const isListingBooking = talentType === "studio" || talentType === "store"
  const titleTarget = isListingBooking ? talentName : talentName.split(" ")[0]
  const actionLabel = isListingBooking ? "booking" : "hire"
  const monthCells = useMemo(() => buildMonthCells(monthCursor), [monthCursor])
  const selectedRangeDays = getInclusiveRangeDays(selectedStartDate, selectedEndDate)
  const needsRange = duration === "multiple-days"
  const hasRequiredRange = !needsRange || Boolean(selectedEndDate)
  const hasDateStepValid = Boolean(selectedStartDate) && hasRequiredRange
  const hasDetailsStepValid = Boolean(province) && Boolean(city) && Boolean(address.trim())
  const dateSummary = selectedEndDate
    ? `${formatShortDate(selectedStartDate)} - ${formatShortDate(selectedEndDate)} - ${selectedRangeDays} days`
    : `${formatShortDate(selectedStartDate)} - 1 day`
  const confirmLabel = isListingBooking ? "Confirm booking" : "Confirm hire"
  const durationLabelValue = durationOptions.find((option) => option.value === duration)?.label || "All day"
  const priceMeta = useMemo(() => parseRateFromLabel(priceLabel), [priceLabel])
  const effectiveDays = selectedRangeDays || 1
  const dailyRate = priceMeta.isDaily ? priceMeta.amount : priceMeta.isHourly ? priceMeta.amount * 8 : priceMeta.amount
  const effectiveRequesterId = requesterId || user?.id || MOCK_BRAD_USER_ID
  const effectiveRequesterName =
    requesterName ||
    profile?.display_name ||
    profile?.full_name ||
    (user?.email ? user.email.split("@")[0] : "Brad Khumalo")
  const effectiveRecipientId = recipientId || talentId
  const effectiveRecipientName = recipientName || talentName
  const effectiveOrigin = requestOrigin || (initialDate ? "availability" : "booking")
  const hourlyHours = getHoursFromDuration(duration)
  const subtotal =
    duration === "multiple-days"
      ? dailyRate * effectiveDays
      : priceMeta.isHourly
        ? priceMeta.amount * hourlyHours * effectiveDays
        : dailyRate * effectiveDays
  const totalEstimate = Math.max(subtotal, 0)

  useEffect(() => {
    if (!open) return
    const nextDate = initialDate || dateOptions[0]?.key || ""
    setStep(1)
    setSelectedStartDate(nextDate)
    setSelectedEndDate("")
    setMonthCursor(parseDateKey(nextDate) || new Date())
    setShowMonthPicker(false)
    setBookingType(initialBookingType || "")
    setDuration("all-day")
    setProvince("")
    setCity("")
    setAddress("")
    setBrief("")
    setSent(false)
    setIsClosing(false)
    setShowConfirmation(false)
  }, [dateOptions, initialBookingType, initialDate, open, talentId])

  useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement

    if (open) {
      root.dataset.hireSheetOpen = "true"
      return () => {
        delete root.dataset.hireSheetOpen
      }
    }

    delete root.dataset.hireSheetOpen
    return undefined
  }, [open])

  useEffect(() => {
    if (typeof window === "undefined") return
    const query = window.matchMedia("(min-width: 1024px)")
    const update = () => setIsDesktop(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  const handleDateSelect = (dateKey: string) => {
    if (!selectedStartDate || selectedEndDate || dateKey < selectedStartDate) {
      setSelectedStartDate(dateKey)
      setSelectedEndDate("")
      return
    }

    if (dateKey === selectedStartDate) {
      setSelectedEndDate("")
      return
    }

    setSelectedEndDate(dateKey)
  }

  const requestClose = () => {
    if (isClosing) return
    setIsClosing(true)
    window.setTimeout(() => {
      setIsClosing(false)
      onOpenChange(false)
    }, 560)
  }

  // The Dialog (desktop) has no built-in exit animation, so requestClose fakes
  // one with a class + timeout. The Drawer (mobile) is vaul-driven and animates
  // its own close - closing it just needs the real state flip.
  const closeSheet = () => {
    if (isDesktop) {
      requestClose()
      return
    }
    setIsClosing(true)
    onOpenChange(false)
  }

  const handleSubmit = () => {
    const shootLocation = `${address.trim()}${city ? `, ${city}` : ""}${province ? `, ${province}` : ""}`
    const request: MockHireRequest = {
      id: `hire-${Date.now()}`,
      requester_id: effectiveRequesterId,
      requester_name: effectiveRequesterName,
      recipient_id: effectiveRecipientId,
      recipient_name: effectiveRecipientName,
      recipient_type: talentType,
      booking_type: bookingType,
      selected_date: selectedStartDate,
      selected_end_date: selectedEndDate || selectedStartDate,
      date_range_days: selectedRangeDays,
      duration,
      province,
      city,
      address,
      shoot_location: shootLocation,
      total_estimate: totalEstimate,
      starting_rate_label: priceLabel,
      brief,
      status: "pending",
      origin: effectiveOrigin,
      created_at: new Date().toISOString(),
    }

    prependMockHireRequest(request)
    setConfirmationVariant(getHireConfirmationVariant({ talentType, bookingType, talentName }))
    setShowConfirmation(true)
    setSent(true)
  }

  const handleConfirmationComplete = useCallback(() => {
    setShowConfirmation(false)
    setSent(false)
    setBrief("")
    requestClose()
  }, [])

  const handleContinue = () => {
    stepDirectionRef.current = 1
    if (step === 1 && bookingType) setStep(2)
    if (step === 2 && hasDateStepValid && duration) setStep(3)
    if (step === 3 && hasDetailsStepValid) setStep(4)
    if (step === 4 && !sent) handleSubmit()
  }

  const continueDisabled =
    (step === 1 && !bookingType) ||
    (step === 2 && (!hasDateStepValid || !duration)) ||
    (step === 3 && !hasDetailsStepValid) ||
    (step === 4 && sent)

  const renderSheetBody = (
    Title: React.ComponentType<{ className?: string; children?: React.ReactNode }>,
    Description: React.ComponentType<{ className?: string; children?: React.ReactNode }>,
    HandleBar: React.ElementType<{ className?: string }>,
  ) => (
        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 32, mass: 0.9 }}
          className="flex min-h-0 flex-1 flex-col bg-white"
        >
        <div className="shrink-0 border-b border-[#e8edf5] bg-white">
          <HandleBar className="mx-auto mt-3 h-1.5 w-16 rounded-full bg-[#cfd5df] shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]" />
          <DialogHeader className="px-5 pb-3 pt-3 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Title className="truncate text-[clamp(19px,5.2vw,22px)] leading-tight">
                  {isListingBooking ? "Book" : "Hire"} {titleTarget}
                </Title>
                <Description className="mt-1 max-w-[30ch] text-[13px] leading-5 text-[#667085]">
                  Send a {actionLabel} request in stages and confirm before submitting.
                </Description>
              </div>
              <motion.button
                type="button"
                onClick={closeSheet}
                aria-label="Close hire request"
                whileTap={{ scale: 0.9, rotate: -8 }}
                animate={isClosing ? { opacity: 0, scale: 0.7, rotate: 45 } : { opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#e1e7f1] bg-white text-[#111318] shadow-sm transition-[transform,background-color] duration-200 hover:bg-[#f6f8fc] active:scale-[0.96]"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
          </DialogHeader>
        </div>

        <div data-vaul-no-drag className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-5 py-4">
          <div className="mx-auto mb-4 flex w-full max-w-[350px] items-center justify-between">
            {flowSteps.map((item, idx) => (
              <div key={item.index} className="relative flex flex-1 flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (item.index < step) {
                      stepDirectionRef.current = -1
                      setStep(item.index)
                    }
                  }}
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full border text-[11px] font-bold transition-colors",
                    item.index === step
                      ? "border-[#f20d14] bg-[#f20d14] text-white"
                      : item.index < step
                        ? "border-[#d8dee8] bg-white text-[#111318]"
                        : "border-[#e5e9f2] bg-[#f7f9fc] text-[#98a2b3]",
                  )}
                >
                  {item.index}
                </button>
                <span
                  className={cn(
                    "mt-1 text-center text-[10px] font-medium",
                    item.index === step ? "text-[#111318]" : "text-[#98a2b3]",
                  )}
                >
                  {item.label}
                </span>
                {idx < flowSteps.length - 1 && (
                  <div className="absolute left-[calc(50%+18px)] top-[13px] h-[1px] w-[calc(100%-36px)] bg-[#e5e9f2]" />
                )}
              </div>
            ))}
          </div>

          <div className="rounded-[22px] border border-[#e8edf5] bg-[#f8fafc] p-4">
            <p className="text-[12px] text-[#667085]">Starting from</p>
            <p className="mt-1 break-words font-mono text-[clamp(27px,7vw,34px)] font-black leading-none">{priceLabel}</p>
          </div>

          <AnimatePresence mode="wait" initial={false} custom={stepDirectionRef.current}>
          {step === 1 && (
            <motion.div
              key="step-1"
              custom={stepDirectionRef.current}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
              className="mt-5 grid gap-2"
            >
              <Label className="text-[14px] font-bold">
                {bookingTypeLabel ||
                  (talentType === "creator"
                    ? "What type of shoot are you booking?"
                    : talentType === "crew"
                      ? "What type of production is this?"
                      : "What are you booking?")}
              </Label>
              <Select value={bookingType} onValueChange={setBookingType}>
                <SelectTrigger className="h-[52px] rounded-2xl border-[#e1e7f1] bg-white px-4 text-[14px]">
                  <SelectValue placeholder={bookingTypePlaceholder || "Select booking type"} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl bg-white">
                  {finalBookingTypeOptions.map((option) => (
                    <SelectItem key={option} value={option} className="rounded-xl py-3">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              custom={stepDirectionRef.current}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
              className="mt-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-[14px] font-bold">Select date</Label>
                <motion.button
                  type="button"
                  onClick={() => setShowMonthPicker((value) => !value)}
                  whileTap={{ scale: 0.9, rotate: -5 }}
                  className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-[#f20d14] transition-colors hover:bg-red-100"
                  aria-label="Open monthly calendar"
                >
                  <CalendarDays className="h-4 w-4" />
                </motion.button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {dateOptions.map((date) => {
                  const active = selectedStartDate === date.key || selectedEndDate === date.key
                  const inRange = isBetweenDateKeys(date.key, selectedStartDate, selectedEndDate)
                  return (
                    <motion.button
                      key={date.key}
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleDateSelect(date.key)}
                      className={`grid min-h-[76px] min-w-[64px] place-items-center rounded-2xl border px-2 text-center ${
                        active
                          ? "border-[#f20d14] bg-[#f20d14] text-white"
                          : inRange
                            ? "border-red-100 bg-red-50 text-[#f20d14]"
                            : "border-[#e8edf5] bg-white text-[#111318]"
                      }`}
                    >
                      <span className="text-[11px] font-semibold">{date.label}</span>
                      <span className="font-mono text-[22px] font-black leading-none">{date.day}</span>
                      <span className="text-[11px]">{date.month}</span>
                    </motion.button>
                  )
                })}
              </div>
              <p className="mt-2 text-[12px] font-medium text-[#667085]">
                {dateSummary}
                {needsRange && !selectedEndDate ? " - choose an end date" : ""}
              </p>

              {showMonthPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="mt-3 rounded-[24px] border border-[#e8edf5] bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1, 12))
                      }
                      className="grid h-9 w-9 place-items-center rounded-full border border-[#e1e7f1] bg-white"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </motion.button>
                    <p className="text-[14px] font-bold">
                      {monthCursor.toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}
                    </p>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1, 12))
                      }
                      className="grid h-9 w-9 place-items-center rounded-full border border-[#e1e7f1] bg-white"
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-[#98a2b3]">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                      <span key={`${day}-${index}`}>{day}</span>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-7 gap-1">
                    {monthCells.map((date, index) => {
                      if (!date) return <div key={`empty-${index}`} className="h-10" />
                      const active = selectedStartDate === date.key || selectedEndDate === date.key
                      const inRange = isBetweenDateKeys(date.key, selectedStartDate, selectedEndDate)
                      return (
                        <motion.button
                          key={date.key}
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          onClick={() => handleDateSelect(date.key)}
                          className={`grid h-10 place-items-center rounded-2xl border text-[13px] font-semibold ${
                            active
                              ? "border-[#f20d14] bg-[#f20d14] text-white"
                              : inRange
                                ? "border-red-100 bg-red-50 text-[#f20d14]"
                                : "border-transparent bg-[#f8fafc] text-[#111318]"
                          }`}
                        >
                          {date.day}
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              <div className="mt-5 grid gap-2">
                <Label className="text-[14px] font-bold">
                  {durationLabel ||
                    (talentType === "studio"
                      ? "How long do you need the space?"
                      : talentType === "store"
                        ? "How long do you need the rental?"
                        : "How long do you need them?")}
                </Label>
                <Select
                  value={duration}
                  onValueChange={(value) => {
                    setDuration(value)
                    if (value === "multiple-days") setShowMonthPicker(true)
                  }}
                >
                  <SelectTrigger className="h-[52px] rounded-2xl border-[#e1e7f1] bg-white px-4 text-[14px]">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl bg-white">
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="rounded-xl py-3">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              custom={stepDirectionRef.current}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
              className="mt-5 grid gap-5"
            >
              <div className="grid gap-2">
                <Label className="text-[14px] font-bold">Province</Label>
                <Select
                  value={province}
                  onValueChange={(value) => {
                    setProvince(value)
                    setCity("")
                  }}
                >
                  <SelectTrigger className="h-[52px] rounded-2xl border-[#e1e7f1] bg-white px-4 text-[14px]">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl bg-white">
                    {Object.keys(PROVINCE_CITIES).map((provinceName) => (
                      <SelectItem key={provinceName} value={provinceName}>
                        {provinceName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-[14px] font-bold">City / Town</Label>
                <Select value={city} onValueChange={setCity} disabled={!province}>
                  <SelectTrigger className="h-[52px] rounded-2xl border-[#e1e7f1] bg-white px-4 text-[14px]">
                    <SelectValue placeholder={province ? "Select city or town" : "Select a province first"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl bg-white">
                    {(PROVINCE_CITIES[province] || []).map((cityName) => (
                      <SelectItem key={cityName} value={cityName}>
                        {cityName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-[14px] font-bold">Address</Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
                  <Input
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Street address where the service will happen"
                    className="h-[52px] rounded-2xl border-[#e1e7f1] bg-white pl-10 text-[14px]"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-[14px] font-bold">{briefLabel}</Label>
                <Textarea
                  value={brief}
                  onChange={(event) => setBrief(event.target.value)}
                  placeholder={briefPlaceholder || defaultBriefPlaceholders[talentType]}
                  className="min-h-[118px] rounded-2xl border-[#e1e7f1] bg-white text-[14px]"
                />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              custom={stepDirectionRef.current}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
              className="mt-5"
            >
              <div className="rounded-[22px] border border-[#e8edf5] bg-white p-4">
                <h4 className="text-[16px] font-bold text-[#111318]">Review & Confirm</h4>
                <div className="mt-4 grid gap-2 text-[14px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#667085]">Talent</span>
                    <span className="font-semibold text-[#111318]">{talentName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#667085]">Date</span>
                    <span className="font-semibold text-[#111318]">{dateSummary}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#667085]">Duration</span>
                    <span className="font-semibold text-[#111318]">{durationLabelValue}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[#667085]">Location</span>
                    <span className="text-right font-semibold text-[#111318]">
                      {address}, {city}, {province}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[#667085]">Service</span>
                    <span className="text-right font-semibold text-[#111318]">{bookingType}</span>
                  </div>
                  {brief.trim() && (
                    <div className="rounded-2xl bg-[#f8fafc] p-3 text-[13px] text-[#475467]">
                      <p className="mb-1 font-semibold text-[#111318]">Project brief</p>
                      <p>{brief}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-[22px] border border-[#ece3cf] bg-[#fffaf2] p-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#8c6b2a]">Total estimate</p>
                <p className="mt-1 break-words font-mono text-[clamp(27px,7vw,34px)] font-black leading-none text-[#111318]">{formatCurrency(totalEstimate)}</p>
                <p className="text-[12px] text-[#8c6b2a]">
                  {duration === "multiple-days"
                    ? `${effectiveDays} day${effectiveDays > 1 ? "s" : ""} selected`
                    : `${durationLabelValue} - ${effectiveDays} day${effectiveDays > 1 ? "s" : ""}`}
                </p>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        <div data-vaul-no-drag className="shrink-0 border-t border-[#e8edf5] bg-white px-5 pb-[max(22px,calc(env(safe-area-inset-bottom)+14px))] pt-3 shadow-[0_-10px_26px_rgba(15,23,42,0.08)]">
          <div className="mb-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                stepDirectionRef.current = -1
                setStep((current) => Math.max(1, current - 1))
              }}
              disabled={step === 1}
              className="h-[52px] flex-1 rounded-full border-[#dbe3ee] bg-white text-[15px] font-semibold text-[#111318]"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleContinue}
              disabled={continueDisabled}
              className="h-[52px] flex-1 rounded-full bg-[#f20d14] text-[15px] font-semibold text-white hover:bg-[#d9070d]"
            >
              {step === 4 ? (
                sent ? (
                  <>
                    <Check className="h-4.5 w-4.5" />
                    Request sent
                  </>
                ) : (
                  <>
                    <Send className="h-4.5 w-4.5" />
                    {confirmLabel}
                  </>
                )
              ) : (
                "Continue"
              )}
            </Button>
          </div>
          <div className="rounded-3xl border border-[#e7edf5] bg-[#f8fafc] px-4 py-3">
            <p className="text-sm font-semibold">{talentName}</p>
            <p className="mt-1 text-xs text-[#667085]">{city && province ? `${city}, ${province}` : "Location to be confirmed"}</p>
            <p className="mt-2 text-xs text-[#667085]">
              {selectedRangeDays} day{selectedRangeDays > 1 ? "s" : ""} - {durationLabelValue}
            </p>
          </div>
        </div>
        </motion.div>
  )

  return (
    <>
      <HireConfirmationOverlay
        open={showConfirmation}
        variant={confirmationVariant}
        onComplete={handleConfirmationComplete}
      />
      {isDesktop ? (
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            if (nextOpen) {
              onOpenChange(true)
              return
            }
            if (showConfirmation) return
            requestClose()
          }}
        >
          <DialogContent
            data-hire-request-sheet-open={open ? "true" : undefined}
            unstyled
            showCloseButton={false}
            onPointerDownOutside={(event) => event.preventDefault()}
            onInteractOutside={(event) => event.preventDefault()}
            onEscapeKeyDown={(event) => event.preventDefault()}
            className={cn(
              "fixed left-1/2 top-1/2 z-[180] flex h-auto max-h-[92dvh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[28px] border border-[#e5e9f2] bg-white p-0 text-[#0b0b0d] shadow-[0_-24px_70px_rgba(0,0,0,0.22)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
              isClosing && "translate-y-6 opacity-0",
            )}
          >
            {renderSheetBody(DialogTitle, DialogDescription, "div")}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer
          open={open}
          onOpenChange={(nextOpen) => {
            if (nextOpen) {
              onOpenChange(true)
              return
            }
            if (showConfirmation) return
            setIsClosing(true)
            onOpenChange(false)
          }}
          shouldScaleBackground={false}
        >
          <DrawerContent
            data-hire-request-sheet-open={open ? "true" : undefined}
            unstyled
            className="fixed inset-x-1.5 bottom-0 top-auto z-[180] flex h-[80vh] max-h-[calc(100dvh-18px)] w-auto max-w-none flex-col overflow-hidden rounded-b-none rounded-t-[30px] border-x-0 border-b-0 border-t border-[#e5e9f2] bg-white p-0 text-[#0b0b0d] shadow-[0_-24px_70px_rgba(0,0,0,0.22)] outline-none supports-[height:80svh]:h-[80svh] supports-[height:80dvh]:h-[80dvh]"
          >
            {renderSheetBody(DrawerTitle, DrawerDescription, DrawerHandle)}
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
