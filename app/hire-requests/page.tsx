"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Inbox,
  MessageCircle,
  Search,
  Send,
  SlidersHorizontal,
  WalletCards,
  XCircle,
} from "lucide-react"
import MobileShell from "@/components/mobile/mobile-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MOCK_BRAD_USER_ID,
  type MockMessagingConversation,
  type MockMessagingProfile,
  loadMockMessagingState,
} from "@/lib/mock-data/messaging-test-data"
import {
  loadMockHireRequests,
  type MockHireRequest,
  type MockHireRequestStatus,
  updateMockHireRequestStatus,
} from "@/lib/mock-data/hire-request-data"
import { cn } from "@/lib/utils"

type RequestFilter = "all" | "received" | "sent"
type StatusFilter = "all" | MockHireRequestStatus

const fallbackAvatar =
  "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400"

const requestFilters: Array<{ key: RequestFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "received", label: "Received" },
  { key: "sent", label: "Sent" },
]

const statusFilters: Array<{ key: StatusFilter; label: string }> = [
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "declined", label: "Declined" },
  { key: "confirmed", label: "Confirmed" },
]

function formatCurrency(amount: number) {
  return `R${Math.max(0, Math.round(amount)).toLocaleString("en-ZA")}`
}

function formatDate(date?: string) {
  if (!date) return "Date to be confirmed"
  const parsed = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDateRange(request: MockHireRequest) {
  if (!request.selected_date) return "Date to be confirmed"
  if (!request.selected_end_date || request.selected_end_date === request.selected_date) return formatDate(request.selected_date)
  return `${formatDate(request.selected_date)} - ${formatDate(request.selected_end_date)}`
}

function statusLabel(status: MockHireRequestStatus) {
  if (status === "accepted") return "Accepted"
  if (status === "confirmed") return "Confirmed"
  if (status === "declined") return "Declined"
  return "Pending"
}

function statusClass(status: MockHireRequestStatus) {
  if (status === "accepted" || status === "confirmed") return "bg-[#ecf8ee] text-[#177a35]"
  if (status === "declined") return "bg-[#fff0f0] text-[#b20f14]"
  return "bg-[#fff7e7] text-[#9b650f]"
}

export default function HireRequestsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [requests, setRequests] = useState<MockHireRequest[]>([])
  const [profiles, setProfiles] = useState<MockMessagingProfile[]>([])
  const [conversations, setConversations] = useState<MockMessagingConversation[]>([])
  const [activeProfileId, setActiveProfileId] = useState(searchParams.get("as") || MOCK_BRAD_USER_ID)
  const [requestFilter, setRequestFilter] = useState<RequestFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [query, setQuery] = useState("")
  const selectedRequestId = searchParams.get("request")

  useEffect(() => {
    const state = loadMockMessagingState()
    setRequests(loadMockHireRequests())
    setProfiles(state.profiles)
    setConversations(state.conversations)
  }, [])

  const profileMap = useMemo(() => {
    const map = new Map<string, MockMessagingProfile>()
    profiles.forEach((profile) => map.set(profile.user_id, profile))
    return map
  }, [profiles])

  const activeProfile = profileMap.get(activeProfileId)
  const receivedCount = requests.filter((request) => request.recipient_id === activeProfileId).length
  const sentCount = requests.filter((request) => request.requester_id === activeProfileId).length

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const isReceived = request.recipient_id === activeProfileId
      const isSent = request.requester_id === activeProfileId
      if (!isReceived && !isSent) return false
      if (requestFilter === "received" && !isReceived) return false
      if (requestFilter === "sent" && !isSent) return false
      if (statusFilter !== "all" && request.status !== statusFilter) return false
      if (query.trim()) {
        const needle = query.toLowerCase()
        const haystack = `${request.requester_name} ${request.recipient_name} ${request.booking_type} ${request.brief} ${request.city} ${request.province}`.toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      return true
    })
  }, [activeProfileId, query, requestFilter, requests, statusFilter])

  const updateStatus = (requestId: string, status: MockHireRequestStatus) => {
    const updated = updateMockHireRequestStatus(requestId, status)
    if (!updated) return
    setRequests((current) => current.map((request) => (request.id === requestId ? updated : request)))
  }

  const getMessageHref = (request: MockHireRequest) => {
    const otherId = request.recipient_id === activeProfileId ? request.requester_id : request.recipient_id
    const conversation = conversations.find(
      (item) => item.participant_ids.includes(request.requester_id) && item.participant_ids.includes(request.recipient_id),
    )
    return conversation
      ? `/messages?mock=1&as=${activeProfileId}&conversation=${conversation.id}`
      : `/messages?mock=1&as=${activeProfileId}&recipient=${otherId}`
  }

  return (
    <MobileShell title="Hire Requests">
      <div className="mx-auto max-w-[560px] space-y-4">
        <section className="rounded-[32px] bg-[#111111] p-5 text-white shadow-[0_24px_60px_rgba(17,17,17,0.18)]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10"
              aria-label="Back"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setRequestFilter("all")
                setStatusFilter("all")
                setQuery("")
                router.replace(`/hire-requests?as=${activeProfileId}`)
              }}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10"
              aria-label="Clear filters"
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </button>
          </div>
          <p className="mt-8 text-[12px] font-black uppercase tracking-[0.14em] text-[#ff5c61]">SnapScout requests</p>
          <h1 className="mt-2 max-w-[340px] text-[37px] font-black leading-[0.95]">Track every hire enquiry.</h1>
          <p className="mt-3 max-w-[380px] text-[14px] leading-6 text-white/75">
            Review incoming bookings, follow sent requests, and jump back into the chat when details need a little polish.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-[22px] bg-white/10 p-4">
              <Inbox className="h-5 w-5 text-[#ff5c61]" />
              <p className="mt-2 text-[28px] font-black">{receivedCount}</p>
              <p className="text-[12px] text-white/70">Received</p>
            </div>
            <div className="rounded-[22px] bg-white/10 p-4">
              <Send className="h-5 w-5 text-[#ff5c61]" />
              <p className="mt-2 text-[28px] font-black">{sentCount}</p>
              <p className="text-[12px] text-white/70">Sent</p>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-[#ebe5db] bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.1em] text-[#9ca3af]">Viewing as</p>
              <p className="mt-1 text-[19px] font-black text-[#111318]">{activeProfile?.display_name || "Brad Khumalo"}</p>
            </div>
            <select
              value={activeProfileId}
              onChange={(event) => {
                setActiveProfileId(event.target.value)
                router.replace(`/hire-requests?as=${event.target.value}`)
              }}
              className="h-11 max-w-[185px] rounded-full border border-[#e8e2d7] bg-white px-3 text-[13px] font-semibold outline-none"
            >
              {profiles.map((profile) => (
                <option key={profile.user_id} value={profile.user_id}>
                  {profile.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-full border border-[#e8e2d7] bg-[#fcfbf8] px-4 py-2">
            <Search className="h-4.5 w-4.5 text-[#667085]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search hire requests..."
              className="h-9 border-0 bg-transparent p-0 text-[14px] shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
            {requestFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => {
                  setRequestFilter(filter.key)
                  if (filter.key === "all") setStatusFilter("all")
                }}
                className={cn(
                  "h-10 rounded-full border px-4 text-[13px] font-bold",
                  requestFilter === filter.key && (filter.key !== "all" || statusFilter === "all")
                    ? "border-[#111318] bg-[#111318] text-white"
                    : "border-[#e8e2d7] bg-white text-[#303643]",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
            {statusFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setStatusFilter(filter.key)}
                className={cn(
                  "h-9 rounded-full border px-3 text-[12px] font-bold",
                  statusFilter === filter.key
                    ? "border-[#f20d14] bg-[#f20d14] text-white"
                    : "border-[#e8e2d7] bg-white text-[#303643]",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="rounded-[30px] border border-[#ebe5db] bg-white p-8 text-center shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#fff0f0] text-[#f20d14]">
                <CalendarCheck2 className="h-8 w-8" />
              </div>
              <p className="mt-4 text-[24px] font-black text-[#111318]">No requests here</p>
              <p className="mt-2 text-[14px] leading-6 text-[#667085]">Try another filter or send a hire request from a profile.</p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const isReceived = request.recipient_id === activeProfileId
              const otherId = isReceived ? request.requester_id : request.recipient_id
              const otherProfile = profileMap.get(otherId)
              const isSelected = selectedRequestId === request.id

              return (
                <motion.article
                  key={request.id}
                  initial={{ opacity: 0, y: 12, scale: 0.99 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.35 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "overflow-hidden rounded-[30px] border bg-white shadow-[0_18px_48px_rgba(15,23,42,0.07)]",
                    isSelected ? "border-[#f20d14]" : "border-[#ebe5db]",
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-14 w-14 border border-[#ece5da]">
                        <AvatarImage src={otherProfile?.profile_picture || fallbackAvatar} className="object-cover" />
                        <AvatarFallback>{(otherProfile?.display_name || request.recipient_name).charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="truncate text-[20px] font-black leading-tight text-[#111318]">
                              {isReceived ? request.requester_name : request.recipient_name}
                            </p>
                            <p className="mt-1 text-[13px] text-[#667085]">
                              {isReceived ? "Received request" : "Sent request"} · {request.booking_type}
                            </p>
                          </div>
                          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-black", statusClass(request.status))}>
                            {statusLabel(request.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-[20px] bg-[#f6f7fb] p-3">
                        <WalletCards className="h-4.5 w-4.5 text-[#f20d14]" />
                        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.04em] text-[#667085]">Estimate</p>
                        <p className="font-mono text-[20px] font-black text-[#111318]">{formatCurrency(request.total_estimate)}</p>
                      </div>
                      <div className="rounded-[20px] bg-[#fff8ec] p-3">
                        <Clock3 className="h-4.5 w-4.5 text-[#9b650f]" />
                        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.04em] text-[#8c6b2a]">Dates</p>
                        <p className="text-[13px] font-black leading-5 text-[#111318]">{formatDateRange(request)}</p>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-[14px] leading-6 text-[#5f6672]">
                      {request.brief || "No project brief added yet."}
                    </p>

                    {isReceived && request.status === "pending" ? (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => updateStatus(request.id, "declined")}
                          className="h-12 rounded-full border-[#ffd2d4] bg-white text-[#b20f14]"
                        >
                          <XCircle className="mr-2 h-4.5 w-4.5" />
                          Decline
                        </Button>
                        <Button
                          type="button"
                          onClick={() => updateStatus(request.id, "accepted")}
                          className="h-12 rounded-full bg-[#f20d14] text-white hover:bg-[#d9070d]"
                        >
                          <CheckCircle2 className="mr-2 h-4.5 w-4.5" />
                          Accept
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 border-t border-[#f0ebe2]">
                    <Link
                      href={getMessageHref(request)}
                      className="inline-flex h-12 items-center justify-center gap-2 py-4 text-[14px] font-black text-[#111318]"
                    >
                      <MessageCircle className="h-4.5 w-4.5" />
                      Chat
                    </Link>
                    <Link
                      href={`/booking/${request.id}?as=${activeProfileId}`}
                      className="inline-flex h-12 items-center justify-center gap-2 border-l border-[#f0ebe2] py-4 text-[14px] font-black text-[#f20d14]"
                    >
                      Review
                      <ChevronRight className="h-4.5 w-4.5" />
                    </Link>
                  </div>
                </motion.article>
              )
            })
          )}
        </section>
      </div>
    </MobileShell>
  )
}
