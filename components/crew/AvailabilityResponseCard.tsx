"use client"

import { useState } from "react"
import { Check, Loader2, MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type AvailabilityResponseCardProps = {
  response: {
    id: string
    status: "pending" | "confirmed" | "declined"
    request?: {
      project_name?: string | null
      shoot_date: string
      shoot_location?: string | null
      note?: string | null
    }
    requester?: {
      full_name?: string
      avatar_url?: string | null
    }
  }
  onUpdated?: (status: "confirmed" | "declined") => void
}

export function AvailabilityResponseCard({ response, onUpdated }: AvailabilityResponseCardProps) {
  const [status, setStatus] = useState(response.status)
  const [busy, setBusy] = useState<"confirmed" | "declined" | null>(null)
  const [error, setError] = useState("")

  const updateStatus = async (nextStatus: "confirmed" | "declined") => {
    setBusy(nextStatus)
    setError("")
    try {
      const apiResponse = await fetch(`/api/availability-responses/${response.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      })
      const payload = await apiResponse.json()
      if (!apiResponse.ok) throw new Error(payload.error || "Could not update availability")
      setStatus(nextStatus)
      onUpdated?.(nextStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update availability")
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card className="rounded-[28px] border-[#e7edf5] bg-white shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">{response.request?.project_name || "Availability check"}</p>
            <p className="mt-1 text-sm text-[#647084]">{response.request?.shoot_date}</p>
            {response.request?.shoot_location && (
              <p className="mt-1 flex items-center gap-1 text-sm text-[#647084]">
                <MapPin className="h-4 w-4" />
                {response.request.shoot_location}
              </p>
            )}
          </div>
          <Badge
            className={
              status === "confirmed"
                ? "bg-green-100 text-green-800"
                : status === "declined"
                  ? "bg-red-100 text-red-800"
                  : "bg-amber-100 text-amber-800"
            }
          >
            {status}
          </Badge>
        </div>

        {response.request?.note && <p className="rounded-2xl bg-[#f8fafc] p-3 text-sm">{response.request.note}</p>}

        {status === "pending" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              disabled={!!busy}
              onClick={() => updateStatus("confirmed")}
              className="h-12 rounded-full bg-green-600 text-white hover:bg-green-700"
            >
              {busy === "confirmed" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              I&apos;m available
            </Button>
            <Button
              type="button"
              disabled={!!busy}
              variant="outline"
              onClick={() => updateStatus("declined")}
              className="h-12 rounded-full bg-white"
            >
              {busy === "declined" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              Not available
            </Button>
          </div>
        ) : (
          <p className="rounded-2xl bg-[#f8fafc] px-3 py-2 text-sm text-[#647084]">
            You marked this request as {status}.
          </p>
        )}

        {error && <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </CardContent>
    </Card>
  )
}
