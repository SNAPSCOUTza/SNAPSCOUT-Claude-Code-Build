"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Eye,
  EyeOff,
  Edit,
  Crown,
  AlertTriangle,
  Lock,
  Globe,
  Users,
  Camera,
  MapPin,
  Star,
  MessageCircle,
  ExternalLink,
  Zap,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import ProfilePreviewCard from "@/components/profile-preview-card"

interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  full_name: string | null
  bio: string | null
  profile_picture: string | null
  city: string | null
  province: string | null
  account_type: string
  is_profile_visible: boolean
  is_verified: boolean
  department: string | null
  roles: string[]
  experience_level: string | null
  years_experience: string | null
  availability_status: string | null
  portfolio_images: string[]
  instagram: string | null
  linkedin: string | null
  youtube_vimeo: string | null
  website: string | null
  specialties: string[]
  gear_owned: string[]
}

interface UserSubscription {
  status: string | null
  current_period_end: string | null
}

interface ProfilePreviewSystemProps {
  userId: string
}

export default function ProfilePreviewSystem({ userId }: ProfilePreviewSystemProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"private" | "live">("private")

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const { data: profileData } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single()

        // Fetch subscription data
        const { data: subData } = await supabase.from("user_subscriptions").select("*").eq("user_id", userId).single()

        setProfile(profileData)
        setSubscription(subData)
      } catch (error) {
        console.error("[v0] Error fetching profile data:", error)
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
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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

  const isScoutAccount = profile.account_type === "Scout"
  const isSubscribed = subscription?.status === "active"
  const canGoLive = isScoutAccount || isSubscribed
  const isCurrentlyLive = profile.is_profile_visible && canGoLive

  // Convert profile data for preview card
  const profilePreviewData = {
    displayName: profile.display_name || "Your Name",
    fullName: profile.full_name || "",
    bio: profile.bio || "",
    province: profile.province || "",
    city: profile.city || "",
    departments: profile.department ? [profile.department] : [],
    roles: profile.roles || [],
    primaryRole: profile.roles?.[0] || "Professional",
    experienceLevel: profile.experience_level || "",
    yearsExperience: profile.years_experience ? Number.parseInt(profile.years_experience) : undefined,
    availabilityStatus: profile.availability_status || "Available",
    profilePictureUrl: profile.profile_picture || "",
    specialties: profile.specialties || [],
    gear: profile.gear_owned || [],
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Preview</h2>
          <p className="text-gray-600">See how your profile appears to clients and make it live</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Profile Status Alert */}
      {!canGoLive && (
        <Alert className="border-red-200 bg-red-50">
          <Lock className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <span>Your profile is private and not visible to clients. Subscribe to make it live!</span>
              <Button asChild size="sm" className="ml-4 bg-red-600 hover:bg-red-700">
                <Link href="/subscribe/plans">
                  <Crown className="h-4 w-4 mr-2" />
                  Make Profile Live
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {canGoLive && !isCurrentlyLive && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="flex items-center justify-between">
              <span>You can make your profile live! Enable visibility in your profile settings.</span>
              <Button asChild size="sm" className="ml-4 bg-yellow-600 hover:bg-yellow-700">
                <Link href="/dashboard">
                  <Globe className="h-4 w-4 mr-2" />
                  Enable Visibility
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isCurrentlyLive && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center justify-between">
              <span>Your profile is live and visible to clients!</span>
              <Button asChild size="sm" variant="outline" className="ml-4 bg-transparent">
                <Link href={`/crew/${profile.user_id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Public Profile
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Preview Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "private" | "live")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="private" className="flex items-center space-x-2">
            <EyeOff className="h-4 w-4" />
            <span>Private View</span>
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Live Preview</span>
          </TabsTrigger>
        </TabsList>

        {/* Private View Tab */}
        <TabsContent value="private" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <EyeOff className="h-5 w-5 mr-2 text-red-600" />
                Private Profile View
              </CardTitle>
              <p className="text-gray-600">
                This is how your profile looks while it's private. Only you can see this view.
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Profile is Private</h3>
                <p className="text-gray-600 mb-4">
                  Your profile is currently hidden from clients and not discoverable in search results.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>• Profile information is saved and ready</p>
                  <p>• Portfolio and social media links are prepared</p>
                  <p>• {canGoLive ? "Ready to go live!" : "Subscription required to go live"}</p>
                </div>
                {!canGoLive && (
                  <div className="mt-6">
                    <Button asChild className="bg-red-600 hover:bg-red-700">
                      <Link href="/subscribe/plans">
                        <Zap className="h-4 w-4 mr-2" />
                        Subscribe to Go Live
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Profile Completion Status */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white border rounded-lg">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Profile Info</h4>
                  <p className="text-sm text-gray-600">
                    {profile.display_name && profile.bio ? "Complete" : "Needs attention"}
                  </p>
                </div>
                <div className="text-center p-4 bg-white border rounded-lg">
                  <Camera className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Portfolio</h4>
                  <p className="text-sm text-gray-600">
                    {profile.portfolio_images.length > 0 ? `${profile.portfolio_images.length} images` : "No images"}
                  </p>
                </div>
                <div className="text-center p-4 bg-white border rounded-lg">
                  <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Social Links</h4>
                  <p className="text-sm text-gray-600">
                    {[profile.instagram, profile.linkedin, profile.youtube_vimeo, profile.website].filter(Boolean)
                      .length > 0
                      ? "Connected"
                      : "Not connected"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Preview Tab */}
        <TabsContent value="live" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-green-600" />
                Live Profile Preview
              </CardTitle>
              <p className="text-gray-600">This is exactly how your profile will appear to clients when it's live.</p>
            </CardHeader>
            <CardContent>
              {/* Upgrade Prompts for Non-Subscribers */}
              {!canGoLive && (
                <div className="mb-6 space-y-4">
                  <Alert className="border-red-200 bg-red-50">
                    <Crown className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <div className="flex items-center justify-between">
                        <span>Subscribe now to make this profile visible to clients!</span>
                        <Button asChild size="sm" className="ml-4 bg-red-600 hover:bg-red-700">
                          <Link href="/subscribe/plans">
                            <Zap className="h-4 w-4 mr-2" />
                            Make Profile Live
                          </Link>
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Profile Preview Card */}
              <div className="flex justify-center">
                <div className="relative">
                  <ProfilePreviewCard profileData={profilePreviewData} showSocialMedia={true} />

                  {/* Overlay for non-subscribers */}
                  {!canGoLive && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-white p-6">
                        <Lock className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Profile Preview</h3>
                        <p className="text-sm mb-4">Subscribe to make this profile live and discoverable</p>
                        <Button asChild className="bg-red-600 hover:bg-red-700">
                          <Link href="/subscribe/plans">
                            <Crown className="h-4 w-4 mr-2" />
                            Subscribe Now
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Benefits of Going Live */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">When your profile goes live, you'll get:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Discoverable in client searches</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Direct project invitations</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Professional verification badge</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Client messaging and booking</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Profile visibility features:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Star className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <span className="text-gray-700">Portfolio showcase</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">Location-based discovery</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-5 w-5 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">Direct client communication</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Social media integration</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline" className="bg-transparent">
          <Link href="/dashboard">
            <Edit className="h-4 w-4 mr-2" />
            Continue Editing Profile
          </Link>
        </Button>

        {canGoLive ? (
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href={`/crew/${profile.user_id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Live Profile
            </Link>
          </Button>
        ) : (
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link href="/subscribe/plans">
              <Crown className="h-4 w-4 mr-2" />
              Subscribe to Go Live
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
