import { NextResponse } from "next/server"
import { apiError, getProfilesByIds, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"

export async function POST(request: Request) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const body = await request.json().catch(() => ({}))
  const requestId = sanitizeText(body.request_id, 80)
  const generalCallTime = sanitizeText(body.general_call_time, 20) || "06:00"

  if (!requestId) return apiError("request_id is required", 400, "REQUEST_ID_REQUIRED")

  const { data: availabilityRequest, error: requestError } = await supabase
    .from("availability_requests")
    .select("id,requester_id,shoot_date,shoot_location,project_name")
    .eq("id", requestId)
    .eq("requester_id", user.id)
    .maybeSingle()

  if (requestError) return apiError(requestError.message, 500, "AVAILABILITY_REQUEST_LOOKUP_FAILED")
  if (!availabilityRequest) return apiError("Availability request not found", 404, "REQUEST_NOT_FOUND")

  const { data: confirmedResponses, error: responseError } = await supabase
    .from("availability_responses")
    .select("crew_member_id")
    .eq("request_id", requestId)
    .eq("status", "confirmed")

  if (responseError) return apiError(responseError.message, 500, "CONFIRMED_CREW_LOOKUP_FAILED")
  if (!confirmedResponses || confirmedResponses.length === 0) {
    return apiError("At least one crew member must confirm before generating a call sheet", 400, "NO_CONFIRMED_CREW")
  }

  const projectName = sanitizeText(body.project_name, 120) || availabilityRequest.project_name || "Untitled production"

  const { data: callSheet, error: callSheetError } = await supabase
    .from("call_sheets")
    .insert({
      request_id: requestId,
      owner_id: user.id,
      project_name: projectName,
      shoot_date: availabilityRequest.shoot_date,
      shoot_location: availabilityRequest.shoot_location,
      general_call_time: generalCallTime,
      status: "draft",
    })
    .select("id,request_id,owner_id,project_name,shoot_date,shoot_location,general_call_time,status,created_at")
    .single()

  if (callSheetError) return apiError(callSheetError.message, 500, "CALL_SHEET_CREATE_FAILED")

  const crewIds = confirmedResponses.map((response: any) => response.crew_member_id)
  const profileMap = await getProfilesByIds(supabase, crewIds)
  const crewRows = crewIds.map((crewMemberId: string) => {
    const profile = profileMap.get(crewMemberId)
    return {
      call_sheet_id: callSheet.id,
      crew_member_id: crewMemberId,
      call_time: generalCallTime,
      department: profile?.skills?.[0] || null,
      role: profile?.role || null,
    }
  })

  const { data: crew, error: crewError } = await supabase
    .from("call_sheet_crew")
    .insert(crewRows)
    .select("id,call_sheet_id,crew_member_id,call_time,department,role")

  if (crewError) return apiError(crewError.message, 500, "CALL_SHEET_CREW_CREATE_FAILED")

  return NextResponse.json(
    {
      call_sheet: {
        ...callSheet,
        crew: (crew || []).map((entry: any) => ({
          ...entry,
          profile: profileMap.get(entry.crew_member_id),
        })),
      },
    },
    { status: 201 },
  )
}
