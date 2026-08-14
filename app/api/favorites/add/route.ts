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

    // Add favorite
    const { error } = await supabase.from("user_favorites").insert({
      user_id: user.id,
      favorited_user_id,
    })

    if (error) {
      // Handle duplicate favorite (already saved)
      if (error.code === "23505") {
        return NextResponse.json({ success: true, message: "Already in favorites" }, { status: 200 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "User added to favorites",
    })
  } catch (error) {
    console.error("[v0] Add favorite error:", error)
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 })
  }
}
