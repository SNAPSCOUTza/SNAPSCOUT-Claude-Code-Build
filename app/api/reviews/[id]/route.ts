import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"

export const runtime = "nodejs"

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context

  const { error } = await supabase.from("profile_reviews").delete().eq("id", params.id).eq("reviewer_id", user.id)

  if (error) return apiError(error.message, 500, "REVIEW_DELETE_FAILED")
  return NextResponse.json({ success: true })
}
