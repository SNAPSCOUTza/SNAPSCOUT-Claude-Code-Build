"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { CheckCircle, MapPin, Star, Loader } from "lucide-react"

export default function OnboardingSuccessPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/signin")
          return
        }

        const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (error) {
          console.log("[v0] Error loading user data:", error)
          return
        }

        setUserData(data)
      } catch (err) {
        console.log("[v0] Failed to load user data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-12 h-12 animate-spin text-red-600" />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load profile data</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
      {/* Progress Bar - Complete */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-green-600 z-50" />

      {/* Success Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-12 text-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-red-200 rounded-full opacity-20 animate-pulse" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-200 rounded-full opacity-20 animate-pulse delay-700" />
          <div className="absolute top-1/2 right-20 w-16 h-16 bg-green-200 rounded-full opacity-20 animate-pulse delay-1000" />
        </div>

        {/* Fire Emoji with Animation */}
        <div className="text-6xl mb-4 animate-bounce">🔥</div>

        {/* Headline */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to SnapScout, {userData.display_name}!</h1>

        {/* Dynamic Subheading */}
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {userData.user_type === "creator" &&
            "Your profile is live! Start getting booked by clients across South Africa."}
          {userData.user_type === "scout" && "You're all set! Start discovering and hiring talented creatives."}
          {userData.user_type === "studio" && "Your studio is ready! Clients can now book your space and equipment."}
        </p>

        {/* Quick Wins Section */}
        <div className="bg-gradient-to-r from-green-50 to-yellow-50 border-2 border-green-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <span>You're all set!</span>
            <span className="text-2xl">🎉</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Profile Created</p>
                <p className="text-sm text-gray-600">Your account is verified and active</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">
                  {userData.selected_plan !== "scout" ? "Subscription Active" : "Free Access Enabled"}
                </p>
                <p className="text-sm text-gray-600">
                  {userData.selected_plan !== "scout"
                    ? `${userData.selected_plan === "creator" ? "Creator" : "Studio"} plan activated`
                    : "Browse and hire creatives"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Location Set</p>
                <p className="text-sm text-gray-600">
                  Active in {userData.location_preferences?.length || 0}{" "}
                  {userData.location_preferences?.length === 1 ? "area" : "areas"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Ready to Connect</p>
                <p className="text-sm text-gray-600">Start building your reputation</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Enter Dashboard
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <button
            onClick={() => router.push("/profile/edit")}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all"
          >
            Complete Profile Later
          </button>
        </div>

        {/* Social Share Prompt */}
        <p className="text-sm text-gray-500 mt-6 flex items-center justify-center gap-2">
          <span>Excited? Share your journey with</span>
          <span className="font-semibold text-red-600">#SnapScoutSA</span>
        </p>
      </div>
    </div>
  )
}
