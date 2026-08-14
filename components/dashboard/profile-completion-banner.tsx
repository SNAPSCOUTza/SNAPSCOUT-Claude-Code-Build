"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"

interface ProfileCompletionBannerProps {
  profile: {
    full_name?: string
    display_name?: string
    bio?: string
    province?: string
    city?: string
    profile_picture?: string
    onboarding_completed?: boolean
  }
}

export default function ProfileCompletionBanner({ profile }: ProfileCompletionBannerProps) {
  const router = useRouter()

  // Calculate completion percentage
  const fieldsToCheck = [
    profile.full_name,
    profile.display_name,
    profile.bio,
    profile.province,
    profile.city,
    profile.profile_picture,
  ]

  const completedFields = fieldsToCheck.filter((field) => field && field.length > 0).length
  const totalFields = fieldsToCheck.length
  const completionPercentage = Math.round((completedFields / totalFields) * 100)

  // Don't show if profile is complete
  if (completionPercentage === 100) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900">Profile Complete!</h3>
              <p className="text-sm text-green-700">Your profile is fully set up and visible to the community.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Complete Your Profile</h3>
            <p className="text-sm text-gray-700 mb-3">
              Your profile is <strong>{completionPercentage}% complete</strong>. Add more information to increase your
              visibility and attract more opportunities.
            </p>

            <Progress value={completionPercentage} className="h-2 mb-4" />

            <div className="flex flex-wrap gap-2 mb-4">
              {!profile.full_name && (
                <span className="text-xs bg-white border border-yellow-300 text-yellow-800 px-2 py-1 rounded">
                  Add Full Name
                </span>
              )}
              {!profile.display_name && (
                <span className="text-xs bg-white border border-yellow-300 text-yellow-800 px-2 py-1 rounded">
                  Add Display Name
                </span>
              )}
              {!profile.bio && (
                <span className="text-xs bg-white border border-yellow-300 text-yellow-800 px-2 py-1 rounded">
                  Write Bio
                </span>
              )}
              {!profile.province && (
                <span className="text-xs bg-white border border-yellow-300 text-yellow-800 px-2 py-1 rounded">
                  Add Location
                </span>
              )}
              {!profile.profile_picture && (
                <span className="text-xs bg-white border border-yellow-300 text-yellow-800 px-2 py-1 rounded">
                  Upload Photo
                </span>
              )}
            </div>

            <Button
              onClick={() => router.push("/dashboard?tab=profile")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Complete Profile Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
