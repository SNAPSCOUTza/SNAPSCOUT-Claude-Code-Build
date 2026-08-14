import { NextResponse } from "next/server"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import { getPublicPortfolioItems } from "@/lib/portfolio/portfolio-service"

export const runtime = "nodejs"

export async function GET(_request: Request, { params }: { params: { username: string } }) {
  const username = decodeURIComponent(params.username || "").replace(/^@/, "").trim()
  if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 })

  const supabase = isAdminClientAvailable() ? createAdminClient() : await createServerClient()

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .or(`username.eq.${username},display_name.eq.${username}`)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const userId = profile.user_id || profile.id
  const portfolio = userId ? await getPublicPortfolioItems(supabase, userId) : { source: "upload", items: [] }

  return NextResponse.json({
    profile,
    portfolio: {
      source: portfolio.source,
      items: portfolio.items,
    },
  })
}
