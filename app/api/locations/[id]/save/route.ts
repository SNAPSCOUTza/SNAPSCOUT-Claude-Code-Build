import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"

export const runtime = "nodejs"

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context
  const { supabase, user } = context

  const { error } = await supabase
    .from("shoot_location_saves")
    .upsert({ location_id: params.id, user_id: user.id }, { onConflict: "location_id,user_id" })

  if (error) return apiError(error.message, 500, "LOCATION_SAVE_FAILED")
  return NextResponse.json({ saved: true })
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context
  const { supabase, user } = context

  const { error } = await supabase
    .from("shoot_location_saves")
    .delete()
    .eq("location_id", params.id)
    .eq("user_id", user.id)

  if (error) return apiError(error.message, 500, "LOCATION_UNSAVE_FAILED")
  return NextResponse.json({ saved: false })
}
