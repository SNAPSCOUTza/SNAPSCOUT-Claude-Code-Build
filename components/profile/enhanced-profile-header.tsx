"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, MessageCircle, Heart, Bookmark, Share2 } from "lucide-react"

interface EnhancedProfileHeaderProps {
  name: string
  profession: string
  location: string
  bio: string
  avatar: string
  rating: number
  reviews: number
  portfolioCount: number
  isOwnProfile?: boolean
  onHire?: () => void
  onMessage?: () => void
  onSave?: () => void
  onShare?: () => void
  isSaved?: boolean
}

export function EnhancedProfileHeader({
  name,
  profession,
  location,
  bio,
  avatar,
  rating,
  reviews,
  portfolioCount,
  isOwnProfile,
  onHire,
  onMessage,
  onSave,
  onShare,
  isSaved,
}: EnhancedProfileHeaderProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar - 200px as specified */}
        <Avatar className="w-[200px] h-[200px] border-4 border-background shadow-lg">
          <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
          <AvatarFallback className="text-4xl">{name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left">
          {/* Name and Badge */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <h1 className="text-[32px] font-bold text-foreground">{name}</h1>
            <Badge variant="secondary" className="w-fit mx-auto md:mx-0">
              {profession}
            </Badge>
            {isOwnProfile && (
              <Badge className="bg-primary text-primary-foreground w-fit mx-auto md:mx-0">Your Profile</Badge>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center justify-center md:justify-start gap-1 text-muted-foreground mb-3">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>

          {/* Bio */}
          <p className="text-foreground/80 mb-4 max-w-2xl">{bio}</p>

          {/* Stats */}
          <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviews} reviews)</span>
            </div>
            <div className="text-muted-foreground">
              <span className="font-semibold text-foreground">{portfolioCount}</span> portfolio items
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            {isOwnProfile ? (
              <Button className="bg-primary hover:bg-primary/90">Preview Your Profile</Button>
            ) : (
              <>
                <Button className="bg-primary hover:bg-primary/90" onClick={onHire}>
                  <Heart className="h-4 w-4 mr-2" />
                  Hire Me
                </Button>
                <Button variant="outline" onClick={onMessage}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" onClick={onSave}>
                  <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Saved" : "Save Profile"}
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
