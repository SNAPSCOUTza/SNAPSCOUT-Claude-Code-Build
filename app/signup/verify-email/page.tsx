"use client"

import { useSearchParams } from "next/navigation"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <Mail className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
        <p className="text-gray-600 mb-4">We sent a verification link to</p>
        <p className="text-red-600 font-semibold mb-6">{email || "your email"}</p>
        <p className="text-sm text-gray-500">Click the link in the email to activate your account.</p>

        <Link href="/auth/login" className="inline-block mt-6 text-red-600 hover:underline font-medium">
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
