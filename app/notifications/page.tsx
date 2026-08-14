"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { Bell, CalendarCheck2, CalendarClock, CheckCheck, MessageCircle, Search, User } from "lucide-react"
import MobileShell from "@/components/mobile/mobile-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MOCK_BRAD_USER_ID, type MockMessagingState, loadMockMessagingState } from "@/lib/mock-data/messaging-test-data"
import { loadMockHireRequests, type MockHireRequest, type MockHireRequestOrigin } from "@/lib/mock-data/hire-request-data"
import { cn } from "@/lib/utils"

const READ_STORAGE_KEY = "snapscout_notifications_read_v1"

type NotificationType = "message" | "booking_received" | "booking_sent"
type NotificationFilter = "all" | "unread" | "messages" | "bookings"

type InboxNotification = {
  id: string
  type: NotificationType
  profileName: string
  profilePicture: string
  title: string
  detail: string
  createdAt: string
  href: string
}

const filterTabs: Array<{ key: NotificationFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "messages", label: "Messages" },
  { key: "bookings", label: "Bookings" },
]

function formatCurrency(amount: number) {
  return `R${Math.max(0, Math.round(amount)).toLocaleString("en-ZA")}`
}

function formatNotificationTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return format(date, "dd MMM, HH:mm")
}

function formatRequestDateLabel(request: MockHireRequest) {
  if (!request.selected_date) return "Date to be confirmed"
  if (!request.selected_end_date || request.selected_end_date === request.selected_date) return request.selected_date
  return `${request.selected_date} to ${request.selected_end_date}`
}

function mapOriginLabel(origin: MockHireRequestOrigin) {
  return origin === "availability" ? "Availability enquiry" : "Booking enquiry"
}

function buildMessagePreview(content: string) {
  if (!content) return "New message"
  if (content.length <= 90) return content
  return `${content.slice(0, 87)}...`
}

function loadReadState(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(READ_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return {}
    return parsed
  } catch {
    return {}
  }
}

function saveReadState(state: Record<string, boolean>) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(state))
}

export default function NotificationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<MockMessagingState | null>(null)
  const [requests, setRequests] = useState<MockHireRequest[]>([])
  const [activeProfileId, setActiveProfileId] = useState(MOCK_BRAD_USER_ID)
  const [filter, setFilter] = useState<NotificationFilter>("all")
  const [query, setQuery] = useState("")
  const [readState, setReadState] = useState<Record<string, boolean>>({})
  const [showProfilePicker, setShowProfilePicker] = useState(false)

  useEffect(() => {
    const loadedState = loadMockMessagingState()
    const loadedRequests = loadMockHireRequests()
    const profileFromQuery = searchParams.get("as")

    setState(loadedState)
    setRequests(loadedRequests)
    setReadState(loadReadState())

    if (profileFromQuery && loadedState.profiles.some((profile) => profile.user_id === profileFromQuery)) {
      setActiveProfileId(profileFromQuery)
    }
  }, [searchParams])

  useEffect(() => {
    saveReadState(readState)
  }, [readState])

  const profileMap = useMemo(() => {
    const map = new Map<string, { name: string; picture: string }>()
    state?.profiles.forEach((profile) => {
      map.set(profile.user_id, {
        name: profile.display_name,
        picture: profile.profile_picture,
      })
    })
    return map
  }, [state])

  const notifications = useMemo(() => {
    if (!state) return []

    const items: InboxNotification[] = []

    state.conversations
      .filter((conversation) => conversation.participant_ids.includes(activeProfileId))
      .forEach((conversation) => {
        const otherId = conversation.participant_ids.find((id) => id !== activeProfileId) || activeProfileId
        const other = profileMap.get(otherId)
        const incoming = [...conversation.messages]
          .reverse()
          .find((message) => message.sender_id !== activeProfileId)

        if (!incoming) return

        items.push({
          id: `msg-${conversation.id}-${incoming.id}`,
          type: "message",
          profileName: other?.name || "SnapScout profile",
          profilePicture: other?.picture || "",
          title: `New message from ${other?.name || "SnapScout profile"}`,
          detail: buildMessagePreview(incoming.content),
          createdAt: incoming.created_at,
          href: `/messages?mock=1&as=${activeProfileId}&conversation=${conversation.id}`,
        })
      })

    requests.forEach((request) => {
      if (request.recipient_id === activeProfileId) {
        items.push({
          id: `booking-in-${request.id}`,
          type: "booking_received",
          profileName: request.requester_name,
          profilePicture: profileMap.get(request.requester_id)?.picture || "",
          title: `${request.requester_name} sent a ${mapOriginLabel(request.origin).toLowerCase()}`,
          detail: `${request.booking_type} - ${formatRequestDateLabel(request)} - ${formatCurrency(request.total_estimate)}`,
          createdAt: request.created_at,
          href: `/hire-requests?as=${activeProfileId}&request=${request.id}`,
        })
      }

      if (request.requester_id === activeProfileId) {
        items.push({
          id: `booking-out-${request.id}`,
          type: "booking_sent",
          profileName: request.recipient_name,
          profilePicture: profileMap.get(request.recipient_id)?.picture || "",
          title: `You sent ${request.recipient_name} a ${mapOriginLabel(request.origin).toLowerCase()}`,
          detail: `${request.booking_type} - ${formatRequestDateLabel(request)} - ${request.status}`,
          createdAt: request.created_at,
          href: `/hire-requests?as=${activeProfileId}&request=${request.id}`,
        })
      }
    })

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [activeProfileId, profileMap, requests, state])

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (filter === "unread" && readState[item.id]) return false
      if (filter === "messages" && item.type !== "message") return false
      if (filter === "bookings" && item.type === "message") return false
      if (query.trim()) {
        const needle = query.toLowerCase()
        const haystack = `${item.title} ${item.detail} ${item.profileName}`.toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      return true
    })
  }, [filter, notifications, query, readState])

  const unreadCount = useMemo(
    () => notifications.filter((item) => !readState[item.id]).length,
    [notifications, readState],
  )

  const activeProfileName = state?.profiles.find((profile) => profile.user_id === activeProfileId)?.display_name || "Profile"

  const openNotification = (notification: InboxNotification) => {
    setReadState((prev) => ({ ...prev, [notification.id]: true }))
    router.push(notification.href)
  }

  if (!state) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-[#fffaf6]">
        <p className="text-[14px] text-[#5f6672]">Loading notifications...</p>
      </div>
    )
  }

  return (
    <MobileShell title="Notifications">
      <div className="min-h-[calc(100dvh-176px)] rounded-[30px] border border-[#ebe5db] bg-white shadow-[0_20px_54px_rgba(0,0,0,0.06)]">
        <div className="border-b border-[#f0ebe2] px-4 pb-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[34px] font-bold leading-none text-[#111318]">Notifications</p>
              <p className="mt-1 text-[13px] text-[#667085]">{unreadCount} unread</p>
            </div>
            <button
              type="button"
              onClick={() => setShowProfilePicker((value) => !value)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[#ece5da] bg-white px-3 text-[12px] font-semibold text-[#111318]"
            >
              <User className="h-3.5 w-3.5" />
              {activeProfileName}
            </button>
          </div>

          {showProfilePicker && (
            <div className="mt-3 rounded-2xl border border-[#ece5da] bg-white p-2">
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {state.profiles.map((profile) => (
                  <button
                    key={profile.user_id}
                    type="button"
                    onClick={() => {
                      setActiveProfileId(profile.user_id)
                      setShowProfilePicker(false)
                      router.replace(`/notifications?as=${profile.user_id}`)
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left",
                      profile.user_id === activeProfileId ? "bg-[#f5f7fb]" : "hover:bg-[#faf8f4]",
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.profile_picture} />
                      <AvatarFallback>{profile.display_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[#111318]">{profile.display_name}</p>
                      <p className="truncate text-[11px] text-[#667085]">{profile.profession}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#e7dfd4] bg-white px-3 py-2">
            <Search className="h-4 w-4 text-[#69707b]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search notifications..."
              className="h-8 border-0 bg-transparent p-0 text-[14px] shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12px] font-semibold",
                  filter === tab.key
                    ? "border-[#111318] bg-[#111318] text-white"
                    : "border-[#ece5da] bg-white text-[#303643]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReadState({})}
              className="h-9 rounded-full border-[#e8e2d7] bg-white text-[#111318]"
            >
              Reset read state
            </Button>
            <Button
              type="button"
              onClick={() => {
                const next: Record<string, boolean> = {}
                notifications.forEach((item) => {
                  next[item.id] = true
                })
                setReadState(next)
              }}
              className="h-9 rounded-full bg-[#f20d14] text-white hover:bg-[#d9070d]"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          </div>
        </div>

        <div className="no-scrollbar max-h-[calc(100dvh-410px)] overflow-y-auto p-4">
          {filteredNotifications.length === 0 ? (
            <div className="grid min-h-[300px] place-items-center text-center">
              <div>
                <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-[#f5f7fb]">
                  <Bell className="h-7 w-7 text-[#667085]" />
                </div>
                <p className="text-[20px] font-semibold text-[#111318]">No notifications yet</p>
                <p className="mt-1 text-[14px] text-[#667085]">Messages and booking enquiries will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const unread = !readState[notification.id]
                const bookingItem = notification.type !== "message"
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => openNotification(notification)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition-colors hover:bg-[#faf8f4]",
                      unread ? "border-[#f2d8da] bg-[#fff8f8]" : "border-[#ece5da] bg-white",
                    )}
                  >
                    <Avatar className="h-12 w-12 border border-[#ece5da]">
                      <AvatarImage src={notification.profilePicture} />
                      <AvatarFallback>{notification.profileName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex h-6 items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-[0.06em]",
                              notification.type === "message"
                                ? "bg-[#edf4ff] text-[#335ea8]"
                                : notification.type === "booking_received"
                                  ? "bg-[#fff2e8] text-[#be6f2f]"
                                  : "bg-[#f4f4f5] text-[#535a67]",
                            )}
                          >
                            {notification.type === "message" ? (
                              <MessageCircle className="mr-1 h-3.5 w-3.5" />
                            ) : notification.type === "booking_received" ? (
                              <CalendarCheck2 className="mr-1 h-3.5 w-3.5" />
                            ) : (
                              <CalendarClock className="mr-1 h-3.5 w-3.5" />
                            )}
                            {notification.type === "message"
                              ? "Message"
                              : notification.type === "booking_received"
                                ? "Received"
                                : "Sent"}
                          </span>
                          {unread ? <span className="h-2.5 w-2.5 rounded-full bg-[#f20d14]" /> : null}
                        </div>
                        <span className="text-[11px] text-[#7b8391]">{formatNotificationTime(notification.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-[15px] font-semibold leading-5 text-[#111318]">{notification.title}</p>
                      <p className="mt-1 text-[13px] leading-5 text-[#5f6672]">{notification.detail}</p>
                      <div className="mt-2 inline-flex items-center text-[12px] font-semibold text-[#f20d14]">
                        {bookingItem ? "Open hire request" : "Open conversation"}
                      </div>
                    </div>
                    {unread ? <CheckCheck className="mt-0.5 h-4.5 w-4.5 text-[#f20d14]" /> : <CheckCheck className="mt-0.5 h-4.5 w-4.5 text-[#b2b8c4]" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  )
}
