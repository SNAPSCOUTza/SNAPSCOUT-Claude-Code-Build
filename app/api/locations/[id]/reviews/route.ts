import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"

export const runtime = "nodejs"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context
  const { supabase, user } = context

  const body = await request.json().catch(() => null)
  if (!body) return apiError("Invalid request body", 400, "LOCATION_REVIEW_INVALID_BODY")

  const rating = Number(body.rating)
  const text = sanitizeText(body.body, 600)

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return apiError("Rating must be between 1 and 5", 400, "LOCATION_REVIEW_INVALID_RATING")
  }
  if (!text) return apiError("Write a few words about your experience", 400, "LOCATION_REVIEW_EMPTY")

  const { data, error } = await supabase
    .from("shoot_location_reviews")
    .upsert(
      { location_id: params.id, user_id: user.id, rating, body: text },
      { onConflict: "location_id,user_id" },
    )
    .select("*")
    .single()

  if (error) return apiError(error.message, 500, "LOCATION_REVIEW_SAVE_FAILED")

  return NextResponse.json({ review: data }, { status: 201 })
}
