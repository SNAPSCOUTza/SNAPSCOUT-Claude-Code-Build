"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { X, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function WelcomeBanner({ profile }: { profile: any }) {
  const searchParams = useSearchParams()
  const isNewUser = searchParams.get("welcome") === "true"
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (isNewUser || (profile?.profile_completion_percentage || 0) < 50) {
      setShowBanner(true)
    }
  }, [isNewUser, profile])

  if (!showBanner) return null

  const completionPercent = profile?.profile_completion_percentage || 10
  const isPaid = profile?.subscription_status === "active"
  const accountType = profile?.account_type?.toLowerCase()
  const isScout = accountType === "scout"

  return (
    <div className="bg-gradient-to-r from-red-600 to-yellow-500 rounded-xl p-6 mb-6 text-white relative">
      <button onClick={() => setShowBanner(false)} className="absolute top-4 right-4 text-white/70 hover:text-white">
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-xl font-bold mb-2">{isNewUser ? "🔥 Welcome to SnapScout!" : "Complete your profile"}</h2>

      <p className="text-white/90 mb-4">
        {isNewUser
          ? "Your account is ready! Complete your profile to get discovered."
          : `Your profile is ${completionPercent}% complete. Add more details to get more visibility.`}
      </p>

      {/* Progress bar */}
      <div className="bg-white/20 rounded-full h-2 mb-4">
        <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${completionPercent}%` }} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Complete Profile
          <ArrowRight className="w-4 h-4" />
        </Link>

        {!isPaid && !isScout && (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors"
          >
            Activate Subscription
          </Link>
        )}
      </div>
    </div>
  )
}
