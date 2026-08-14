"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useProfileStore, type DemoProfileState } from "@/hooks/use-profile-store"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Instagram, Linkedin, Youtube, UserPlus, Edit, Info, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type PreviewProfile = {
  displayName: string
  profession: string
  location: string
  bio: string
  profilePicture: string
  roles: string[]
  portfolioImages: string[]
  socialLinks: {
    instagram?: string
    linkedin?: string
    youtube?: string
    website?: string
  }
}

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return ""
}

function normalizeLiveProfile(raw: any, userEmail?: string | null): PreviewProfile {
  const socialLinks = raw?.social_links || {}
  const skills = raw?.skills || {}
  const displayName = firstText(raw?.display_name, raw?.full_name, raw?.username, userEmail?.split("@")[0], "Your profile")
  const profession = firstText(raw?.profession, raw?.primary_role, skills?.primaryRole, "Creative professional")
  const location = firstText(raw?.location, [raw?.city, raw?.province].filter(Boolean).join(", "))
  const roles = [
    ...asArray(raw?.roles),
    ...asArray(raw?.departments),
    ...asArray(raw?.specialties),
    ...asArray(skills?.roles),
    ...asArray(skills?.specialties),
  ]

  return {
    displayName,
    profession,
    location,
    bio: firstText(raw?.bio, "Add a short bio so clients know what you do best."),
    profilePicture: firstText(raw?.profile_image_url, raw?.profile_picture, raw?.avatar_url, "/placeholder.svg"),
    roles: roles.length ? Array.from(new Set(roles)) : [profession],
    portfolioImages: asArray(raw?.portfolio_images),
    socialLinks: {
      instagram: firstText(socialLinks.instagram, raw?.instagram),
      linkedin: firstText(socialLinks.linkedin, raw?.linkedin),
      youtube: firstText(socialLinks.youtube, socialLinks.vimeo, raw?.youtube_vimeo),
      website: firstText(socialLinks.website, raw?.website_url),
    },
  }
}

function normalizeDemoProfile(raw: DemoProfileState): PreviewProfile {
  const location = firstText([raw.city, raw.province].filter(Boolean).join(", "))

  return {
    displayName: firstText(raw.display_name, raw.full_name, "Your Name"),
    profession: firstText(raw.profession, "Photographer"),
    location,
    bio: firstText(raw.bio, "A short bio about your skills, experience, and what makes you unique."),
    profilePicture: firstText(raw.profile_picture, "/placeholder.svg"),
    roles: raw.roles?.length ? raw.roles : [firstText(raw.profession, "Photographer")],
    portfolioImages: raw.portfolio_images || [],
    socialLinks: {
      instagram: raw.instagram,
      linkedin: raw.linkedin,
      youtube: raw.youtube_vimeo,
      website: raw.website_url,
    },
  }
}

export default function ProfilePreviewPage() {
  const { profile: demoProfile } = useProfileStore()
  const { user, profile: authProfile, isAuthenticated, isLoading: authLoading } = useAuth()
  const [liveProfile, setLiveProfile] = useState<any>(null)
  const [liveLoading, setLiveLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !isAuthenticated) return

    let cancelled = false

    const loadLiveProfile = async () => {
      setLiveLoading(true)
      setLoadError(null)

      try {
        const response = await fetch("/api/profile/load", {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result?.error || "Could not load your live profile.")
        }

        if (!cancelled) {
          setLiveProfile(result.profile || authProfile || null)
        }
      } catch (error: any) {
        if (!cancelled) {
          setLiveProfile(authProfile || null)
          setLoadError(error?.message || "Could not load your live profile.")
        }
      } finally {
        if (!cancelled) setLiveLoading(false)
      }
    }

    loadLiveProfile()

    return () => {
      cancelled = true
    }
  }, [authLoading, authProfile, isAuthenticated, user?.id])

  const profile = useMemo(() => {
    if (isAuthenticated) {
      return normalizeLiveProfile(liveProfile || authProfile, user?.email)
    }

    return normalizeDemoProfile(demoProfile)
  }, [authProfile, demoProfile, isAuthenticated, liveProfile, user?.email])

  const showDemoBanner = !authLoading && !isAuthenticated
  const showSignedInEmptyHint = !authLoading && isAuthenticated && !liveLoading && !liveProfile && !authProfile

  return (
    <div className="min-h-screen bg-white md:bg-gray-100">
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-8">
        {showDemoBanner && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="font-bold text-blue-800">This is a Demo Preview</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 text-blue-800 sm:flex-row sm:items-center sm:justify-between">
              This is how your profile will look to clients. Ready to go live?
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" className="bg-transparent" variant="outline">
                  <Link href="/dashboard">
                    <Edit className="mr-2 h-4 w-4" />
                    Continue Editing
                  </Link>
                </Button>
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/onboarding">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up & Publish
                  </Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {loadError && isAuthenticated && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="font-bold text-amber-900">Using your saved session</AlertTitle>
            <AlertDescription className="text-amber-900">
              I could not refresh the full profile just now, so this preview is using the profile data already loaded in
              your signed-in session.
            </AlertDescription>
          </Alert>
        )}

        {showSignedInEmptyHint && (
          <Alert className="mb-6 border-red-100 bg-red-50">
            <Info className="h-4 w-4 text-[#f20d14]" />
            <AlertTitle className="font-bold text-[#0b0b0d]">Your profile is connected</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 text-[#334155] sm:flex-row sm:items-center sm:justify-between">
              Finish adding your details in the dashboard so this mobile preview can show your live public profile.
              <Button asChild size="sm" className="rounded-full bg-[#f20d14] text-white hover:bg-[#d9070d]">
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {authLoading || liveLoading ? (
          <div className="flex min-h-[55vh] items-center justify-center">
            <div className="flex items-center gap-3 rounded-full border border-[#dfe5ef] bg-white px-5 py-3 text-sm font-semibold text-[#475569] shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-[#f20d14]" />
              Loading your profile
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="space-y-6 lg:col-span-1 lg:space-y-8">
              <Card className="rounded-[28px] border-[#dfe5ef] bg-white shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="relative mx-auto mb-4 h-32 w-32">
                    <Image
                      src={profile.profilePicture || "/placeholder.svg"}
                      alt={profile.displayName}
                      fill
                      className="rounded-full border-4 border-white object-cover shadow-lg"
                    />
                  </div>
                  <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                  <p className="text-gray-600">{profile.profession}</p>
                  {profile.location && <p className="mt-1 text-sm text-gray-500">{profile.location}</p>}
                  <div className="mt-4 flex justify-center gap-2">
                    {profile.socialLinks.instagram && (
                      <Button asChild size="icon" variant="ghost" className="rounded-full">
                        <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                          <Instagram className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {profile.socialLinks.linkedin && (
                      <Button asChild size="icon" variant="ghost" className="rounded-full">
                        <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {profile.socialLinks.youtube && (
                      <Button asChild size="icon" variant="ghost" className="rounded-full">
                        <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                          <Youtube className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {profile.socialLinks.website && (
                      <Button asChild size="icon" variant="ghost" className="rounded-full">
                        <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-[28px] border-[#dfe5ef] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Roles</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {profile.roles.map((role, roleIndex) => (
                    <Badge key={`${role}-${roleIndex}`} className="rounded-full bg-[#f20d14] px-3 py-1 text-white">
                      {role}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 lg:col-span-2 lg:space-y-8">
              <Card className="rounded-[28px] border-[#dfe5ef] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-gray-700">{profile.bio}</p>
                </CardContent>
              </Card>
              <Card className="rounded-[28px] border-[#dfe5ef] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.portfolioImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {profile.portfolioImages.map((image, index) => (
                        <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-2xl">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Portfolio image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No portfolio images have been added yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
