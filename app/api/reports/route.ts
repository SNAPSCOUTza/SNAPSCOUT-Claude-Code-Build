import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sanitizeSingleLineInput, sanitizeTextInput } from "@/lib/utils/sanitize"

export const dynamic = "force-dynamic"

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value?: string | null) {
  return Boolean(value && uuidPattern.test(value))
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Please sign in to report a user." }, { status: 401 })
  }

  const body = await request.json()
  const reason = sanitizeSingleLineInput(body.reason, 120)
  const reportedUserId = sanitizeSingleLineInput(body.reportedUserId, 120)
  const entityType = sanitizeSingleLineInput(body.entityType || "user", 40)
  const entityId = sanitizeSingleLineInput(body.entityId, 120)
  const notes = sanitizeTextInput(body.notes, 1500)

  if (!reason) {
    return NextResponse.json({ error: "Choose a reason for the report." }, { status: 400 })
  }

  const fullNotes = [
    notes,
    reportedUserId && !isUuid(reportedUserId) ? `Reported profile reference: ${reportedUserId}` : "",
    entityId && !isUuid(entityId) ? `Related conversation/reference: ${entityId}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      reported_user_id: isUuid(reportedUserId) ? reportedUserId : null,
      entity_type: entityType || "user",
      entity_id: isUuid(entityId) ? entityId : null,
      reason,
      notes: fullNotes || null,
      status: "open",
    })
    .select("id,status,created_at")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ report: data })
}
