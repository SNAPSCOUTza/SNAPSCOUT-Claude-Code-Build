import { NextResponse } from "next/server"
import { apiError, getProfilesByIds, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"

export async function GET(_request: Request, { params }: { params: { requestId: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const { data: availabilityRequest, error: requestError } = await supabase
    .from("availability_requests")
    .select("id,requester_id,shoot_date,shoot_location,project_name,note,created_at")
    .eq("id", params.requestId)
    .maybeSingle()

  if (requestError) return apiError(requestError.message, 500, "AVAILABILITY_REQUEST_LOOKUP_FAILED")
  if (!availabilityRequest) return apiError("Availability request not found", 404, "REQUEST_NOT_FOUND")

  if (availabilityRequest.requester_id !== user.id) {
    const { data: ownResponse, error: ownResponseError } = await supabase
      .from("availability_responses")
      .select("id")
      .eq("request_id", params.requestId)
      .eq("crew_member_id", user.id)
      .maybeSingle()

    if (ownResponseError) return apiError(ownResponseError.message, 500, "AVAILABILITY_ACCESS_CHECK_FAILED")
    if (!ownResponse) return apiError("You cannot access this availability request", 403, "FORBIDDEN")
  }

  const { data: responses, error: responseError } = await supabase
    .from("availability_responses")
    .select("id,request_id,crew_member_id,status,responded_at,created_at")
    .eq("request_id", params.requestId)
    .order("created_at", { ascending: true })

  if (responseError) return apiError(responseError.message, 500, "AVAILABILITY_RESPONSES_LOOKUP_FAILED")

  const profileMap = await getProfilesByIds(
    supabase,
    (responses || []).map((response: any) => response.crew_member_id),
  )

  return NextResponse.json({
    request: {
      ...availabilityRequest,
      responses: (responses || []).map((response: any) => ({
        ...response,
        profile: profileMap.get(response.crew_member_id),
      })),
    },
  })
}
