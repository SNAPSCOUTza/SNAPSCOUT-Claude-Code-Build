import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"

export async function POST(request: Request) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const body = await request.json().catch(() => ({}))
  const shootDate = sanitizeText(body.shoot_date, 20)
  const crewMemberIds = Array.isArray(body.crew_member_ids)
    ? Array.from(new Set(body.crew_member_ids.filter((id: unknown): id is string => typeof id === "string")))
    : []

  if (!shootDate) return apiError("shoot_date is required", 400, "SHOOT_DATE_REQUIRED")
  if (crewMemberIds.length === 0) return apiError("Select at least one crew member", 400, "CREW_REQUIRED")

  const { data: availabilityRequest, error: requestError } = await supabase
    .from("availability_requests")
    .insert({
      requester_id: user.id,
      shoot_date: shootDate,
      shoot_location: sanitizeText(body.shoot_location, 160) || null,
      project_name: sanitizeText(body.project_name, 120) || null,
      note: sanitizeText(body.note, 1000) || null,
    })
    .select("id,requester_id,shoot_date,shoot_location,project_name,note,created_at")
    .single()

  if (requestError) return apiError(requestError.message, 500, "AVAILABILITY_REQUEST_CREATE_FAILED")

  const responseRows = crewMemberIds.map((crew_member_id) => ({
    request_id: availabilityRequest.id,
    crew_member_id,
    status: "pending",
  }))

  const { data: responses, error: responseError } = await supabase
    .from("availability_responses")
    .insert(responseRows)
    .select("id,request_id,crew_member_id,status,responded_at,created_at")

  if (responseError) return apiError(responseError.message, 500, "AVAILABILITY_RESPONSES_CREATE_FAILED")

  return NextResponse.json(
    {
      request: {
        ...availabilityRequest,
        responses: responses || [],
      },
    },
    { status: 201 },
  )
}
