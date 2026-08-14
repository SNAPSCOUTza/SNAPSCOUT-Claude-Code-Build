import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  encryptInstagramToken,
  exchangeInstagramCode,
  fetchInstagramProfile,
  verifyInstagramOAuthState,
} from "@/lib/portfolio/instagram"
import { syncInstagramMediaForConnection } from "@/lib/portfolio/portfolio-service"

export const runtime = "nodejs"

function dashboardRedirect(requestUrl: string, status: "connected" | "error", message?: string) {
  const url = new URL("/dashboard", requestUrl)
  url.searchParams.set("instagram", status)
  if (message) url.searchParams.set("message", message.slice(0, 160))
  return NextResponse.redirect(url)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const error = url.searchParams.get("error_description") || url.searchParams.get("error")

  if (error) return dashboardRedirect(request.url, "error", error)
  if (!code || !state) return dashboardRedirect(request.url, "error", "Instagram did not return an authorization code.")

  const statePayload = verifyInstagramOAuthState(state)
  if (!statePayload?.userId) return dashboardRedirect(request.url, "error", "Instagram connection expired. Please try again.")

  try {
    const serverClient = await createServerClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (user && user.id !== statePayload.userId) {
      return dashboardRedirect(request.url, "error", "This Instagram connection belongs to a different user session.")
    }

    const token = await exchangeInstagramCode(code, request.url)
    const encrypted = encryptInstagramToken(token.accessToken)
    const profile = await fetchInstagramProfile(token.accessToken)
    const expiresAt = new Date(Date.now() + token.expiresIn * 1000).toISOString()
    const supabase = createAdminClient()

    const { data: connection, error: upsertError } = await supabase
      .from("instagram_connections")
      .upsert(
        {
          user_id: statePayload.userId,
          instagram_user_id: profile.id || token.instagramUserId,
          instagram_username: profile.username,
          username: profile.username,
          access_token: null,
          access_token_encrypted: encrypted.encrypted,
          token_iv: encrypted.iv,
          token_tag: encrypted.tag,
          expires_at: expiresAt,
          token_expires_at: expiresAt,
          status: "connected",
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_error: null,
        },
        { onConflict: "user_id" },
      )
      .select("*")
      .single()

    if (upsertError) throw upsertError

    await syncInstagramMediaForConnection(supabase, connection, true)
    await supabase.from("user_profiles").update({ portfolio_source: "instagram" }).eq("user_id", statePayload.userId)

    return dashboardRedirect(request.url, "connected")
  } catch (callbackError: any) {
    return dashboardRedirect(request.url, "error", callbackError?.message || "Instagram connection failed.")
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const url = new URL(request.url)
  if (body.code) url.searchParams.set("code", String(body.code))
  if (body.state) url.searchParams.set("state", String(body.state))
  if (body.error) url.searchParams.set("error", String(body.error))
  return GET(new Request(url.toString(), { headers: request.headers }))
}
