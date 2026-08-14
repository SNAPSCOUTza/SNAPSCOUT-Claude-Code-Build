import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"

const allowedStatuses = new Set(["confirmed", "declined"])

export async function PATCH(request: Request, { params }: { params: { responseId: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const body = await request.json().catch(() => ({}))
  const status = typeof body.status === "string" ? body.status : ""

  if (!allowedStatuses.has(status)) {
    return apiError("Status must be confirmed or declined", 400, "INVALID_STATUS")
  }

  const { data: response, error: lookupError } = await supabase
    .from("availability_responses")
    .select("id,crew_member_id")
    .eq("id", params.responseId)
    .eq("crew_member_id", user.id)
    .maybeSingle()

  if (lookupError) return apiError(lookupError.message, 500, "AVAILABILITY_RESPONSE_LOOKUP_FAILED")
  if (!response) return apiError("Availability response not found", 404, "RESPONSE_NOT_FOUND")

  const { data, error } = await supabase
    .from("availability_responses")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", params.responseId)
    .eq("crew_member_id", user.id)
    .select("id,request_id,crew_member_id,status,responded_at,created_at")
    .single()

  if (error) return apiError(error.message, 500, "AVAILABILITY_RESPONSE_UPDATE_FAILED")

  return NextResponse.json({ response: data })
}
