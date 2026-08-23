import { NextResponse } from "next/server"
import { apiError, getProfilesByIds, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"
import { createAdminClient } from "@/lib/supabase/admin"

// Every call sheet the current user has a stake in: ones they created
// (owned) and ones they've been sent as crew (received). See
// /api/call-sheets/[callSheetId] for the single-sheet, owner-or-crew
// authorization check this mirrors.
export async function GET() {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context
  const { supabase, user } = context

  const [ownedResult, crewRowsResult] = await Promise.all([
    supabase
      .from("call_sheets")
      .select("id,owner_id,project_name,shoot_date,shoot_location,general_call_time,status,created_at")
      .eq("owner_id", user.id)
      .order("shoot_date", { ascending: true }),
    supabase.from("call_sheet_crew").select("call_sheet_id,call_time,department,role,response_status,responded_at").eq("crew_member_id", user.id),
  ])

  if (ownedResult.error) return apiError(ownedResult.error.message, 500, "CALL_SHEET_OWNED_LIST_FAILED")
  if (crewRowsResult.error) return apiError(crewRowsResult.error.message, 500, "CALL_SHEET_CREW_LOOKUP_FAILED")

  const owned = ownedResult.data || []
  const crewRows = crewRowsResult.data || []

  const admin = createAdminClient()

  const [receivedSheetsResult, ownedCrewCountsResult] = await Promise.all([
    crewRows.length > 0
      ? admin
          .from("call_sheets")
          .select("id,owner_id,project_name,shoot_date,shoot_location,general_call_time,status,created_at")
          .in(
            "id",
            crewRows.map((row: any) => row.call_sheet_id),
          )
          .eq("status", "sent")
          .order("shoot_date", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    owned.length > 0
      ? admin
          .from("call_sheet_crew")
          .select("call_sheet_id")
          .in(
            "call_sheet_id",
            owned.map((sheet: any) => sheet.id),
          )
      : Promise.resolve({ data: [], error: null }),
  ])

  if (receivedSheetsResult.error) return apiError(receivedSheetsResult.error.message, 500, "CALL_SHEET_RECEIVED_LIST_FAILED")

  const received = receivedSheetsResult.data || []
  const crewByCallSheet = new Map(crewRows.map((row: any) => [row.call_sheet_id, row]))
  const ownerProfiles = await getProfilesByIds(
    admin,
    received.map((sheet: any) => sheet.owner_id),
  )

  const crewCountByCallSheet = new Map<string, number>()
  for (const row of ownedCrewCountsResult.data || []) {
    crewCountByCallSheet.set(row.call_sheet_id, (crewCountByCallSheet.get(row.call_sheet_id) || 0) + 1)
  }

  return NextResponse.json({
    owned: owned.map((sheet: any) => ({ ...sheet, crew_count: crewCountByCallSheet.get(sheet.id) || 0 })),
    received: received.map((sheet: any) => ({
      ...sheet,
      my_entry: crewByCallSheet.get(sheet.id),
      owner: ownerProfiles.get(sheet.owner_id),
    })),
  })
}

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
