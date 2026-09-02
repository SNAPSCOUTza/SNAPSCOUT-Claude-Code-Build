import { NextResponse } from "next/server"
import { getAdminContext } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const { supabase } = await getAdminContext()
  const { data, error } = await supabase
    .from("shoot_locations")
    .select(
      "id,name,city,province,location_type,status,cover_image_url,rating,review_count,save_count,created_by,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ locations: data || [] })
}
