import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getPublicPortfolioItems } from "@/lib/portfolio/portfolio-service"

export const runtime = "nodejs"

// Only public-safe columns - never select("*") on user_profiles for an
// unauthenticated-reachable route. email, role, suspended, suspended_reason,
// and subscription_status must never appear in this response.
const PUBLIC_PROFILE_COLUMNS =
  "user_id, username, display_name, full_name, profession, bio, location, city, province, " +
  "profile_image_url, profile_picture, avatar_url, cover_image_url, hourly_rate, daily_rate, " +
  "project_rate, pricing, skills, portfolio_images, rating, review_count, availability, " +
  "availability_status, is_profile_visible, account_type, instagram, facebook, youtube, vimeo, " +
  "imdb_profile, linkedin, website"

export async function GET(_request: Request, { params }: { params: { username: string } }) {
  const username = decodeURIComponent(params.username || "").replace(/^@/, "").trim()
  if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 })

  // Plain RLS-respecting client - "Visible profiles are public" governs which
  // rows are reachable here, same as every other public profile lookup.
  const supabase = await createServerClient()

  // Two separate .eq() lookups instead of a hand-built .or() filter string -
  // .eq() values are always safely parameterized, never string-concatenated,
  // so there's no PostgREST filter-injection surface here.
  let { data: profile, error }: { data: any; error: any } = await supabase
    .from("user_profiles")
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq("username", username)
    .maybeSingle()

  if (!profile && !error) {
    ;({ data: profile, error } = await supabase
      .from("user_profiles")
      .select(PUBLIC_PROFILE_COLUMNS)
      .eq("display_name", username)
      .maybeSingle())
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const portfolio = await getPublicPortfolioItems(supabase, profile.user_id)

  return NextResponse.json(
    {
      profile,
      portfolio: {
        source: portfolio.source,
        items: portfolio.items,
      },
    },
    {
      // Public profile data changes infrequently. Cache for 60s at the edge,
      // serve stale for up to 5 minutes while a fresh copy is fetched in the
      // background, so a profile update never takes more than a minute to
      // show up for new visitors.
      headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" },
    },
  )
}
