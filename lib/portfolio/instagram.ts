import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto"

const AUTH_URL = "https://www.instagram.com/oauth/authorize"
const TOKEN_URL = "https://api.instagram.com/oauth/access_token"
const GRAPH_URL = "https://graph.instagram.com"
const STATE_VERSION = "v1"
const REQUIRED_ENV_VARS = [
  "INSTAGRAM_CLIENT_ID",
  "INSTAGRAM_CLIENT_SECRET",
  "INSTAGRAM_REDIRECT_URI",
  "INSTAGRAM_TOKEN_ENCRYPTION_KEY",
  "CRON_SECRET",
] as const

type EncryptedToken = {
  encrypted: string
  iv: string
  tag: string
}

type InstagramTokenResponse = {
  access_token: string
  user_id?: string | number
  expires_in?: number
}

export type InstagramMediaRecord = {
  id: string
  media_url?: string
  thumbnail_url?: string
  permalink?: string
  caption?: string
  media_type?: string
  timestamp?: string
  username?: string
}

export type InstagramSetupStatus = {
  configured: boolean
  missing: string[]
  redirectUri: string
  localRedirectUris: string[]
  requiredEnvVars: string[]
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url")
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8")
}

function getSecret() {
  const secret =
    process.env.INSTAGRAM_TOKEN_ENCRYPTION_KEY ||
    process.env.INSTAGRAM_CLIENT_SECRET ||
    process.env.CRON_SECRET

  if (!secret) {
    throw new Error("Instagram encryption secret is not configured")
  }

  return secret
}

function getEncryptionKey() {
  return createHmac("sha256", "snapscout-instagram-token").update(getSecret()).digest()
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url")
}

export function encryptInstagramToken(token: string): EncryptedToken {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    encrypted: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  }
}

export function decryptInstagramToken(input: EncryptedToken) {
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(input.iv, "base64"))
  decipher.setAuthTag(Buffer.from(input.tag, "base64"))
  return Buffer.concat([
    decipher.update(Buffer.from(input.encrypted, "base64")),
    decipher.final(),
  ]).toString("utf8")
}

export function createInstagramOAuthState(userId: string) {
  const payload = JSON.stringify({
    v: STATE_VERSION,
    userId,
    nonce: randomBytes(16).toString("hex"),
    createdAt: Date.now(),
  })
  const encoded = base64UrlEncode(payload)
  return `${encoded}.${sign(encoded)}`
}

export function verifyInstagramOAuthState(state: string) {
  const [encoded, signature] = state.split(".")
  if (!encoded || !signature || sign(encoded) !== signature) return null

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as {
      v?: string
      userId?: string
      createdAt?: number
    }
    if (payload.v !== STATE_VERSION || !payload.userId || !payload.createdAt) return null
    if (Date.now() - payload.createdAt > 15 * 60 * 1000) return null
    return payload
  } catch {
    return null
  }
}

export function getInstagramRedirectUri(requestUrl: string) {
  return process.env.INSTAGRAM_REDIRECT_URI || new URL("/api/instagram/callback", requestUrl).toString()
}

export function getInstagramSetupStatus(requestUrl: string): InstagramSetupStatus {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key])
  return {
    configured: missing.length === 0,
    missing,
    redirectUri: getInstagramRedirectUri(requestUrl),
    localRedirectUris: [
      "http://localhost:3000/api/instagram/callback",
      "http://127.0.0.1:3000/api/instagram/callback",
    ],
    requiredEnvVars: [...REQUIRED_ENV_VARS],
  }
}

export function buildInstagramAuthUrl(userId: string, requestUrl: string) {
  const clientId = process.env.INSTAGRAM_CLIENT_ID
  if (!clientId) throw new Error("INSTAGRAM_CLIENT_ID is not configured")

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getInstagramRedirectUri(requestUrl),
    response_type: "code",
    scope: "instagram_business_basic",
    state: createInstagramOAuthState(userId),
  })

  return `${AUTH_URL}?${params.toString()}`
}

async function parseInstagramResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = payload?.error_message || payload?.error?.message || "Instagram request failed"
    throw new Error(message)
  }
  return payload as T
}

export async function exchangeInstagramCode(code: string, requestUrl: string) {
  const clientId = process.env.INSTAGRAM_CLIENT_ID
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error("Instagram OAuth environment variables are not configured")

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    redirect_uri: getInstagramRedirectUri(requestUrl),
    code,
  })

  const shortLived = await parseInstagramResponse<InstagramTokenResponse>(
    await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }),
  )

  const longLivedUrl = new URL(`${GRAPH_URL}/access_token`)
  longLivedUrl.searchParams.set("grant_type", "ig_exchange_token")
  longLivedUrl.searchParams.set("client_secret", clientSecret)
  longLivedUrl.searchParams.set("access_token", shortLived.access_token)

  const longLived = await parseInstagramResponse<InstagramTokenResponse>(await fetch(longLivedUrl.toString()))
  return {
    accessToken: longLived.access_token || shortLived.access_token,
    instagramUserId: String(shortLived.user_id || ""),
    expiresIn: longLived.expires_in || 60 * 24 * 60 * 60,
  }
}

export async function refreshInstagramAccessToken(accessToken: string) {
  const url = new URL(`${GRAPH_URL}/refresh_access_token`)
  url.searchParams.set("grant_type", "ig_refresh_token")
  url.searchParams.set("access_token", accessToken)

  const refreshed = await parseInstagramResponse<InstagramTokenResponse>(await fetch(url.toString()))
  return {
    accessToken: refreshed.access_token || accessToken,
    expiresIn: refreshed.expires_in || 60 * 24 * 60 * 60,
  }
}

export async function fetchInstagramProfile(accessToken: string) {
  const url = new URL(`${GRAPH_URL}/me`)
  url.searchParams.set("fields", "id,username")
  url.searchParams.set("access_token", accessToken)
  return parseInstagramResponse<{ id: string; username?: string }>(await fetch(url.toString()))
}

export async function fetchInstagramMedia(accessToken: string, limit = 50) {
  const url = new URL(`${GRAPH_URL}/me/media`)
  url.searchParams.set("fields", "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username")
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 50)))
  url.searchParams.set("access_token", accessToken)

  const payload = await parseInstagramResponse<{ data?: InstagramMediaRecord[] }>(await fetch(url.toString()))
  return payload.data || []
}
