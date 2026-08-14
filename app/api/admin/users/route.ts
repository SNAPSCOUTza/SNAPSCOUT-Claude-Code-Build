import { NextResponse } from "next/server"
import { getAdminContext } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const { supabase } = await getAdminContext()
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id,user_id,email,display_name,full_name,account_type,role,suspended,suspended_reason,created_at")
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data || [] })
}
