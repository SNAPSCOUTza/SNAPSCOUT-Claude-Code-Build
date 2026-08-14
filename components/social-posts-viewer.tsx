"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Instagram,
  Facebook,
  Linkedin,
  Video,
  ExternalLink,
  Heart,
  MessageCircle,
  Play,
  ImageIcon,
  Type,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { SocialPost, SocialProfile } from "@/types/crew"

interface SocialPostsViewerProps {
  socialProfiles: SocialProfile[]
  socialPosts: SocialPost[]
  maxPosts?: number
  showPlatformTabs?: boolean
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

const platformNames = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  vimeo: "Vimeo",
}

export function SocialPostsViewer({
  socialProfiles,
  socialPosts,
  maxPosts = 8,
  showPlatformTabs = false,
}: SocialPostsViewerProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)

  // Filter posts based on selected platform
  const filteredPosts = selectedPlatform
    ? socialPosts.filter((post) => post.platform === selectedPlatform)
    : socialPosts

  // Limit posts to maxPosts
  const displayPosts = filteredPosts.slice(0, maxPosts)

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Play className="h-4 w-4" />
      case "text":
        return <Type className="h-4 w-4" />
      default:
        return <ImageIcon className="h-4 w-4" />
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (!socialPosts || socialPosts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Instagram className="h-5 w-5 mr-2" />
            Recent Social Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Instagram className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No social media posts available</p>
            <p className="text-sm text-gray-400 mt-2">
              Connect your social media accounts to showcase your latest work
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Instagram className="h-5 w-5 mr-2" />
            Recent Social Posts
          </CardTitle>
          {showPlatformTabs && socialProfiles.length > 1 && (
            <div className="flex space-x-2">
              <Button
                variant={selectedPlatform === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPlatform(null)}
              >
                All
              </Button>
              {socialProfiles.map((profile) => {
                const Icon = platformIcons[profile.platform]
                return (
                  <Button
                    key={profile.platform}
                    variant={selectedPlatform === profile.platform ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPlatform(profile.platform)}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayPosts.map((post) => {
            const Icon = platformIcons[post.platform]
            const profile = socialProfiles.find((p) => p.platform === post.platform)

            return (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-0">
                  {/* Post Content */}
                  <div className="relative">
                    {post.type === "image" && post.content && (
                      <div className="aspect-square relative">
                        <Image
                          src={post.content || "/placeholder.svg"}
                          alt={post.caption || "Social media post"}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    )}

                    {post.type === "video" && (
                      <div className="aspect-square relative bg-gray-900 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    )}

                    {post.type === "text" && (
                      <div className="aspect-square relative bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
                        <p className="text-gray-700 text-sm text-center line-clamp-4">{post.caption || post.content}</p>
                      </div>
                    )}

                    {/* Platform Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className={`bg-gradient-to-r ${platformColors[post.platform]} text-white border-0`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {platformNames[post.platform]}
                      </Badge>
                    </div>

                    {/* Post Type Icon */}
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/50 rounded-full p-1">{getPostTypeIcon(post.type)}</div>
                    </div>
                  </div>

                  {/* Post Details */}
                  <div className="p-3">
                    {post.caption && <p className="text-sm text-gray-700 line-clamp-2 mb-2">{post.caption}</p>}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {post.likes.toLocaleString()}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {post.comments.toLocaleString()}
                        </span>
                      </div>
                      <span>{formatDate(post.timestamp)}</span>
                    </div>

                    {/* View Post Link */}
                    {post.url && (
                      <Link
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-red-700 hover:text-red-800 font-medium transition-colors"
                      >
                        View Post
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    )}

                    {/* Fallback to profile link if no post URL */}
                    {!post.url && profile && (
                      <Link
                        href={profile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-red-700 hover:text-red-800 font-medium transition-colors"
                      >
                        View on {platformNames[post.platform]}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Show More Button */}
        {filteredPosts.length > maxPosts && (
          <div className="text-center mt-6">
            <Button variant="outline" className="bg-transparent">
              View All Posts ({filteredPosts.length})
            </Button>
          </div>
        )}

        {/* Social Profiles Summary */}
        {socialProfiles.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Follow on Social Media</h4>
            <div className="flex flex-wrap gap-3">
              {socialProfiles.map((profile) => {
                const Icon = platformIcons[profile.platform]
                return (
                  <Link
                    key={profile.platform}
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-700 transition-colors"
                  >
                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${platformColors[profile.platform]}`}>
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="font-medium">@{profile.username}</span>
                      <span className="text-xs text-gray-500 ml-2">{profile.followers.toLocaleString()} followers</span>
                    </div>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
