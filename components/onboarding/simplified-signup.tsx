"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader, Eye, EyeOff, Camera, Search, Building2 } from "lucide-react"

type AccountType = "content_creator" | "scout" | "studio"

interface SignupData {
  account_type: AccountType | null
  email: string
  password: string
  confirmPassword: string
  display_name: string
}

export default function SimplifiedSignup() {
  const router = useRouter()

  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [formData, setFormData] = useState<SignupData>({
    account_type: null,
    email: "",
    password: "",
    confirmPassword: "",
    display_name: "",
  })

  const accountTypes = [
    {
      id: "content_creator" as AccountType,
      title: "Creator",
      description: "Photographer, videographer, or creative professional",
      icon: Camera,
      price: "R60/month",
    },
    {
      id: "scout" as AccountType,
      title: "Scout / Client",
      description: "Looking to hire creative professionals",
      icon: Search,
      price: "Free",
    },
    {
      id: "studio" as AccountType,
      title: "Studio / Store",
      description: "Rent equipment or studio space",
      icon: Building2,
      price: "R489/month",
    },
  ]

  const handleSelectAccountType = (type: AccountType) => {
    setFormData({ ...formData, account_type: type })
    setStep(2)
  }

  const validateForm = (): boolean => {
    setError("")

    if (!formData.display_name.trim()) {
      setError("Please enter your name")
      return false
    }

    if (!formData.email.trim()) {
      setError("Please enter your email")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    if (!termsAccepted) {
      setError("Please accept the Terms of Service")
      return false
    }

    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      console.log("[v0] Starting signup via custom API for:", formData.email)

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          display_name: formData.display_name,
          account_type: formData.account_type,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Signup failed")
      }

      console.log("[v0] Signup result:", result)

      router.push("/auth/login?signup=success&email=" + encodeURIComponent(formData.email))
    } catch (err: any) {
      console.error("[v0] Signup error:", err)
      setError(err.message || "Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center p-4">
      {/* Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200">
        <div className="h-full bg-red-600 transition-all duration-300" style={{ width: step === 1 ? "50%" : "100%" }} />
      </div>

      {/* Step 1: Account Type Selection */}
      {step === 1 && (
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join SnapScout</h1>
            <p className="text-gray-600">South Africa's creative network. What describes you best?</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {accountTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelectAccountType(type.id)}
                className="bg-white rounded-xl p-6 text-left shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:border-red-600 border-2 border-transparent group"
              >
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600 transition-colors">
                  <type.icon className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{type.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                <span className="text-sm font-semibold text-red-600">{type.price}</span>
              </button>
            ))}
          </div>

          <p className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/auth/login" className="text-red-600 hover:underline font-semibold">
              Sign In
            </a>
          </p>
        </div>
      )}

      {/* Step 2: Account Details */}
      {step === 2 && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={() => setStep(1)}
            className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1 text-sm"
          >
            ← Back
          </button>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
            <p className="text-gray-600 text-sm">
              {accountTypes.find((t) => t.id === formData.account_type)?.title} account
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none pr-12"
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                placeholder="Re-enter password"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords don't match</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-red-600 rounded"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <a href="/terms" className="text-red-600 hover:underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-red-600 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center mt-4 text-xs text-gray-500">
            You can complete your profile and add subscription later
          </p>
        </div>
      )}
    </div>
  )
}
