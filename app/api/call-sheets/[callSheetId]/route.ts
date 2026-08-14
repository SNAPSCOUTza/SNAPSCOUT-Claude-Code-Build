import { NextResponse } from "next/server"
import { apiError, getProfilesByIds, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"

export async function GET(_request: Request, { params }: { params: { callSheetId: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const { data: callSheet, error: callSheetError } = await supabase
    .from("call_sheets")
    .select("id,request_id,owner_id,project_name,shoot_date,shoot_location,general_call_time,status,created_at")
    .eq("id", params.callSheetId)
    .eq("owner_id", user.id)
    .maybeSingle()

  if (callSheetError) return apiError(callSheetError.message, 500, "CALL_SHEET_LOOKUP_FAILED")
  if (!callSheet) return apiError("Call sheet not found", 404, "CALL_SHEET_NOT_FOUND")

  const { data: crew, error: crewError } = await supabase
    .from("call_sheet_crew")
    .select("id,call_sheet_id,crew_member_id,call_time,department,role")
    .eq("call_sheet_id", params.callSheetId)
    .order("call_time", { ascending: true })

  if (crewError) return apiError(crewError.message, 500, "CALL_SHEET_CREW_LOOKUP_FAILED")

  const profileMap = await getProfilesByIds(
    supabase,
    (crew || []).map((entry: any) => entry.crew_member_id),
  )

  return NextResponse.json({
    call_sheet: {
      ...callSheet,
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
