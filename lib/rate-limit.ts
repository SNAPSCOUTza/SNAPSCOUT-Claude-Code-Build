import type { SupabaseClient } from "@supabase/supabase-js"

export type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds: number
}

// Backed by public.rate_limit_events (see the matching migration) - requires
// the service-role client, since that table has no anon/authenticated grants
// at all. Always fails closed: if the check itself errors, the call is
// denied rather than silently let through.
export async function checkRateLimit(
  supabaseAdmin: SupabaseClient,
  key: string,
  { windowMs, max }: { windowMs: number; max: number },
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - windowMs).toISOString()
  const retryAfterSeconds = Math.ceil(windowMs / 1000)

  const { count, error } = await supabaseAdmin
    .from("rate_limit_events")
    .select("*", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", windowStart)

  if (error) {
    console.error("[rate-limit] check failed, denying by default:", error.message)
    return { allowed: false, retryAfterSeconds }
  }

  if ((count || 0) >= max) {
    return { allowed: false, retryAfterSeconds }
  }

  const { error: insertError } = await supabaseAdmin.from("rate_limit_events").insert({ key })
  if (insertError) {
    console.error("[rate-limit] failed to record attempt, denying by default:", insertError.message)
    return { allowed: false, retryAfterSeconds }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

// Vercel sets x-forwarded-for on every request reaching a serverless
// function; it's the closest thing to a real client IP available here.
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") || "unknown"
}
