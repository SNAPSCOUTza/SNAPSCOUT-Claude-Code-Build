import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"
import type { PortfolioMediaType, PortfolioSourcePlatform } from "@/types/portfolio"

function parseUrl(rawUrl: unknown) {
  if (typeof rawUrl !== "string") return null
  try {
    return new URL(rawUrl.trim())
  } catch {
    return null
  }
}

function youtubeId(url: URL) {
  if (url.hostname.includes("youtu.be")) return url.pathname.split("/").filter(Boolean)[0] || null
  if (url.hostname.includes("youtube.com")) return url.searchParams.get("v") || url.pathname.match(/\/shorts\/([^/?#]+)/)?.[1] || null
  return null
}

function vimeoId(url: URL) {
  if (!url.hostname.includes("vimeo.com")) return null
  return url.pathname.split("/").filter(Boolean).find((part) => /^\d+$/.test(part)) || null
}

// Vimeo's oEmbed endpoint is public - no API key needed - and returns a real
// thumbnail for the video. Falls back to the generic static placeholder if
// the video is private/deleted or the request fails; never lets a thumbnail
// lookup block the actual import.
async function fetchVimeoThumbnail(videoUrl: string): Promise<string | null> {
  try {
    const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return null
    const data = await response.json()
    return typeof data.thumbnail_url === "string" ? data.thumbnail_url : null
  } catch {
    return null
  }
}

function classifyUrl(url: URL): {
  source_platform: PortfolioSourcePlatform
  media_type: PortfolioMediaType
  embed_url: string | null
  thumbnail_url: string | null
} {
  const host = url.hostname.toLowerCase()
  const youtubeVideoId = youtubeId(url)
  if (youtubeVideoId) {
    return {
      source_platform: "youtube",
      media_type: "video",
      embed_url: `https://www.youtube.com/embed/${youtubeVideoId}`,
      thumbnail_url: `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`,
    }
  }

  const detectedVimeoId = vimeoId(url)
  if (detectedVimeoId) {
    return {
      source_platform: "vimeo",
      media_type: "video",
      embed_url: `https://player.vimeo.com/video/${detectedVimeoId}`,
      thumbnail_url: "/video-reel-showcase.png",
    }
  }

  if (host.includes("instagram.com")) {
    return { source_platform: "instagram", media_type: "embed", embed_url: null, thumbnail_url: "/placeholder.svg" }
  }

  if (host.includes("facebook.com") || host.includes("fb.watch")) {
    return { source_platform: "facebook", media_type: "embed", embed_url: null, thumbnail_url: "/placeholder.svg" }
  }

  if (host.includes("imdb.com")) {
    return { source_platform: "imdb", media_type: "external", embed_url: null, thumbnail_url: "/placeholder.svg" }
  }

  const looksLikeImage = /\.(png|jpe?g|webp|gif|avif)$/i.test(url.pathname)
  return {
    source_platform: "external",
    media_type: looksLikeImage ? "image" : "external",
    embed_url: null,
    thumbnail_url: looksLikeImage ? url.toString() : "/placeholder.svg",
  }
}

export async function POST(request: Request) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const body = await request.json().catch(() => ({}))
  const parsed = parseUrl(body.url || body.source_url)

  if (!parsed) {
    return apiError("Paste a valid Instagram, Facebook, Vimeo, IMDb, YouTube, or media URL", 400, "INVALID_PORTFOLIO_URL")
  }

  const classified = classifyUrl(parsed)

  // Real thumbnail for Vimeo instead of the generic placeholder - cheap,
  // public API call, worth the extra round trip for a much better result.
  if (classified.source_platform === "vimeo") {
    const realThumbnail = await fetchVimeoThumbnail(parsed.toString())
    if (realThumbnail) classified.thumbnail_url = realThumbnail
  }

  const payload = {
    user_id: user.id,
    source_platform: classified.source_platform,
    media_type: classified.media_type,
    source_url: parsed.toString(),
    thumbnail_url: body.thumbnail_url || classified.thumbnail_url,
    full_media_url: classified.media_type === "image" ? parsed.toString() : null,
    embed_url: classified.embed_url,
    title: sanitizeText(body.title, 120) || `${classified.source_platform[0].toUpperCase()}${classified.source_platform.slice(1)} portfolio link`,
    caption: sanitizeText(body.caption, 500) || null,
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
    is_visible: body.is_visible === false ? false : true,
  }

  const { data, error } = await supabase.from("portfolio_items").insert(payload).select("*").single()

  if (error) return apiError(error.message, 500, "PORTFOLIO_LINK_IMPORT_FAILED")

  return NextResponse.json({ item: data }, { status: 201 })
}
