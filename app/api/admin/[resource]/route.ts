import { NextResponse } from "next/server"
import { ADMIN_TABLES, type AdminTable } from "@/lib/admin/admin-config"
import { getAdminContext, writeAdminActivity } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

function getTable(resource: string): AdminTable | null {
  return ADMIN_TABLES.includes(resource as AdminTable) ? (resource as AdminTable) : null
}

export async function GET(_: Request, { params }: { params: { resource: string } }) {
  const table = getTable(params.resource)
  if (!table) return NextResponse.json({ error: "Unknown admin resource." }, { status: 404 })

  const { supabase } = await getAdminContext()
  const orderColumn = table === "feature_flags" || table === "homepage_content" ? "updated_at" : "created_at"
  const { data, error } = await supabase.from(table).select("*").order(orderColumn, { ascending: false }).limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data || [] })
}

export async function POST(request: Request, { params }: { params: { resource: string } }) {
  const table = getTable(params.resource)
  if (!table) return NextResponse.json({ error: "Unknown admin resource." }, { status: 404 })

  const { supabase, user } = await getAdminContext()
  const body = await request.json()
  const payload = {
    ...body,
    ...(["advertisements", "events", "featured_creators", "featured_jobs"].includes(table) ? { created_by: user.id } : {}),
    ...(table === "articles" ? { author_id: user.id } : {}),
    ...(table === "feature_flags" || table === "homepage_content" ? { updated_by: user.id } : {}),
  }

  const { data, error } = await supabase.from(table).insert(payload).select("*").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAdminActivity(supabase, user.id, `created ${table}`, table, data?.id || null, { title: data?.title || data?.key })
  return NextResponse.json({ item: data })
}
