"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MapPin, Clock, Eye, MessageCircle, Heart } from "lucide-react"
import type { CrewMember, SocialPost, SocialProfile } from "@/types/crew"

interface ProfilePreviewCardProps {
  profileData: {
    displayName?: string
    fullName?: string
    bio?: string
    province?: string
    city?: string
    departments?: string[]
    roles?: string[]
    primaryRole?: string
    experienceLevel?: string
    yearsExperience?: number
    availabilityStatus?: string
    profilePictureUrl?: string
    specialties?: string[]
    gear?: string[]
  }
  showSocialMedia?: boolean
}

export default function ProfilePreviewCard({ profileData, showSocialMedia = true }: ProfilePreviewCardProps) {
  const [mockSocialPosts, setMockSocialPosts] = useState<SocialPost[]>([])
  const [mockSocialProfiles, setMockSocialProfiles] = useState<SocialProfile[]>([])

  useEffect(() => {
    // Generate mock social media data based on user's role
    const generateMockSocialData = () => {
      const posts: SocialPost[] = [
        {
          id: "1",
          platform: "instagram",
          type: "image",
          content: "/film-set-behind-scenes.png",
          caption: "Behind the scenes of our latest project! 🎬",
          likes: 124,
          comments: 18,
          timestamp: "2 days ago",
        },
        {
          id: "2",
          platform: "vimeo",
          type: "video",
          content: "/video-reel-showcase.png",
          caption: "Check out my latest reel showcasing recent work",
          likes: 89,
          comments: 12,
          timestamp: "1 week ago",
        },
        {
          id: "3",
          platform: "linkedin",
          type: "text",
          content: "",
          caption: "Just wrapped an amazing commercial shoot. Great team collaboration!",
          likes: 45,
          comments: 8,
          timestamp: "3 days ago",
        },
      ]

      const profiles: SocialProfile[] = [
        {
          platform: "instagram",
          username: `@${profileData.displayName?.toLowerCase().replace(/\s+/g, "") || "filmmaker"}`,
          url: "#",
          followers: 2840,
          verified: false,
        },
        {
          platform: "vimeo",
          username: profileData.displayName?.replace(/\s+/g, "") || "filmmaker",
          url: "#",
          followers: 1250,
          verified: true,
        },
        {
          platform: "linkedin",
          username: profileData.fullName || profileData.displayName || "Film Professional",
          url: "#",
          followers: 890,
          verified: false,
        },
      ]

      setMockSocialPosts(posts)
      setMockSocialProfiles(profiles)
    }

    generateMockSocialData()
  }, [profileData.displayName, profileData.fullName])

  // Convert profile data to CrewMember format for display
  const crewMember: CrewMember = {
    id: 1,
    name: profileData.displayName || "Your Name",
    role: profileData.primaryRole || profileData.roles?.[0] || "Film Professional",
    department: profileData.departments?.[0] || "Production",
    location: profileData.city && profileData.province ? `${profileData.city}, ${profileData.province}` : "Location",
    availability: profileData.availabilityStatus || "Available",
    experienceLevel: profileData.experienceLevel || "Mid-Level",
    experience: profileData.yearsExperience ? `${profileData.yearsExperience} years` : "Experience level",
    rating: 4.8,
    profilePicture: profileData.profilePictureUrl || "/professional-headshot.png",
    recentWork: "Recent project showcase",
    specialties: profileData.specialties || [],
    gear: profileData.gear || [],
    socialProfiles: mockSocialProfiles,
    socialPosts: mockSocialPosts,
  }

  const getAvailabilityColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "busy":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "unavailable":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getExperienceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "entry":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "mid":
      case "mid-level":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "senior":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardContent className="p-0">
        {/* Profile Header */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-red-500 to-red-600"></div>
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <Image
                src={crewMember.profilePicture || "/placeholder.svg"}
                alt={crewMember.name}
                width={80}
                height={80}
                className="rounded-full border-4 border-white shadow-lg object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 px-6 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{crewMember.name}</h3>
              <p className="text-red-600 font-semibold">{crewMember.role}</p>
            </div>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium text-gray-700">{crewMember.rating}</span>
            </div>
          </div>

          {/* Bio */}
          {profileData.bio && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{profileData.bio}</p>}

          {/* Location & Availability */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{crewMember.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{crewMember.experience}</span>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={`${getAvailabilityColor(crewMember.availability)} border`}>
              {crewMember.availability}
            </Badge>
            <Badge className={`${getExperienceColor(crewMember.experienceLevel)} border`}>
              {crewMember.experienceLevel}
            </Badge>
            {profileData.departments && profileData.departments.length > 1 && (
              <Badge variant="outline" className="text-xs">
                +{profileData.departments.length - 1} more
              </Badge>
            )}
          </div>

          {/* Specialties */}
          {crewMember.specialties.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-1">
                {crewMember.specialties.slice(0, 3).map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {crewMember.specialties.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{crewMember.specialties.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Social Media Preview */}
          {showSocialMedia && mockSocialPosts.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Recent Work</h4>
              <div className="grid grid-cols-3 gap-2">
                {mockSocialPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="relative group cursor-pointer">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {post.type === "image" || post.type === "video" ? (
                        <Image
                          src={post.content || "/placeholder.svg"}
                          alt="Recent work"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 text-white text-xs">
                        <Heart className="w-3 h-3" />
                        <span>{post.likes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              <Eye className="w-4 h-4 mr-2" />
              View Profile
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
