"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, ArrowLeft, Instagram, Youtube, Film, Globe, InstagramIcon as Tiktok } from 'lucide-react'
import type { OnboardingData } from "@/app/onboarding/page"

interface ProfileBasicsProps {
  onNext: () => void
  onPrev: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

export default function ProfileBasics({ onNext, onPrev, data, updateData }: ProfileBasicsProps) {
  const handleSocialLinkChange = (platform: keyof OnboardingData['socialLinks'], value: string) => {
    updateData({
      socialLinks: {
        ...data.socialLinks,
        [platform]: value
      }
    })
  }

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    updateData({ [field]: value })
  }

  const isFormValid = data.displayName.trim() !== '' && data.bio.trim() !== ''

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Tell Us About Yourself
        </h1>
        <p className="text-lg text-gray-700">
          This information will form the core of your public profile.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-8"
      >
        {/* Basic Info */}
        <Card className="bg-white border-gray-300 shadow-lg">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-900 font-medium">Display Name <span className="text-red-600">*</span></Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your professional name or alias"
                value={data.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-900 font-medium">Bio <span className="text-red-600">*</span></Label>
              <Textarea
                id="bio"
                placeholder="A short introduction about yourself, your work, and your passion."
                value={data.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePicture" className="text-gray-900 font-medium">Profile Picture URL (Optional)</Label>
              <Input
                id="profilePicture"
                type="url"
                placeholder="https://yourimage.com/profile.jpg"
                value={data.profilePicture}
                onChange={(e) => handleInputChange('profilePicture', e.target.value)}
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="bg-white border-gray-300 shadow-lg">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Social Links (Optional)</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-gray-900 font-medium">Instagram</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-700 text-sm">
                    <Instagram className="h-4 w-4" />
                  </span>
                  <Input
                    id="instagram"
                    type="url"
                    placeholder="@username"
                    value={data.socialLinks.instagram}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    className="rounded-l-none bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube_vimeo" className="text-gray-900 font-medium">YouTube / Vimeo</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-700 text-sm">
                    <Youtube className="h-4 w-4" />
                  </span>
                  <Input
                    id="youtube_vimeo"
                    type="url"
                    placeholder="Channel URL"
                    value={data.youtube_vimeo}
                    onChange={(e) => handleInputChange('youtube_vimeo', e.target.value)}
                    className="rounded-l-none bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok" className="text-gray-900 font-medium">TikTok</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-700 text-sm">
                    <Tiktok className="h-4 w-4" />
                  </span>
                  <Input
                    id="tiktok"
                    type="url"
                    placeholder="@username"
                    value={data.socialLinks.tiktok}
                    onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)}
                    className="rounded-l-none bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-gray-900 font-medium">Website</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-700 text-sm">
                    <Globe className="h-4 w-4" />
                  </span>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={data.socialLinks.website}
                    onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                    className="rounded-l-none bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imdbProfile" className="text-gray-900 font-medium">IMDB Profile</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-700 text-sm">
                    <Film className="h-4 w-4" />
                  </span>
                  <Input
                    id="imdbProfile"
                    type="url"
                    placeholder="https://imdb.com/name/yourprofile"
                    value={data.imdbProfile}
                    onChange={(e) => handleInputChange('imdbProfile', e.target.value)}
                    className="rounded-l-none bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-gray-900 font-medium">LinkedIn Profile</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-700 text-sm">
                    <Film className="h-4 w-4" />
                  </span>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={data.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    className="rounded-l-none bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8 pb-8">
          <Button
            variant="ghost"
            onClick={onPrev}
            className="text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={onNext}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg"
            size="lg"
            disabled={!isFormValid}
          >
            Next: Specialization
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
