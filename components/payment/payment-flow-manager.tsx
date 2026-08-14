"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Crown,
  Zap,
  RefreshCw,
  Eye,
  EyeOff,
  Globe,
  Lock,
} from "lucide-react"
import Link from "next/link"

interface PaymentFlowManagerProps {
  userId: string
  currentPlan?: string
  onPaymentSuccess?: () => void
}

interface SubscriptionStatus {
  id?: string
  status: string | null
  current_period_end: string | null
  payment_reference: string | null
  amount: number | null
}

interface ProfileStatus {
  account_type: string
  is_profile_visible: boolean
  is_verified: boolean
  display_name: string | null
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string
        email: string
        amount: number
        currency: string
        ref: string
        callback: (response: any) => void
        onClose: () => void
      }) => {
        openIframe: () => void
      }
    }
  }
}

const PLAN_PRICING = {
  "creators-crew": { amount: 60000, label: "SnapScout Creators & Crew", price: "R600" },
  "studios-stores": { amount: 30000, label: "SnapScout Studios & Stores", price: "R300" },
}

export default function PaymentFlowManager({ userId, currentPlan, onPaymentSuccess }: PaymentFlowManagerProps) {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [profile, setProfile] = useState<ProfileStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle")
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlan || "creators-crew")
  const [error, setError] = useState("")
  const [userEmail, setUserEmail] = useState("")

  const supabase = createClient()

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const fetchData = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserEmail(user.email || "")

        // Fetch subscription data
        const { data: subData } = await supabase.from("user_subscriptions").select("*").eq("user_id", userId).single()

        // Fetch profile data
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("account_type, is_profile_visible, is_verified, display_name")
          .eq("user_id", userId)
          .single()

        setSubscription(subData)
        setProfile(profileData)
      }
    } catch (error) {
      console.error("[v0] Error fetching payment data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [userId])

  const initializePayment = async (planId: string) => {
    setPaymentLoading(true)
    setError("")
    setPaymentStatus("processing")

    try {
      const planDetails = PLAN_PRICING[planId as keyof typeof PLAN_PRICING]
      if (!planDetails) {
        throw new Error("Invalid plan selected")
      }

      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          accountType: planId === "creators-crew" ? "Creator" : "Studio",
          userId: userId,
          planId: planId,
          amount: planDetails.amount,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to initialize payment")
      }

      if (window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
          email: userEmail,
          amount: planDetails.amount,
          currency: "ZAR",
          ref: result.reference,
          callback: (response) => {
            console.log("[v0] Payment successful:", response)
            verifyPayment(response.reference)
          },
          onClose: () => {
            console.log("[v0] Payment popup closed")
            setPaymentStatus("idle")
            setPaymentLoading(false)
          },
        })

        handler.openIframe()
      } else {
        throw new Error("Paystack not loaded")
      }
    } catch (err) {
      console.error("[v0] Payment initialization error:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize payment")
      setPaymentStatus("failed")
      setPaymentLoading(false)
    }
  }

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      })

      const result = await response.json()

      if (result.success && result.status === "success") {
        setPaymentStatus("success")
        setPaymentLoading(false)

        // Refresh data to show updated status
        await fetchData()

        // Call success callback
        onPaymentSuccess?.()

        setTimeout(() => {
          setPaymentStatus("idle")
        }, 3000)
      } else {
        setPaymentStatus("failed")
        setError("Payment verification failed. Please try again.")
        setPaymentLoading(false)
      }
    } catch (err) {
      setPaymentStatus("failed")
      setError("Failed to verify payment status")
      setPaymentLoading(false)
    }
  }

  const toggleProfileVisibility = async () => {
    if (!profile) return

    const newVisibility = !profile.is_profile_visible

    // Only allow enabling visibility if user has active subscription or is Scout
    if (newVisibility && profile.account_type !== "Scout" && subscription?.status !== "active") {
      setError("You need an active subscription to make your profile visible")
      return
    }

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ is_profile_visible: newVisibility })
        .eq("user_id", userId)

      if (error) {
        setError("Failed to update profile visibility")
      } else {
        setProfile({ ...profile, is_profile_visible: newVisibility })
      }
    } catch (err) {
      setError("Failed to update profile visibility")
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "unpaid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "unpaid":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading payment information...</span>
      </div>
    )
  }

  const isScoutAccount = profile?.account_type === "Scout"
  const hasActiveSubscription = subscription?.status === "active"
  const canGoLive = isScoutAccount || hasActiveSubscription

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment & Subscription Management</h2>
          <p className="text-gray-600">Manage your subscription and profile visibility</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Status Alerts */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {paymentStatus === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Payment successful! Your profile is now live and visible to clients.
          </AlertDescription>
        </Alert>
      )}

      {paymentStatus === "failed" && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>Payment failed. Please try again or contact support.</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Current Status</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade Plan</TabsTrigger>
          <TabsTrigger value="visibility">Profile Visibility</TabsTrigger>
        </TabsList>

        {/* Current Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Subscription Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {isScoutAccount ? "Free Scout Account" : profile?.account_type || "No Plan"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {isScoutAccount
                        ? "Free forever"
                        : subscription?.amount
                          ? `R${subscription.amount}/month`
                          : "No active subscription"}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(subscription?.status)} border`}>
                    {getStatusIcon(subscription?.status)}
                    <span className="ml-1">{subscription?.status || (isScoutAccount ? "Free" : "None")}</span>
                  </Badge>
                </div>

                {subscription?.current_period_end && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {profile?.is_profile_visible ? (
                    <Eye className="h-5 w-5 mr-2 text-green-600" />
                  ) : (
                    <EyeOff className="h-5 w-5 mr-2 text-red-600" />
                  )}
                  Profile Visibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {profile?.is_profile_visible ? "Profile is Live" : "Profile is Private"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {profile?.is_profile_visible ? "Visible to clients and discoverable" : "Hidden from public view"}
                    </p>
                  </div>
                  <Badge variant={profile?.is_profile_visible ? "default" : "secondary"}>
                    {profile?.is_profile_visible ? "Live" : "Private"}
                  </Badge>
                </div>

                <Button
                  onClick={toggleProfileVisibility}
                  variant={profile?.is_profile_visible ? "outline" : "default"}
                  className="w-full"
                  disabled={!canGoLive && !profile?.is_profile_visible}
                >
                  {profile?.is_profile_visible ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Make Private
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      {canGoLive ? "Make Live" : "Subscribe to Go Live"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Upgrade Plan Tab */}
        <TabsContent value="upgrade" className="space-y-6">
          {!hasActiveSubscription && !isScoutAccount && (
            <Alert className="border-blue-200 bg-blue-50">
              <Crown className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Subscribe to make your profile visible to clients and start receiving project invitations.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(PLAN_PRICING).map(([planId, planDetails]) => (
              <Card
                key={planId}
                className={`cursor-pointer transition-all ${
                  selectedPlan === planId ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedPlan(planId)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{planDetails.label}</span>
                    {planId === "studios-stores" && <Crown className="h-5 w-5 text-yellow-600" />}
                  </CardTitle>
                  <div className="text-3xl font-bold text-red-600">{planDetails.price}</div>
                  <p className="text-gray-600">per month</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {planId === "creators-crew" ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Professional profile visibility</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Unlimited portfolio uploads</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Direct client messaging</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Basic analytics dashboard</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Priority search placement</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Team member management</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Advanced analytics</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Custom branding options</span>
                        </div>
                      </>
                    )}
                  </div>

                  <Button
                    onClick={() => initializePayment(planId)}
                    disabled={paymentLoading || paymentStatus === "processing"}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {paymentLoading && selectedPlan === planId ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Subscribe Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Profile Visibility Tab */}
        <TabsContent value="visibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Visibility Control</CardTitle>
              <p className="text-gray-600">
                Control when your profile is visible to clients. You need an active subscription to make your profile
                live.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Private State */}
                <div
                  className={`p-6 border-2 rounded-lg ${!profile?.is_profile_visible ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                >
                  <div className="flex items-center mb-4">
                    <Lock className="h-8 w-8 text-red-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Private Profile</h3>
                      <p className="text-sm text-gray-600">Hidden from clients</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Profile not discoverable in search</li>
                    <li>• No client contact or invitations</li>
                    <li>• Can still edit and prepare profile</li>
                    <li>• No subscription required</li>
                  </ul>
                </div>

                {/* Live State */}
                <div
                  className={`p-6 border-2 rounded-lg ${profile?.is_profile_visible ? "border-green-500 bg-green-50" : "border-gray-200"}`}
                >
                  <div className="flex items-center mb-4">
                    <Globe className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Live Profile</h3>
                      <p className="text-sm text-gray-600">Visible to clients</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Discoverable in client searches</li>
                    <li>• Receive project invitations</li>
                    <li>• Direct client messaging</li>
                    <li>• {isScoutAccount ? "Free for Scout accounts" : "Requires active subscription"}</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={toggleProfileVisibility}
                  size="lg"
                  className={
                    profile?.is_profile_visible ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                  }
                  disabled={!canGoLive && !profile?.is_profile_visible}
                >
                  {profile?.is_profile_visible ? (
                    <>
                      <EyeOff className="h-5 w-5 mr-2" />
                      Make Profile Private
                    </>
                  ) : (
                    <>
                      <Eye className="h-5 w-5 mr-2" />
                      {canGoLive ? "Make Profile Live" : "Subscribe to Go Live"}
                    </>
                  )}
                </Button>
              </div>

              {!canGoLive && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <div className="flex items-center justify-between">
                      <span>You need an active subscription to make your profile visible to clients.</span>
                      <Button asChild size="sm" className="ml-4 bg-red-600 hover:bg-red-700">
                        <Link href="/subscribe/plans">
                          <Crown className="h-4 w-4 mr-2" />
                          Subscribe Now
                        </Link>
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
