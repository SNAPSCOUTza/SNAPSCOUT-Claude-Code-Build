export type PortfolioSourcePlatform =
  | "local"
  | "instagram"
  | "facebook"
  | "youtube"
  | "vimeo"
  | "imdb"
  | "external"

export type PortfolioMediaType = "image" | "video" | "embed" | "external"

export type PortfolioSource = "upload" | "instagram"

export type NormalizedPortfolioItem = {
  id: string
  cacheId?: string | null
  instagramMediaId?: string | null
  source: PortfolioSource
  source_platform?: PortfolioSourcePlatform
  mediaType: "image" | "video" | "reel"
  media_type?: PortfolioMediaType | "reel" | null
  thumbnailUrl: string
  mediaUrl: string
  thumbnail_url?: string | null
  full_media_url?: string | null
  media_url?: string | null
  image_url?: string | null
  permalink?: string | null
  source_url?: string | null
  caption?: string | null
  title?: string | null
  description?: string | null
  username?: string | null
  timestamp?: string | null
  sort_order?: number | null
  is_cover?: boolean | null
}

export type ProfilePortfolioItem = {
  id: string
  cacheId?: string | null
  instagramMediaId?: string | null
  user_id?: string
  source_platform?: PortfolioSourcePlatform | null
  media_type?: PortfolioMediaType | null
  source_url?: string | null
  thumbnail_url?: string | null
  full_media_url?: string | null
  embed_url?: string | null
  title?: string | null
  caption?: string | null
  sort_order?: number | null
  is_visible?: boolean | null
  created_at?: string | null
  updated_at?: string | null
  type?: "image" | "video"
  thumbnail?: string
  fullUrl?: string
  platform?: PortfolioSourcePlatform
  link?: string
  embedUrl?: string
  duration?: number
  source?: PortfolioSource
  mediaType?: "image" | "video" | "reel"
  thumbnailUrl?: string
  mediaUrl?: string
  media_url?: string | null
  image_url?: string | null
  permalink?: string | null
  description?: string | null
  username?: string | null
  timestamp?: string | null
  is_cover?: boolean | null
}

export type LightboxPortfolioItem = {
  id: string
  type: "image" | "video"
  thumbnail: string
  fullUrl?: string
  title?: string
  platform?: PortfolioSourcePlatform
  duration?: number
  link?: string
  embedUrl?: string
  caption?: string
  description?: string
  username?: string
  timestamp?: string
  source?: PortfolioSource
}

export function normalizePortfolioItem(item: ProfilePortfolioItem, index = 0): LightboxPortfolioItem {
  const platform = item.source_platform || item.platform || (item.source === "instagram" ? "instagram" : "local")
  const mediaType = item.media_type || item.mediaType || item.type || "image"
  const thumbnail =
    item.thumbnailUrl ||
    item.thumbnail_url ||
    item.thumbnail ||
    item.mediaUrl ||
    item.media_url ||
    item.image_url ||
    item.full_media_url ||
    item.fullUrl ||
    item.source_url ||
    "/placeholder.svg"

  return {
    id: item.id || `portfolio-${index}`,
    type: mediaType === "image" || mediaType === "external" ? "image" : "video",
    thumbnail,
    fullUrl:
      item.mediaUrl ||
      item.media_url ||
      item.image_url ||
      item.full_media_url ||
      item.fullUrl ||
      item.thumbnailUrl ||
      item.thumbnail_url ||
      item.thumbnail ||
      undefined,
    title: item.title || item.caption || undefined,
    platform,
    link: item.permalink || item.source_url || item.link || undefined,
    embedUrl: item.embed_url || item.embedUrl || undefined,
    duration: item.duration,
    caption: item.caption || undefined,
    description: item.description || undefined,
    username: item.username || undefined,
    timestamp: item.timestamp || item.created_at || undefined,
    source: item.source,
  }
}

export function fallbackImagesToPortfolioItems(
  images: string[] = [],
  ownerId = "profile",
  titlePrefix = "Portfolio",
): LightboxPortfolioItem[] {
  return images.filter(Boolean).map((image, index) => ({
    id: `${ownerId}-fallback-${index}`,
    type: "image",
    thumbnail: image,
    fullUrl: image,
    title: `${titlePrefix} ${index + 1}`,
    platform: "local",
  }))
}
