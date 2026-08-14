"use client"

import { useState, useEffect, useRef } from "react"
import { Heart, MessageCircle, MapPin, ExternalLink } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  LOCAL_SAVED_PROFILES_EVENT,
  loadLocalSavedProfiles,
  removeProfileLocally,
  type LocalSavedProfile,
} from "@/lib/saved-profiles-local"

interface SavedProfile {
  user_id: string
  display_name: string
  full_name: string
  profile_picture: string
  city: string
  province: string
  account_type: string
  bio: string
  experience_level: string
  hourly_rate: string
  roles: string[]
  saved_at: string
  href?: string
  category?: LocalSavedProfile["category"]
}

export default function SavedProfilesPage() {
  const [profiles, setProfiles] = useState<SavedProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "crew" | "creator" | "studio">("all")
  const initRef = useRef(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    loadSavedProfiles()

    const syncLocalProfiles = () => {
      setProfiles((current) => mergeProfiles(current.filter((profile) => !profile.saved_at?.startsWith("local:")), getLocalProfiles()))
    }

    window.addEventListener(LOCAL_SAVED_PROFILES_EVENT, syncLocalProfiles)
    window.addEventListener("storage", syncLocalProfiles)

    return () => {
      window.removeEventListener(LOCAL_SAVED_PROFILES_EVENT, syncLocalProfiles)
      window.removeEventListener("storage", syncLocalProfiles)
    }
  }, [])

  const getLocalProfiles = (): SavedProfile[] =>
    loadLocalSavedProfiles().map((profile) => ({
      user_id: profile.id,
      display_name: profile.name,
      full_name: profile.name,
      profile_picture: profile.imageUrl || "",
      city: profile.location?.split(",")[0]?.trim() || "",
      province: profile.location?.split(",").slice(1).join(",").trim() || "",
      account_type: profile.role || profile.category || "Professional",
      bio: "",
      experience_level: "",
      hourly_rate: "",
      roles: profile.role ? [profile.role] : [],
      saved_at: `local:${profile.savedAt}`,
      href: profile.href,
      category: profile.category,
    }))

  const mergeProfiles = (remoteProfiles: SavedProfile[], localProfiles: SavedProfile[]) => {
    const seen = new Set<string>()
    return [...localProfiles, ...remoteProfiles].filter((profile) => {
      if (seen.has(profile.user_id)) return false
      seen.add(profile.user_id)
      return true
    })
  }

  const loadSavedProfiles = async () => {
    const localProfiles = getLocalProfiles()

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setProfiles(localProfiles)
        setIsLoading(false)
        return
      }

      setCurrentUserId(session.user.id)

      const { data: favorites, error } = await supabase
        .from("user_favorites")
        .select("favorited_user_id, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching favorites:", error)
        setIsLoading(false)
        return
      }

      if (!favorites || favorites.length === 0) {
        setProfiles(localProfiles)
        setIsLoading(false)
        return
      }

      const favoritedIds = favorites.map((f: any) => f.favorited_user_id)

      const { data: profilesData, error: profilesError } = await supabase
        .from("user_profiles")
        .select(`
          id, user_id, full_name, display_name, username, email, profession, bio, location, city, province,
          profile_image_url, profile_picture, avatar_url, availability, availability_status, pricing,
          hourly_rate, daily_rate, project_rate, skills, social_links, portfolio_images,
          is_public, is_profile_visible, subscription_status
        `)
        .in("user_id", favoritedIds)

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError)
        setIsLoading(false)
        return
      }

      // Merge the saved_at timestamp with profile data and transform to expected format
      const mergedProfiles = (profilesData || []).map((profile: any) => {
        const profileId = profile.user_id || profile.id
        const location = profile.location || [profile.city, profile.province].filter(Boolean).join(", ")
        const favorite = favorites.find((f: any) => f.favorited_user_id === profileId)
        return {
          user_id: profileId,
          display_name: profile.display_name || profile.full_name || profile.username || "Unknown",
          full_name: profile.full_name || profile.display_name || profile.username || "Unknown",
          profile_picture: profile.profile_image_url || profile.profile_picture || profile.avatar_url || "",
          city: profile.city || location?.split(",")[0]?.trim() || "",
          province: profile.province || location?.split(",")[1]?.trim() || "",
          account_type: profile.profession || "Professional",
          bio: profile.bio || "",
          experience_level: "",
          hourly_rate:
            profile.pricing ||
            (profile.hourly_rate ? `R${profile.hourly_rate}/hr` : profile.daily_rate ? `R${profile.daily_rate}/day` : ""),
          roles: profile.skills || [],
          saved_at: favorite?.created_at || "",
        }
      })

      setProfiles(mergeProfiles(mergedProfiles, localProfiles))
    } catch (error) {
      console.error("Error loading saved profiles:", error)
      setProfiles(localProfiles)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFavorite = async (profileId: string) => {
    removeProfileLocally(profileId)
    setProfiles((prev) => prev.filter((p) => p.user_id !== profileId))

    if (!currentUserId) return

    try {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", currentUserId)
        .eq("favorited_user_id", profileId)

      if (error) throw error

      setProfiles((prev) => prev.filter((p) => p.user_id !== profileId))
    } catch (error) {
      console.error("Error removing favorite:", error)
    }
  }

  const filteredProfiles = profiles.filter((profile) => {
    if (filter === "all") return true
    const accountType = profile.account_type?.toLowerCase() || ""
    if (filter === "crew") return accountType === "crew" || accountType === "film_crew"
    if (filter === "creator") return accountType === "creator" || accountType === "content_creator"
    if (filter === "studio") return accountType === "studio" || accountType === "store"
    return true
  })

  const getAccountTypeLabel = (type: string) => {
    const normalized = type?.toLowerCase() || ""
    if (normalized === "crew" || normalized === "film_crew") return "Film Crew"
    if (normalized === "creator" || normalized === "content_creator") return "Creator"
    if (normalized === "studio") return "Studio"
    if (normalized === "store") return "Store"
    return type || "Professional"
  }

  const getProfileLink = (profile: SavedProfile) => {
    if (profile.href) return profile.href
    const type = profile.account_type?.toLowerCase() || ""
    if (type === "studio") return `/studios/${profile.user_id}`
    if (type === "store") return `/stores/${profile.user_id}`
    if (profile.category === "crew" || profile.user_id.startsWith("crew-")) return `/crew/${profile.user_id}`
    if (profile.category === "creator" || profile.user_id.startsWith("creator-")) return `/creators/${profile.user_id}`
    return `/profile/${profile.user_id}`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!currentUserId && profiles.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-[#f7f8fb] px-4 py-8 text-[#111318]">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-[#e4e9f1] bg-white px-5 py-10 text-center shadow-[0_18px_40px_rgba(9,14,24,0.06)]">
          <Heart className="mx-auto mb-4 h-14 w-14 text-[#f20d14] opacity-70" />
          <h2 className="text-[25px] font-bold tracking-[-0.02em] text-[#111318]">Sign in to view saved profiles</h2>
          <p className="mx-auto mt-2 max-w-[34ch] text-[15px] leading-6 text-[#667085]">
            Create an account to save your favorite creators, crew members, and studios
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#f20d14] px-7 text-[15px] font-semibold text-white shadow-[0_14px_28px_rgba(242,13,20,0.18)] transition-[transform,background-color] duration-200 hover:bg-[#d80a10] active:scale-[0.96]"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#f7f8fb] px-4 pb-[calc(120px+env(safe-area-inset-bottom))] pt-8 text-[#111318]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[32px] bg-[#111318] p-5 text-white shadow-[0_20px_44px_rgba(9,14,24,0.16)]">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#f20d14]">
              <Heart className="h-5 w-5 fill-current" />
            </span>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#ff6b70]">SnapScout saved</p>
              <h1 className="text-[34px] font-black leading-none tracking-[-0.03em]">Saved Profiles</h1>
            </div>
          </div>
          <p className="mt-4 max-w-[42ch] text-[15px] leading-6 text-white/78">Keep trusted creatives, crew, studios, and stores ready for your next shoot.</p>
        </div>

      {/* Filter tabs */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {[
          { value: "all", label: "All" },
          { value: "crew", label: "Film Crew" },
          { value: "creator", label: "Creators" },
          { value: "studio", label: "Studios & Stores" },
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={filter === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(tab.value as typeof filter)}
            className={cn(
              "h-11 shrink-0 rounded-full px-5 text-[13px] font-semibold transition-[transform,background-color,color,border-color] duration-200 active:scale-[0.96]",
              filter === tab.value
                ? "border-[#111318] bg-[#111318] text-white"
                : "border-[#dde5ef] bg-white text-[#263140]",
            )}
          >
            {tab.label}
            {tab.value === "all" && ` (${profiles.length})`}
          </Button>
        ))}
      </div>

      {filteredProfiles.length === 0 ? (
        <div className="rounded-[32px] border border-[#e4e9f1] bg-white px-5 py-12 text-center shadow-[0_16px_34px_rgba(9,14,24,0.05)]">
          <Heart className="mx-auto mb-4 h-14 w-14 text-[#f20d14] opacity-60" />
          <h2 className="mb-2 text-[22px] font-bold text-[#111318]">
            {profiles.length === 0 ? "No saved profiles yet" : "No profiles match this filter"}
          </h2>
          <p className="mx-auto mb-6 max-w-[36ch] text-[15px] leading-6 text-[#667085]">
            {profiles.length === 0
              ? "Start exploring and save profiles to keep them handy for future projects"
              : "Try selecting a different filter or browse more profiles"}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/find-crew"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#f20d14] px-6 text-[14px] font-semibold text-white transition-transform active:scale-[0.96]"
            >
              Browse Crew
            </Link>
            <Link
              href="/creators"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#dde5ef] bg-white px-6 text-[14px] font-semibold text-[#111318] transition-transform active:scale-[0.96]"
            >
              Browse Creators
            </Link>
            <Link
              href="/studios-stores"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#dde5ef] bg-white px-6 text-[14px] font-semibold text-[#111318] transition-transform active:scale-[0.96]"
            >
              Browse Studios
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProfiles.map((profile) => (
            <Card
              key={profile.user_id}
              className="overflow-hidden rounded-[30px] border-[#e4e9f1] bg-white shadow-[0_14px_32px_rgba(9,14,24,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(9,14,24,0.09)]"
            >
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-[72px] w-[72px] border-2 border-white shadow-[0_10px_22px_rgba(9,14,24,0.12)]">
                      <AvatarImage src={profile.profile_picture || ""} alt={profile.display_name} />
                      <AvatarFallback className="bg-[#f4f6f8] text-lg font-bold text-[#111318]">
                        {profile.display_name?.charAt(0) || profile.full_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-[21px] font-bold leading-tight tracking-[-0.02em] text-[#111318]">
                        {profile.display_name || profile.full_name}
                      </h3>
                      <Badge variant="secondary" className="mt-1 rounded-full bg-[#fff1f1] px-3 py-1 text-[11px] font-semibold text-[#f20d14]">
                        {getAccountTypeLabel(profile.account_type)}
                      </Badge>
                      {profile.city && (
                        <div className="mt-2 flex items-center gap-1 text-[13px] text-[#667085]">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {profile.city}
                            {profile.province ? `, ${profile.province}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {profile.bio && <p className="mt-3 line-clamp-2 text-[14px] leading-6 text-[#566071]">{profile.bio}</p>}

                  {profile.roles && profile.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {profile.roles.slice(0, 3).map((role, idx) => (
                        <Badge key={idx} variant="outline" className="rounded-full border-[#dde5ef] bg-white text-[11px]">
                          {role}
                        </Badge>
                      ))}
                      {profile.roles.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.roles.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {profile.hourly_rate && (
                    <div className="mt-3 flex items-center gap-1 text-[14px] font-semibold text-[#111318]">
                      {profile.hourly_rate}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-[#e8edf5] bg-[#fbfcfe] p-3">
                  <div className="flex gap-2">
                    <Link href={getProfileLink(profile)}>
                      <Button variant="outline" size="sm" className="h-10 rounded-full border-[#dde5ef] bg-white px-4">
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/messages?recipient=${profile.user_id}`}>
                      <Button variant="outline" size="sm" className="h-10 rounded-full border-[#dde5ef] bg-white px-4">
                        <MessageCircle className="h-3 w-3" />
                        Message
                      </Button>
                    </Link>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFavorite(profile.user_id)}
                    className="h-10 w-10 rounded-full text-[#f20d14] hover:bg-[#fff1f1] hover:text-[#d80a10]"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
