import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"
import { getInstagramConnection } from "@/lib/portfolio/portfolio-service"

export const runtime = "nodejs"

export async function POST() {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const connection = await getInstagramConnection(supabase, user.id)

  if (connection?.id) {
    await supabase.from("instagram_media_selections").delete().eq("connection_id", connection.id).eq("user_id", user.id)
    await supabase.from("instagram_media_cache").delete().eq("connection_id", connection.id).eq("user_id", user.id)
    const { error } = await supabase.from("instagram_connections").delete().eq("id", connection.id).eq("user_id", user.id)
    if (error) return apiError(error.message, 500, "INSTAGRAM_DISCONNECT_FAILED")
  }

  await supabase.from("user_profiles").update({ portfolio_source: "upload" }).eq("user_id", user.id)
  return NextResponse.json({ success: true })
}
