import { NextResponse } from "next/server"
import { apiError, assertPoolOwner, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"

export async function DELETE(_request: Request, { params }: { params: { poolId: string } }) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const pool = await assertPoolOwner(supabase, params.poolId, user.id)
  if (pool.error) return pool.error

  const { error } = await supabase.from("crew_pools").delete().eq("id", params.poolId).eq("owner_id", user.id)
  if (error) return apiError(error.message, 500, "POOL_DELETE_FAILED")

  return NextResponse.json({ success: true })
}
