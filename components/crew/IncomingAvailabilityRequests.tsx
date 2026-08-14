"use client"

import { useEffect, useState } from "react"
import type { ComponentProps } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AvailabilityResponseCard } from "@/components/crew/AvailabilityResponseCard"

type IncomingResponse = ComponentProps<typeof AvailabilityResponseCard>["response"]

export function IncomingAvailabilityRequests() {
  const [responses, setResponses] = useState<IncomingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchResponses = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/availability-responses", { credentials: "include" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not load availability requests")
      setResponses(payload.responses || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load availability requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResponses()
  }, [])

  const visibleResponses = responses.filter((response) => response.status === "pending")

  if (!loading && !error && visibleResponses.length === 0) return null

  return (
    <section className="rounded-[28px] border border-[#e7edf5] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Availability requests</h2>
          <p className="text-sm text-[#647084]">Confirm or decline incoming shoot checks.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={fetchResponses} className="rounded-full bg-white">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-[#647084]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading requests...
          </div>
        ) : error ? (
          <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : (
          visibleResponses.map((response) => (
            <AvailabilityResponseCard
              key={response.id}
              response={response}
              onUpdated={(status) =>
                setResponses((prev) =>
                  prev.map((item) => (item.id === response.id ? { ...item, status } : item)),
                )
              }
            />
          ))
        )}
      </div>
    </section>
  )
}
