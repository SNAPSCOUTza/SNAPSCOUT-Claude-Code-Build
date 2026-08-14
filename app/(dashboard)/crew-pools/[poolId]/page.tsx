"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CalendarCheck, MapPin, RefreshCw, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { AvailabilityRequestModal } from "@/components/crew/AvailabilityRequestModal"
import type { CrewPool, CrewPoolMember } from "@/types/crew-pool"

function initials(name?: string) {
  return (name || "SS")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatRate(rate?: number | null) {
  return rate ? `R${rate.toLocaleString("en-ZA")}` : "Rate on request"
}

export default function CrewPoolDetailPage() {
  const params = useParams<{ poolId: string }>()
  const [pool, setPool] = useState<CrewPool | null>(null)
  const [members, setMembers] = useState<CrewPoolMember[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [requestOpen, setRequestOpen] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const selectedMembers = useMemo(
    () => members.filter((member) => selectedIds.includes(member.profile_id)),
    [members, selectedIds],
  )

  const fetchMembers = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/crew-pools/${params.poolId}/members`, { credentials: "include" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not load pool")
      setPool(payload.pool)
      setMembers(payload.members || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load pool")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [params.poolId])

  const toggleSelected = (profileId: string, checked: boolean | "indeterminate") => {
    setSelectedIds((prev) =>
      checked === true ? Array.from(new Set([...prev, profileId])) : prev.filter((id) => id !== profileId),
    )
  }

  const removeMember = async (profileId: string) => {
    setRemovingId(profileId)
    setError("")
    try {
      const response = await fetch(`/api/crew-pools/${params.poolId}/members/${profileId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || "Could not remove member")
      setMembers((prev) => prev.filter((member) => member.profile_id !== profileId))
      setSelectedIds((prev) => prev.filter((id) => id !== profileId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove member")
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 pb-32 text-[#07111f] md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button asChild variant="ghost" className="-ml-3 rounded-full">
              <Link href="/crew-pools">
                <ArrowLeft className="h-4 w-4" />
                Crew Pools
              </Link>
            </Button>
            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">{pool?.name || "Crew Pool"}</h1>
            <p className="mt-2 text-sm text-[#5d6b82]">{members.length} saved crew members</p>
          </div>
          <Button
            type="button"
            disabled={selectedMembers.length === 0}
            onClick={() => setRequestOpen(true)}
            className="h-12 rounded-full bg-[#ef1218] px-6 text-white hover:bg-[#d90d12]"
          >
            <CalendarCheck className="h-4 w-4" />
            Check Availability
          </Button>
        </div>

        {error && (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-3xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>
            <Button type="button" variant="outline" size="sm" onClick={fetchMembers} className="rounded-full bg-white">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="rounded-[28px] border-[#e4ebf3] bg-white">
                  <CardContent className="flex items-center gap-4 p-5">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-full" />
                  </CardContent>
                </Card>
              ))
            : members.map((member, index) => {
                const profile = member.profile
                const checked = selectedIds.includes(member.profile_id)
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.35 }}
                  >
                    <Card className="rounded-[28px] border-[#e4ebf3] bg-white shadow-sm">
                      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => toggleSelected(member.profile_id, value)}
                          className="h-5 w-5 rounded-md"
                          aria-label={`Select ${profile?.full_name || "crew member"}`}
                        />
                        <Avatar className="h-14 w-14 border border-[#e4ebf3]">
                          <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "Crew"} />
                          <AvatarFallback>{initials(profile?.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-lg font-black">{profile?.full_name || "SnapScout Creative"}</p>
                          <p className="text-sm font-medium text-[#ef1218]">{profile?.role || "Creative"}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-[#5d6b82]">
                            <MapPin className="h-3.5 w-3.5" />
                            {profile?.location || "South Africa"}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {(profile?.skills || []).slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="rounded-full bg-[#f2f4f7]">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="hidden text-right sm:block">
                          <p className="font-black">{formatRate(profile?.day_rate)}</p>
                          <p className="text-xs text-[#5d6b82]">Day rate</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={removingId === member.profile_id}
                          onClick={() => removeMember(member.profile_id)}
                          className="rounded-full bg-white"
                          aria-label={`Remove ${profile?.full_name || "member"}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
        </div>

        {!loading && members.length === 0 && !error && (
          <div className="mt-10 rounded-[32px] border border-dashed border-[#dbe4ee] bg-[#f8fafc] p-8 text-center">
            <h2 className="text-2xl font-black">No saved crew yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#5d6b82]">
              Use the Save to Pool button on profiles and browse cards to build this crew list.
            </p>
            <Button asChild className="mt-5 h-12 rounded-full bg-[#ef1218] px-6 text-white hover:bg-[#d90d12]">
              <Link href="/find-crew">Find Crew</Link>
            </Button>
          </div>
        )}
      </div>

      {selectedMembers.length > 0 && !requestOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e4ebf3] bg-white/95 px-4 py-4 backdrop-blur md:hidden">
          <Button
            type="button"
            onClick={() => setRequestOpen(true)}
            className="h-12 w-full rounded-full bg-[#ef1218] text-white hover:bg-[#d90d12]"
          >
            Check Availability ({selectedMembers.length})
          </Button>
        </div>
      )}

      <AvailabilityRequestModal
        open={requestOpen}
        onOpenChange={setRequestOpen}
        poolId={params.poolId}
        selectedMembers={selectedMembers}
      />
    </main>
  )
}
