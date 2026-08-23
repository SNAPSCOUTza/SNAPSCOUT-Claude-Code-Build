"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Clock, MapPin, RefreshCw, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type OwnedCallSheet = {
  id: string
  project_name?: string
  shoot_date: string
  shoot_location?: string
  general_call_time: string
  status: "draft" | "sent"
  crew_count: number
}

type ReceivedCallSheet = {
  id: string
  project_name?: string
  shoot_date: string
  shoot_location?: string
  general_call_time: string
  my_entry?: { call_time: string; response_status?: "pending" | "accepted" | "declined" }
  owner?: { full_name: string }
}

const responseBadge: Record<string, { label: string; className: string }> = {
  pending: { label: "Awaiting your response", className: "bg-amber-50 text-amber-700" },
  accepted: { label: "Accepted", className: "bg-green-50 text-green-700" },
  declined: { label: "Declined", className: "bg-red-50 text-red-700" },
}

export default function CallSheetsListPage() {
  const [owned, setOwned] = useState<OwnedCallSheet[]>([])
  const [received, setReceived] = useState<ReceivedCallSheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchCallSheets = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/call-sheets", { credentials: "include" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not load call sheets")
      setOwned(payload.owned || [])
      setReceived(payload.received || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load call sheets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCallSheets()
  }, [])

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-[#07111f] md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef1218]">Crew planning</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Call Sheets</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#5d6b82]">
              Everything you've sent as a producer, and everything sent to you as crew.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={fetchCallSheets} className="h-11 w-11 rounded-full bg-white p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-3xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>
            <Button type="button" variant="outline" size="sm" onClick={fetchCallSheets} className="rounded-full bg-white">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-xl font-black">Call sheets you've sent</h2>
          <p className="mt-1 text-sm text-[#5d6b82]">Created from a confirmed availability check - open one to edit or send it.</p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {loading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <Card key={index} className="rounded-[24px] border-[#e4ebf3] bg-white">
                  <CardContent className="space-y-3 p-4">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : owned.length === 0 ? (
              <div className="md:col-span-2 rounded-[24px] border border-dashed border-[#dbe4ee] bg-[#f8fafc] p-6 text-center text-sm text-[#5d6b82]">
                No call sheets yet. Generate one from a confirmed availability check inside a pool.
              </div>
            ) : (
              owned.map((sheet, index) => (
                <motion.div
                  key={sheet.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                >
                  <Link href={`/crew-pools/call-sheets/${sheet.id}`}>
                    <Card className="h-full rounded-[24px] border-[#e4ebf3] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                      <CardContent className="flex items-start justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-black">{sheet.project_name || "Untitled production"}</span>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                sheet.status === "sent" ? "bg-green-50 text-green-700" : "bg-[#f4f7fb] text-[#5d6b82]"
                              }`}
                            >
                              {sheet.status}
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5d6b82]">
                            <span>{sheet.shoot_date}</span>
                            {sheet.shoot_location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {sheet.shoot_location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {sheet.crew_count} crew
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[#5d6b82]" />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-black">Call sheets sent to you</h2>
          <p className="mt-1 text-sm text-[#5d6b82]">Accept or decline once you've confirmed the details.</p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {loading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <Card key={index} className="rounded-[24px] border-[#e4ebf3] bg-white">
                  <CardContent className="space-y-3 p-4">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : received.length === 0 ? (
              <div className="md:col-span-2 rounded-[24px] border border-dashed border-[#dbe4ee] bg-[#f8fafc] p-6 text-center text-sm text-[#5d6b82]">
                Nothing sent to you yet.
              </div>
            ) : (
              received.map((sheet, index) => (
                <motion.div
                  key={sheet.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                >
                  <Link href={`/crew-pools/call-sheets/${sheet.id}`}>
                    <Card className="h-full rounded-[24px] border-[#e4ebf3] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                      <CardContent className="flex items-start justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-black">{sheet.project_name || "Untitled production"}</span>
                            {sheet.my_entry?.response_status && (
                              <span
                                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${responseBadge[sheet.my_entry.response_status].className}`}
                              >
                                {responseBadge[sheet.my_entry.response_status].label}
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5d6b82]">
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
                          </div>
                          {sheet.owner?.full_name && (
                            <p className="mt-1 text-xs text-[#5d6b82]">From {sheet.owner.full_name}</p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[#5d6b82]" />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
