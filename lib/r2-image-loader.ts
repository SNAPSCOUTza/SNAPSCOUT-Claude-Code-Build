// Custom next/image loader used for every <Image> in the app (configured in
// next.config.mjs). Its job is to avoid Vercel's paid image-optimization
// pipeline entirely, letting R2's free egress serve images directly instead.
//
// R2 alone (without the separate Cloudflare Images product) doesn't support
// on-the-fly resizing via URL parameters, so this is a pass-through: local
// assets and already-absolute URLs (R2, Supabase Storage during migration,
// Instagram's CDN, etc.) are returned unchanged. next/image still provides
// lazy-loading, layout stability, and srcset hints on the client even though
// the server always returns the same file regardless of requested width.
export default function r2ImageLoader({ src }: { src: string; width: number; quality?: number }) {
  return src
}
