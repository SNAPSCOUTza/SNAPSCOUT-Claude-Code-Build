"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Clock, FileText, Loader2, MapPin, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

type MyCallSheet = {
  id: string
  project_name?: string
  shoot_date: string
  shoot_location?: string
  general_call_time: string
  my_entry?: { call_time: string; department?: string; role?: string }
  owner?: { full_name: string }
}

export function MyCallSheets() {
  const [callSheets, setCallSheets] = useState<MyCallSheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchCallSheets = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/call-sheets", { credentials: "include" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not load call sheets")
      setCallSheets(payload.call_sheets || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load call sheets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCallSheets()
  }, [])

  if (!loading && !error && callSheets.length === 0) return null

  return (
    <section className="rounded-[28px] border border-[#e7edf5] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Your call sheets</h2>
          <p className="text-sm text-[#647084]">Shoots you've confirmed with call sheet details.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={fetchCallSheets} className="rounded-full bg-white">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-[#647084]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading call sheets...
          </div>
        ) : error ? (
          <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : (
          callSheets.map((sheet) => (
            <Link
              key={sheet.id}
              href={`/crew-pools/call-sheets/${sheet.id}`}
              className="flex items-center gap-4 rounded-3xl border border-[#e1e8f0] bg-white px-4 py-3 shadow-sm transition-[transform,box-shadow,border-color] duration-200 ease-out hover:border-[#ffd0d2] hover:shadow-[0_12px_28px_rgba(242,13,20,0.1)]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#fff1f1] text-[#ef1218]">
                <FileText className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{sheet.project_name || "Untitled production"}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#647084]">
                  <span>{sheet.shoot_date}</span>
                  {sheet.shoot_location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {sheet.shoot_location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Call {sheet.my_entry?.call_time || sheet.general_call_time}
                  </span>
                </span>
                {sheet.owner?.full_name && (
                  <span className="mt-0.5 block text-xs text-[#647084]">From {sheet.owner.full_name}</span>
                )}
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}
