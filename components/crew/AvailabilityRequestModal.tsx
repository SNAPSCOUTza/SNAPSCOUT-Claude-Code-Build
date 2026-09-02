"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, MapPin, Send } from "lucide-react"
import { LoadingDot } from "@/components/ui/loading-dot"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { CrewPoolMember } from "@/types/crew-pool"

type AvailabilityRequestModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  poolId: string
  selectedMembers: CrewPoolMember[]
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

export function AvailabilityRequestModal({
  open,
  onOpenChange,
  poolId,
  selectedMembers,
}: AvailabilityRequestModalProps) {
  const router = useRouter()
  const [shootDate, setShootDate] = useState("")
  const [projectName, setProjectName] = useState("")
  const [location, setLocation] = useState("")
  const [province, setProvince] = useState("")
  const [city, setCity] = useState("")
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const submit = async () => {
    if (!shootDate) {
      setError("Choose a shoot date first.")
      return
    }

    setSubmitting(true)
    setError("")
    try {
      const response = await fetch("/api/availability-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          shoot_date: shootDate,
          shoot_location: location || [city, province].filter(Boolean).join(", "),
          project_name: projectName,
          note,
          crew_member_ids: selectedMembers.map((member) => member.profile_id),
          province,
          city,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not send request")

      onOpenChange(false)
      router.push(`/crew-pools/${poolId}/availability/${payload.request.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send request")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed inset-x-2 bottom-0 top-auto flex max-h-[86dvh] w-auto max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-b-none rounded-t-[30px] border-x-0 border-b-0 border-t border-[#e7edf5] bg-white p-0 shadow-[0_-24px_70px_rgba(0,0,0,0.22)] lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:max-h-[90dvh] lg:w-full lg:max-w-lg lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[28px] lg:border"
      >
        <DialogHeader className="shrink-0 border-b border-[#e8edf5] px-5 pb-4 pt-5 text-left">
          <DialogTitle className="text-[clamp(22px,6vw,28px)] leading-tight">Check availability</DialogTitle>
          <DialogDescription className="mt-1 text-[14px] leading-5 text-[#667085]">
            Send a one-tap availability request to selected crew.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shoot-date">Shoot date</Label>
              <div className="relative flex items-center">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647084]" />
                <Input
                  id="shoot-date"
                  type="date"
                  value={shootDate}
                  onChange={(event) => setShootDate(event.target.value)}
                  className="h-[52px] rounded-2xl bg-white pl-10 pr-3 text-[16px]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="Nike campaign"
                className="h-[52px] rounded-2xl bg-white text-[16px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shoot-location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647084]" />
              <Input
                id="shoot-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Woodstock, Cape Town"
                className="h-[52px] rounded-2xl bg-white pl-10 text-[16px]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Province</Label>
              <Select
                value={province}
                onValueChange={(value) => {
                  setProvince(value)
                  setCity("")
                }}
              >
                <SelectTrigger className="h-[52px] rounded-2xl bg-white text-[16px]">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {Object.keys(PROVINCE_CITIES).map((provinceName) => (
                    <SelectItem key={provinceName} value={provinceName}>
                      {provinceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>City / Town</Label>
              <Select
                value={city}
                onValueChange={setCity}
                disabled={!province}
              >
                <SelectTrigger className="h-[52px] rounded-2xl bg-white text-[16px]">
                  <SelectValue placeholder={province ? "Select city" : "Choose province first"} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {(PROVINCE_CITIES[province] || []).map((cityName) => (
                    <SelectItem key={cityName} value={cityName}>
                      {cityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note to crew</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Arrive camera-ready. Parking available."
              className="min-h-28 rounded-2xl bg-white"
            />
          </div>

          <div className="rounded-3xl border border-[#e7edf5] bg-[#f8fafc] p-4">
            <p className="text-sm font-semibold">{selectedMembers.length} selected crew</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedMembers.map((member) => (
                <span key={member.id} className="rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm">
                  {member.profile?.full_name || "Crew member"}
                </span>
              ))}
            </div>
          </div>

          {error && <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        </div>
        <div className="shrink-0 border-t border-[#e8edf5] bg-white px-5 pb-[max(22px,calc(env(safe-area-inset-bottom)+14px))] pt-3 shadow-[0_-10px_26px_rgba(15,23,42,0.08)]">
          <Button
            type="button"
            disabled={submitting || selectedMembers.length === 0}
            onClick={submit}
            className="h-[54px] w-full rounded-full bg-[#ef1218] text-[15px] font-semibold text-white shadow-[0_14px_28px_rgba(242,13,20,0.18)] hover:bg-[#d90d12]"
          >
            {submitting ? <LoadingDot /> : <Send className="h-4 w-4" />}
            Send availability check
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
