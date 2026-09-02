"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { LoadingDot } from "@/components/ui/loading-dot"
import { format } from "date-fns"
import {
  ArrowLeft,
  ChevronRight,
  CalendarCheck2,
  Camera,
  CheckCheck,
  EllipsisVertical,
  Flag,
  Home,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Settings2,
  User,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import MobileShell from "@/components/mobile/mobile-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MOCK_BRAD_USER_ID,
  type MockMessagingConversation,
  type MockMessagingEnquiryCard,
  type MockMessagingMessage,
  type MockMessagingProfile,
  type MockMessagingState,
  loadMockMessagingState,
  saveMockMessagingState,
} from "@/lib/mock-data/messaging-test-data"
import { loadMockHireRequests, type MockHireRequest, type MockHireRequestOrigin } from "@/lib/mock-data/hire-request-data"
import { sanitizeSingleLineInput, sanitizeTextInput } from "@/lib/utils/sanitize"
import { cn } from "@/lib/utils"
import { MessagingProvider, useMessaging } from "@/components/messaging/supabase-messaging-provider"
import { ConversationList } from "@/components/messaging/conversation-list"
import { ChatView } from "@/components/messaging/chat-view"
import { NewConversationModal } from "@/components/messaging/new-conversation-modal"

type InboxFilter = "all" | "unread" | "bookings" | "creatives" | "studios"

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const fallbackAvatar =
  "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400"

const emptyInboxIllustration = "/images/messages-empty-state.png"

const panelTransition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] } as const

const fallbackProfilePictures: Record<"creator" | "crew" | "studio" | "store", string> = {
  creator: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
  crew: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400",
  studio: "https://images.pexels.com/photos/5091121/pexels-photo-5091121.jpeg?auto=compress&cs=tinysrgb&w=400",
  store: "https://images.pexels.com/photos/4489730/pexels-photo-4489730.jpeg?auto=compress&cs=tinysrgb&w=400",
}

const filterTabs: Array<{ key: InboxFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "bookings", label: "Bookings" },
  { key: "creatives", label: "Creatives" },
  { key: "studios", label: "Studios" },
]

const reportReasons = [
  { value: "harassment", label: "Harassment or abuse" },
  { value: "spam", label: "Spam or scam" },
  { value: "unsafe_behavior", label: "Unsafe behavior" },
  { value: "fake_profile", label: "Fake profile" },
  { value: "payment_issue", label: "Payment issue" },
  { value: "other", label: "Other" },
]

function formatCurrency(amount: number) {
  return `R${Math.max(0, Math.round(amount)).toLocaleString("en-ZA")}`
}

function formatInboxTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMessageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayDiff = Math.floor((startOfToday.getTime() - startOfMessageDay.getTime()) / 86400000)

  if (dayDiff === 0) return format(date, "HH:mm")
  if (dayDiff === 1) return "Yesterday"
  if (dayDiff < 7) return `${dayDiff}d ago`
  return format(date, "dd MMM")
}

function formatRequestDateLabel(request: MockHireRequest) {
  return buildDateRangeLabel(request.selected_date, request.selected_end_date)
}

function formatDateLabel(dateString?: string) {
  if (!dateString) return ""
  const parsed = new Date(`${dateString}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return dateString
  return format(parsed, "dd MMM yyyy")
}

function buildDateRangeLabel(start?: string, end?: string) {
  if (!start) return "Date to be confirmed"
  const formattedStart = formatDateLabel(start)
  const formattedEnd = formatDateLabel(end)
  if (!end || end === start) return formattedStart
  return `${formattedStart} - ${formattedEnd}`
}

function formatDurationLabel(duration?: string, days = 1) {
  if (duration === "2-hours") return `${days} day${days > 1 ? "s" : ""} - Two hours/day`
  if (duration === "3-hours") return `${days} day${days > 1 ? "s" : ""} - Three hours/day`
  if (duration === "4-hours") return `${days} day${days > 1 ? "s" : ""} - Four hours/day`
  if (duration === "multiple-days") return `${days} day${days > 1 ? "s" : ""} - Full day`
  return `${days} day${days > 1 ? "s" : ""} - Full day`
}

function statusLabel(status: MockMessagingEnquiryCard["status"]) {
  if (status === "confirmed") return "Confirmed"
  if (status === "accepted") return "Accepted"
  if (status === "declined") return "Declined"
  return "Pending review"
}

function mapOriginLabel(origin: MockHireRequestOrigin) {
  return origin === "availability" ? "Availability Enquiry" : "Booking Enquiry"
}

function inferConversationTag(profile: MockMessagingProfile | undefined, conversation: MockMessagingConversation) {
  if (conversation.messages.some((message) => message.message_type === "enquiry")) return "bookings"

  const role = (profile?.profession || "").toLowerCase()
  if (role.includes("studio") || role.includes("store")) return "studios"
  return "creatives"
}

function buildConversationPreview(message: MockMessagingMessage | undefined) {
  if (!message) return "No messages yet."

  if (message.message_type === "enquiry" && message.enquiry) {
    return `${mapOriginLabel(message.enquiry.origin)}: ${message.enquiry.booking_type}`
  }

  if (message.message_type === "quote" && message.quote) {
    return `Quote: ${message.quote.title} ${formatCurrency(message.quote.amount)}`
  }

  return message.content || "No messages yet."
}

function upsertProfile(
  profiles: MockMessagingProfile[],
  userId: string,
  displayName: string,
  profession: string,
  city = "South Africa",
  picture = fallbackAvatar,
) {
  const existing = profiles.find((profile) => profile.user_id === userId)
  if (existing) return

  profiles.push({
    user_id: userId,
    display_name: displayName,
    profession,
    city,
    profile_picture: picture,
  })
}

function buildEnquiryMessage(request: MockHireRequest, conversationId: string): MockMessagingMessage {
  const enquiry: MockMessagingEnquiryCard = {
    request_id: request.id,
    booking_type: request.booking_type,
    origin: request.origin,
    date_label: formatRequestDateLabel(request),
    location:
      request.shoot_location ||
      request.address ||
      [request.city, request.province].filter(Boolean).join(", ") ||
      "To be confirmed",
    total_estimate: request.total_estimate,
    status: request.status,
    duration: request.duration,
    date_range_days: request.date_range_days,
    brief: request.brief,
    starting_rate_label: request.starting_rate_label,
    requester_name: request.requester_name,
  }

  return {
    id: `enquiry-${request.id}`,
    conversation_id: conversationId,
    sender_id: request.requester_id,
    content: `${mapOriginLabel(request.origin)} created`,
    message_type: "enquiry",
    created_at: request.created_at,
    is_edited: false,
    enquiry,
  }
}

function applyEnquiryCardsToState(
  previous: MockMessagingState | null,
  requests: MockHireRequest[],
): MockMessagingState | null {
  if (!previous) return previous

  const nextProfiles = [...previous.profiles]
  const nextConversations = previous.conversations.map((conversation) => ({
    ...conversation,
    participant_ids: [...conversation.participant_ids] as [string, string],
    messages: [...conversation.messages],
  }))

  let changed = false

  requests.forEach((request) => {
    upsertProfile(
      nextProfiles,
      request.requester_id,
      request.requester_name,
      "Creative Producer",
      "South Africa",
      fallbackAvatar,
    )

    upsertProfile(
      nextProfiles,
      request.recipient_id,
      request.recipient_name,
      request.recipient_type === "studio" ? "Studio" : request.recipient_type === "store" ? "Store" : "Creator",
      request.city || "South Africa",
      fallbackProfilePictures[request.recipient_type],
    )

    if (!previous.profiles.find((profile) => profile.user_id === request.requester_id)) changed = true
    if (!previous.profiles.find((profile) => profile.user_id === request.recipient_id)) changed = true

    let conversation = nextConversations.find(
      (item) =>
        item.participant_ids.includes(request.requester_id) && item.participant_ids.includes(request.recipient_id),
    )

    if (!conversation) {
      conversation = {
        id: `thread-${request.requester_id}-${request.recipient_id}`,
        participant_ids: [request.requester_id, request.recipient_id],
        created_at: request.created_at,
        updated_at: request.created_at,
        messages: [],
      }
      nextConversations.push(conversation)
      changed = true
    }

    const existingIndex = conversation.messages.findIndex(
      (message) => message.message_type === "enquiry" && message.enquiry?.request_id === request.id,
    )

    const enquiryMessage = buildEnquiryMessage(request, conversation.id)

    if (existingIndex === -1) {
      conversation.messages.push(enquiryMessage)
      changed = true
    } else {
      const existing = conversation.messages[existingIndex]
      const existingEnquiry = existing.enquiry
      const shouldRefresh =
        existingEnquiry?.status !== request.status ||
        existingEnquiry?.total_estimate !== request.total_estimate ||
        existingEnquiry?.date_label !== enquiryMessage.enquiry?.date_label ||
        existingEnquiry?.location !== enquiryMessage.enquiry?.location ||
        existingEnquiry?.brief !== enquiryMessage.enquiry?.brief ||
        existingEnquiry?.duration !== enquiryMessage.enquiry?.duration

      if (shouldRefresh) {
        conversation.messages[existingIndex] = {
          ...existing,
          enquiry: enquiryMessage.enquiry,
          content: enquiryMessage.content,
        }
        changed = true
      }
    }

    conversation.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const latest = conversation.messages[conversation.messages.length - 1]
    if (latest && latest.created_at !== conversation.updated_at) {
      conversation.updated_at = latest.created_at
      changed = true
    }
  })

  if (!changed) return previous

  return {
    profiles: nextProfiles,
    conversations: nextConversations,
  }
}

function LiveMessagesInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { conversations, selectConversation, createConversation, currentConversation, currentUserId, loading } =
    useMessaging()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newConvoOpen, setNewConvoOpen] = useState(false)
  const handledRecipientRef = useRef<string | null>(null)

  const recipient = searchParams.get("recipient")

  useEffect(() => {
    if (!recipient || !currentUserId) return
    if (handledRecipientRef.current === recipient) return
    if (!UUID_PATTERN.test(recipient)) return
    handledRecipientRef.current = recipient

    createConversation(recipient).then((conversationId) => {
      if (conversationId) {
        setSelectedId(conversationId)
        selectConversation(conversationId)
      }
    })
  }, [recipient, currentUserId, createConversation, selectConversation])

  const handleSelect = useCallback(
    (conversationId: string) => {
      setSelectedId(conversationId)
      selectConversation(conversationId)
    },
    [selectConversation],
  )

  const handleBack = useCallback(() => {
    setSelectedId(null)
  }, [])

  const hasSelectedConversation = Boolean(selectedId && currentConversation)

  if (!currentUserId && !loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center p-6">
        <div className="w-full max-w-md rounded-[28px] border border-[#e8e4de] bg-white p-6 text-center">
          <p className="text-[21px] font-semibold text-[#111318]">Sign in to view messages</p>
          <p className="mt-2 text-[14px] leading-6 text-[#5f6672]">
            You need to be signed in to send and receive messages on SnapScout.
          </p>
          <Button
            className="mt-5 h-12 rounded-full bg-[#f20d14] text-white hover:bg-[#d9070d]"
            onClick={() => router.push("/auth/login")}
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <MobileShell
      title="Messages"
      hideBottomNav={hasSelectedConversation}
      disableBottomNavAutoHide={!hasSelectedConversation}
      lockToViewport={hasSelectedConversation}
    >
      <div className={hasSelectedConversation ? "flex h-full min-h-0 flex-1 flex-col" : "h-[calc(100dvh-176px)] min-h-[620px]"}>
        {hasSelectedConversation ? (
          <ChatView onBack={handleBack} />
        ) : (
          <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <p className="text-lg font-semibold text-foreground">Conversations</p>
              <Button size="icon" className="h-10 w-10 rounded-full" onClick={() => setNewConvoOpen(true)}>
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationList onSelect={handleSelect} selectedId={selectedId} />
            </div>
          </div>
        )}
      </div>

      <NewConversationModal
        open={newConvoOpen}
        onOpenChange={setNewConvoOpen}
        onConversationCreated={(conversationId) => {
          setSelectedId(conversationId)
          selectConversation(conversationId)
        }}
      />
    </MobileShell>
  )
}

function LiveMessagesContent() {
  return (
    <MessagingProvider>
      <LiveMessagesInner />
    </MessagingProvider>
  )
}

function MockMessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<MockMessagingState | null>(null)
  const [hireRequests, setHireRequests] = useState<MockHireRequest[]>([])
  const [activeProfileId, setActiveProfileId] = useState(MOCK_BRAD_USER_ID)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [filter, setFilter] = useState<InboxFilter>("all")
  const [composerValue, setComposerValue] = useState("")
  const [showProfilePicker, setShowProfilePicker] = useState(false)
  const [showStarterList, setShowStarterList] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState("harassment")
  const [reportNotes, setReportNotes] = useState("")
  const [reporting, setReporting] = useState(false)
  const [reportStatus, setReportStatus] = useState("")
  const initializedRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadedState = loadMockMessagingState()
    const loadedRequests = loadMockHireRequests()
    const profileFromQuery = searchParams.get("as")

    setState(loadedState)
    setHireRequests(loadedRequests)

    if (profileFromQuery && loadedState.profiles.some((profile) => profile.user_id === profileFromQuery)) {
      setActiveProfileId(profileFromQuery)
    }
  }, [searchParams])

  useEffect(() => {
    if (!state) return
    saveMockMessagingState(state)
  }, [state])

  useEffect(() => {
    setState((prev) => applyEnquiryCardsToState(prev, hireRequests))
  }, [hireRequests])

  useEffect(() => {
    if (!state) return

    const onFocus = () => {
      setHireRequests(loadMockHireRequests())
      setState((prev) => applyEnquiryCardsToState(prev, loadMockHireRequests()))
    }

    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [state])

  const profileMap = useMemo(() => {
    const map = new Map<string, MockMessagingProfile>()
    state?.profiles.forEach((profile) => map.set(profile.user_id, profile))
    return map
  }, [state])

  const conversationsForActiveProfile = useMemo(() => {
    if (!state) return []
    return state.conversations
      .filter((conversation) => conversation.participant_ids.includes(activeProfileId))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [state, activeProfileId])

  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return null
    return conversationsForActiveProfile.find((conversation) => conversation.id === selectedConversationId) || null
  }, [conversationsForActiveProfile, selectedConversationId])

  const upsertConversation = useCallback(
    (recipientId: string) => {
      if (!state) return null
      if (!recipientId || recipientId === activeProfileId) return null

      const existing = state.conversations.find(
        (conversation) =>
          conversation.participant_ids.includes(activeProfileId) && conversation.participant_ids.includes(recipientId),
      )

      if (existing) return existing.id

      const recipientProfile = state.profiles.find((profile) => profile.user_id === recipientId)
      const createdAt = new Date().toISOString()
      const newConversation: MockMessagingConversation = {
        id: `thread-${activeProfileId}-${recipientId}-${Date.now()}`,
        participant_ids: [activeProfileId, recipientId],
        created_at: createdAt,
        updated_at: createdAt,
        messages: [],
      }

      const needsProfile = !recipientProfile
      const nextProfiles = needsProfile
        ? [
            ...state.profiles,
            {
              user_id: recipientId,
              display_name: recipientId.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
              profession: "Creator",
              city: "South Africa",
              profile_picture: fallbackAvatar,
            },
          ]
        : state.profiles

      setState({
        profiles: nextProfiles,
        conversations: [newConversation, ...state.conversations],
      })

      return newConversation.id
    },
    [activeProfileId, state],
  )

  useEffect(() => {
    if (!state || initializedRef.current) return
    initializedRef.current = true

    const recipient = searchParams.get("recipient")
    const conversationFromQuery = searchParams.get("conversation")

    if (recipient && recipient !== activeProfileId) {
      const createdId = upsertConversation(recipient)
      if (createdId) {
        setSelectedConversationId(createdId)
        setShowStarterList(false)
        return
      }
    }

    if (conversationFromQuery && conversationsForActiveProfile.some((conversation) => conversation.id === conversationFromQuery)) {
      setSelectedConversationId(conversationFromQuery)
      return
    }

  }, [state, searchParams, activeProfileId, conversationsForActiveProfile, upsertConversation])

  useEffect(() => {
    const params = new URLSearchParams()
    params.set("mock", "1")
    params.set("as", activeProfileId)
    if (selectedConversationId) params.set("conversation", selectedConversationId)
    router.replace(`/messages?${params.toString()}`)
  }, [activeProfileId, selectedConversationId, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedConversation?.messages.length])

  const filteredConversations = useMemo(() => {
    return conversationsForActiveProfile.filter((conversation) => {
      const otherId = conversation.participant_ids.find((id) => id !== activeProfileId) || activeProfileId
      const otherProfile = profileMap.get(otherId)
      const lastMessage = conversation.messages[conversation.messages.length - 1]
      const tag = inferConversationTag(otherProfile, conversation)

      if (filter === "all") return true
      if (filter === "unread") return Boolean(lastMessage) && lastMessage.sender_id !== activeProfileId
      if (filter === "bookings") return tag === "bookings"
      if (filter === "creatives") return tag === "creatives"
      if (filter === "studios") return tag === "studios"
      return true
    })
  }, [activeProfileId, conversationsForActiveProfile, filter, profileMap])

  const sendTextMessage = useCallback(() => {
    const sanitizedComposerValue = sanitizeTextInput(composerValue, 1200)
    if (!state || !selectedConversation || !sanitizedComposerValue) return

    const message: MockMessagingMessage = {
      id: `${selectedConversation.id}-msg-${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender_id: activeProfileId,
      content: sanitizedComposerValue,
      message_type: "text",
      created_at: new Date().toISOString(),
      is_edited: false,
    }

    setState((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        conversations: prev.conversations.map((conversation) =>
          conversation.id === selectedConversation.id
            ? {
                ...conversation,
                messages: [...conversation.messages, message],
                updated_at: message.created_at,
              }
            : conversation,
        ),
      }
    })
    setComposerValue("")
  }, [activeProfileId, composerValue, selectedConversation, state])

  const sendQuoteResponse = useCallback(
    (accepted: boolean) => {
      if (!state || !selectedConversation) return

      const message: MockMessagingMessage = {
        id: `${selectedConversation.id}-msg-${Date.now()}`,
        conversation_id: selectedConversation.id,
        sender_id: activeProfileId,
        content: accepted ? "Quote accepted. Let us proceed." : "Thanks, but I will pass on this quote.",
        message_type: "text",
        created_at: new Date().toISOString(),
        is_edited: false,
      }

      setState((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          conversations: prev.conversations.map((conversation) =>
            conversation.id === selectedConversation.id
              ? {
                  ...conversation,
                  messages: [...conversation.messages, message],
                  updated_at: message.created_at,
                }
              : conversation,
          ),
        }
      })
    },
    [activeProfileId, selectedConversation, state],
  )

  const openConversationWith = (recipientId: string) => {
    const conversationId = upsertConversation(recipientId)
    if (!conversationId) return

    setShowStarterList(false)
    setSelectedConversationId(conversationId)
  }

  const selectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    setShowProfilePicker(false)
    setShowStarterList(false)
  }

  if (!state) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-[#fffaf6]">
        <p className="text-[14px] text-[#5f6672]">Loading message threads...</p>
      </div>
    )
  }

  const activeProfile = profileMap.get(activeProfileId)
  const selectedOtherId = selectedConversation?.participant_ids.find((id) => id !== activeProfileId) || activeProfileId
  const selectedOtherProfile = profileMap.get(selectedOtherId)
  const hasSelectedConversation = Boolean(selectedConversation)
  const conversationMessages = selectedConversation?.messages || []
  const selectedConversationHasEnquiry = conversationMessages.some((message) => message.message_type === "enquiry")
  const selectedLatestEnquiry = [...conversationMessages].reverse().find((message) => message.message_type === "enquiry" && message.enquiry)
  const selectedContactFirstName = (selectedOtherProfile?.display_name || "there").split(" ")[0]
  const selectedBookingHref = selectedLatestEnquiry?.enquiry?.request_id
    ? `/booking/${selectedLatestEnquiry.enquiry.request_id}?as=${activeProfileId}`
    : `/booking/${selectedOtherId}?as=${activeProfileId}`
  const selectedProfileHref = (() => {
    const role = (selectedOtherProfile?.profession || "").toLowerCase()
    if (role.includes("studio") || role.includes("store")) return `/studios-stores/${selectedOtherId}`
    if (role.includes("crew")) return `/crew/${selectedOtherId}`
    return `/creators/${selectedOtherId}`
  })()

  const submitReport = async () => {
    if (!selectedOtherId) return
    setReporting(true)
    setReportStatus("")

    const sanitizedReason = sanitizeSingleLineInput(reportReason, 80)
    const sanitizedNotes = sanitizeTextInput(reportNotes, 1500)

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportedUserId: selectedOtherId,
        entityType: "message",
        entityId: selectedConversationId,
        reason: sanitizedReason,
        notes: sanitizedNotes,
      }),
    })
    const payload = await response.json()

    if (!response.ok) {
      setReportStatus(payload.error || "Could not submit the report.")
      setReporting(false)
      return
    }

    setReportStatus("Report sent to moderation.")
    setReportNotes("")
    setReporting(false)
    window.setTimeout(() => {
      setShowReportDialog(false)
      setReportStatus("")
    }, 900)
  }

  const listPane = (
    <div className="flex h-full flex-col rounded-[30px] border border-[#ebe5db] bg-white shadow-[0_20px_54px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[#f0ebe2] px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-bold leading-none text-[#111318]">Messages</h1>
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={() => {
                setFilter("all")
                setShowProfilePicker(false)
                setShowStarterList(false)
              }}
              whileTap={{ scale: 0.92 }}
              whileHover={{ y: -1 }}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#ffe0e1] bg-[#fff7f7] text-[#f20d14] shadow-sm"
              aria-label="Search conversations"
            >
              <Search className="h-4.5 w-4.5" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setFilter((value) => (value === "all" ? "unread" : "all"))}
              whileTap={{ scale: 0.92 }}
              whileHover={{ y: -1 }}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#ece5da] bg-white text-[#111318] shadow-sm"
              aria-label="Filter conversations"
            >
              <Settings2 className="h-4.5 w-4.5" />
            </motion.button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowProfilePicker((value) => !value)}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-[#ece5da] bg-white px-3 text-[12px] font-semibold text-[#111318] shadow-sm"
          >
            <User className="h-3.5 w-3.5" />
            Send as
            <span className="max-w-[110px] truncate">{activeProfile?.display_name || "Profile"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowStarterList((value) => !value)}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-[#ffe0e1] bg-[#fff7f7] px-3 text-[12px] font-bold text-[#f20d14] shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            New chat
          </button>
        </div>

        {showProfilePicker && (
          <div className="mt-2 rounded-2xl border border-[#ece5da] bg-white p-2">
            <div className="max-h-36 space-y-1 overflow-y-auto">
              {state.profiles.map((profile) => (
                <motion.button
                  key={profile.user_id}
                  type="button"
                  onClick={() => {
                    setActiveProfileId(profile.user_id)
                    setSelectedConversationId(null)
                    initializedRef.current = false
                    setShowProfilePicker(false)
                  }}
                  whileTap={{ scale: 0.985 }}
                  whileHover={{ y: -1 }}
                  transition={{ type: "spring", stiffness: 360, damping: 24 }}
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
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {showStarterList && (
          <div className="mt-2 rounded-2xl border border-[#ece5da] bg-white p-2">
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">Start chat with</p>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {state.profiles
                .filter((profile) => profile.user_id !== activeProfileId)
                .map((profile) => (
                  <motion.button
                    key={profile.user_id}
                    type="button"
                    onClick={() => openConversationWith(profile.user_id)}
                    whileTap={{ scale: 0.985 }}
                    whileHover={{ y: -1 }}
                    transition={{ type: "spring", stiffness: 360, damping: 24 }}
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-[#faf8f4]"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.profile_picture} />
                      <AvatarFallback>{profile.display_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[#111318]">{profile.display_name}</p>
                      <p className="truncate text-[11px] text-[#667085]">{profile.profession}</p>
                    </div>
                  </motion.button>
                ))}
            </div>
          </div>
        )}

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {filterTabs.map((tab) => (
            <motion.button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12px] font-semibold",
                filter === tab.key
                  ? "border-[#f20d14] bg-[#f20d14] text-white shadow-[0_10px_24px_rgba(242,13,20,0.18)]"
                  : "border-[#ece5da] bg-white text-[#303643]",
              )}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center px-5 py-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={panelTransition}
              className="relative mx-auto h-[260px] w-full max-w-[290px]"
            >
              <Image
                src={emptyInboxIllustration}
                alt=""
                fill
                sizes="290px"
                className="object-contain"
                priority={false}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...panelTransition, delay: 0.08 }}
            >
              <p className="mt-2 text-[27px] font-bold leading-tight text-[#111318]">Your inbox is quiet.</p>
              <p className="mx-auto mt-2 max-w-[260px] text-[14px] leading-6 text-[#5f6672]">
                Bookings, enquiries, and collaborations will appear here.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...panelTransition, delay: 0.16 }}
            >
              <Button asChild className="mt-5 h-12 rounded-full bg-[#f20d14] px-6 text-white hover:bg-[#d9070d]">
                <Link href="/explore">Explore SnapScout</Link>
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="divide-y divide-[#f2eee8]">
            {filteredConversations.map((conversation) => {
              const otherId = conversation.participant_ids.find((id) => id !== activeProfileId) || activeProfileId
              const otherProfile = profileMap.get(otherId)
              const lastMessage = conversation.messages[conversation.messages.length - 1]
              const isUnread = lastMessage && lastMessage.sender_id !== activeProfileId
              const tag = inferConversationTag(otherProfile, conversation)

              return (
                <motion.button
                  key={conversation.id}
                  type="button"
                  onClick={() => selectConversation(conversation.id)}
                  initial={{ opacity: 0, y: 10, scale: 0.99 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.45 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  whileTap={{ scale: 0.985 }}
                  whileHover={{ y: -1 }}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#faf8f4]",
                    selectedConversationId === conversation.id && "bg-[#f8f5f1]",
                  )}
                >
                  <Avatar className="h-14 w-14 border border-[#ece6db]">
                    <AvatarImage src={otherProfile?.profile_picture || fallbackAvatar} />
                    <AvatarFallback>{otherProfile?.display_name?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[20px] font-semibold leading-tight text-[#111318]">
                        {otherProfile?.display_name || "Unknown profile"}
                      </p>
                      <span className="shrink-0 text-[12px] text-[#6f7782]">
                        {lastMessage ? formatInboxTime(lastMessage.created_at) : ""}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[14px] leading-5 text-[#515868]">{buildConversationPreview(lastMessage)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          tag === "bookings"
                            ? "bg-[#fff2e8] text-[#be6f2f]"
                            : tag === "studios"
                              ? "bg-[#f0f5ff] text-[#335ea8]"
                              : "bg-[#f6f2ea] text-[#7a5e2d]",
                        )}
                      >
                        {tag === "bookings" ? "Booking" : tag === "studios" ? "Studio" : "Creative"}
                      </span>
                      {isUnread ? <span className="h-2.5 w-2.5 rounded-full bg-[#f20d14]" /> : null}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  const chatPane = hasSelectedConversation ? (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[30px] border border-[#ebe5db] bg-white shadow-[0_20px_54px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[#f0ebe2] bg-white px-3 py-3 sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <motion.button
              type="button"
              onClick={() => setSelectedConversationId(null)}
              whileTap={{ scale: 0.9, x: -1 }}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#ece5da] bg-white text-[#111318] shadow-sm transition-transform active:scale-[0.96]"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </motion.button>
            <Avatar className="h-11 w-11 shrink-0 border border-[#ece6db] shadow-sm">
              <AvatarImage src={selectedOtherProfile?.profile_picture || fallbackAvatar} />
              <AvatarFallback>{selectedOtherProfile?.display_name?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-[clamp(20px,6vw,24px)] font-semibold leading-tight text-[#111318]">
                {selectedOtherProfile?.display_name || "Unknown"}
              </p>
              <p className="text-[13px] text-[#5f6672]">{selectedOtherProfile?.profession || "Creator"}</p>
              {selectedConversationHasEnquiry ? (
                <span className="mt-1 inline-flex rounded-full bg-[#fff1e6] px-2.5 py-1 text-[11px] font-black text-[#be6f2f]">
                  Booking enquiry
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <motion.a
              href="tel:+27000000000"
              whileTap={{ scale: 0.92 }}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#ffe0e1] bg-[#fff7f7] text-[#f20d14] shadow-sm transition-transform active:scale-[0.96]"
              aria-label="Call contact"
            >
              <Phone className="h-4.5 w-4.5" />
            </motion.a>
            <motion.button
              type="button"
              onClick={() => router.push("/explore")}
              whileTap={{ scale: 0.92 }}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#ece5da] bg-white text-[#111318] shadow-sm transition-transform active:scale-[0.96]"
              aria-label="Return home"
            >
              <Home className="h-4.5 w-4.5" />
            </motion.button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button asChild variant="outline" className="h-10 flex-1 rounded-full border-[#e8e2d7] bg-white text-[14px] font-semibold text-[#111318] shadow-sm">
            <Link href={selectedProfileHref}>
              <User className="mr-2 h-4 w-4" />
              View Profile
            </Link>
          </Button>
          <Button asChild className="h-10 flex-1 rounded-full bg-[#f20d14] text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(242,13,20,0.18)] hover:bg-[#d9070d]">
            <Link href={selectedBookingHref}>
              <CalendarCheck2 className="mr-2 h-4 w-4" />
              View Booking
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowReportDialog(true)}
            className="col-span-2 h-10 rounded-full border-[#ffd4d6] bg-[#fff7f7] text-[14px] font-semibold text-[#f20d14] shadow-sm hover:bg-[#fff0f1]"
          >
            <Flag className="mr-2 h-4 w-4" />
            Report User
          </Button>
        </div>
      </div>

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto scroll-smooth bg-[#fcfaf7] p-4">
        <div className="mx-auto rounded-full bg-[#f2ede5] px-3 py-1 text-[11px] font-semibold text-[#596170]">Today</div>

        {conversationMessages.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <p className="text-[14px] text-[#667085]">Start this conversation with your first message.</p>
          </div>
        ) : (
          conversationMessages.map((message) => {
            const ownMessage = message.sender_id === activeProfileId

            if (message.message_type === "system") {
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8, scale: 0.985 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl border border-[#e6def1] bg-[#f6f0ff] p-3"
                >
                  <p className="text-[15px] font-semibold text-[#222234]">{message.content}</p>
                  <p className="mt-1 text-[11px] text-[#6f6a85]">{formatInboxTime(message.created_at)}</p>
                </motion.div>
              )
            }

            if (message.message_type === "enquiry" && message.enquiry) {
              const dayCount = Math.max(1, message.enquiry.date_range_days || 1)
              const durationSummary = formatDurationLabel(message.enquiry.duration, dayCount)
              const introCopy = `Hi ${selectedContactFirstName}\nI would like to enquire about your availability for ${message.enquiry.booking_type.toLowerCase()}.\nPlease see the details below.`
              const locationLabel = message.enquiry.location || "To be confirmed"
              const projectBrief = message.enquiry.brief?.trim() || "Project brief to be confirmed."
              const startingRateLabel = message.enquiry.starting_rate_label || "Rate on request"
              const dateRangeLabel = message.enquiry.date_label || "Date to be confirmed"

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.99 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.4 }}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  className={cn("w-full max-w-[94%] space-y-2", ownMessage ? "ml-auto" : "mr-auto")}
                >
                  {ownMessage ? (
                    <motion.div
                      whileTap={{ scale: 0.995 }}
                      className="ml-auto max-w-[92%] rounded-[26px] bg-[#f20d14] px-5 py-4 text-white shadow-[0_14px_30px_rgba(242,13,20,0.26)]"
                    >
                      <p className="whitespace-pre-wrap text-[16px] leading-7">{introCopy}</p>
                      <p className="mt-2 text-right text-[11px] text-white/80">
                        {formatInboxTime(message.created_at)} <CheckCheck className="ml-1 inline h-3.5 w-3.5" />
                      </p>
                    </motion.div>
                  ) : null}

                  <div className="overflow-hidden rounded-[28px] border border-[#e7dece] bg-white shadow-[0_14px_34px_rgba(16,24,40,0.09)]">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#ffe8e8] text-[#b20f14]">
                          <CalendarCheck2 className="h-6 w-6" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[18px] font-semibold leading-tight text-[#111318]">Booking Enquiry</p>
                          <p className="mt-1 text-[14px] leading-5 text-[#5f6672]">
                            You have sent a booking request to {selectedContactFirstName}.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-[20px] border border-[#e6e9f0] bg-[#f6f8fc] px-4 py-3">
                        <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#667085]">Starting from</p>
                        <p className="mt-1 font-mono text-[24px] font-black leading-none text-[#111318]">{startingRateLabel}</p>
                      </div>

                      <div className="mt-3 rounded-[20px] border border-[#e6e9f0] bg-white p-4">
                        <p className="text-[14px] font-semibold text-[#111318]">Enquiry Details</p>
                        <dl className="mt-3 space-y-2">
                          <div className="flex items-start justify-between gap-3 text-[14px]">
                            <dt className="text-[#667085]">Service</dt>
                            <dd className="text-right font-semibold text-[#111318]">{message.enquiry.booking_type}</dd>
                          </div>
                          <div className="flex items-start justify-between gap-3 text-[14px]">
                            <dt className="text-[#667085]">Date</dt>
                            <dd className="text-right font-semibold text-[#111318]">{dateRangeLabel}</dd>
                          </div>
                          <div className="flex items-start justify-between gap-3 text-[14px]">
                            <dt className="text-[#667085]">Duration</dt>
                            <dd className="text-right font-semibold text-[#111318]">{durationSummary}</dd>
                          </div>
                          <div className="flex items-start justify-between gap-3 text-[14px]">
                            <dt className="text-[#667085]">Location</dt>
                            <dd className="max-w-[62%] text-right font-semibold text-[#111318]">{locationLabel}</dd>
                          </div>
                          <div className="flex items-start justify-between gap-3 text-[14px]">
                            <dt className="text-[#667085]">Project brief</dt>
                            <dd className="max-w-[62%] text-right font-semibold text-[#111318]">{projectBrief}</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="mt-3 rounded-[20px] border border-[#efe6d6] bg-[#fff9ee] p-4">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#8c6b2a]">Total estimate</p>
                        <p className="mt-1 font-mono text-[34px] font-black leading-none text-[#111318]">
                          {formatCurrency(message.enquiry.total_estimate)}
                        </p>
                        <p className="mt-1 text-[14px] text-[#8c6b2a]">{durationSummary}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="rounded-full bg-[#f7f3ec] px-3 py-1 text-[11px] font-semibold text-[#6a5d47]">
                          {statusLabel(message.enquiry.status)}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/booking/${message.enquiry.request_id}?as=${activeProfileId}`}
                      className="flex items-center justify-between border-t border-[#ece6da] px-4 py-3 text-[16px] font-semibold text-[#f20d14]"
                    >
                      View enquiry details
                      <ChevronRight className="h-4.5 w-4.5" />
                    </Link>
                  </div>
                  <p className="px-1 text-right text-[11px] text-[#7c8392]">
                    {formatInboxTime(message.created_at)} {ownMessage ? <CheckCheck className="ml-1 inline h-3.5 w-3.5" /> : null}
                  </p>
                </motion.div>
              )
            }

            if (message.message_type === "quote" && message.quote) {
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.99 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.45 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className={cn("max-w-[92%]", ownMessage ? "ml-auto" : "mr-auto")}
                >
                  <div className="rounded-[22px] border border-[#efe5d8] bg-white p-4 shadow-sm">
                    <p className="text-[16px] font-semibold text-[#111318]">{message.quote.title}</p>
                    <p className="mt-1 text-[13px] text-[#5e6573]">{message.quote.coverage}</p>
                    <ul className="mt-3 space-y-1 text-[13px] text-[#5e6573]">
                      {message.quote.items.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#9ba3b2]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-[35px] font-semibold leading-none text-[#111318]">
                      {formatCurrency(message.quote.amount)}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => sendQuoteResponse(false)}
                        className="h-11 rounded-xl border-[#e8e2d7] bg-white text-[#111318]"
                      >
                        Decline
                      </Button>
                      <Button
                        type="button"
                        onClick={() => sendQuoteResponse(true)}
                        className="h-11 rounded-xl bg-[#f20d14] text-white hover:bg-[#d9070d]"
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            }

            return (
              <div key={message.id} className={cn("flex", ownMessage ? "justify-end" : "justify-start")}>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.99 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.45 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  whileTap={{ scale: 0.995 }}
                  className={cn("max-w-[80%] rounded-[18px] px-4 py-3", ownMessage ? "bg-[#f20d14] text-white" : "border border-[#ece5da] bg-white text-[#111318]")}
                >
                  <p className="whitespace-pre-wrap text-[16px] leading-6">{message.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-right text-[11px]",
                      ownMessage ? "text-white/80" : "text-[#7c8392]",
                    )}
                  >
                    {formatInboxTime(message.created_at)} {ownMessage ? <CheckCheck className="ml-1 inline h-3.5 w-3.5" /> : null}
                  </p>
                </motion.div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[#f0ebe2] bg-white px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#ffe0e1] bg-[#fff7f7] text-[#f20d14]"
            aria-label="Open quick actions"
          >
            <Plus className="h-4.5 w-4.5" />
          </motion.button>
          <div className="flex flex-1 items-center gap-1 rounded-full border border-[#e9e3d8] bg-[#fbf9f5] px-3 py-2 shadow-sm">
            <Input
              value={composerValue}
              onChange={(event) => setComposerValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  sendTextMessage()
                }
              }}
              placeholder={`Message ${selectedOtherProfile?.display_name || "user"}...`}
              className="h-8 border-0 bg-transparent p-0 text-[14px] shadow-none focus-visible:ring-0"
            />
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              className="grid h-8 w-8 place-items-center rounded-full text-[#5f6672]"
              aria-label="Attach file"
            >
              <Paperclip className="h-4.5 w-4.5" />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              className="grid h-8 w-8 place-items-center rounded-full text-[#5f6672]"
              aria-label="Open camera"
            >
              <Camera className="h-4.5 w-4.5" />
            </motion.button>
          </div>
          <motion.button
            type="button"
            onClick={sendTextMessage}
            disabled={!composerValue.trim()}
            whileTap={{ scale: composerValue.trim() ? 0.92 : 1 }}
            className={cn(
              "grid h-12 w-12 shrink-0 place-items-center rounded-full text-white transition-colors",
              composerValue.trim() ? "bg-[#f20d14] shadow-[0_12px_24px_rgba(242,13,20,0.22)]" : "bg-[#f5a4a8]",
            )}
            aria-label="Send message"
          >
            <Send className="h-4.5 w-4.5" />
          </motion.button>
        </div>
      </div>
    </div>
  ) : (
    <div className="grid h-full place-items-center rounded-[30px] border border-[#ebe5db] bg-white shadow-[0_20px_54px_rgba(0,0,0,0.06)]">
      <div className="max-w-[280px] text-center">
        <p className="text-[28px] font-semibold leading-tight text-[#111318]">Pick a conversation</p>
        <p className="mt-2 text-[14px] text-[#667085]">Select a chat or start a new one from the list.</p>
      </div>
    </div>
  )

  const reportDialog = (
    <AnimatePresence>
      {showReportDialog && hasSelectedConversation ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/35 px-3 pb-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowReportDialog(false)
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.985 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[430px] rounded-[30px] border border-[#ffe0e1] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.22)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f20d14]">Safety report</p>
                <h2 className="mt-1 text-[25px] font-black leading-tight text-[#111318]">
                  Report {selectedOtherProfile?.display_name || "this user"}
                </h2>
                <p className="mt-1 text-sm leading-5 text-[#667085]">
                  Tell moderation what happened. This creates a private report in the admin console.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReportDialog(false)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#e5ebf3] bg-white text-[#111318] shadow-sm active:scale-[0.96]"
                aria-label="Close report dialog"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <label className="mt-4 block">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[#7b8798]">Reason</span>
              <select
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
                className="mt-2 h-12 w-full rounded-full border border-[#dce3ee] bg-[#fbfcfe] px-4 text-sm font-semibold outline-none focus:border-[#f20d14] focus:ring-4 focus:ring-[#f20d14]/10"
              >
                {reportReasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 block">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[#7b8798]">Details</span>
              <textarea
                value={reportNotes}
                onChange={(event) => setReportNotes(event.target.value)}
                placeholder="Add a short explanation for moderation..."
                className="mt-2 min-h-28 w-full rounded-[22px] border border-[#dce3ee] bg-[#fbfcfe] px-4 py-3 text-sm outline-none focus:border-[#f20d14] focus:ring-4 focus:ring-[#f20d14]/10"
              />
            </label>

            {reportStatus ? (
              <p
                className={cn(
                  "mt-3 rounded-2xl px-4 py-3 text-sm font-semibold",
                  reportStatus.includes("sent")
                    ? "bg-[#ecfdf3] text-[#027a48]"
                    : "bg-[#fff0f1] text-[#b42318]",
                )}
              >
                {reportStatus}
              </p>
            ) : null}

            <button
              type="button"
              onClick={submitReport}
              disabled={reporting}
              className="mt-4 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#f20d14] text-sm font-black text-white shadow-[0_16px_30px_rgba(242,13,20,0.22)] transition hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
            >
              {reporting ? <LoadingDot /> : <Flag className="h-4 w-4" />}
              Submit Report
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )

  return (
    <MobileShell
      title="Messages"
      hideBottomNav={hasSelectedConversation}
      disableBottomNavAutoHide={!hasSelectedConversation}
      lockToViewport={hasSelectedConversation}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          hasSelectedConversation
            ? "flex h-full min-h-0 flex-1 flex-col"
            : "h-[calc(100dvh-176px)] min-h-[620px]",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={hasSelectedConversation ? "chat-page" : "inbox-page"}
            initial={{ opacity: 0, x: hasSelectedConversation ? 26 : -26, scale: 0.995 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: hasSelectedConversation ? -20 : 20, scale: 0.995 }}
            transition={panelTransition}
            className={hasSelectedConversation ? "flex h-full min-h-0 flex-1 flex-col" : "h-full"}
          >
            {hasSelectedConversation ? chatPane : listPane}
          </motion.div>
        </AnimatePresence>
      </div>
      {reportDialog}
    </MobileShell>
  )
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const useMockMode = searchParams.get("mock") === "1"

  if (useMockMode) {
    return <MockMessagesContent />
  }

  return <LiveMessagesContent />
}
