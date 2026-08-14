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
      return NextResponse.json({ is_favorited: false }, { status: 200 })
    }

    // Check if favorited
    const { data, error } = await supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("favorited_user_id", favorited_user_id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      is_favorited: !!data,
    })
  } catch (error) {
    console.error("[v0] Check favorite error:", error)
    return NextResponse.json({ is_favorited: false }, { status: 200 })
  }
}
