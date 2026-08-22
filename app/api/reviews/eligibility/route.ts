import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"

export const runtime = "nodejs"

// Mirrors the eligibility check enforced by the "confirmed bookings can
// leave a review" RLS policy (private.has_confirmed_booking_with) - this
// endpoint only decides whether to SHOW the review button; the database
// policy is what actually stops an ineligible write.
export async function GET(request: Request) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const { searchParams } = new URL(request.url)
  const profileId = sanitizeText(searchParams.get("profile_id"), 80)
  if (!profileId) return apiError("profile_id is required", 400, "PROFILE_ID_REQUIRED")

  if (profileId === user.id) {
    return NextResponse.json({ eligible: false, existingReview: null })
  }

  const [asRequester, asCrew, existing] = await Promise.all([
    supabase
      .from("availability_requests")
      .select("id, availability_responses!inner(id)")
      .eq("requester_id", user.id)
      .eq("availability_responses.crew_member_id", profileId)
      .eq("availability_responses.status", "confirmed")
      .limit(1),
    supabase
      .from("availability_responses")
      .select("id, availability_requests!inner(id, requester_id)")
      .eq("crew_member_id", user.id)
      .eq("status", "confirmed")
      .eq("availability_requests.requester_id", profileId)
      .limit(1),
    supabase
      .from("profile_reviews")
      .select("id,rating,body")
      .eq("profile_id", profileId)
      .eq("reviewer_id", user.id)
      .maybeSingle(),
  ])

  const eligible = Boolean(asRequester.data?.length) || Boolean(asCrew.data?.length)

  return NextResponse.json({
    eligible,
    existingReview: existing.data || null,
  })
}
