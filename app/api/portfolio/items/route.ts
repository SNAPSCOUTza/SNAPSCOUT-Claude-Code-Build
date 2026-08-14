import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"
import { getPublicPortfolioItems, toLegacyPortfolioItem } from "@/lib/portfolio/portfolio-service"

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function normalizeUrl(value: unknown, maxLength = 1200) {
  if (typeof value !== "string") return null
  const trimmed = value.trim().slice(0, maxLength)
  if (!trimmed) return null
  return trimmed
}

export async function GET(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const url = new URL(request.url)
  const requestedUserId = url.searchParams.get("userId") || undefined

  if (requestedUserId && !uuidPattern.test(requestedUserId)) {
    return NextResponse.json({ items: [] })
  }

  if (!requestedUserId && !user) {
    return apiError("Authentication required", 401, "UNAUTHENTICATED")
  }

  const userId = requestedUserId || user!.id

  const readClient = isAdminClientAvailable() ? createAdminClient() : supabase

  try {
    const portfolio = await getPublicPortfolioItems(readClient, userId)
    return NextResponse.json({ items: portfolio.items.map(toLegacyPortfolioItem), source: portfolio.source })
  } catch (error: any) {
    const message = error?.message || "Portfolio items could not be loaded"
    if (message.toLowerCase().includes("schema cache") || message.toLowerCase().includes("portfolio_items")) {
      return NextResponse.json({ items: [] })
    }
    return apiError(message, 500, "PORTFOLIO_ITEMS_LOAD_FAILED")
  }
}

export async function POST(request: Request) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const body = await request.json().catch(() => ({}))

  const sourcePlatform = sanitizeText(body.source_platform || body.platform || "local", 32) || "local"
  const mediaType = sanitizeText(body.media_type || body.type || "image", 32) || "image"

  const payload = {
    user_id: user.id,
    source_platform: sourcePlatform,
    media_type: mediaType,
    source_url: normalizeUrl(body.source_url || body.link),
    thumbnail_url: normalizeUrl(body.thumbnail_url || body.thumbnail),
    full_media_url: normalizeUrl(body.full_media_url || body.fullUrl),
    embed_url: normalizeUrl(body.embed_url || body.embedUrl),
    title: sanitizeText(body.title, 120) || null,
    caption: sanitizeText(body.caption, 500) || null,
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
    is_visible: body.is_visible === false ? false : true,
  }

  if (!payload.source_url && !payload.thumbnail_url && !payload.full_media_url && !payload.embed_url) {
    return apiError("Add a portfolio URL, media URL, or thumbnail URL", 400, "PORTFOLIO_ITEM_MISSING_MEDIA")
  }

  const { data, error } = await supabase.from("portfolio_items").insert(payload).select("*").single()

  if (error) return apiError(error.message, 500, "PORTFOLIO_ITEM_CREATE_FAILED")

  return NextResponse.json({ item: data }, { status: 201 })
}
