import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"

export async function POST(_request: Request, { params }: { params: { callSheetId: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const { data, error } = await supabase
    .from("call_sheets")
    .update({ status: "sent" })
    .eq("id", params.callSheetId)
    .eq("owner_id", user.id)
    .select("id,status")
    .single()

  if (error) return apiError(error.message, 500, "CALL_SHEET_SEND_FAILED")

  return NextResponse.json({ success: true, call_sheet: data })
}
