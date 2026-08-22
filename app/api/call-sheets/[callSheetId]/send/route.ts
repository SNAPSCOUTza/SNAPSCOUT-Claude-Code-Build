import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"

export async function POST(_request: Request, { params }: { params: { callSheetId: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const { data: callSheet, error } = await supabase
    .from("call_sheets")
    .update({ status: "sent" })
    .eq("id", params.callSheetId)
    .eq("owner_id", user.id)
    .select("id,status,project_name,shoot_date,shoot_location,general_call_time")
    .single()

  if (error) return apiError(error.message, 500, "CALL_SHEET_SEND_FAILED")

  const { data: crew } = await supabase
    .from("call_sheet_crew")
    .select("crew_member_id")
    .eq("call_sheet_id", params.callSheetId)

  const crewIds = (crew || [])
    .map((entry: any) => entry.crew_member_id as string)
    .filter((id: string) => id !== user.id)

  if (crewIds.length > 0) {
    const messageBody = [
      `📋 New call sheet: ${callSheet.project_name || "Untitled production"}`,
      `${callSheet.shoot_date}${callSheet.shoot_location ? ` · ${callSheet.shoot_location}` : ""}`,
      `General call ${callSheet.general_call_time}`,
      "",
      `View your call sheet: /crew-pools/call-sheets/${params.callSheetId}`,
    ].join("\n")

    for (const crewMemberId of crewIds) {
      // Mirrors the client-side find-or-create pattern in
      // supabase-messaging-provider.tsx - the unique constraint is
      // directional, so both participant orderings need checking before
      // inserting a new conversation.
      const { data: existingConvo } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant_1.eq.${user.id},participant_2.eq.${crewMemberId}),and(participant_1.eq.${crewMemberId},participant_2.eq.${user.id})`,
        )
        .maybeSingle()

      let conversationId: string | undefined = existingConvo?.id

      if (!conversationId) {
        const { data: newConvo, error: convoError } = await supabase
          .from("conversations")
          .insert({
            participant_1: user.id,
            participant_2: crewMemberId,
            last_message_at: new Date().toISOString(),
            last_message: messageBody,
          })
          .select("id")
          .single()

        if (convoError || !newConvo) continue
        conversationId = newConvo.id
      }

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: messageBody,
      })

      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString(), last_message: messageBody })
        .eq("id", conversationId)
    }
  }

  return NextResponse.json({ success: true, call_sheet: callSheet })
}
