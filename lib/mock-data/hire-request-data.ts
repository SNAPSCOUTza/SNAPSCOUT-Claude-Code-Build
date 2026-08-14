import { MOCK_BRAD_USER_ID } from "@/lib/mock-data/messaging-test-data"

export const MOCK_HIRE_REQUESTS_STORAGE_KEY = "snapscout_hire_requests"

export type MockHireRequestOrigin = "booking" | "availability"

export type MockHireRequestStatus = "pending" | "accepted" | "declined" | "confirmed"

export type MockHireRequestRecipientType = "creator" | "crew" | "studio" | "store"

export type MockHireRequest = {
  id: string
  requester_id: string
  requester_name: string
  recipient_id: string
  recipient_name: string
  recipient_type: MockHireRequestRecipientType
  booking_type: string
  selected_date: string
  selected_end_date: string
  date_range_days: number
  duration: string
  province: string
  city: string
  address: string
  shoot_location: string
  total_estimate: number
  starting_rate_label?: string
  brief: string
  status: MockHireRequestStatus
  origin: MockHireRequestOrigin
  created_at: string
}

function normalizeOrigin(value: unknown): MockHireRequestOrigin {
  if (value === "availability") return "availability"
  return "booking"
}

function normalizeRecipientType(value: unknown): MockHireRequestRecipientType {
  if (value === "crew" || value === "studio" || value === "store") return value
  return "creator"
}

function normalizeStatus(value: unknown): MockHireRequestStatus {
  if (value === "accepted" || value === "declined" || value === "confirmed") return value
  return "pending"
}

function normalizeRequest(raw: any): MockHireRequest {
  const createdAt = typeof raw?.created_at === "string" ? raw.created_at : raw?.createdAt

  return {
    id: String(raw?.id || `hire-${Date.now()}`),
    requester_id: String(raw?.requester_id || raw?.requesterId || MOCK_BRAD_USER_ID),
    requester_name: String(raw?.requester_name || raw?.requesterName || "Brad Khumalo"),
    recipient_id: String(raw?.recipient_id || raw?.recipientId || raw?.talentId || "unknown-recipient"),
    recipient_name: String(raw?.recipient_name || raw?.recipientName || raw?.talentName || "SnapScout profile"),
    recipient_type: normalizeRecipientType(raw?.recipient_type || raw?.recipientType || raw?.talentType),
    booking_type: String(raw?.booking_type || raw?.bookingType || "Booking enquiry"),
    selected_date: String(raw?.selected_date || raw?.selectedDate || ""),
    selected_end_date: String(raw?.selected_end_date || raw?.selectedEndDate || raw?.selectedDate || ""),
    date_range_days: Number(raw?.date_range_days || raw?.dateRangeDays || 1) || 1,
    duration: String(raw?.duration || "all-day"),
    province: String(raw?.province || ""),
    city: String(raw?.city || ""),
    address: String(raw?.address || ""),
    shoot_location: String(raw?.shoot_location || raw?.shootLocation || ""),
    total_estimate: Number(raw?.total_estimate || raw?.totalEstimate || 0) || 0,
    starting_rate_label: String(raw?.starting_rate_label || raw?.startingRateLabel || ""),
    brief: String(raw?.brief || ""),
    status: normalizeStatus(raw?.status),
    origin: normalizeOrigin(raw?.origin || raw?.requestOrigin),
    created_at:
      typeof createdAt === "string" && createdAt.length > 0 ? createdAt : new Date().toISOString(),
  }
}

export function loadMockHireRequests(): MockHireRequest[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(MOCK_HIRE_REQUESTS_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => normalizeRequest(item))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } catch {
    return []
  }
}

export function saveMockHireRequests(requests: MockHireRequest[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(MOCK_HIRE_REQUESTS_STORAGE_KEY, JSON.stringify(requests))
}

export function prependMockHireRequest(request: MockHireRequest) {
  const current = loadMockHireRequests()
  const next = [request, ...current.filter((item) => item.id !== request.id)]
  saveMockHireRequests(next)
}

export function updateMockHireRequestStatus(requestId: string, status: MockHireRequestStatus) {
  const current = loadMockHireRequests()
  const next = current.map((request) => (request.id === requestId ? { ...request, status } : request))
  saveMockHireRequests(next)
  return next.find((request) => request.id === requestId) || null
}
