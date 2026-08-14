import { NextResponse } from "next/server"
import { ADMIN_TABLES, type AdminTable } from "@/lib/admin/admin-config"
import { getAdminContext, writeAdminActivity } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

function getTable(resource: string): AdminTable | null {
  return ADMIN_TABLES.includes(resource as AdminTable) ? (resource as AdminTable) : null
}

function idColumn(table: AdminTable) {
  return table === "feature_flags" ? "key" : "id"
}

export async function PATCH(request: Request, { params }: { params: { resource: string; id: string } }) {
  const table = getTable(params.resource)
  if (!table) return NextResponse.json({ error: "Unknown admin resource." }, { status: 404 })

  const { supabase, user } = await getAdminContext()
  const body = await request.json()
  const timestampedTables: AdminTable[] = [
    "advertisements",
    "articles",
    "events",
    "reports",
    "feature_flags",
    "homepage_content",
  ]
  const payload = {
    ...body,
    ...(table === "feature_flags" || table === "homepage_content" ? { updated_by: user.id } : {}),
    ...(timestampedTables.includes(table) ? { updated_at: new Date().toISOString() } : {}),
  }

  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq(idColumn(table), decodeURIComponent(params.id))
    .select("*")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAdminActivity(supabase, user.id, `updated ${table}`, table, data?.id || null, { patch: Object.keys(body) })
  return NextResponse.json({ item: data })
}

export async function DELETE(_: Request, { params }: { params: { resource: string; id: string } }) {
  const table = getTable(params.resource)
  if (!table) return NextResponse.json({ error: "Unknown admin resource." }, { status: 404 })

  const { supabase, user } = await getAdminContext()
  const { error } = await supabase.from(table).delete().eq(idColumn(table), decodeURIComponent(params.id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAdminActivity(supabase, user.id, `deleted ${table}`, table, table === "feature_flags" ? null : params.id)
  return NextResponse.json({ success: true })
}
