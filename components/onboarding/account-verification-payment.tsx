"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Mail, Loader, CheckCircle, Eye, EyeOff, Lock, ChevronDown, Check } from "lucide-react"

type OnboardingStep = "account" | "verification" | "payment"

interface OnboardingFormData {
  userType: "creator" | "scout" | "studio"
  email: string
  password: string
  confirmPassword: string
  displayName: string
  location: string
  bio: string
  profileImageUrl?: string
  specialties: string[]
  locationPreferences: string[]
  willingToTravel: boolean
  socialLinks: {
    instagram?: string
    youtube?: string
    tiktok?: string
    website?: string
  }
  selectedPlan: "creator" | "scout" | "studio"
}

export default function OnboardingAccountPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()

  const [currentStep, setCurrentStep] = useState<OnboardingStep>("account")
  const [formData, setFormData] = useState<OnboardingFormData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [paymentError, setPaymentError] = useState("")
  const [showFeatures, setShowFeatures] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  // Client-safe dev mode detection
  const isDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString().split("T")[1]
    console.log(`[v0] [${timestamp}]`, message)
    if (isDev) {
      setDebugInfo((prev) => [...prev.slice(-25), `${timestamp}: ${message}`])
    }
  }

  // Load saved onboarding data
  useEffect(() => {
    addDebugLog("Component mounted - loading onboarding data")

    const saved = localStorage.getItem("snapscout_onboarding")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        addDebugLog(`Loaded data: ${data.userType} / ${data.selectedPlan}`)
        setFormData(data)
      } catch (err) {
        addDebugLog("Failed to parse saved data")
        router.push("/onboarding")
      }
    } else {
      addDebugLog("No saved data found - redirecting to start")
      router.push("/onboarding")
    }
  }, [router])

  // Verify Supabase configuration on mount
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    addDebugLog(`Config check - URL exists: ${!!url}, Key exists: ${!!key}`)

    if (!url || !url.includes("supabase.co")) {
      addDebugLog("❌ Invalid or missing Supabase URL")
      setError("Configuration error. Please contact support.")
    }

    if (!key || key.length < 100) {
      addDebugLog("❌ Invalid or missing Supabase anon key")
      setError("Configuration error. Please contact support.")
    }

    // Test connection
    const testConnection = async () => {
      try {
        const { error } = await supabase.from("users").select("count").limit(1)
        addDebugLog(error ? `❌ Connection test failed: ${error.message}` : "✓ Supabase connection OK")
      } catch (err: any) {
        addDebugLog(`❌ Connection test error: ${err.message}`)
      }
    }

    if (formData) testConnection()
  }, [formData, supabase])

  // Password strength calculator
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    return Math.min(strength, 3)
  }

  const passwordStrength = formData?.password ? calculatePasswordStrength(formData.password) : 0

  // Form validation
  const validateForm = (): boolean => {
    if (!formData?.email || !formData?.password || !formData?.confirmPassword) {
      setError("All fields are required")
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

  // Step 8A: Create Account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !formData) return

    setLoading(true)
    setError("")
    addDebugLog("=== STARTING ACCOUNT CREATION ===")

    try {
      addDebugLog(`Creating account for: ${formData.email}`)

      // Call Supabase auth signup - ONLY auth, no profile creation yet
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            display_name: formData.displayName,
            user_type: formData.userType,
          },
        },
      })

      addDebugLog(`Auth response - Has user: ${!!authData?.user}, Has error: ${!!authError}`)

      if (authError) {
        addDebugLog(`Auth error: ${authError.name || "Unknown"} (Status: ${authError.status || "N/A"})`)

        // Handle specific error types
        if (authError.name === "AuthRetryableFetchError" || authError.status === 504) {
          throw new Error("Connection timeout. Please check your internet connection and try again.")
        }

        if (authError.status === 0 || authError.name?.includes("FetchError")) {
          throw new Error("Cannot connect to authentication service. Please check your network connection.")
        }

        if (authError.message?.includes("rate limit")) {
          throw new Error("Too many signup attempts. Please wait 5 minutes and try again.")
        }

        if (
          authError.message?.includes("already registered") ||
          authError.message?.includes("already been registered")
        ) {
          throw new Error("This email is already registered. Please sign in instead.")
        }

        throw new Error(authError.message || "Failed to create account")
      }

      if (!authData?.user) {
        addDebugLog("No user data returned from signup")
        throw new Error("Account creation failed - please try again")
      }

      addDebugLog(`User created with ID: ${authData.user.id}`)
      setUserId(authData.user.id)

      // Check if email confirmation is enabled
      const {
        data: { session },
      } = await supabase.auth.getSession()
      addDebugLog(
        `Session check: ${session ? "Has session (email confirmation disabled)" : "No session (email confirmation required)"}`,
      )

      if (session) {
        // Email confirmation disabled - create profile immediately
        addDebugLog("Email confirmation disabled - creating profile")
        await createUserProfile(authData.user.id)

        if (formData.selectedPlan === "scout") {
          // Free plan - activate immediately
          await supabase
            .from("user_profiles")
            .update({
              subscription_status: "active",
              is_profile_visible: true,
            })
            .eq("id", authData.user.id)

          localStorage.removeItem("snapscout_onboarding")
          addDebugLog("Redirecting to success page")
          router.push("/onboarding/success")
        } else {
          // Paid plan - go to payment
          addDebugLog("Moving to payment step")
          setCurrentStep("payment")
        }
      } else {
        // Email confirmation enabled - go to verification step first
        addDebugLog("Moving to verification step")
        setCurrentStep("verification")
      }
    } catch (err: any) {
      addDebugLog(`ERROR: ${err?.message || "Unknown error"}`)

      // Extract meaningful error message
      let errorMessage = "Failed to create account. Please try again."

      if (err?.message) {
        errorMessage = err.message
      } else if (err?.name === "AuthRetryableFetchError") {
        errorMessage = "Connection timeout. Please check your internet and try again."
      } else if (err?.status === 504) {
        errorMessage = "Server timeout. Please wait a moment and try again."
      } else if (err?.status === 0) {
        errorMessage = "Network error. Please check your connection."
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
      addDebugLog("=== ACCOUNT CREATION COMPLETE ===")
    }
  }

  const createUserProfile = async (id: string) => {
    if (!formData) return

    addDebugLog("Creating user profile in database...")

    const profileData = {
      id: id,
      user_id: id,
      email: formData.email,
      display_name: formData.displayName,
      user_type: formData.userType,
      location: formData.location,
      bio: formData.bio,
      profile_picture: formData.profileImageUrl || null,
      specializations: formData.specialties || [],
      provinces: formData.locationPreferences?.join(", ") || "",
      willing_to_travel: formData.willingToTravel || false,
      instagram: formData.socialLinks?.instagram || null,
      youtube: formData.socialLinks?.youtube || null,
      website: formData.socialLinks?.website || null,
      account_type: formData.selectedPlan,
      subscription_status: "pending",
      is_profile_visible: false,
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error: profileError } = await supabase.from("user_profiles").insert(profileData)

    if (profileError) {
      addDebugLog(`Profile error: ${profileError.message} (Code: ${profileError.code})`)
      throw new Error(`Profile creation failed: ${profileError.message}`)
    }

    addDebugLog("Profile created successfully")
  }

  useEffect(() => {
    if (currentStep !== "verification") return

    addDebugLog("Starting email verification polling...")

    const checkVerification = setInterval(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.email_confirmed_at) {
        addDebugLog("Email verified!")
        clearInterval(checkVerification)

        // Create profile after verification
        try {
          await createUserProfile(user.id)
        } catch (err: any) {
          addDebugLog(`Profile creation error: ${err.message}`)
          setError(err.message)
          return
        }

        // For free users, activate and redirect
        if (formData?.selectedPlan === "scout") {
          await supabase
            .from("user_profiles")
            .update({
              subscription_status: "active",
              is_profile_visible: true,
            })
            .eq("id", user.id)

          localStorage.removeItem("snapscout_onboarding")
          router.push("/onboarding/success")
        } else {
          // For paid users, go to payment
          setCurrentStep("payment")
        }
      }
    }, 5000) // Check every 5 seconds

    return () => {
      addDebugLog("Stopping verification polling")
      clearInterval(checkVerification)
    }
  }, [currentStep, formData, supabase, router])

  // Resend verification email
  const handleResendEmail = async () => {
    if (resendCooldown > 0 || !formData?.email) return

    addDebugLog("Resending verification email...")
    setResendCooldown(60)

    try {
      await supabase.auth.resend({
        type: "signup",
        email: formData.email,
      })

      addDebugLog("✓ Verification email resent")

      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err: any) {
      addDebugLog(`❌ Resend failed: ${err.message}`)
      setError(err.message)
    }
  }

  // Step 8C: Payment processing
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setLoading(true)
    setPaymentError("")
    addDebugLog("=== STARTING PAYMENT ===")

    try {
      const planCode = formData.selectedPlan === "creator" ? "PLN_creator_monthly" : "PLN_studio_monthly"
      const amount = formData.selectedPlan === "creator" ? 60 : 489

      addDebugLog(`Plan: ${formData.selectedPlan}, Code: ${planCode}, Amount: R${amount}`)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      addDebugLog("Initializing Paystack...")

      // Initialize Paystack
      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: user.email!,
        amount: amount * 100, // Convert to kobo
        currency: "ZAR",
        plan: planCode,
        ref: `SUB_${user.id}_${Date.now()}`,

        callback: async (response: any) => {
          try {
            addDebugLog(`Payment callback - Reference: ${response.reference}`)

            // Update user status
            await supabase
              .from("user_profiles")
              .update({
                subscription_status: "active",
                is_profile_visible: true,
                paystack_subscription_code: response.reference,
              })
              .eq("id", user.id)

            // Create subscription record
            await supabase.from("user_subscriptions").insert({
              user_id: user.id,
              plan_code: planCode,
              status: "active",
              paystack_subscription_code: response.reference,
              amount: amount * 100, // in kobo
              currency: "ZAR",
            })

            addDebugLog("Subscription created")

            // Clear onboarding data
            localStorage.removeItem("snapscout_onboarding")

            // Redirect to success
            router.push("/onboarding/success")
          } catch (err: any) {
            addDebugLog(`Payment callback error: ${err.message}`)
            setPaymentError(err.message || "Payment verification failed")
            setLoading(false)
          }
        },

        onClose: () => {
          addDebugLog("Payment modal closed by user")
          setLoading(false)
          setPaymentError("Payment cancelled. You can try again when ready.")
        },
      })

      handler.openIframe()
    } catch (err: any) {
      addDebugLog(`Payment error: ${err.message}`)
      setPaymentError(err.message || "Payment failed. Please try again.")
      setLoading(false)
    }
  }

  // Loading state
  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      {/* Load Paystack Script */}
      <script src="https://js.paystack.co/v1/inline.js" async />

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-yellow-400 transition-all duration-500"
          style={{
            width: currentStep === "account" ? "87.5%" : currentStep === "verification" ? "93.75%" : "100%",
          }}
        />
      </div>

      {/* Dev Mode Indicator */}
      {isDev && (
        <div className="fixed top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold z-50 shadow-lg">
          DEV MODE
        </div>
      )}

      {/* Debug Panel */}
      {isDev && debugInfo.length > 0 && (
        <div className="fixed bottom-4 left-4 max-w-md max-h-80 overflow-auto bg-gray-900 text-green-400 text-[10px] p-4 rounded-lg font-mono shadow-2xl z-50 border border-green-600">
          <div className="flex justify-between items-center mb-2 sticky top-0 bg-gray-900">
            <div className="font-bold text-green-300">Debug Log</div>
            <button onClick={() => setDebugInfo([])} className="text-red-400 hover:text-red-300 text-xs">
              Clear
            </button>
          </div>
          <div className="space-y-0.5">
            {debugInfo.map((log, i) => (
              <div key={i} className="leading-tight">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 8A: Account Creation Form */}
      {currentStep === "account" && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-600">One last step to join South Africa's creative network</p>
          </div>

          <form onSubmit={handleCreateAccount} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password || ""}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none pr-12 transition-all"
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 flex gap-1">
                  <div
                    className={`h-1 flex-1 rounded transition-all duration-300 ${passwordStrength >= 1 ? "bg-red-600" : "bg-gray-200"}`}
                  />
                  <div
                    className={`h-1 flex-1 rounded transition-all duration-300 ${passwordStrength >= 2 ? "bg-yellow-400" : "bg-gray-200"}`}
                  />
                  <div
                    className={`h-1 flex-1 rounded transition-all duration-300 ${passwordStrength >= 3 ? "bg-green-600" : "bg-gray-200"}`}
                  />
                </div>
              )}
              {formData.password && (
                <p className="text-xs text-gray-500 mt-1">
                  {passwordStrength === 1 && "Weak password"}
                  {passwordStrength === 2 && "Medium password"}
                  {passwordStrength === 3 && "Strong password"}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword || ""}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none pr-12 transition-all"
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <span>⚠️</span> Passwords do not match
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start pt-2">
              <input
                type="checkbox"
                id="terms"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-600 cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to SnapScout's{" "}
                <a href="/terms" target="_blank" className="text-red-600 hover:underline font-medium" rel="noreferrer">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-red-600 hover:underline font-medium"
                  rel="noreferrer"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-4 animate-shake">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/signin" className="text-red-600 hover:underline font-semibold transition-colors">
              Sign In
            </a>
          </p>
        </div>
      )}

      {/* Step 8B: Email Verification */}
      {currentStep === "verification" && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <Mail className="w-20 h-20 mx-auto text-yellow-400 animate-bounce" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Inbox!</h1>
          <p className="text-gray-600 mb-4">We sent a verification link to</p>
          <p className="text-red-600 font-semibold text-lg mb-6">{formData.email}</p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 leading-relaxed">
              Click the link in the email to verify your account. This page will automatically update once verified.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <Loader className="w-5 h-5 animate-spin text-red-600" />
            <span className="text-gray-600 font-medium">Waiting for verification...</span>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={resendCooldown > 0}
              className="w-full py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : "Resend verification email"}
            </button>

            <button
              onClick={() => setCurrentStep("account")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline"
            >
              Change email address
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
        </div>
      )}

      {/* Step 8C: Payment Processing */}
      {currentStep === "payment" && (
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-green-600 font-semibold">Email verified!</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Activate Your Subscription</h1>
          <p className="text-gray-600 text-center mb-6">Get full access to SnapScout and start getting booked</p>

          {/* Plan Summary Card */}
          <div className="bg-gradient-to-br from-red-50 to-yellow-50 border-2 border-red-600 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {formData.selectedPlan === "creator" ? "Creator Plan" : "Studio Plan"}
                </h3>
                <p className="text-sm text-gray-600">Monthly subscription</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-red-600">R{formData.selectedPlan === "creator" ? "60" : "489"}</p>
                <p className="text-sm text-gray-600">/month</p>
              </div>
            </div>

            <button
              onClick={() => setShowFeatures(!showFeatures)}
              className="text-sm text-red-600 font-medium flex items-center gap-1 hover:underline transition-all"
            >
              {showFeatures ? "Hide" : "Show"} features
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${showFeatures ? "rotate-180" : ""}`}
              />
            </button>

            {showFeatures && (
              <ul className="mt-4 space-y-2 animate-fadeIn">
                {(formData.selectedPlan === "creator"
                  ? [
                      "Full portfolio showcase",
                      "Priority in search results",
                      "Booking management system",
                      "Direct client messaging",
                      "Analytics dashboard",
                      "Verified badge",
                    ]
                  : [
                      "List unlimited equipment",
                      "Studio space bookings",
                      "Multiple locations",
                      "Advanced analytics",
                      "Priority listing",
                      "Team management",
                      "Custom branding",
                      "API access",
                    ]
                ).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Payment Error */}
          {paymentError && (
            <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-4 mb-4 animate-shake">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-red-800 font-medium">{paymentError}</p>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <form onSubmit={handlePayment}>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Activate Subscription
                  <Lock className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            <span>Secure payment powered by Paystack</span>
          </div>

          <p className="text-xs text-center text-gray-500 mt-4">
            Your card will be charged R{formData.selectedPlan === "creator" ? "60" : "489"} monthly. Cancel anytime.
          </p>
        </div>
      )}
    </div>
  )
}
