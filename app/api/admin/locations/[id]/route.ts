import { NextResponse } from "next/server"
import { requireSuperAdmin, writeAdminActivity } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { supabase, user } = await requireSuperAdmin()

  const { error } = await supabase.from("shoot_locations").delete().eq("id", params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAdminActivity(supabase, user.id, "deleted location", "shoot_locations", params.id, {})
  return NextResponse.json({ success: true })
}
