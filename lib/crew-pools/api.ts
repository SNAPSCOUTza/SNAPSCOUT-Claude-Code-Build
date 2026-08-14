import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { CrewProfile } from "@/types/crew-pool"

export type ApiContext = {
  supabase: any
  user: { id: string; email?: string | null }
}

export function apiError(error: string, status = 500, code?: string) {
  return NextResponse.json({ error, code }, { status })
}

export async function requireUser(): Promise<ApiContext | NextResponse> {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return apiError("Authentication required", 401, "UNAUTHENTICATED")
  }

  return { supabase, user }
}

export function isApiErrorContext(value: ApiContext | NextResponse): value is NextResponse {
  return value instanceof NextResponse
}

export function sanitizeText(value: unknown, maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : ""
}

export function normalizeSkills(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string")
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean)
  return []
}

export function parseDayRate(value: unknown): number | null {
  if (typeof value === "number") return value
  if (typeof value !== "string") return null
  const amount = Number(value.replace(/[^\d.]/g, ""))
  return Number.isFinite(amount) ? amount : null
}

export function normalizeCrewProfile(record: any, fallbackId: string): CrewProfile {
  const location =
    record?.location ||
    [record?.city, record?.province].filter(Boolean).join(", ") ||
    record?.service_area ||
    "South Africa"

  return {
    id: record?.user_id || record?.id || fallbackId,
    full_name: record?.display_name || record?.full_name || record?.username || "SnapScout Creative",
    role: record?.profession || record?.role || record?.account_type || "Creative",
    location,
    avatar_url: record?.profile_image_url || record?.profile_picture || record?.avatar_url || null,
    day_rate: parseDayRate(record?.day_rate || record?.pricing || record?.rate),
    skills: normalizeSkills(record?.skills || record?.specialties || record?.specializations),
    rating: typeof record?.rating === "number" ? record.rating : undefined,
    job_count: typeof record?.job_count === "number" ? record.job_count : undefined,
    is_verified: Boolean(record?.is_verified || record?.verified),
  }
}

export async function getProfilesByIds(supabase: any, ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)))
  const profiles = new Map<string, CrewProfile>()
  if (uniqueIds.length === 0) return profiles

  const { data: userProfiles } = await supabase
    .from("user_profiles")
    .select("*")
    .in("user_id", uniqueIds)

  for (const profile of userProfiles || []) {
    profiles.set(profile.user_id || profile.id, normalizeCrewProfile(profile, profile.user_id || profile.id))
  }

  return profiles
}

export async function assertPoolOwner(supabase: any, poolId: string, ownerId: string) {
  const { data, error } = await supabase
    .from("crew_pools")
    .select("id,owner_id,name,color,created_at,updated_at")
    .eq("id", poolId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) return { error: apiError(error.message, 500, "POOL_LOOKUP_FAILED") }
  if (!data) return { error: apiError("Crew pool not found", 404, "POOL_NOT_FOUND") }
  return { data }
}
