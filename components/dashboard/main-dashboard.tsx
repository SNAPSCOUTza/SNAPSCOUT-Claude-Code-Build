"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Eye,
  EyeOff,
  Crown,
  CheckCircle,
  AlertTriangle,
  Users,
  Star,
  Zap,
  Shield,
  Globe,
  Camera,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import { getAccountTypeDisplay } from "@/types/account-types"

interface UserProfile {
  id: string
  full_name: string | null
  display_name: string | null
  account_type: string
  is_profile_visible: boolean
  is_verified: boolean
  profile_picture: string | null
  bio: string | null
  city: string | null
  province: string | null
}

interface UserSubscription {
  id: string
  status: string | null
  current_period_end: string | null
  created_at: string
}

export default function MainDashboard({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const { data: profileData } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single()

        // Fetch subscription data
        const { data: subData } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle()

        setProfile(profileData)
        setSubscription(subData)
      } catch (error) {
        console.error("[v0] Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
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

  const accountTypeLower = profile.account_type?.toLowerCase()
  const isScoutAccount = accountTypeLower === "scout"
  const isSubscribed = subscription?.status === "active"
  const canGoLive = isScoutAccount || isSubscribed

  // Calculate profile completion
  const profileFields = [
    profile.full_name,
    profile.display_name,
    profile.bio,
    profile.city,
    profile.province,
    profile.profile_picture,
  ]
  const completedFields = profileFields.filter((field) => field && field.trim() !== "").length
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100)

  const getAccountStatusInfo = () => {
    if (isScoutAccount) {
      return {
        title: "Free Scout Account",
        description: "Your profile is visible at no cost",
        color: "green",
        icon: Shield,
        status: "active",
      }
    } else if (isSubscribed) {
      return {
        title: "Premium Subscriber",
        description: "Your profile is live and discoverable",
        color: "blue",
        icon: Crown,
        status: "active",
      }
    } else {
      return {
        title: "Basic Account",
        description: "Subscribe to make your profile visible",
        color: "gray",
        icon: Users,
        status: "inactive",
      }
    }
  }

  const accountInfo = getAccountStatusInfo()
  const StatusIcon = accountInfo.icon

  const subscriptionPlans = [
    {
      name: "SnapScout Creators & Crew",
      price: "R60",
      interval: "month",
      description: "Perfect for individual creators and freelancers",
      features: [
        "Profile visible to clients",
        "Unlimited portfolio uploads",
        "Direct client messaging",
        "Gig application tracking",
        "Professional badge",
      ],
      targetUsers: ["Film Crew", "Creator"],
      popular: false,
    },
    {
      name: "SnapScout Studios & Stores",
      price: "R300",
      interval: "month",
      description: "Ideal for production companies and agencies",
      features: [
        "Enhanced profile visibility",
        "Priority in search results",
        "Team member profiles",
        "Advanced analytics",
        "Premium support",
        "Custom branding options",
      ],
      targetUsers: ["Studio"],
      popular: true,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Account Status Overview */}
      <Card
        className={`border-l-4 ${
          accountInfo.status === "active" ? "border-l-green-500 bg-green-50" : "border-l-red-500 bg-red-50"
        }`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-full ${
                  accountInfo.status === "active" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                }`}
              >
                <StatusIcon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">{accountInfo.title}</CardTitle>
                <CardDescription className="text-base">{accountInfo.description}</CardDescription>
              </div>
            </div>
            <Badge
              className={`${
                accountInfo.status === "active"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-red-100 text-red-800 border-red-200"
              }`}
            >
              {accountInfo.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Profile Visibility Status */}
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
              {profile.is_profile_visible ? (
                <Eye className="h-5 w-5 text-green-600" />
              ) : (
                <EyeOff className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {profile.is_profile_visible ? "Profile is Live" : "Profile is Private"}
                </p>
                <p className="text-xs text-gray-600">
                  {profile.is_profile_visible ? "Visible to clients" : "Hidden from public view"}
                </p>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs font-medium">{profileCompletion}%</span>
                </div>
              </div>
              <div>
                <p className="font-medium text-sm">Profile Complete</p>
                <Progress value={profileCompletion} className="w-16 h-2" />
              </div>
            </div>

            {/* Account Type */}
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">{getAccountTypeDisplay(profile.account_type)}</p>
                <p className="text-xs text-gray-600">Account type</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Preview System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Profile Preview
          </CardTitle>
          <CardDescription>
            {profile.is_profile_visible
              ? "Your profile is currently live and visible to clients"
              : "Preview how your profile will appear when live"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                {profile.profile_picture ? (
                  <img
                    src={profile.profile_picture || "/placeholder.svg"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <Users className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <div>
                <h3 className="font-medium">{profile.display_name || profile.full_name || "Your Name"}</h3>
                <p className="text-sm text-gray-600">{getAccountTypeDisplay(profile.account_type)}</p>
                <p className="text-xs text-gray-500">
                  {profile.city && profile.province ? `${profile.city}, ${profile.province}` : "Location not set"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!profile.is_profile_visible && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Private - Not visible to public
                </Badge>
              )}
              <Button asChild variant="outline" size="sm">
                <Link href={`/crew/${profile.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Profile
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Benefits & Upgrade CTA */}
      {!canGoLive && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <Zap className="h-5 w-5 mr-2" />
              Make Your Profile Live
            </CardTitle>
            <CardDescription className="text-red-700">
              Subscribe to make your profile visible to clients and start receiving project invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {subscriptionPlans
                .filter((plan) => {
                  if (isScoutAccount) return false // Scouts don't need plans

                  // Map account types to plan targets
                  const type = profile.account_type?.toLowerCase()
                  if (type === "studio" && plan.targetUsers.includes("Studio")) return true
                  if (type === "store" && plan.targetUsers.includes("Store")) return true // Assuming Store is targeted same as Studio or needs update
                  if (
                    (type === "film_crew" || type === "content_creator") &&
                    (plan.targetUsers.includes("Film Crew") || plan.targetUsers.includes("Creator"))
                  )
                    return true

                  return plan.targetUsers.some((target) => target.toLowerCase() === type?.replace("_", " "))
                })
                .map((plan, index) => (
                  <div
                    key={index}
                    className={`relative p-4 border-2 rounded-lg bg-white ${
                      plan.popular ? "border-red-500" : "border-gray-200"
                    }`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 left-4 bg-red-600 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-red-600">{plan.price}</span>
                        <span className="text-sm text-gray-500 ml-1">/{plan.interval}</span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className={`w-full ${
                        plan.popular ? "bg-red-600 hover:bg-red-700" : "bg-gray-800 hover:bg-gray-900"
                      }`}
                    >
                      <Link href="/subscribe">
                        <Globe className="h-4 w-4 mr-2" />
                        Go Live Now
                      </Link>
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Camera className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium">Edit Profile</h3>
                <p className="text-sm text-gray-600">Update your information</p>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full mt-3 bg-transparent">
              <Link href="/dashboard">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Briefcase className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-medium">Browse Gigs</h3>
                <p className="text-sm text-gray-600">Find new opportunities</p>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full mt-3 bg-transparent">
              <Link href="/marketplace/available-gigs">Browse Gigs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-medium">Discover Talent</h3>
                <p className="text-sm text-gray-600">Find other professionals</p>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full mt-3 bg-transparent">
              <Link href="/discover">Discover</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
