import type { NormalizedPortfolioItem, PortfolioSource } from "@/types/portfolio"
import {
  decryptInstagramToken,
  encryptInstagramToken,
  fetchInstagramMedia,
  refreshInstagramAccessToken,
  type InstagramMediaRecord,
} from "@/lib/portfolio/instagram"

export const PORTFOLIO_BUCKET = "portfolio-uploads"
export const PORTFOLIO_DISPLAY_LIMIT = 9
export const INSTAGRAM_CACHE_LIMIT = 50
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type SupabaseLike = any

export function isUuid(value?: string | null) {
  return Boolean(value && uuidPattern.test(value))
}

function normalizeMediaType(value?: string | null): "image" | "video" | "reel" {
  const normalized = String(value || "image").toUpperCase()
  if (normalized.includes("VIDEO")) return "video"
  if (normalized.includes("REEL")) return "reel"
  return "image"
}

export function normalizeUploadItem(record: any): NormalizedPortfolioItem {
  const mediaUrl = record.image_url || record.full_media_url || record.thumbnail_url || record.source_url || "/placeholder.svg"
  return {
    id: record.id,
    source: "upload",
    source_platform: "local",
    mediaType: normalizeMediaType(record.media_type),
    media_type: "image",
    thumbnailUrl: record.thumbnail_url || mediaUrl,
    mediaUrl,
    thumbnail_url: record.thumbnail_url || mediaUrl,
    full_media_url: mediaUrl,
    image_url: mediaUrl,
    source_url: mediaUrl,
    title: record.title,
    description: record.description || record.caption,
    caption: record.caption || record.description,
    timestamp: record.created_at,
    sort_order: record.sort_order,
    is_cover: Boolean(record.is_cover),
  }
}

export function normalizePortfolioLinkItem(record: any): NormalizedPortfolioItem {
  const mediaUrl = record.full_media_url || record.thumbnail_url || record.embed_url || record.source_url || "/placeholder.svg"
  return {
    id: record.id,
    source: "upload",
    source_platform: record.source_platform || "external",
    mediaType: normalizeMediaType(record.media_type),
    media_type: record.media_type,
    thumbnailUrl: record.thumbnail_url || mediaUrl,
    mediaUrl,
    thumbnail_url: record.thumbnail_url || mediaUrl,
    full_media_url: mediaUrl,
    image_url: mediaUrl,
    permalink: record.source_url,
    source_url: record.source_url,
    title: record.title,
    description: record.caption,
    caption: record.caption,
    timestamp: record.created_at,
    sort_order: record.sort_order,
  }
}

export function normalizeInstagramItem(record: any, username?: string | null): NormalizedPortfolioItem {
  const mediaUrl = record.media_url || record.thumbnail_url || "/placeholder.svg"
  return {
    id: record.id || record.media_id || record.instagram_media_id,
    cacheId: record.id,
    instagramMediaId: record.media_id || record.instagram_media_id,
    source: "instagram",
    source_platform: "instagram",
    mediaType: normalizeMediaType(record.media_type),
    media_type: normalizeMediaType(record.media_type) === "image" ? "image" : "video",
    thumbnailUrl: record.thumbnail_url || mediaUrl,
    mediaUrl,
    thumbnail_url: record.thumbnail_url || mediaUrl,
    full_media_url: mediaUrl,
    media_url: mediaUrl,
    permalink: record.permalink,
    source_url: record.permalink,
    caption: record.caption,
    title: record.caption,
    username,
    timestamp: record.timestamp || record.taken_at,
    sort_order: record.sort_order,
  }
}

export function toLegacyPortfolioItem(item: NormalizedPortfolioItem) {
  return {
    id: item.id,
    user_id: undefined,
    source_platform: item.source_platform || (item.source === "instagram" ? "instagram" : "local"),
    media_type: item.mediaType === "image" ? "image" : "video",
    source_url: item.permalink || item.source_url || item.mediaUrl,
    thumbnail_url: item.thumbnailUrl,
    full_media_url: item.mediaUrl,
    embed_url: null,
    title: item.title,
    caption: item.caption,
    sort_order: item.sort_order || 0,
    is_visible: true,
    created_at: item.timestamp,
    source: item.source,
    mediaType: item.mediaType,
    thumbnailUrl: item.thumbnailUrl,
    mediaUrl: item.mediaUrl,
    permalink: item.permalink,
    description: item.description,
    username: item.username,
    timestamp: item.timestamp,
  }
}

export async function getPortfolioSource(supabase: SupabaseLike, userId: string): Promise<PortfolioSource> {
  const { data } = await supabase
    .from("user_profiles")
    .select("portfolio_source")
    .eq("user_id", userId)
    .maybeSingle()

  return data?.portfolio_source === "instagram" ? "instagram" : "upload"
}

export async function getInstagramConnection(supabase: SupabaseLike, userId: string) {
  const { data, error } = await supabase
    .from("instagram_connections")
    .select("id,user_id,instagram_user_id,instagram_username,username,access_token_encrypted,token_iv,token_tag,expires_at,token_expires_at,status,last_sync,last_error,connected_at")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) return null
  return data
}

export async function getInstagramAvailableItems(supabase: SupabaseLike, connection: any, limit = INSTAGRAM_CACHE_LIMIT) {
  if (!connection?.id) return []

  const { data } = await supabase
    .from("instagram_media_cache")
    .select("*")
    .eq("connection_id", connection.id)
    .order("timestamp", { ascending: false })
    .order("last_synced", { ascending: false })
    .limit(limit)

  return (data || []).map((item: any) => normalizeInstagramItem(item, connection.instagram_username || connection.username))
}

export async function getSelectedInstagramItems(supabase: SupabaseLike, connection: any) {
  if (!connection?.id || !connection.user_id) return []

  const { data: selections } = await supabase
    .from("instagram_media_selections")
    .select("media_cache_id,sort_order")
    .eq("connection_id", connection.id)
    .eq("user_id", connection.user_id)
    .order("sort_order", { ascending: true })
    .limit(PORTFOLIO_DISPLAY_LIMIT)

  const selectedIds = (selections || []).map((selection: any) => selection.media_cache_id).filter(Boolean)
  if (!selectedIds.length) return []

  const { data: cached } = await supabase
    .from("instagram_media_cache")
    .select("*")
    .eq("connection_id", connection.id)
    .in("id", selectedIds)

  const byId = new Map((cached || []).map((item: any) => [item.id, item]))
  return (selections || [])
    .map((selection: any) => {
      const record = byId.get(selection.media_cache_id)
      return record
        ? normalizeInstagramItem({ ...record, sort_order: selection.sort_order }, connection.instagram_username || connection.username)
        : null
    })
    .filter(Boolean)
}

export async function ensureDefaultInstagramSelections(supabase: SupabaseLike, connection: any) {
  if (!connection?.id || !connection.user_id) return []

  const { count } = await supabase
    .from("instagram_media_selections")
    .select("id", { count: "exact", head: true })
    .eq("connection_id", connection.id)
    .eq("user_id", connection.user_id)

  if ((count || 0) > 0) return []

  const { data: latest } = await supabase
    .from("instagram_media_cache")
    .select("id")
    .eq("connection_id", connection.id)
    .eq("user_id", connection.user_id)
    .order("timestamp", { ascending: false })
    .order("last_synced", { ascending: false })
    .limit(PORTFOLIO_DISPLAY_LIMIT)

  const rows = (latest || []).map((item: any, index: number) => ({
    user_id: connection.user_id,
    connection_id: connection.id,
    media_cache_id: item.id,
    sort_order: index,
  }))

  if (!rows.length) return []
  await supabase.from("instagram_media_selections").insert(rows)
  return rows
}

export async function saveInstagramSelections(supabase: SupabaseLike, userId: string, selectedIds: string[]) {
  const uniqueIds = Array.from(new Set(selectedIds.filter(isUuid))).slice(0, PORTFOLIO_DISPLAY_LIMIT)
  if (!uniqueIds.length) throw new Error("Select at least one Instagram post.")

  const connection = await getInstagramConnection(supabase, userId)
  if (!connection?.id) throw new Error("Connect Instagram before choosing posts.")

  const { data: allowed, error: allowedError } = await supabase
    .from("instagram_media_cache")
    .select("id")
    .eq("connection_id", connection.id)
    .eq("user_id", userId)
    .in("id", uniqueIds)

  if (allowedError) throw allowedError
  const allowedIds = new Set((allowed || []).map((item: any) => item.id))
  const rows = uniqueIds
    .filter((id) => allowedIds.has(id))
    .map((id, index) => ({
      user_id: userId,
      connection_id: connection.id,
      media_cache_id: id,
      sort_order: index,
      updated_at: new Date().toISOString(),
    }))

  if (!rows.length) throw new Error("Choose posts from your connected Instagram account.")

  await supabase.from("instagram_media_selections").delete().eq("connection_id", connection.id).eq("user_id", userId)
  const { error } = await supabase.from("instagram_media_selections").insert(rows)
  if (error) throw error

  await supabase.from("user_profiles").update({ portfolio_source: "instagram" }).eq("user_id", userId)
  return getSelectedInstagramItems(supabase, connection)
}

export async function getPublicPortfolioItems(supabase: SupabaseLike, userId: string) {
  const source = await getPortfolioSource(supabase, userId)

  if (source === "instagram") {
    const connection = await getInstagramConnection(supabase, userId)
    if (connection?.id) {
      const selectedItems = await getSelectedInstagramItems(supabase, connection)
      const items = selectedItems.length
        ? selectedItems
        : (await getInstagramAvailableItems(supabase, connection, PORTFOLIO_DISPLAY_LIMIT)).slice(0, PORTFOLIO_DISPLAY_LIMIT)

      return {
        source,
        connection,
        items,
      }
    }
  }

  const [{ data: uploads }, { data: links }] = await Promise.all([
    supabase
      .from("portfolio_uploads")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "visible")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("user_id", userId)
      .eq("is_visible", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
  ])

  const items = [...(uploads || []).map(normalizeUploadItem), ...(links || []).map(normalizePortfolioLinkItem)]
    .sort((a, b) => {
      const sortDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0)
      if (sortDiff !== 0) return sortDiff
      return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    })
    .slice(0, PORTFOLIO_DISPLAY_LIMIT)

  return {
    source: "upload" as PortfolioSource,
    connection: null,
    items,
  }
}

export async function syncInstagramMediaForConnection(supabase: SupabaseLike, connection: any, force = false) {
  if (!connection?.id || !connection.user_id) throw new Error("Instagram connection is missing")

  const lastSync = connection.last_sync ? new Date(connection.last_sync).getTime() : 0
  if (!force && lastSync && Date.now() - lastSync < 5 * 60 * 1000) {
    return { skipped: true, reason: "Synced recently" }
  }

  if (!connection.access_token_encrypted || !connection.token_iv || !connection.token_tag) {
    throw new Error("Instagram connection needs to be reconnected")
  }

  let token = decryptInstagramToken({
    encrypted: connection.access_token_encrypted,
    iv: connection.token_iv,
    tag: connection.token_tag,
  })

  const expiresAt = connection.expires_at || connection.token_expires_at
  const expiresSoon = expiresAt ? new Date(expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 : false
  if (expiresSoon) {
    const refreshed = await refreshInstagramAccessToken(token)
    token = refreshed.accessToken
    const encrypted = encryptInstagramToken(token)
    const nextExpiresAt = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString()
    await supabase
      .from("instagram_connections")
      .update({
        access_token_encrypted: encrypted.encrypted,
        token_iv: encrypted.iv,
        token_tag: encrypted.tag,
        expires_at: nextExpiresAt,
        token_expires_at: nextExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", connection.id)
  }

  const media = await fetchInstagramMedia(token, INSTAGRAM_CACHE_LIMIT)
  await upsertInstagramMedia(supabase, connection, media)
  await ensureDefaultInstagramSelections(supabase, connection)

  await supabase
    .from("instagram_connections")
    .update({
      status: "connected",
      last_sync: new Date().toISOString(),
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", connection.id)

  return { skipped: false, count: media.length }
}

export async function upsertInstagramMedia(
  supabase: SupabaseLike,
  connection: any,
  media: InstagramMediaRecord[],
) {
  const rows = media.slice(0, INSTAGRAM_CACHE_LIMIT).map((item) => ({
    connection_id: connection.id,
    user_id: connection.user_id,
    instagram_media_id: item.id,
    media_id: item.id,
    media_url: item.media_url || item.thumbnail_url || null,
    thumbnail_url: item.thumbnail_url || item.media_url || null,
    permalink: item.permalink || null,
    caption: item.caption || null,
    media_type: item.media_type || "IMAGE",
    taken_at: item.timestamp || null,
    timestamp: item.timestamp || null,
    cached_at: new Date().toISOString(),
    last_synced: new Date().toISOString(),
  }))

  if (!rows.length) return

  await supabase
    .from("instagram_media_cache")
    .upsert(rows, { onConflict: "connection_id,instagram_media_id" })
}
