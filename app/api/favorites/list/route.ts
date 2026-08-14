import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get favorites with profile details
    const { data, error } = await supabase
      .from("user_favorites")
      .select(`
        id,
        created_at,
        favorite_user:user_profiles!favorited_user_id (
          id,
          user_id,
          display_name,
          full_name,
          account_type,
          city,
          province,
          profile_picture,
          bio,
          profession,
          rating,
          total_reviews
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      favorites: data,
    })
  } catch (error) {
    console.error("[v0] List favorites error:", error)
    return NextResponse.json({ error: "Failed to load favorites" }, { status: 500 })
  }
}
