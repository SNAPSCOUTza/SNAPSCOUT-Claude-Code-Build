import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"

function normalizeUrl(value: unknown, maxLength = 1200) {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim().slice(0, maxLength)
  return trimmed || null
}

export async function PATCH(request: Request, { params }: { params: { itemId: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const body = await request.json().catch(() => ({}))

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if ("source_platform" in body || "platform" in body) updates.source_platform = sanitizeText(body.source_platform || body.platform, 32)
  if ("media_type" in body || "type" in body) updates.media_type = sanitizeText(body.media_type || body.type, 32)
  if ("source_url" in body || "link" in body) updates.source_url = normalizeUrl(body.source_url || body.link)
  if ("thumbnail_url" in body || "thumbnail" in body) updates.thumbnail_url = normalizeUrl(body.thumbnail_url || body.thumbnail)
  if ("full_media_url" in body || "fullUrl" in body) updates.full_media_url = normalizeUrl(body.full_media_url || body.fullUrl)
  if ("embed_url" in body || "embedUrl" in body) updates.embed_url = normalizeUrl(body.embed_url || body.embedUrl)
  if ("title" in body) updates.title = sanitizeText(body.title, 120) || null
  if ("caption" in body) updates.caption = sanitizeText(body.caption, 500) || null
  if ("sort_order" in body && Number.isFinite(Number(body.sort_order))) updates.sort_order = Number(body.sort_order)
  if ("is_visible" in body) updates.is_visible = Boolean(body.is_visible)

  const { data, error } = await supabase
    .from("portfolio_items")
    .update(updates)
    .eq("id", params.itemId)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle()

  if (error) return apiError(error.message, 500, "PORTFOLIO_ITEM_UPDATE_FAILED")
  if (!data) return apiError("Portfolio item not found", 404, "PORTFOLIO_ITEM_NOT_FOUND")

  return NextResponse.json({ item: data })
}

export async function DELETE(_request: Request, { params }: { params: { itemId: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const { error } = await supabase.from("portfolio_items").delete().eq("id", params.itemId).eq("user_id", user.id)

  if (error) return apiError(error.message, 500, "PORTFOLIO_ITEM_DELETE_FAILED")

  return NextResponse.json({ success: true })
}
