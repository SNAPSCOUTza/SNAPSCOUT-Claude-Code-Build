import { NextResponse } from "next/server"
import { apiError, getProfilesByIds, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(_request: Request, { params }: { params: { callSheetId: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context
  const { user } = context

  // A call sheet needs to be readable by both its owner and any crew member
  // it lists - call_sheets/call_sheet_crew RLS only grants the owner read
  // access today. Widening that requires a DB migration this environment
  // can't apply automatically (see scripts/create-crew-pool-tables.sql's own
  // "run this manually" note), so authorization is enforced here instead,
  // using the admin client to read past RLS once that check passes.
  const admin = createAdminClient()

  const { data: callSheet, error: callSheetError } = await admin
    .from("call_sheets")
    .select("id,request_id,owner_id,project_name,shoot_date,shoot_location,general_call_time,status,created_at")
    .eq("id", params.callSheetId)
    .maybeSingle()

  if (callSheetError) return apiError(callSheetError.message, 500, "CALL_SHEET_LOOKUP_FAILED")
  if (!callSheet) return apiError("Call sheet not found", 404, "CALL_SHEET_NOT_FOUND")

  const { data: crew, error: crewError } = await admin
    .from("call_sheet_crew")
    .select("id,call_sheet_id,crew_member_id,call_time,department,role,response_status,responded_at")
    .eq("call_sheet_id", params.callSheetId)
    .order("call_time", { ascending: true })

  if (crewError) return apiError(crewError.message, 500, "CALL_SHEET_CREW_LOOKUP_FAILED")

  const isOwner = callSheet.owner_id === user.id
  const isCrew = (crew || []).some((entry: any) => entry.crew_member_id === user.id)

  // Crew can only see a call sheet once it's actually been sent - not a
  // producer's in-progress draft.
  if (!isOwner && !(isCrew && callSheet.status === "sent")) {
    return apiError("Call sheet not found", 404, "CALL_SHEET_NOT_FOUND")
  }

  const profileMap = await getProfilesByIds(admin, [
    ...(crew || []).map((entry: any) => entry.crew_member_id),
    callSheet.owner_id,
  ])

  const myEntry = (crew || []).find((entry: any) => entry.crew_member_id === user.id)

  return NextResponse.json({
    call_sheet: {
      ...callSheet,
      is_owner: isOwner,
      owner: profileMap.get(callSheet.owner_id),
      my_response_status: !isOwner ? myEntry?.response_status : undefined,
      crew: (crew || []).map((entry: any) => ({
        ...entry,
        profile: profileMap.get(entry.crew_member_id),
      })),
    },
  })
}

export async function PATCH(request: Request, { params }: { params: { callSheetId: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const body = await request.json().catch(() => ({}))

  const update = {
    project_name: sanitizeText(body.project_name, 120) || "Untitled production",
  }

  const { data, error } = await supabase
    .from("call_sheets")
    .update(update)
    .eq("id", params.callSheetId)
    .eq("owner_id", user.id)
    .select("id,request_id,owner_id,project_name,shoot_date,shoot_location,general_call_time,status,created_at")
    .maybeSingle()

  if (error) return apiError(error.message, 500, "CALL_SHEET_UPDATE_FAILED")
  if (!data) return apiError("Call sheet not found", 404, "CALL_SHEET_NOT_FOUND")

  return NextResponse.json({ call_sheet: data })
}
