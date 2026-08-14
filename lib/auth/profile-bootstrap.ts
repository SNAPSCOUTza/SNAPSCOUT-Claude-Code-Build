const CURRENT_ACCOUNT_TYPES = new Set(["film_crew", "content_creator", "scout", "studio", "store"])

export type InitialUserProfileInput = {
  userId: string
  email: string
  displayName: string
  accountType: string
  isProfileVisible?: boolean
}

export function normalizeAccountType(value: string | null | undefined) {
  const normalized = (value || "").trim().toLowerCase()
  if (normalized === "creator") return "content_creator"
  if (CURRENT_ACCOUNT_TYPES.has(normalized)) return normalized
  return "content_creator"
}

function defaultProfession(accountType: string) {
  switch (accountType) {
    case "film_crew":
      return "Film Crew"
    case "scout":
      return "Client"
    case "studio":
      return "Studio"
    case "store":
      return "Store"
    default:
      return "Creative Professional"
  }
}

export function buildInitialUserProfile({
  userId,
  email,
  displayName,
  accountType,
  isProfileVisible = false,
}: InitialUserProfileInput) {
  const normalizedAccountType = normalizeAccountType(accountType)

  return {
    user_id: userId,
    email,
    full_name: displayName,
    display_name: displayName,
    username: email.split("@")[0],
    account_type: normalizedAccountType,
    user_type: normalizedAccountType,
    bio: "",
    profession: defaultProfession(normalizedAccountType),
    location: "",
    city: "",
    profile_picture: "",
    profile_image_url: "",
    availability: "available",
    availability_status: "available",
    is_profile_visible: isProfileVisible,
    skills: [],
    portfolio_images: [],
    subscription_status: normalizedAccountType === "scout" ? "active" : "inactive",
  }
}

export async function upsertInitialUserProfile(supabaseAdmin: any, input: InitialUserProfileInput) {
  const profile = buildInitialUserProfile(input)

  let { error } = await supabaseAdmin.from("user_profiles").upsert(profile, {
    onConflict: "user_id",
  })

  if (error?.message?.toLowerCase().includes("account_type")) {
    const { error: fallbackError } = await supabaseAdmin.from("user_profiles").upsert(
      {
        ...profile,
        account_type: null,
      },
      { onConflict: "user_id" },
    )
    error = fallbackError
  }

  return { profile, error }
}
