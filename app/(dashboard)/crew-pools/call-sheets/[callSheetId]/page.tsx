"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, CreditCard, Printer, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import type { CallSheet, CallSheetCrewEntry } from "@/types/crew-pool"

function initials(name?: string) {
  return (name || "SS")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function CallSheetPage() {
  const params = useParams<{ callSheetId: string }>()
  const [callSheet, setCallSheet] = useState<CallSheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [projectName, setProjectName] = useState("")

  const fetchCallSheet = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/call-sheets/${params.callSheetId}`, { credentials: "include" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not load call sheet")
      setCallSheet(payload.call_sheet)
      setProjectName(payload.call_sheet?.project_name || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load call sheet")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCallSheet()
  }, [params.callSheetId])

  const updateProjectName = async () => {
    if (!callSheet || projectName === callSheet.project_name) return
    setSaving("project")
    setError("")
    try {
      const response = await fetch(`/api/call-sheets/${params.callSheetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ project_name: projectName }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not update project")
      setCallSheet((prev) => (prev ? { ...prev, project_name: payload.call_sheet.project_name } : prev))
      setMessage("Project updated")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update project")
    } finally {
      setSaving("")
    }
  }

  const updateCrew = async (entry: CallSheetCrewEntry, update: Partial<CallSheetCrewEntry>) => {
    setSaving(entry.crew_member_id)
    setError("")
    try {
      const response = await fetch(`/api/call-sheets/${params.callSheetId}/crew/${entry.crew_member_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          call_time: update.call_time ?? entry.call_time,
          department: update.department ?? entry.department,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not update crew")
      setCallSheet((prev) =>
        prev
          ? {
              ...prev,
              crew: (prev.crew || []).map((crewEntry) =>
                crewEntry.id === entry.id ? { ...crewEntry, ...payload.crew } : crewEntry,
              ),
            }
          : prev,
      )
      setMessage("Call time saved")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update crew")
    } finally {
      setSaving("")
    }
  }

  const sendCallSheet = async () => {
    setSaving("send")
    setError("")
    try {
      const response = await fetch(`/api/call-sheets/${params.callSheetId}/send`, {
        method: "POST",
        credentials: "include",
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not send call sheet")
      setCallSheet((prev) => (prev ? { ...prev, status: "sent" } : prev))
      setMessage("Call sheet marked as sent")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send call sheet")
    } finally {
      setSaving("")
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-[#07111f] md:px-8 print:px-0">
      <div className="mx-auto max-w-5xl">
        <Button asChild variant="ghost" className="-ml-3 rounded-full print:hidden">
          <Link href="/crew-pools">
            <ArrowLeft className="h-4 w-4" />
            Crew Pools
          </Link>
        </Button>

        <div className="mt-4 rounded-[32px] border border-[#e4ebf3] bg-white p-5 shadow-sm">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef1218]">Call sheet</p>
                  <Input
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    onBlur={updateProjectName}
                    className="mt-2 h-auto border-0 bg-transparent p-0 text-3xl font-black tracking-tight shadow-none focus-visible:ring-0 md:text-5xl"
                  />
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#5d6b82]">
                    <span className="rounded-full bg-[#f4f7fb] px-3 py-2">{callSheet?.shoot_date}</span>
                    <span className="rounded-full bg-[#f4f7fb] px-3 py-2">{callSheet?.shoot_location || "Location TBC"}</span>
                    <span className="flex items-center gap-2 rounded-full bg-[#f4f7fb] px-3 py-2">
                      <Clock className="h-4 w-4" />
                      General call {callSheet?.general_call_time}
                    </span>
                  </div>
                </div>
                <Badge className={callSheet?.status === "sent" ? "bg-green-100 text-green-800" : "bg-[#f4f7fb] text-[#07111f]"}>
                  {callSheet?.status || "draft"}
                </Badge>
              </div>
            </>
          )}
        </div>

        {error && <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {message && <p className="mt-5 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}

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
                    <Skeleton className="h-10 w-24 rounded-full" />
                  </CardContent>
                </Card>
              ))
            : (callSheet?.crew || []).map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.35 }}
                >
                  <Card className="rounded-[28px] border-[#e4ebf3] bg-white shadow-sm">
                    <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_160px_180px] md:items-center">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={entry.profile?.avatar_url || undefined} alt={entry.profile?.full_name} />
                          <AvatarFallback>{initials(entry.profile?.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-black">{entry.profile?.full_name || "Crew member"}</p>
                          <p className="truncate text-sm text-[#5d6b82]">{entry.role || entry.profile?.role || "Crew"}</p>
                        </div>
                      </div>
                      <Input
                        defaultValue={entry.call_time}
                        onBlur={(event) => updateCrew(entry, { call_time: event.target.value })}
                        className="h-11 rounded-full bg-white"
                        aria-label={`Call time for ${entry.profile?.full_name || "crew member"}`}
                      />
                      <Input
                        defaultValue={entry.department || ""}
                        onBlur={(event) => updateCrew(entry, { department: event.target.value })}
                        className="h-11 rounded-full bg-white"
                        placeholder="Department"
                        aria-label={`Department for ${entry.profile?.full_name || "crew member"}`}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row print:hidden">
          <Button
            type="button"
            disabled={saving === "send" || callSheet?.status === "sent"}
            onClick={sendCallSheet}
            className="h-12 rounded-full bg-[#ef1218] text-white hover:bg-[#d90d12]"
          >
            <Send className="h-4 w-4" />
            Send to Crew
          </Button>
          <Button type="button" variant="outline" onClick={() => window.print()} className="h-12 rounded-full bg-white">
            <Printer className="h-4 w-4" />
            Export as PDF
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-full bg-white">
            <Link href="/dashboard/payment">
              <CreditCard className="h-4 w-4" />
              Request Payments
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
