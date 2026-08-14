"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function OAuthConsentPage() {
  const router = useRouter()

  useEffect(() => {
    const handleConsent = async () => {
      const supabase = createClient()

      // Check if user already has a session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // User is already signed in, redirect to dashboard
        router.push("/dashboard")
      } else {
        // No session, redirect to login
        router.push("/auth/login?message=Please sign in to continue")
      }
    }

    handleConsent()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing...</p>
      </div>
    </div>
  )
}
