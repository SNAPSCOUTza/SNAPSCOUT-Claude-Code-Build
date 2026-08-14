import { NextResponse } from "next/server"
import { apiError, getProfilesByIds, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"

export async function GET() {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const { data: responses, error: responseError } = await supabase
    .from("availability_responses")
    .select("id,request_id,crew_member_id,status,responded_at,created_at")
    .eq("crew_member_id", user.id)
    .order("created_at", { ascending: false })

  if (responseError) return apiError(responseError.message, 500, "AVAILABILITY_RESPONSE_LIST_FAILED")

  const requestIds = Array.from(new Set((responses || []).map((response: any) => response.request_id)))
  const requestsById = new Map<string, any>()

  if (requestIds.length > 0) {
    const { data: requests, error: requestError } = await supabase
      .from("availability_requests")
      .select("id,requester_id,shoot_date,shoot_location,project_name,note,created_at")
      .in("id", requestIds)

    if (requestError) return apiError(requestError.message, 500, "AVAILABILITY_REQUEST_LIST_FAILED")
    for (const request of requests || []) {
      requestsById.set(request.id, request)
    }
  }

  const requesterIds = Array.from(
    new Set(Array.from(requestsById.values()).map((request: any) => request.requester_id).filter(Boolean)),
  )
  const requesterProfiles = await getProfilesByIds(supabase, requesterIds)

  return NextResponse.json({
    responses: (responses || []).map((response: any) => {
      const request = requestsById.get(response.request_id)
      return {
        ...response,
        request,
        requester: request ? requesterProfiles.get(request.requester_id) : undefined,
      }
    }),
  })
}
