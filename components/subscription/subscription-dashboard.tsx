"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, CreditCard, Loader2, RefreshCw } from "lucide-react"

interface SubscriptionData {
  id: string
  subscription_id: string | null
  customer_id: string | null
  status: string | null
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

interface ProfileData {
  account_type: string
  is_profile_visible: boolean
  is_verified: boolean
  full_name: string | null
}

export default function SubscriptionDashboard({ userId }: { userId: string }) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const supabase = createClient()

  const fetchData = async () => {
    try {
      // Fetch subscription data
      const { data: subData } = await supabase.from("user_subscriptions").select("*").eq("user_id", userId).single()

      // Fetch profile data
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("account_type, is_profile_visible, is_verified, full_name")
        .eq("user_id", userId)
        .single()

      setSubscription(subData)
      setProfile(profileData)
    } catch (error) {
      console.error("[v0] Error fetching subscription data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [userId])

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

  const getPlanDetails = (accountType: string) => {
    switch (accountType) {
      case "Creator":
      case "Crew":
      case "Film Crew":
      case "Content Creator":
      case "Creator":
        return { name: "Creator/Crew Membership", price: "R129", interval: "monthly" }
      case "Studio":
      case "Store":
        return { name: "Studio/Store Membership", price: "R489", interval: "monthly" }
      case "Scout":
        return { name: "Scout (Free)", price: "Free", interval: "forever" }
      default:
        return { name: "Unknown Plan", price: "N/A", interval: "N/A" }
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading subscription details...</span>
      </div>
    )
  }

  if (!profile) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Unable to load profile information.</AlertDescription>
      </Alert>
    )
  }

  const planDetails = getPlanDetails(profile.account_type)
  const isScoutAccount = profile.account_type === "Scout"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscription Dashboard</h2>
          <p className="text-muted-foreground">Manage your subscription and profile visibility</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Subscription Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
          <CardDescription>Current plan and payment status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{planDetails.name}</h3>
              <p className="text-muted-foreground">
                {planDetails.price} {planDetails.interval !== "forever" && `/ ${planDetails.interval}`}
              </p>
            </div>
            <Badge className={`${getStatusColor(subscription?.status)} flex items-center gap-1`}>
              {getStatusIcon(subscription?.status)}
              {subscription?.status || (isScoutAccount ? "Free" : "No Subscription")}
            </Badge>
          </div>

          {!isScoutAccount && subscription && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Period Start</p>
                <p className="text-sm">{formatDate(subscription.current_period_start)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Payment Date</p>
                <p className="text-sm">{formatDate(subscription.current_period_end)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Visibility Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {profile.is_profile_visible ? (
              <Eye className="h-5 w-5 text-green-600" />
            ) : (
              <EyeOff className="h-5 w-5 text-red-600" />
            )}
            Profile Visibility
          </CardTitle>
          <CardDescription>Your profile visibility status on the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{profile.is_profile_visible ? "Profile is Live" : "Profile is Private"}</h3>
              <p className="text-sm text-muted-foreground">
                {profile.is_profile_visible
                  ? "Your profile is visible to clients and can receive project invitations"
                  : "Your profile is hidden from public view"}
              </p>
            </div>
            <Badge variant={profile.is_profile_visible ? "default" : "secondary"}>
              {profile.is_profile_visible ? "Live" : "Private"}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className={`h-4 w-4 ${profile.is_verified ? "text-green-600" : "text-gray-400"}`} />
            <span className={profile.is_verified ? "text-green-600" : "text-gray-500"}>
              {profile.is_verified ? "Profile Verified" : "Profile Not Verified"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status Alerts */}
      {subscription?.status === "unpaid" && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Your payment is overdue. Please update your payment method to keep your profile visible.
            <Button variant="outline" size="sm" className="ml-2 bg-transparent">
              Update Payment
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {subscription?.status === "cancelled" && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Your subscription has been cancelled. Your profile is no longer visible to clients.
            <Button variant="outline" size="sm" className="ml-2 bg-transparent">
              Reactivate Subscription
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!subscription && !isScoutAccount && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You don't have an active subscription. Subscribe now to make your profile visible to clients.
            <Button variant="outline" size="sm" className="ml-2 bg-transparent">
              Subscribe Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isScoutAccount && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            You have a free Scout account. Your profile is visible at no cost!
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
