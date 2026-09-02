import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"

export const runtime = "nodejs"

export async function DELETE(request: Request, { params }: { params: { id: string; reviewId: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context
  const { supabase, user } = context

  const { error } = await supabase
    .from("shoot_location_reviews")
    .delete()
    .eq("id", params.reviewId)
    .eq("location_id", params.id)
    .eq("user_id", user.id)

  if (error) return apiError(error.message, 500, "LOCATION_REVIEW_DELETE_FAILED")

  return NextResponse.json({ success: true })
}
