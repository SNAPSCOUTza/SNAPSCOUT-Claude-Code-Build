"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, FileText, MapPin, XCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createBrowserClient } from "@/lib/supabase/client"
import type { AvailabilityRequest, AvailabilityResponse } from "@/types/crew-pool"

function initials(name?: string) {
  return (name || "SS")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const statusClasses = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  declined: "bg-red-100 text-red-800",
}

export default function AvailabilityStatusPage() {
  const params = useParams<{ poolId: string; requestId: string }>()
  const router = useRouter()
  const [request, setRequest] = useState<AvailabilityRequest | null>(null)
  const [responses, setResponses] = useState<AvailabilityResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  const counts = useMemo(
    () => ({
      confirmed: responses.filter((response) => response.status === "confirmed").length,
      pending: responses.filter((response) => response.status === "pending").length,
      declined: responses.filter((response) => response.status === "declined").length,
    }),
    [responses],
  )

  const fetchRequest = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/availability-requests/${params.requestId}`, { credentials: "include" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not load availability request")
      setRequest(payload.request)
      setResponses(payload.request?.responses || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load availability request")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequest()
  }, [params.requestId])

  useEffect(() => {
    const supabase = createBrowserClient()
    const channel = supabase
      .channel(`availability-${params.requestId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "availability_responses",
          filter: `request_id=eq.${params.requestId}`,
        },
        (payload: any) => {
          setResponses((prev) =>
            prev.map((response) => (response.id === payload.new.id ? { ...response, ...payload.new } : response)),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.requestId])

  const generateCallSheet = async () => {
    setGenerating(true)
    setError("")
    try {
      const response = await fetch("/api/call-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          request_id: params.requestId,
          project_name: request?.project_name,
          general_call_time: "06:00",
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not generate call sheet")
      router.push(`/crew-pools/call-sheets/${payload.call_sheet.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate call sheet")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-[#07111f] md:px-8">
      <div className="mx-auto max-w-5xl">
        <Button asChild variant="ghost" className="-ml-3 rounded-full">
          <Link href={`/crew-pools/${params.poolId}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to pool
          </Link>
        </Button>

        <div className="mt-4 rounded-[32px] border border-[#e4ebf3] bg-white p-5 shadow-sm">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef1218]">Availability check</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">
                {request?.project_name || "Untitled production"}
              </h1>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#5d6b82]">
                <span className="flex items-center gap-2 rounded-full bg-[#f4f7fb] px-3 py-2">
                  <CalendarDays className="h-4 w-4" />
                  {request?.shoot_date}
                </span>
                {request?.shoot_location && (
                  <span className="flex items-center gap-2 rounded-full bg-[#f4f7fb] px-3 py-2">
                    <MapPin className="h-4 w-4" />
                    {request.shoot_location}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-3xl bg-green-50 p-4 text-green-800">
            <CheckCircle2 className="h-5 w-5" />
            <p className="mt-2 text-2xl font-black">{counts.confirmed}</p>
            <p className="text-xs font-semibold">Confirmed</p>
          </div>
          <div className="rounded-3xl bg-amber-50 p-4 text-amber-800">
            <Clock3 className="h-5 w-5" />
            <p className="mt-2 text-2xl font-black">{counts.pending}</p>
            <p className="text-xs font-semibold">Pending</p>
          </div>
          <div className="rounded-3xl bg-red-50 p-4 text-red-800">
            <XCircle className="h-5 w-5" />
            <p className="mt-2 text-2xl font-black">{counts.declined}</p>
            <p className="text-xs font-semibold">Declined</p>
          </div>
        </div>

        {error && <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="mt-6 space-y-3">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="rounded-[28px] border-[#e4ebf3] bg-white">
                  <CardContent className="flex items-center gap-4 p-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </CardContent>
                </Card>
              ))
            : responses.map((response, index) => (
                <motion.div
                  key={response.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.35 }}
                >
                  <Card className="rounded-[28px] border-[#e4ebf3] bg-white shadow-sm">
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={response.profile?.avatar_url || undefined} alt={response.profile?.full_name} />
                        <AvatarFallback>{initials(response.profile?.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-black">{response.profile?.full_name || "Crew member"}</p>
                        <p className="truncate text-sm text-[#5d6b82]">{response.profile?.role || "Creative"}</p>
                      </div>
                      <Badge className={`rounded-full ${statusClasses[response.status]}`}>{response.status}</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            type="button"
            disabled={counts.confirmed < 1 || generating}
            onClick={generateCallSheet}
            className="h-12 rounded-full bg-[#07111f] px-6 text-white hover:bg-black"
          >
            <FileText className="h-4 w-4" />
            {generating ? "Generating..." : "Generate Call Sheet"}
          </Button>
        </div>
      </div>
    </main>
  )
}
