import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"
import { createServerClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const profileId = sanitizeText(searchParams.get("profile_id"), 80)
  if (!profileId) return apiError("profile_id is required", 400, "PROFILE_ID_REQUIRED")

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("profile_reviews")
    .select("id,profile_id,reviewer_id,rating,body,created_at,updated_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })

  if (error) return apiError(error.message, 500, "REVIEWS_LOAD_FAILED")
  return NextResponse.json({ reviews: data || [] })
}

export async function POST(request: Request) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const body = await request.json().catch(() => ({}))
  const profileId = sanitizeText(body.profile_id, 80)
  const rating = Number(body.rating)
  const reviewBody = sanitizeText(body.body, 2000)

  if (!profileId) return apiError("profile_id is required", 400, "PROFILE_ID_REQUIRED")
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return apiError("rating must be an integer from 1 to 5", 400, "REVIEW_RATING_INVALID")
  }
  if (profileId === user.id) return apiError("You can't review your own profile", 400, "REVIEW_SELF_NOT_ALLOWED")

  const { data, error } = await supabase
    .from("profile_reviews")
    .upsert(
      { profile_id: profileId, reviewer_id: user.id, rating, body: reviewBody || null },
      { onConflict: "profile_id,reviewer_id" },
    )
    .select("id,profile_id,reviewer_id,rating,body,created_at,updated_at")
    .single()

  if (error) {
    // RLS rejects the insert/update itself when there's no confirmed
    // booking between reviewer and profile - surface that as a clear 403
    // rather than the raw Postgres policy-violation message.
    if (error.code === "42501") {
      return apiError(
        "You can only review someone after a confirmed booking with them",
        403,
        "REVIEW_NOT_ELIGIBLE",
      )
    }
    return apiError(error.message, 500, "REVIEW_SAVE_FAILED")
  }

  return NextResponse.json({ review: data }, { status: 201 })
}
