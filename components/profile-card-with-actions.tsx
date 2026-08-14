"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import Image from "next/image"
import { MessageButton } from "@/components/messaging/message-button"
import { SaveProfileButton } from "@/components/messaging/save-profile-button"
import Link from "next/link"

interface ProfileCardWithActionsProps {
  profile: {
    user_id: string
    display_name: string
    full_name?: string
    profile_picture?: string
    city?: string
    province?: string
    account_type: string
    bio?: string
    experience_level?: string
    hourly_rate?: number
    roles?: string[]
  }
}

export function ProfileCardWithActions({ profile }: ProfileCardWithActionsProps) {
  return (
    <Card className="overflow-hidden rounded-[28px] border-[#e4e9f1] bg-white shadow-[0_14px_32px_rgba(9,14,24,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(9,14,24,0.09)]">
      <div className="relative h-48 bg-muted">
        {profile.profile_picture ? (
          <Image
            src={profile.profile_picture || "/placeholder.svg"}
            alt={profile.display_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
            <span className="text-4xl font-bold">{profile.display_name?.[0]?.toUpperCase()}</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <SaveProfileButton
            profileId={profile.user_id}
            profileName={profile.display_name}
            profileRole={profile.account_type}
            profileLocation={[profile.city, profile.province].filter(Boolean).join(", ")}
            profileImage={profile.profile_picture}
            profileHref={`/profile/${profile.user_id}`}
            category="profile"
          />
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Link href={`/profile/${profile.user_id}`}>
              <h3 className="font-semibold text-lg text-foreground hover:text-primary transition-colors">
                {profile.display_name}
              </h3>
            </Link>
            {(profile.city || profile.province) && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {profile.city && profile.province
                  ? `${profile.city}, ${profile.province}`
                  : profile.city || profile.province}
              </p>
            )}
          </div>
        </div>

        {profile.bio && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{profile.bio}</p>}

        {profile.roles && profile.roles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.roles.slice(0, 3).map((role) => (
              <Badge key={role} variant="secondary" className="bg-secondary text-secondary-foreground">
                {role}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-sm">
            {profile.experience_level && <span className="text-muted-foreground">{profile.experience_level}</span>}
            {profile.hourly_rate && <span className="font-semibold text-foreground">${profile.hourly_rate}/hr</span>}
          </div>
          <MessageButton
            recipientId={profile.user_id}
            recipientName={profile.display_name}
            variant="outline"
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  )
}
