import { NextResponse } from "next/server"
import { apiError, assertPoolOwner, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"

export async function DELETE(
  _request: Request,
  { params }: { params: { poolId: string; profileId: string } },
) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const { supabase, user } = context
  const pool = await assertPoolOwner(supabase, params.poolId, user.id)
  if (pool.error) return pool.error

  const { error } = await supabase
    .from("crew_pool_members")
    .delete()
    .eq("pool_id", params.poolId)
    .eq("profile_id", params.profileId)

  if (error) return apiError(error.message, 500, "POOL_MEMBER_REMOVE_FAILED")

  return NextResponse.json({ success: true })
}
