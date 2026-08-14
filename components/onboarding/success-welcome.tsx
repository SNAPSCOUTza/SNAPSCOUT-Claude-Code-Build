"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react"
import type { OnboardingData } from "@/app/onboarding/page"
import Image from "next/image"

interface SuccessWelcomeProps {
  data: OnboardingData
  onComplete: () => void
}

export default function SuccessWelcome({ data, onComplete }: SuccessWelcomeProps) {
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
        return "You're ready to get discovered and booked!"
      case "client":
        return "You're ready to find amazing creative talent!"
      case "studio":
        return "You're ready to showcase your studio and equipment!"
      default:
        return "You're ready to explore SnapScout!"
    }
  }

  const getQuickWins = () => {
    switch (data.userType) {
      case "creator":
        return [
          "Your professional profile is live",
          "Start getting discovered by clients",
          "Upload your portfolio",
          "Set your availability calendar",
        ]
      case "client":
        return [
          "Browse thousands of verified creatives",
          "Filter by location and specialty",
          "View portfolios and rates",
          "Start booking talent",
        ]
      case "studio":
        return [
          "Your studio listing is active",
          "Showcase your equipment",
          "Manage bookings and availability",
          "Connect with local creatives",
        ]
      default:
        return ["Your profile is set up", "Explore the platform", "Connect with others", "Start creating"]
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-white">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative"
        >
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-yellow-400 rounded-full flex items-center justify-center relative">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 0.95, 1],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CEO%20%283000%20x%204800%20px%29.zip%20-%201.jpg-XDG5Q9FXuaMzUtssO8puHyVI3woHRY.jpeg"
                  alt="CEO Logo"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Additional glow effect */}
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-white/20 blur-sm"
              />
            </motion.div>

            {/* Sparkle Effects */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="absolute inset-0"
            >
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400" />
              <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-green-500" />
              <Sparkles className="absolute top-1/2 -left-4 w-5 h-5 text-primary" />
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
            <h1 className="text-5xl font-bold text-gray-900">🔥 You're in!</h1>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
              Welcome to SnapScout, {data.displayName}!
            </h2>
          </div>

          <p className="text-xl text-gray-700">{getWelcomeMessage()}</p>

          <Badge className="bg-green-100 text-green-800 border-green-300 px-4 py-2">{getUserTypeLabel()}</Badge>
        </motion.div>

        {/* Quick Wins */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Here's what you can do next:</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getQuickWins().map((win, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-800 text-sm">{win}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="space-y-4"
        >
          <Button
            onClick={onComplete}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
            size="lg"
          >
            Explore Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => {
              // Complete profile later logic
              onComplete()
            }}
          >
            Complete Profile Later
          </Button>
        </motion.div>

        {/* Social Sharing (Optional) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="pt-8 border-t border-gray-200"
        >
          <p className="text-sm text-gray-600 mb-4">Share your SnapScout journey:</p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
              onClick={() => {
                const text = `Just joined SnapScout as a ${getUserTypeLabel()}! 🔥 #SnapScout #CreativeNetwork`
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank")
              }}
            >
              Share on Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
              onClick={() => {
                const text = `Just joined SnapScout - South Africa's premier creative network! 🎬📸`
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://snapscout.co.za")}&summary=${encodeURIComponent(text)}`,
                  "_blank",
                )
              }}
            >
              Share on LinkedIn
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
