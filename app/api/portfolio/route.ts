import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"
import {
  getInstagramAvailableItems,
  getSelectedInstagramItems,
  getPublicPortfolioItems,
  isUuid,
  toLegacyPortfolioItem,
} from "@/lib/portfolio/portfolio-service"
import { getInstagramSetupStatus } from "@/lib/portfolio/instagram"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const serverClient = await createServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  const url = new URL(request.url)
  const requestedUserId = url.searchParams.get("userId")

  if (requestedUserId && !isUuid(requestedUserId)) {
    return NextResponse.json({ items: [], legacyItems: [], source: "upload" })
  }

  if (!requestedUserId && !user) {
    return NextResponse.json({ error: "Authentication required", code: "UNAUTHENTICATED" }, { status: 401 })
  }

  const userId = requestedUserId || user!.id
  const isOwner = Boolean(user && user.id === userId)
  const supabase = isAdminClientAvailable() ? createAdminClient() : serverClient

  try {
    const portfolio = await getPublicPortfolioItems(supabase, userId)
    const setup = getInstagramSetupStatus(request.url)
    let canSeeSetupDetails = false
    let instagramAvailableItems: any[] = []
    let instagramSelectedIds: string[] = []

    if (isOwner) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle()

      canSeeSetupDetails = ["admin", "super_admin"].includes(String(profile?.role || ""))

      if (portfolio.connection?.id) {
        instagramAvailableItems = await getInstagramAvailableItems(supabase, portfolio.connection)
        instagramSelectedIds = (await getSelectedInstagramItems(supabase, portfolio.connection))
          .map((item: any) => item.cacheId || item.id)
          .filter(Boolean)
      }
    }

    const connection = isOwner && portfolio.connection
      ? {
          id: portfolio.connection.id,
          instagramUserId: portfolio.connection.instagram_user_id,
          username: portfolio.connection.instagram_username || portfolio.connection.username,
          status: portfolio.connection.status,
          expiresAt: portfolio.connection.expires_at || portfolio.connection.token_expires_at,
          lastSync: portfolio.connection.last_sync,
          lastError: portfolio.connection.last_error,
          connectedAt: portfolio.connection.connected_at,
        }
      : null

    return NextResponse.json({
      source: portfolio.source,
      items: portfolio.items,
      legacyItems: portfolio.items.map(toLegacyPortfolioItem),
      instagramConnection: connection,
      instagramAvailableItems,
      instagramSelectedIds,
      instagramSetup: {
        configured: setup.configured,
        redirectUri: setup.redirectUri,
        localRedirectUris: setup.localRedirectUris,
        requiredEnvVars: canSeeSetupDetails ? setup.requiredEnvVars : [],
        missing: canSeeSetupDetails ? setup.missing : [],
      },
    })
  } catch (error: any) {
    const message = error?.message || "Portfolio could not be loaded"
    if (message.toLowerCase().includes("schema cache") || message.toLowerCase().includes("does not exist")) {
      return NextResponse.json({ items: [], legacyItems: [], source: "upload" })
    }
    return NextResponse.json({ error: message, code: "PORTFOLIO_LOAD_FAILED" }, { status: 500 })
  }
}
