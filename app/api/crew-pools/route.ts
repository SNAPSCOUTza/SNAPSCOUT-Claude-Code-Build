import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"

export async function GET() {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const { data: pools, error } = await supabase
    .from("crew_pools")
    .select("id,owner_id,name,color,created_at,updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false })

  if (error) return apiError(error.message, 500, "POOL_LIST_FAILED")

  const poolIds = (pools || []).map((pool: any) => pool.id)
  const counts = new Map<string, number>()

  if (poolIds.length > 0) {
    const { data: members, error: memberError } = await supabase
      .from("crew_pool_members")
      .select("pool_id")
      .in("pool_id", poolIds)

    if (memberError) return apiError(memberError.message, 500, "POOL_COUNT_FAILED")

    for (const member of members || []) {
      counts.set(member.pool_id, (counts.get(member.pool_id) || 0) + 1)
    }
  }

  return NextResponse.json({
    pools: (pools || []).map((pool: any) => ({
      ...pool,
      member_count: counts.get(pool.id) || 0,
    })),
  })
}

export async function POST(request: Request) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const body = await request.json().catch(() => ({}))
  const name = sanitizeText(body.name, 50)
  const color = sanitizeText(body.color, 20) || "#FF5C00"

  if (!name) return apiError("Pool name is required", 400, "POOL_NAME_REQUIRED")

  const { data, error } = await supabase
    .from("crew_pools")
    .insert({ owner_id: user.id, name, color })
    .select("id,owner_id,name,color,created_at,updated_at")
    .single()

  if (error) return apiError(error.message, 500, "POOL_CREATE_FAILED")

  return NextResponse.json({ pool: { ...data, member_count: 0 } }, { status: 201 })
}
