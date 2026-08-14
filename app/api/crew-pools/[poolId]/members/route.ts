import { NextResponse } from "next/server"
import {
  apiError,
  assertPoolOwner,
  getProfilesByIds,
  isApiErrorContext,
  requireUser,
  sanitizeText,
} from "@/lib/crew-pools/api"

export async function GET(_request: Request, { params }: { params: { poolId: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const pool = await assertPoolOwner(supabase, params.poolId, user.id)
  if (pool.error) return pool.error

  const { data: members, error } = await supabase
    .from("crew_pool_members")
    .select("id,pool_id,profile_id,saved_at")
    .eq("pool_id", params.poolId)
    .order("saved_at", { ascending: false })

  if (error) return apiError(error.message, 500, "POOL_MEMBERS_FAILED")

  const profileMap = await getProfilesByIds(
    supabase,
    (members || []).map((member: any) => member.profile_id),
  )

  return NextResponse.json({
    pool: pool.data,
    members: (members || []).map((member: any) => ({
      ...member,
      profile: profileMap.get(member.profile_id),
    })),
  })
}

export async function POST(request: Request, { params }: { params: { poolId: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const pool = await assertPoolOwner(supabase, params.poolId, user.id)
  if (pool.error) return pool.error

  const body = await request.json().catch(() => ({}))
  const profileId = sanitizeText(body.profile_id, 80)
  if (!profileId) return apiError("profile_id is required", 400, "PROFILE_ID_REQUIRED")

  const profileMap = await getProfilesByIds(supabase, [profileId])
  if (!profileMap.has(profileId)) return apiError("Profile not found", 404, "PROFILE_NOT_FOUND")

  const { data: existing } = await supabase
    .from("crew_pool_members")
    .select("id,pool_id,profile_id,saved_at")
    .eq("pool_id", params.poolId)
    .eq("profile_id", profileId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({
      member: { ...existing, profile: profileMap.get(profileId) },
      already_saved: true,
    })
  }

  const { data, error } = await supabase
    .from("crew_pool_members")
    .insert({ pool_id: params.poolId, profile_id: profileId })
    .select("id,pool_id,profile_id,saved_at")
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ already_saved: true })
    }
    return apiError(error.message, 500, "POOL_MEMBER_SAVE_FAILED")
  }

  return NextResponse.json({ member: { ...data, profile: profileMap.get(profileId) } }, { status: 201 })
}
