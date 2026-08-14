import { createClient } from "@/lib/supabase/server"
import { sanitizeSingleLineInput } from "@/lib/utils/sanitize"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const favorited_user_id = sanitizeSingleLineInput(body?.favorited_user_id, 120)

    if (!favorited_user_id) {
      return NextResponse.json({ error: "Missing favorited_user_id" }, { status: 400 })
    }

    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Remove favorite
    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("favorited_user_id", favorited_user_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "User removed from favorites",
    })
  } catch (error) {
    console.error("[v0] Remove favorite error:", error)
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 })
  }
}
