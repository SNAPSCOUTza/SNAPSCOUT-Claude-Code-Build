"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Sparkles, Camera, Search, Building2, Star } from "lucide-react"
import type { OnboardingData } from "@/app/onboarding/page"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface WelcomeToDashboardProps {
  data: OnboardingData
}

export default function WelcomeToDashboard({ data }: WelcomeToDashboardProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const onComplete = () => {
    localStorage.removeItem("snapscout-onboarding")
  }

  const handleGoToDashboard = () => {
    setIsNavigating(true)
    onComplete()
    router.push("/dashboard")
  }

  const getUserTypeIcon = () => {
    switch (data.userType) {
      case "creator":
        return Camera
      case "client":
        return Search
      case "studio":
        return Building2
      default:
        return Camera
    }
  }

  const getUserTypeLabel = () => {
    switch (data.userType) {
      case "creator":
        return "Creative Professional"
      case "client":
        return "Client/Scout"
      case "studio":
        return "Studio Owner"
      default:
        return "User"
    }
  }

  const getWelcomeMessage = () => {
    switch (data.userType) {
      case "creator":
        return "Your creative journey starts now!"
      case "client":
        return "Ready to discover amazing talent!"
      case "studio":
        return "Your studio is ready to shine!"
      default:
        return "Welcome to SnapScout!"
    }
  }

  const getNextSteps = () => {
    switch (data.userType) {
      case "creator":
        return ["Complete your portfolio", "Set your availability", "Upload sample work", "Connect with clients"]
      case "client":
        return ["Browse creative profiles", "Save your favorites", "Post your first project", "Start conversations"]
      case "studio":
        return ["Add equipment listings", "Upload studio photos", "Set booking rates", "Connect with creatives"]
      default:
        return ["Explore the platform", "Complete your profile", "Connect with others", "Start creating"]
    }
  }

  const Icon = getUserTypeIcon()

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative"
        >
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500 to-yellow-500 rounded-full flex items-center justify-center relative">
            <Icon className="w-16 h-16 text-white" />

            {/* Sparkle Effects */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="absolute inset-0"
            >
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400" />
              <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-green-500" />
              <Sparkles className="absolute top-1/2 -left-4 w-5 h-5 text-red-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-gray-900">🎉 Welcome!</h1>
            <h2 className="text-3xl font-bold text-gray-900">{data.displayName}</h2>
          </div>

          <p className="text-xl text-gray-700">{getWelcomeMessage()}</p>

          <Badge className="bg-red-100 text-red-700 border-red-200 px-4 py-2">{getUserTypeLabel()}</Badge>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Star className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-semibold text-gray-900">Your next steps:</h3>
                <Star className="w-6 h-6 text-yellow-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getNextSteps().map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-800 text-sm">{step}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="space-y-4"
        >
          <Button
            onClick={handleGoToDashboard}
            disabled={isNavigating}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 text-lg font-semibold shadow-lg transition-colors disabled:opacity-75"
            size="lg"
          >
            {isNavigating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                Navigating...
              </>
            ) : (
              <>
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-sm text-gray-600">You can always complete your profile later from your dashboard</p>
        </motion.div>
      </div>
    </div>
  )
}
