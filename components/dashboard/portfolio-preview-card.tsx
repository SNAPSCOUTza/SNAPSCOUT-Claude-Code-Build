"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Edit, Plus, LinkIcon, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface PortfolioItem {
  id: string
  thumbnail: string
  title?: string
}

interface PortfolioPreviewCardProps {
  name: string
  avatar: string
  rating: number
  reviews: number
  portfolioItems: PortfolioItem[]
  profileId: string
}

export function PortfolioPreviewCard({
  name,
  avatar,
  rating,
  reviews,
  portfolioItems,
  profileId,
}: PortfolioPreviewCardProps) {
  const displayItems = portfolioItems.slice(0, 9)
  const hasItems = portfolioItems.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          How Clients See Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mini Header */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b">
          <Avatar className="w-[100px] h-[100px]">
            <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
            <AvatarFallback className="text-2xl">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>{rating.toFixed(1)}</span>
              <span>({reviews} reviews)</span>
            </div>
          </div>
        </div>

        {/* 3x3 Portfolio Grid */}
        {hasItems ? (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {displayItems.map((item) => (
              <div key={item.id} className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                <Image
                  src={item.thumbnail || "/placeholder.svg"}
                  alt={item.title || "Portfolio"}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            {/* Fill empty slots */}
            {Array.from({ length: Math.max(0, 9 - displayItems.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 mb-4 bg-muted rounded-lg">
            <p className="text-muted-foreground mb-2">No portfolio items yet</p>
            <Button variant="outline" size="sm">
              <LinkIcon className="h-4 w-4 mr-2" />
              Connect Social Media
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 bg-transparent" asChild>
            <Link href={`/profile/${profileId}`}>
              <Eye className="h-4 w-4 mr-2" />
              View as Public
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent" asChild>
            <Link href="/dashboard?tab=portfolio">
              <Edit className="h-4 w-4 mr-2" />
              Edit Portfolio
            </Link>
          </Button>
          <Button className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
