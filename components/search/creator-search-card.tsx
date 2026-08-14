"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface PortfolioItem {
  id: string
  thumbnail: string
}

interface CreatorSearchCardProps {
  id: string
  name: string
  profession: string
  location: string
  avatar: string
  portfolioCount: number
  portfolioItems: PortfolioItem[]
  isOwnProfile?: boolean
}

export function CreatorSearchCard({
  id,
  name,
  profession,
  location,
  avatar,
  portfolioCount,
  portfolioItems,
  isOwnProfile,
}: CreatorSearchCardProps) {
  const previewItems = portfolioItems.slice(0, 4)

  return (
    <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-4">
        {/* Profile Image */}
        <div className="aspect-square relative rounded-lg overflow-hidden mb-3">
          <Image src={avatar || "/placeholder.svg"} alt={name} fill className="object-cover" />
          {isOwnProfile && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">Your Profile</Badge>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium">
              View Profile
            </span>
          </div>
        </div>

        {/* Info */}
        <h3 className="font-semibold text-foreground">{name}</h3>
        <Badge variant="secondary" className="mb-1">
          {profession}
        </Badge>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3 w-3" />
          <span>{location}</span>
        </div>

        {/* Portfolio Thumbnails - 4 overlapping */}
        <div className="flex -space-x-2 mb-3">
          {previewItems.map((item, index) => (
            <div
              key={item.id}
              className="w-10 h-10 rounded-lg overflow-hidden border-2 border-background relative"
              style={{ zIndex: 4 - index }}
            >
              <Image src={item.thumbnail || "/placeholder.svg"} alt="Portfolio preview" fill className="object-cover" />
            </div>
          ))}
          {portfolioCount > 4 && (
            <div className="w-10 h-10 rounded-lg bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
              +{portfolioCount - 4}
            </div>
          )}
        </div>

        {/* CTA */}
        {isOwnProfile ? (
          <Button variant="outline" className="w-full bg-transparent" asChild>
            <Link href={`/profile/${id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Preview Your Profile
            </Link>
          </Button>
        ) : (
          <Button variant="outline" className="w-full bg-transparent" asChild>
            <Link href={`/profile/${id}`}>View Profile</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
