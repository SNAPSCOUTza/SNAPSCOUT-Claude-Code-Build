import { NextResponse } from "next/server"
import { apiError, getProfilesByIds, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"
import { createAdminClient } from "@/lib/supabase/admin"

const allowedStatuses = new Set(["accepted", "declined"])

// A crew member accepting/declining the specific call sheet they were sent -
// separate from (and later than) their earlier availability_responses
// confirmation. call_sheet_crew RLS only grants the owner write access
// today, so this is enforced in-route with the admin client, same pattern
// as GET /api/call-sheets/[callSheetId].
export async function POST(request: Request, { params }: { params: { callSheetId: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context
  const { supabase, user } = context

  const body = await request.json().catch(() => ({}))
  const status = typeof body.status === "string" ? body.status : ""
  if (!allowedStatuses.has(status)) {
    return apiError("Status must be accepted or declined", 400, "INVALID_STATUS")
  }

  const admin = createAdminClient()

  const { data: callSheet, error: callSheetError } = await admin
    .from("call_sheets")
    .select("id,owner_id,project_name,shoot_date,status")
    .eq("id", params.callSheetId)
    .maybeSingle()

  if (callSheetError) return apiError(callSheetError.message, 500, "CALL_SHEET_LOOKUP_FAILED")
  if (!callSheet || callSheet.status !== "sent") return apiError("Call sheet not found", 404, "CALL_SHEET_NOT_FOUND")

  const { data: updatedEntry, error: updateError } = await admin
    .from("call_sheet_crew")
    .update({ response_status: status, responded_at: new Date().toISOString() })
    .eq("call_sheet_id", params.callSheetId)
    .eq("crew_member_id", user.id)
    .select("id,call_sheet_id,crew_member_id,call_time,department,role,response_status,responded_at")
    .maybeSingle()

  if (updateError) return apiError(updateError.message, 500, "CALL_SHEET_RESPONSE_FAILED")
  if (!updatedEntry) return apiError("You're not listed on this call sheet", 404, "NOT_ON_CALL_SHEET")

  // Reflect the response on the crew member's own real availability calendar.
  // Accepting marks the shoot date Booked; declining removes any Booked
  // entry this same call sheet previously created (covers a change of mind
  // after having accepted first). Uses the request-scoped client since the
  // crew member owns these rows themselves - no admin client needed here.
  if (status === "accepted") {
    await supabase.from("availability_entries").upsert(
      {
        owner_id: user.id,
        owner_type: "crew",
        date: callSheet.shoot_date,
        status: "booked",
        note: callSheet.project_name || "Call sheet booking",
        call_sheet_id: callSheet.id,
      },
      { onConflict: "owner_id,date" },
    )
  } else {
    await supabase
      .from("availability_entries")
      .delete()
      .eq("owner_id", user.id)
      .eq("call_sheet_id", callSheet.id)
  }

  // Let the producer know via the real messaging system, mirroring the
  // notification sent when the call sheet went out.
  const profileMap = await getProfilesByIds(admin, [user.id])
  const myName = profileMap.get(user.id)?.full_name || "A crew member"
  const replyBody =
    status === "accepted"
      ? `✅ ${myName} accepted the call sheet: ${callSheet.project_name || "Untitled production"}`
      : `❌ ${myName} declined the call sheet: ${callSheet.project_name || "Untitled production"}`

  const { data: existingConvo } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant_1.eq.${user.id},participant_2.eq.${callSheet.owner_id}),and(participant_1.eq.${callSheet.owner_id},participant_2.eq.${user.id})`,
    )
    .maybeSingle()

  let conversationId: string | undefined = existingConvo?.id

  if (!conversationId) {
    const { data: newConvo } = await supabase
      .from("conversations")
      .insert({
        participant_1: user.id,
        participant_2: callSheet.owner_id,
        last_message_at: new Date().toISOString(),
        last_message: replyBody,
      })
      .select("id")
      .single()
    conversationId = newConvo?.id
  }

  if (conversationId) {
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: replyBody,
    })
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString(), last_message: replyBody })
      .eq("id", conversationId)
  }

  return NextResponse.json({ crew: updatedEntry })
}
