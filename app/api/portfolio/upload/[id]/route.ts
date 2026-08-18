import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"
import { deleteFromR2 } from "@/lib/r2/storage"

export const runtime = "nodejs"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const body = await request.json().catch(() => null)
  if (!body || typeof body.is_cover !== "boolean") {
    return apiError("Provide is_cover", 400, "PORTFOLIO_UPLOAD_INVALID_BODY")
  }

  const { data: existing, error: lookupError } = await supabase
    .from("portfolio_uploads")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (lookupError) return apiError(lookupError.message, 500, "PORTFOLIO_UPLOAD_LOOKUP_FAILED")
  if (!existing) return apiError("Portfolio upload not found", 404, "PORTFOLIO_UPLOAD_NOT_FOUND")

  if (body.is_cover) {
    await supabase.from("portfolio_uploads").update({ is_cover: false }).eq("user_id", user.id).eq("is_cover", true)
  }

  const { error: updateError } = await supabase
    .from("portfolio_uploads")
    .update({ is_cover: body.is_cover })
    .eq("id", params.id)
    .eq("user_id", user.id)

  if (updateError) return apiError(updateError.message, 500, "PORTFOLIO_UPLOAD_UPDATE_FAILED")

  return NextResponse.json({ success: true })
}

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
    await deleteFromR2([data.storage_path]).catch(() => null)
  }

  return NextResponse.json({ success: true })
}
