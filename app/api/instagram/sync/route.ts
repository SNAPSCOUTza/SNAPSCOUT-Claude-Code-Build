import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"
import { getInstagramConnection, syncInstagramMediaForConnection } from "@/lib/portfolio/portfolio-service"

export const runtime = "nodejs"

function isCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const auth = request.headers.get("authorization")
  const headerSecret = request.headers.get("x-cron-secret")
  return auth === `Bearer ${secret}` || headerSecret === secret
}

async function syncOne(supabase: any, connection: any, force = false) {
  try {
    return await syncInstagramMediaForConnection(supabase, connection, force)
  } catch (error: any) {
    await supabase
      .from("instagram_connections")
      .update({
        status: "error",
        last_error: error?.message || "Instagram sync failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", connection.id)
    return { skipped: false, error: error?.message || "Instagram sync failed" }
  }
}

async function runCronSync(force = false) {
  if (!isAdminClientAvailable()) {
    return apiError("Supabase service role is not configured", 500, "ADMIN_CLIENT_UNAVAILABLE")
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("instagram_connections")
    .select("*")
    .eq("status", "connected")

  if (error) return apiError(error.message, 500, "INSTAGRAM_CONNECTIONS_LOAD_FAILED")

  const staleBefore = Date.now() - 24 * 60 * 60 * 1000
  const dueConnections = (data || []).filter((connection: any) => {
    if (force) return true
    if (!connection.last_sync) return true
    return new Date(connection.last_sync).getTime() < staleBefore
  })

  const results = []
  for (const connection of dueConnections) {
    results.push({ id: connection.id, ...(await syncOne(supabase, connection, force)) })
  }

  return NextResponse.json({ synced: results.length, results })
}

export async function GET(request: Request) {
  if (!isCronRequest(request)) return apiError("Cron secret required", 401, "CRON_SECRET_REQUIRED")
  return runCronSync(false)
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const force = Boolean(body.force)

  if (isCronRequest(request)) return runCronSync(force)

  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const connection = await getInstagramConnection(context.supabase, context.user.id)
  if (!connection) return apiError("Connect Instagram before syncing.", 404, "INSTAGRAM_CONNECTION_NOT_FOUND")

  const result = await syncOne(context.supabase, connection, force)
  return NextResponse.json(result)
}
