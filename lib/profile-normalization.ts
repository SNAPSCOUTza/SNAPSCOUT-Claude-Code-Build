type AuthUserLike = {
  id: string
  email?: string | null
}

const firstPresent = (...values: any[]) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value
  }
  return null
}

const textArray = (value: any): string[] => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean)
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean)
  }
  return []
}

export function normalizeSocialLinks(profile: any = {}) {
  const socialLinks = profile.social_links && typeof profile.social_links === "object" ? profile.social_links : {}

  return {
    instagram: firstPresent(socialLinks.instagram, profile.instagram, profile.instagram_url),
    linkedin: firstPresent(socialLinks.linkedin, profile.linkedin, profile.linkedin_url),
    youtube: firstPresent(socialLinks.youtube, profile.youtube, profile.youtube_url),
    website: firstPresent(socialLinks.website, profile.website, profile.website_url, profile.portfolio_url),
    twitter: firstPresent(socialLinks.twitter, profile.twitter, profile.twitter_url),
    vimeo: firstPresent(socialLinks.vimeo, profile.vimeo, profile.vimeo_url),
    facebook: firstPresent(socialLinks.facebook, profile.facebook, profile.facebook_url),
    imdb: firstPresent(socialLinks.imdb, socialLinks.imdb_profile, profile.imdb, profile.imdb_profile, profile.imdb_url),
  }
}

export function normalizeProfile(profile: any, user: AuthUserLike) {
  if (!profile) return null

  const avatar = firstPresent(profile.profile_image_url, profile.profile_picture, profile.avatar_url)
  const visibility = profile.is_profile_visible ?? profile.is_public ?? true
  const social_links = normalizeSocialLinks(profile)
  let city = firstPresent(profile.city, profile.cities)
  let province = firstPresent(profile.province, profile.provinces)
  if (typeof city === "string" && city.includes(",")) {
    const [parsedCity, parsedProvince] = city.split(",").map((part) => part.trim())
    city = parsedCity || city
    province = province || parsedProvince || null
  }
  const location = firstPresent(profile.location, [city, province].filter(Boolean).join(", "))

  return {
    ...profile,
    id: profile.id || profile.user_id || user.id,
    user_id: profile.user_id || user.id,
    username: firstPresent(profile.username, profile.display_name, profile.full_name),
    full_name: firstPresent(profile.full_name, profile.display_name),
    display_name: firstPresent(profile.display_name, profile.full_name),
    account_type: firstPresent(profile.account_type, profile.user_type),
    user_type: firstPresent(profile.user_type, profile.account_type),
    avatar_url: avatar,
    profile_picture: avatar,
    profile_image_url: avatar,
    email: firstPresent(profile.email, user.email),
    location,
    city,
    province,
    is_profile_visible: visibility,
    is_public: visibility,
    social_links,
    instagram: social_links.instagram,
    linkedin: social_links.linkedin,
    youtube: social_links.youtube,
    website: social_links.website,
    twitter: social_links.twitter,
    vimeo: social_links.vimeo,
    facebook: social_links.facebook,
    imdb_profile: social_links.imdb,
    skills: textArray(profile.skills || profile.specializations || profile.roles),
    specializations: textArray(profile.specializations || profile.skills),
    roles: textArray(profile.roles),
    departments: textArray(profile.departments),
    software_skills: textArray(profile.software_skills),
    technical_skills: textArray(profile.technical_skills),
    photography_skills: textArray(profile.photography_skills),
    videography_skills: textArray(profile.videography_skills),
    willing_to_travel: Boolean(profile.willing_to_travel),
    hourly_rate: profile.hourly_rate ?? null,
    daily_rate: profile.daily_rate ?? null,
    project_rate: profile.project_rate ?? null,
    rate_card_visible: profile.rate_card_visible ?? true,
    experience_level: firstPresent(profile.experience_level, profile.experience),
    subscription_status:
      profile.subscription_status || (profile.account_type?.toLowerCase?.() === "scout" ? "active" : "inactive"),
  }
}
