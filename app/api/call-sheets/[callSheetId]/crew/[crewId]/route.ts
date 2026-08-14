import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"

export async function PATCH(
  request: Request,
  { params }: { params: { callSheetId: string; crewId: string } },
) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const body = await request.json().catch(() => ({}))

  const { data: callSheet, error: callSheetError } = await supabase
    .from("call_sheets")
    .select("id")
    .eq("id", params.callSheetId)
    .eq("owner_id", user.id)
    .maybeSingle()

  if (callSheetError) return apiError(callSheetError.message, 500, "CALL_SHEET_LOOKUP_FAILED")
  if (!callSheet) return apiError("Call sheet not found", 404, "CALL_SHEET_NOT_FOUND")

  const update = {
    call_time: sanitizeText(body.call_time, 20) || "06:00",
    department: sanitizeText(body.department, 80) || null,
  }

  const { data, error } = await supabase
    .from("call_sheet_crew")
    .update(update)
    .eq("call_sheet_id", params.callSheetId)
    .eq("crew_member_id", params.crewId)
    .select("id,call_sheet_id,crew_member_id,call_time,department,role")
    .single()

  if (error) return apiError(error.message, 500, "CALL_SHEET_CREW_UPDATE_FAILED")

  return NextResponse.json({ crew: data })
}
