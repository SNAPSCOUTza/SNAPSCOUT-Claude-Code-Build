import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"
import { PORTFOLIO_BUCKET } from "@/lib/portfolio/portfolio-service"

export const runtime = "nodejs"

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const { data, error } = await supabase
    .from("portfolio_uploads")
    .select("id,storage_path")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) return apiError(error.message, 500, "PORTFOLIO_UPLOAD_LOOKUP_FAILED")
  if (!data) return apiError("Portfolio upload not found", 404, "PORTFOLIO_UPLOAD_NOT_FOUND")

  const { error: deleteError } = await supabase
    .from("portfolio_uploads")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id)

  if (deleteError) return apiError(deleteError.message, 500, "PORTFOLIO_UPLOAD_DELETE_FAILED")

  if (data.storage_path) {
    await supabase.storage.from(PORTFOLIO_BUCKET).remove([data.storage_path])
  }

  return NextResponse.json({ success: true })
}
