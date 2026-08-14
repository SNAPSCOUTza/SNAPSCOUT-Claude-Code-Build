"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Home,
  MapPin,
  MessageCircle,
  ShieldCheck,
  User,
  WalletCards,
  XCircle,
} from "lucide-react"
import MobileShell from "@/components/mobile/mobile-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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

const fallbackHero =
  "https://images.pexels.com/photos/3062545/pexels-photo-3062545.jpeg?auto=compress&cs=tinysrgb&w=900"
const fallbackAvatar =
  "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400"

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

function formatDuration(request: MockHireRequest) {
  const days = Math.max(1, request.date_range_days || 1)
  if (request.duration === "2-hours") return `${days} day${days > 1 ? "s" : ""} · Two hours/day`
  if (request.duration === "3-hours") return `${days} day${days > 1 ? "s" : ""} · Three hours/day`
  if (request.duration === "4-hours") return `${days} day${days > 1 ? "s" : ""} · Four hours/day`
  if (request.duration === "multiple-days") return `${days} day${days > 1 ? "s" : ""} · Full day`
  return `${days} day${days > 1 ? "s" : ""} · All day`
}

function statusStyles(status: MockHireRequestStatus) {
  if (status === "accepted" || status === "confirmed") return "bg-[#ecf8ee] text-[#177a35] border-[#ccebd3]"
  if (status === "declined") return "bg-[#fff0f0] text-[#b20f14] border-[#ffd6d8]"
  return "bg-[#fff7e7] text-[#9b650f] border-[#f4dfb2]"
}

function statusLabel(status: MockHireRequestStatus) {
  if (status === "accepted") return "Accepted"
  if (status === "confirmed") return "Confirmed"
  if (status === "declined") return "Declined"
  return "Pending review"
}

function profilePath(profileId: string, profile?: MockMessagingProfile, recipientType?: MockHireRequest["recipient_type"]) {
  const role = (profile?.profession || recipientType || "").toLowerCase()
  if (role.includes("studio") || role.includes("store")) return `/studios-stores/${profileId}`
  if (role.includes("crew") || recipientType === "crew") return `/crew/${profileId}`
  return `/creators/${profileId}`
}

export default function BookingReviewPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [requests, setRequests] = useState<MockHireRequest[]>([])
  const [profiles, setProfiles] = useState<MockMessagingProfile[]>([])
  const [conversations, setConversations] = useState<MockMessagingConversation[]>([])
  const activeProfileId = searchParams.get("as") || MOCK_BRAD_USER_ID

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

  const request = useMemo(() => {
    return (
      requests.find((item) => item.id === params.id) ||
      requests.find((item) => item.recipient_id === params.id || item.requester_id === params.id) ||
      null
    )
  }, [params.id, requests])

  const relatedConversation = useMemo(() => {
    if (!request) return null
    return (
      conversations.find(
        (conversation) =>
          conversation.participant_ids.includes(request.requester_id) &&
          conversation.participant_ids.includes(request.recipient_id),
      ) || null
    )
  }, [conversations, request])

  const requesterProfile = request ? profileMap.get(request.requester_id) : undefined
  const recipientProfile = request ? profileMap.get(request.recipient_id) : undefined
  const isRecipient = request?.recipient_id === activeProfileId
  const otherProfileId = isRecipient ? request?.requester_id : request?.recipient_id
  const otherProfile = otherProfileId ? profileMap.get(otherProfileId) : undefined
  const messageHref = request
    ? relatedConversation
      ? `/messages?mock=1&as=${activeProfileId}&conversation=${relatedConversation.id}`
      : `/messages?mock=1&as=${activeProfileId}&recipient=${otherProfileId}`
    : "/messages?mock=1"

  const updateStatus = (status: MockHireRequestStatus) => {
    if (!request) return
    const updated = updateMockHireRequestStatus(request.id, status)
    if (!updated) return
    setRequests((current) => current.map((item) => (item.id === request.id ? updated : item)))
  }

  if (!request) {
    return (
      <MobileShell title="Booking Review">
        <div className="mx-auto max-w-[520px] rounded-[32px] border border-[#ebe5db] bg-white p-6 text-center shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#fff0f0] text-[#f20d14]">
            <CalendarCheck2 className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-[28px] font-black leading-tight text-[#111318]">No booking found</h1>
          <p className="mt-2 text-[14px] leading-6 text-[#667085]">
            This request may have been cleared or belongs to another mock profile.
          </p>
          <Button asChild className="mt-5 h-12 rounded-full bg-[#f20d14] px-6 text-white hover:bg-[#d9070d]">
            <Link href="/hire-requests">Open hire requests</Link>
          </Button>
        </div>
      </MobileShell>
    )
  }

  const heroProfile = recipientProfile || requesterProfile
  const displayName = isRecipient ? request.requester_name : request.recipient_name
  const subtitle = isRecipient ? "Client booking request" : `${request.recipient_name} booking review`
  const location = request.shoot_location || request.address || [request.city, request.province].filter(Boolean).join(", ") || "Location to be confirmed"
  const profileHref = profilePath(isRecipient ? request.requester_id : request.recipient_id, otherProfile, request.recipient_type)

  return (
    <MobileShell title="Booking Review">
      <div className="mx-auto max-w-[560px] space-y-4">
        <section className="overflow-hidden rounded-[32px] bg-[#111111] text-white shadow-[0_24px_60px_rgba(17,17,17,0.22)]">
          <div className="relative min-h-[270px] p-5">
            <Image
              src={heroProfile?.profile_picture || fallbackHero}
              alt=""
              fill
              sizes="560px"
              className="object-cover opacity-45"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
            <div className="relative z-10 flex items-center justify-between">
              <motion.button
                type="button"
                onClick={() => router.back()}
                whileTap={{ scale: 0.92 }}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 text-[13px] font-bold backdrop-blur"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </motion.button>
              <Link
                href="/explore"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/35 bg-white/10 backdrop-blur"
                aria-label="Home"
              >
                <Home className="h-4.5 w-4.5" />
              </Link>
            </div>
            <div className="relative z-10 mt-16">
              <span className={cn("inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em]", statusStyles(request.status))}>
                {statusLabel(request.status)}
              </span>
              <p className="mt-4 text-[12px] font-black uppercase tracking-[0.14em] text-[#ff5c61]">
                {request.origin === "availability" ? "Availability enquiry" : "Booking enquiry"}
              </p>
              <h1 className="mt-2 max-w-[360px] text-[36px] font-black leading-[0.95]">
                Review {request.booking_type.toLowerCase()}.
              </h1>
              <p className="mt-3 max-w-[360px] text-[14px] leading-6 text-white/80">{subtitle}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-[#ebe5db] bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16 border border-[#ece5da]">
              <AvatarImage src={otherProfile?.profile_picture || fallbackAvatar} className="object-cover" />
              <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[23px] font-black leading-tight text-[#111318]">{displayName}</p>
              <p className="mt-1 text-[13px] text-[#667085]">{otherProfile?.profession || subtitle}</p>
            </div>
            <Button asChild variant="outline" className="h-11 rounded-full border-[#e8e2d7] px-4">
              <Link href={profileHref}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[22px] bg-[#f6f7fb] p-4">
              <WalletCards className="h-5 w-5 text-[#f20d14]" />
              <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#667085]">Client budget</p>
              <p className="mt-1 font-mono text-[25px] font-black text-[#111318]">{formatCurrency(request.total_estimate)}</p>
            </div>
            <div className="rounded-[22px] bg-[#fff8ec] p-4">
              <Clock3 className="h-5 w-5 text-[#9b650f]" />
              <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#8c6b2a]">Duration</p>
              <p className="mt-1 text-[17px] font-black text-[#111318]">{formatDuration(request)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-[#ebe5db] bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.12em] text-[#9ca3af]">Receipt review</p>
              <h2 className="mt-1 text-[24px] font-black text-[#111318]">What the client wants</h2>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fff0f0] text-[#f20d14]">
              <CalendarCheck2 className="h-6 w-6" />
            </span>
          </div>

          <div className="space-y-3">
            {[
              { icon: CalendarCheck2, label: "Date", value: formatDateRange(request) },
              { icon: MapPin, label: "Location", value: location },
              { icon: ShieldCheck, label: "Service", value: request.booking_type },
              { icon: FileText, label: "Project brief", value: request.brief || "Project brief to be confirmed." },
            ].map((item) => (
              <div key={item.label} className="rounded-[22px] border border-[#edf0f5] bg-[#fcfbf8] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#f20d14] shadow-sm">
                    <item.icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#667085]">{item.label}</p>
                    <p className="mt-1 text-[15px] font-semibold leading-6 text-[#111318]">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="sticky bottom-[104px] z-20 rounded-[28px] border border-[#ebe5db] bg-white/95 p-3 shadow-[0_18px_44px_rgba(15,23,42,0.12)] backdrop-blur">
          {isRecipient && request.status === "pending" ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                onClick={() => updateStatus("declined")}
                variant="outline"
                className="h-14 rounded-full border-[#ffd2d4] bg-white text-[#b20f14]"
              >
                <XCircle className="mr-2 h-5 w-5" />
                Decline
              </Button>
              <Button
                type="button"
                onClick={() => updateStatus("accepted")}
                className="h-14 rounded-full bg-[#f20d14] text-white hover:bg-[#d9070d]"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Accept
              </Button>
            </div>
          ) : (
            <Button asChild className="h-14 w-full rounded-full bg-[#f20d14] text-white hover:bg-[#d9070d]">
              <Link href={messageHref}>
                <MessageCircle className="mr-2 h-5 w-5" />
                Continue conversation
              </Link>
            </Button>
          )}

          <Button asChild variant="outline" className="mt-2 h-12 w-full rounded-full border-[#e8e2d7] bg-white text-[#111318]">
            <Link href="/hire-requests">
              View all hire requests
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </MobileShell>
  )
}
