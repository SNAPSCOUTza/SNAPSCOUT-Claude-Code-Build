"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowRight, Sparkles } from "lucide-react"
import type { OnboardingData } from "@/app/onboarding/page"
import { useOnboarding } from "@/app/onboarding/onboarding-provider"
import { useEffect } from "react"

interface ProfileCompletionProps {
  onNext: () => void
  onPrev: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

export default function ProfileCompletion({ onNext, onPrev, data, updateData }: ProfileCompletionProps) {
  const { saveProfile, isSaving } = useOnboarding()

  const handleNext = async () => {
    await saveProfile()
    onNext()
  }

  // Pre-save profile when component mounts if user is authenticated
  useEffect(() => {
    saveProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white border-gray-200 shadow-lg">
        <CardHeader className="text-center">
          <Sparkles className="w-12 h-12 mx-auto text-yellow-500" />
          <CardTitle className="text-3xl font-bold text-gray-900 mt-4">Almost there!</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Let's add some final touches to make your profile stand out.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-base font-semibold text-gray-800">
              Your Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell us about your passion, experience, and what makes you unique as a creative..."
              value={data.bio}
              onChange={(e) => updateData({ bio: e.target.value })}
              className="min-h-[120px] text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profilePicture" className="text-base font-semibold text-gray-800">
              Profile Picture URL
            </Label>
            <Input
              id="profilePicture"
              placeholder="https://example.com/your-photo.jpg"
              value={data.profilePicture}
              onChange={(e) => updateData({ profilePicture: e.target.value })}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold text-gray-800">Social & Portfolio Links</Label>
            <div className="space-y-3">
              <Input
                placeholder="Instagram URL"
                value={data.socialLinks.instagram}
                onChange={(e) => updateData({ socialLinks: { ...data.socialLinks, instagram: e.target.value } })}
              />
              <Input
                placeholder="YouTube/Vimeo URL"
                value={data.youtube_vimeo}
                onChange={(e) => updateData({ youtube_vimeo: e.target.value })}
              />
              <Input
                placeholder="LinkedIn URL"
                value={data.linkedin}
                onChange={(e) => updateData({ linkedin: e.target.value })}
              />
              <Input
                placeholder="Personal Website/Portfolio URL"
                value={data.socialLinks.website}
                onChange={(e) => updateData({ socialLinks: { ...data.socialLinks, website: e.target.value } })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleNext}
              disabled={isSaving}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Profile
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
