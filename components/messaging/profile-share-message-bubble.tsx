"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ProfileShareMessageBubbleProps {
  profileId: string
  profileHref: string
}

// Looks up the profile live at render time rather than trusting anything
// stored in the message - so the preview always shows the sender's current
// name/photo/profession, never a stale snapshot from when it was sent.
export function ProfileShareMessageBubble({ profileId, profileHref }: ProfileShareMessageBubbleProps) {
  const [profile, setProfile] = useState<{ display_name: string; profile_picture: string; profession: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    supabase
      .from("user_profiles")
      .select("display_name, profile_picture, profession")
      .eq("user_id", profileId)
      .maybeSingle()
      .then(({ data }: { data: { display_name: string; profile_picture: string; profession: string } | null }) => {
        if (!cancelled) {
          setProfile(data)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [profileId])

  return (
    <div className="w-64 overflow-hidden rounded-2xl border border-border bg-background">
      <div className="flex items-center gap-3 p-3">
        <Avatar className="h-11 w-11">
          <AvatarImage src={profile?.profile_picture || ""} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {profile?.display_name?.charAt(0)?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {loading ? "Loading profile..." : profile?.display_name || "SnapScout member"}
          </p>
          {profile?.profession && <p className="truncate text-xs text-muted-foreground">{profile.profession}</p>}
        </div>
      </div>
      <Button asChild size="sm" className="w-full rounded-none rounded-b-2xl bg-primary text-primary-foreground hover:bg-primary/90">
        <Link href={profileHref}>
          View Profile
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  )
}
