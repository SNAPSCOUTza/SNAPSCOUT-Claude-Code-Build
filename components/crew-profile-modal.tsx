"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  MapPin,
  Calendar,
  Star,
  ExternalLink,
  Heart,
  MessageCircle,
  Play,
  Instagram,
  Facebook,
  Linkedin,
  Video,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { CrewMember, SocialPost } from "@/types/crew"

interface CrewProfileModalProps {
  member: CrewMember | null
  isOpen: boolean
  onClose: () => void
}

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  vimeo: Video,
}

const platformColors = {
  instagram: "from-purple-500 to-pink-500",
  facebook: "from-blue-600 to-blue-700",
  linkedin: "from-blue-700 to-blue-800",
  vimeo: "from-teal-500 to-cyan-600",
}

export function CrewProfileModal({ member, isOpen, onClose }: CrewProfileModalProps) {
  const [activeTab, setActiveTab] = useState("instagram")

  if (!member) return null

  const renderSocialPost = (post: SocialPost) => {
    return (
      <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          {post.type === "image" && (
            <div className="aspect-square relative">
              <Image
                src={post.content || "/placeholder.svg"}
                alt={post.caption || "Social media post"}
                fill
                loading="lazy"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
            </div>
          )}
          {post.type === "video" && (
            <div className="aspect-square relative bg-gray-900 flex items-center justify-center">
              <Play className="h-12 w-12 text-white opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}
          {post.caption && (
            <div className="p-3">
              <p className="text-sm text-gray-700 line-clamp-2">{post.caption}</p>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Heart className="h-3 w-3 mr-1" />
                    {post.likes}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    {post.comments}
                  </span>
                </div>
                <span>{new Date(post.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{member.name} - Profile Details</DialogTitle>
        </DialogHeader>

        {/* Profile Header - keeping exact same styling */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <Image
              src={member.profilePicture || "/placeholder.svg"}
              alt={`${member.name} profile picture`}
              width={80}
              height={80}
              loading="lazy"
              className="w-20 h-20 rounded-full object-cover border-3 border-white shadow-lg"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                member.availability === "Available" ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{member.name}</h2>
            <p className="text-lg text-gray-600 font-medium">{member.role}</p>
            <p className="text-sm text-gray-500">{member.recentWork}</p>
            <div className="flex items-center mt-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-semibold text-gray-700 ml-1">{member.rating}</span>
              <span className="text-sm text-gray-500 ml-2">• {member.experience} experience</span>
            </div>
          </div>
          <div className="flex space-x-2">
            {member.socialProfiles.map((profile) => {
              const Icon = platformIcons[profile.platform]
              return (
                <Link
                  key={profile.platform}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Icon className="h-4 w-4 text-gray-600" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Badges - keeping exact same styling */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="outline" className="bg-white/80">
            {member.department}
          </Badge>
          <Badge
            className={`${
              member.availability === "Available"
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-red-100 text-red-800 hover:bg-red-100"
            }`}
          >
            {member.availability}
          </Badge>
          <Badge variant="secondary" className="bg-gray-100">
            {member.experienceLevel}
          </Badge>
        </div>

        {/* Location and Details - keeping exact same styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              {member.location}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              {member.experience} experience
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Specialties:</p>
            <div className="flex flex-wrap gap-1">
              {member.specialties.map((specialty, idx) => (
                <span key={idx} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {member.socialProfiles.map((profile) => {
              const Icon = platformIcons[profile.platform]
              return (
                <TabsTrigger key={profile.platform} value={profile.platform} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline capitalize">{profile.platform}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {member.socialProfiles.map((profile) => (
            <TabsContent key={profile.platform} value={profile.platform} className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${platformColors[profile.platform]}`}>
                    {(() => {
                      const Icon = platformIcons[profile.platform]
                      return <Icon className="h-5 w-5 text-white" />
                    })()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">@{profile.username}</h3>
                    <p className="text-sm text-gray-500">
                      {profile.followers.toLocaleString()} followers
                      {profile.verified && " • Verified"}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={profile.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {member.socialPosts.filter((post) => post.platform === profile.platform).map(renderSocialPost)}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Equipment Section - keeping exact same styling */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold text-gray-900 mb-3">Equipment & Gear</h3>
          <div className="flex flex-wrap gap-2">
            {member.gear.map((item, idx) => (
              <span key={idx} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons - keeping exact same styling */}
        <div className="flex gap-3 mt-6 pt-6 border-t">
          <Button className="flex-1 bg-red-700 hover:bg-red-800">
            <MessageCircle className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            <Heart className="h-4 w-4 mr-2" />
            Save Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
