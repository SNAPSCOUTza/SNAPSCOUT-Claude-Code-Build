import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser, sanitizeText } from "@/lib/crew-pools/api"

const allowedStatuses = new Set(["available", "booked", "blocked"])

export async function GET() {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context
  const { supabase, user } = context

  const { data, error } = await supabase
    .from("availability_entries")
    .select("id,owner_id,owner_type,date,status,note,call_sheet_id")
    .eq("owner_id", user.id)

  if (error) return apiError(error.message, 500, "AVAILABILITY_LIST_FAILED")

  return NextResponse.json({ entries: data || [] })
}

// Replaces the caller's full set of *editable* entries with the given list -
// mirrors AvailabilityManager's "Apply" action, where the editor already
// represents the desired end state (including removed/reset dates that
// should be deleted). Booked entries are never touched here: they're only
// ever created/removed by call sheet acceptance (see
// /api/call-sheets/[callSheetId]/respond), and the editor UI already blocks
// editing them client-side.
export async function PUT(request: Request) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context
  const { supabase, user } = context

  const body = await request.json().catch(() => ({}))
  const rawEntries = Array.isArray(body.entries) ? body.entries : []
  const ownerType = sanitizeText(body.owner_type, 20) || "crew"

  const entries = rawEntries
    .map((entry: any) => ({
      date: sanitizeText(entry.date, 10),
      status: typeof entry.status === "string" ? entry.status : "",
      note: entry.note ? sanitizeText(entry.note, 200) : null,
    }))
    .filter((entry: any) => entry.date && allowedStatuses.has(entry.status) && entry.status !== "booked")

  const { data: existing, error: existingError } = await supabase
    .from("availability_entries")
    .select("id,date,status")
    .eq("owner_id", user.id)
    .neq("status", "booked")

  if (existingError) return apiError(existingError.message, 500, "AVAILABILITY_LOOKUP_FAILED")

  const nextDates = new Set(entries.map((entry: any) => entry.date))
  const toDelete = (existing || []).filter((row: any) => !nextDates.has(row.date)).map((row: any) => row.id)

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from("availability_entries").delete().in("id", toDelete)
    if (deleteError) return apiError(deleteError.message, 500, "AVAILABILITY_DELETE_FAILED")
  }

  if (entries.length > 0) {
    const { error: upsertError } = await supabase.from("availability_entries").upsert(
      entries.map((entry: any) => ({
        owner_id: user.id,
        owner_type: ownerType,
        date: entry.date,
        status: entry.status,
        note: entry.note,
      })),
      { onConflict: "owner_id,date" },
    )
    if (upsertError) return apiError(upsertError.message, 500, "AVAILABILITY_UPSERT_FAILED")
  }

  const { data: final, error: finalError } = await supabase
    .from("availability_entries")
    .select("id,owner_id,owner_type,date,status,note,call_sheet_id")
    .eq("owner_id", user.id)

  if (finalError) return apiError(finalError.message, 500, "AVAILABILITY_LIST_FAILED")

  return NextResponse.json({ entries: final || [] })
}
