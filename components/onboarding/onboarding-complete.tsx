"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star, ArrowRight, Users, Briefcase, Camera } from "lucide-react"
import Image from "next/image"

interface OnboardingCompleteProps {
  data: any
  onComplete: () => void
}

export default function OnboardingComplete({ data, onComplete }: OnboardingCompleteProps) {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    setShowAnimation(true)
  }, [])

  const getAccountTypeIcon = () => {
    switch (data.accountType) {
      case "film_crew":
        return <Briefcase className="h-8 w-8 text-white" />
      case "content_creator":
        return <Camera className="h-8 w-8 text-white" />
      default:
        return <Users className="h-8 w-8 text-white" />
    }
  }

  const getAccountTypeTitle = () => {
    switch (data.accountType) {
      case "film_crew":
        return "Film Crew Professional"
      case "content_creator":
        return "Creator"
      case "studio":
        return "Studio"
      case "store":
        return "Store/Brand"
      case "scout":
        return "Scout"
      default:
        return "Professional"
    }
  }

  const nextSteps = [
    {
      title: "Complete your portfolio",
      description: "Upload your best work samples",
      completed: !!data.portfolioUrl,
    },
    {
      title: "Set your availability",
      description: "Update your current status",
      completed: !!data.availability,
    },
    {
      title: "Upload sample work",
      description: "Showcase your skills",
      completed: !!data.reelUrl,
    },
    {
      title: "Connect with clients",
      description: "Start getting discovered",
      completed: false,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Success Animation */}
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-600 mb-6 transform transition-all duration-1000 ${showAnimation ? "scale-100 rotate-0" : "scale-0 rotate-180"}`}
        >
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CEO%20%283000%20x%204800%20px%29.zip%20-%201.jpg-XDG5Q9FXuaMzUtssO8puHyVI3woHRY.jpeg"
            alt="CEO Logo"
            width={60}
            height={60}
            className="rounded-full border-2 border-white animate-pulse"
          />
        </div>

        <div
          className={`transform transition-all duration-700 delay-300 ${showAnimation ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SnapScout!</h1>
          <p className="text-lg text-gray-600 mb-4">Your professional profile is ready</p>

          <Badge className="bg-red-100 text-red-800 px-4 py-2">{getAccountTypeTitle()}</Badge>
        </div>
      </div>

      {/* Profile Summary */}
      <Card
        className={`transform transition-all duration-700 delay-500 ${showAnimation ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              {getAccountTypeIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{data.displayName || "Professional"}</h3>
              <p className="text-gray-600">
                {data.city}, {data.province}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-red-600">{data.selectedRoles?.length || 0}</p>
              <p className="text-sm text-gray-600">Roles</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{data.equipment?.length || 0}</p>
              <p className="text-sm text-gray-600">Equipment</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{data.experienceLevel?.split(" ")[0] || "New"}</p>
              <p className="text-sm text-gray-600">Experience</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{data.availability === "available" ? "✓" : "○"}</p>
              <p className="text-sm text-gray-600">Available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card
        className={`transform transition-all duration-700 delay-700 ${showAnimation ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900">Your next steps:</h3>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <CheckCircle className={`h-5 w-5 ${step.completed ? "text-green-500" : "text-gray-300"}`} />
                <div>
                  <p className="font-medium text-gray-900">{step.title}</p>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Button */}
      <div
        className={`text-center transform transition-all duration-700 delay-1000 ${showAnimation ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      >
        <Button onClick={onComplete} size="lg" className="bg-red-600 hover:bg-red-700 px-8 py-3 text-lg">
          Go to Dashboard
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <p className="text-sm text-gray-600 mt-4">
          Start building your professional network and get discovered by clients
        </p>
      </div>
    </div>
  )
}
