"use client"

import { useProfileStore } from "@/hooks/use-profile-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageUploader } from "./image-uploader"
import { X, Plus, Instagram, Twitter, Linkedin, Youtube, Globe } from "lucide-react"
import { useState } from "react"

export function ProfileForm() {
  const state = useProfileStore()
  const [skillInput, setSkillInput] = useState("")

  const handleSkillAdd = () => {
    state.addSkill(skillInput)
    setSkillInput("")
  }

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>This is how you'll appear to others on SnapScout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start space-x-6">
            <div className="w-32 flex-shrink-0">
              <Label>Profile Picture</Label>
              <ImageUploader
                label="Upload Photo"
                currentImage={state.profileImageUrl}
                onUpload={(url) => state.setProfileState({ profileImageUrl: url })}
              />
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={state.fullName}
                  onChange={(e) => state.setProfileState({ fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  value={state.profession}
                  onChange={(e) => state.setProfileState({ profession: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={state.location}
                  onChange={(e) => state.setProfileState({ location: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={state.bio}
              onChange={(e) => state.setProfileState({ bio: e.target.value })}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Specialties</CardTitle>
          <CardDescription>Showcase your areas of expertise.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {state.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-base py-1">
                {skill}
                <button
                  onClick={() => state.removeSkill(skill)}
                  className="ml-2 rounded-full hover:bg-destructive/20 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a new skill"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSkillAdd()}
            />
            <Button onClick={handleSkillAdd}>
              <Plus className="h-4 w-4 mr-2" /> Add Skill
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social & Web Links</CardTitle>
          <CardDescription>Link to your work and social profiles.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(state.socialLinks).map((key) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="capitalize flex items-center">
                {key === "website" && <Globe className="h-4 w-4 mr-2" />}
                {key === "instagram" && <Instagram className="h-4 w-4 mr-2" />}
                {key === "twitter" && <Twitter className="h-4 w-4 mr-2" />}
                {key === "linkedin" && <Linkedin className="h-4 w-4 mr-2" />}
                {key === "youtube" && <Youtube className="h-4 w-4 mr-2" />}
                {key}
              </Label>
              <Input
                id={key}
                value={state.socialLinks[key as keyof typeof state.socialLinks]}
                onChange={(e) =>
                  state.setProfileState({ socialLinks: { ...state.socialLinks, [key]: e.target.value } })
                }
                placeholder={`https://...`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Portfolio */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
          <CardDescription>Upload images of your best work.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {state.portfolioImages.map((img, index) => (
              <div key={index} className="relative group aspect-square">
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`Portfolio image ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <Button variant="destructive" size="icon" onClick={() => state.removePortfolioImage(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="aspect-square">
              <ImageUploader label="Add Image" onUpload={state.addPortfolioImage} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
