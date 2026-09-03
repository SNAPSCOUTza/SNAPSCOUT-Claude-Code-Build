// Profile-share messages are encoded into the existing `messages.content`
// text column rather than requiring a schema migration - the real (non-mock)
// messaging system has no message-type column today, so this keeps the
// feature working against the actual live table instead of a hypothetical
// one. The prefix is namespaced enough that no real typed message could
// collide with it. Only a profile reference + href travel in the message -
// never a name/bio/photo snapshot - so the bubble always reflects the
// sender's current profile, not a stale copy.
const PROFILE_SHARE_PREFIX = "snapscout:profile_share:"

export type ProfileSharePayload = {
  profileId: string
  profileHref: string
}

export function encodeProfileShareContent(payload: ProfileSharePayload): string {
  return `${PROFILE_SHARE_PREFIX}${JSON.stringify(payload)}`
}

export function decodeProfileShareContent(content: string): ProfileSharePayload | null {
  if (!content?.startsWith(PROFILE_SHARE_PREFIX)) return null
  try {
    const parsed = JSON.parse(content.slice(PROFILE_SHARE_PREFIX.length))
    if (typeof parsed?.profileId === "string" && typeof parsed?.profileHref === "string") {
      return { profileId: parsed.profileId, profileHref: parsed.profileHref }
    }
    return null
  } catch {
    return null
  }
}
