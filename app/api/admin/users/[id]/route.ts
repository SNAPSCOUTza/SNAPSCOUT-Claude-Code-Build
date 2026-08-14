import { NextResponse } from "next/server"
import { requireSuperAdmin, writeAdminActivity } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { supabase, user } = await requireSuperAdmin()
  const body = await request.json()
  const patch: Record<string, any> = {}

  if (typeof body.role === "string") patch.role = body.role
  if (typeof body.suspended === "boolean") {
    patch.suspended = body.suspended
    patch.suspended_at = body.suspended ? new Date().toISOString() : null
    patch.suspended_reason = body.suspended ? body.suspended_reason || "Administrative action" : null
  }

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "No supported user updates supplied." }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .update(patch)
    .eq("user_id", params.id)
    .select("id,user_id,email,display_name,full_name,account_type,role,suspended,suspended_reason,created_at")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAdminActivity(supabase, user.id, "updated user access", "user_profiles", data.id, {
    target_user_id: params.id,
    patch: Object.keys(patch),
  })
  return NextResponse.json({ user: data })
}
