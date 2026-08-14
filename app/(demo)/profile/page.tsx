"use client"

import type React from "react"

import { useProfileStore } from "@/hooks/use-profile-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Instagram, Twitter, Linkedin, Youtube, Globe, MapPin, DollarSign, Calendar } from "lucide-react"
import Image from "next/image"

const socialIcons: { [key: string]: React.ElementType } = {
  website: Globe,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
}

export default function PublicProfilePage() {
  const profile = useProfileStore((state) => state)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
          <Avatar className="w-32 h-32 border-4 border-white shadow-md">
            <AvatarImage src={profile.profileImageUrl || "/placeholder.svg"} alt={profile.fullName} />
            <AvatarFallback className="text-4xl">{profile.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-900">{profile.fullName}</h1>
            <p className="text-xl text-primary font-medium mt-1">{profile.profession}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-muted-foreground mt-2">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1.5" />
                {profile.location}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                {profile.availability}
              </span>
              <span className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1.5" />
                {profile.pricing}
              </span>
            </div>
            <div className="mt-4 flex justify-center md:justify-start space-x-2">
              {Object.entries(profile.socialLinks).map(([key, value]) => {
                if (value) {
                  const Icon = socialIcons[key]
                  return (
                    <Button key={key} variant="outline" size="icon" asChild>
                      <a href={value} target="_blank" rel="noopener noreferrer">
                        <Icon className="h-5 w-5" />
                      </a>
                    </Button>
                  )
                }
                return null
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </CardContent>
          </Card>

          {/* Portfolio */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profile.portfolioImages.map((img, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div className="aspect-square relative rounded-lg overflow-hidden cursor-pointer group">
                        <Image
                          src={img || "/placeholder.svg"}
                          alt={`Portfolio ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-semibold">View</p>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl p-2">
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`Portfolio ${index + 1}`}
                        width={1200}
                        height={800}
                        className="rounded-lg w-full h-auto"
                      />
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-base py-1">
                  {skill}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
