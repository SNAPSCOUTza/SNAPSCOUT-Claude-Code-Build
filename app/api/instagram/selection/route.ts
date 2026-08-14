import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"
import {
  getInstagramAvailableItems,
  getInstagramConnection,
  getSelectedInstagramItems,
  saveInstagramSelections,
} from "@/lib/portfolio/portfolio-service"

export const runtime = "nodejs"

export async function GET() {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const connection = await getInstagramConnection(context.supabase, context.user.id)
  if (!connection?.id) {
    return NextResponse.json({ availableItems: [], selectedIds: [], items: [] })
  }

  const selected = await getSelectedInstagramItems(context.supabase, connection)
  const available = await getInstagramAvailableItems(context.supabase, connection)

  return NextResponse.json({
    availableItems: available,
    selectedIds: selected.map((item: any) => item.cacheId || item.id).filter(Boolean),
    items: selected,
  })
}

export async function POST(request: Request) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context

  const body = await request.json().catch(() => ({}))
  const selectedIds = Array.isArray(body.selectedIds) ? body.selectedIds.map(String) : []

  try {
    const items = await saveInstagramSelections(context.supabase, context.user.id, selectedIds)
    const connection = await getInstagramConnection(context.supabase, context.user.id)
    const available = connection ? await getInstagramAvailableItems(context.supabase, connection) : []

    return NextResponse.json({
      success: true,
      items,
      availableItems: available,
      selectedIds: items.map((item: any) => item.cacheId || item.id).filter(Boolean),
    })
  } catch (error: any) {
    return apiError(error?.message || "Could not save Instagram portfolio selection.", 400, "INSTAGRAM_SELECTION_FAILED")
  }
}
