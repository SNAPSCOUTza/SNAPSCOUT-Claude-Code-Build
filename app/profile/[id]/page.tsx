"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  User,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Linkedin,
  Youtube,
  Facebook,
  Globe,
  Camera,
  Edit,
  ExternalLink,
  MessageCircle,
  Film,
  Languages,
  DollarSign,
  Clapperboard,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/auth"
import { useParams } from "next/navigation"
import { SocialPostsViewer } from "@/components/social-posts-viewer"

export default function ProfilePage() {
  const params = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: profileData, error } = await supabase
        .from("user_profiles")
        .select(`
          *,
          user_subscriptions!inner(status)
        `)
        .eq("user_id", params.id)
        .eq("user_subscriptions.status", "active")
        .single()

      if (error || !profileData) {
        console.error("Profile not found or subscription not active")
        setLoading(false)
        return
      }

      setProfile(profileData)

      // Check if current user is the profile owner
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user && user.id === params.id) {
        setIsOwner(true)
      }

      setLoading(false)
    }

    loadProfile()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">
            This profile doesn't exist or the user doesn't have an active subscription.
          </p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/snapscout-new-logo.jpeg"
              alt="SnapScout Logo"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full"
            />
            <div>
              <span className="text-xl font-bold text-gray-900">SnapScout</span>
              <p className="text-xs text-gray-500 -mt-1">Professional Profile</p>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            {isOwner && (
              <Button asChild variant="outline" size="sm">
                <Link href="/profile/setup">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Profile
                </Link>
              </Button>
            )}
            <Link href="/find-crew" className="text-red-700 hover:text-red-800">
              Browse More Profiles
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{profile.display_name}</h1>
                    <Badge
                      className={`${
                        profile.availability === "available"
                          ? "bg-green-100 text-green-800"
                          : profile.availability === "busy"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {profile.availability === "available"
                        ? "Available"
                        : profile.availability === "busy"
                          ? "Busy"
                          : "Fully Booked"}
                    </Badge>
                  </div>

                  <p className="text-xl text-red-700 font-semibold mb-2">{profile.profession}</p>

                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{profile.location}</span>
                    {profile.experience_years && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{profile.experience_years} years experience</span>
                      </>
                    )}
                    {profile.hourly_rate && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{profile.hourly_rate}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 mb-2">
                    {profile.department && <Badge variant="secondary">{profile.department}</Badge>}
                    {profile.role && <Badge variant="secondary">{profile.role}</Badge>}
                    {profile.experience_level && <Badge variant="secondary">{profile.experience_level}</Badge>}
                  </div>

                  <p className="text-gray-700 mb-6">{profile.bio}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {profile.skills &&
                      profile.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-gray-50">
                          {skill}
                        </Badge>
                      ))}
                  </div>

                  <div className="flex space-x-4">
                    <Button className="bg-red-700 hover:bg-red-800">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Me
                    </Button>
                    {profile.website && (
                      <Button variant="outline" asChild>
                        <a href={profile.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Portfolio
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Portfolio Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Placeholder for portfolio images */}
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Portfolio images will be displayed here once uploaded
                  </p>
                </CardContent>
              </Card>

              {/* Social Posts Viewer */}
              {profile.socialProfiles && profile.socialPosts && (
                <SocialPostsViewer
                  socialProfiles={profile.socialProfiles}
                  socialPosts={profile.socialPosts}
                  maxPosts={8}
                  showPlatformTabs={true}
                />
              )}

              {/* Credits & Experience Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clapperboard className="h-5 w-5 mr-2" />
                    Credits & Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.credits_experience ? (
                    profile.credits_experience.split("\n").map((item: string, index: number) => (
                      <p key={index} className="text-gray-700">
                        {item}
                      </p>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Film className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No credits or experience added yet.</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Add your past work highlights to showcase your expertise.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <a href={`tel:${profile.phone}`} className="text-red-700 hover:text-red-800">
                        {profile.phone}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">Contact via SnapScout</span>
                  </div>

                  {profile.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-gray-400 mr-3" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-700 hover:text-red-800 flex items-center"
                      >
                        Portfolio Website
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}

                  {profile.daily_rate && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">Daily Rate: {profile.daily_rate}</span>
                    </div>
                  )}

                  {profile.hourly_rate && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">Hourly Rate: {profile.hourly_rate}</span>
                    </div>
                  )}

                  {profile.project_rate && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">Project Rate: {profile.project_rate}</span>
                    </div>
                  )}

                  {profile.languages && (
                    <div className="flex items-center">
                      <Languages className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">Languages: {profile.languages}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Media Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.instagram && (
                    <a
                      href={profile.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-red-700 transition-colors"
                    >
                      <Instagram className="h-4 w-4 mr-3" />
                      Instagram
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  )}

                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-red-700 transition-colors"
                    >
                      <Linkedin className="h-4 w-4 mr-3" />
                      LinkedIn
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  )}

                  {profile.youtube && (
                    <a
                      href={profile.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-red-700 transition-colors"
                    >
                      <Youtube className="h-4 w-4 mr-3" />
                      YouTube
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  )}

                  {profile.facebook && (
                    <a
                      href={profile.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-red-700 transition-colors"
                    >
                      <Facebook className="h-4 w-4 mr-3" />
                      Facebook
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  )}

                  {profile.imdb && (
                    <a
                      href={profile.imdb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-red-700 transition-colors"
                    >
                      <Film className="h-4 w-4 mr-3" />
                      IMDB
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  )}

                  {!profile.instagram &&
                    !profile.linkedin &&
                    !profile.youtube &&
                    !profile.facebook &&
                    !profile.imdb && <p className="text-gray-500 text-sm">No social media links added</p>}
                </CardContent>
              </Card>

              {/* Rate Card Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Rate Card</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.daily_rate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Rate</span>
                      <span className="font-semibold">{profile.daily_rate}</span>
                    </div>
                  )}
                  {profile.hourly_rate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hourly Rate</span>
                      <span className="font-semibold">{profile.hourly_rate}</span>
                    </div>
                  )}
                  {profile.project_rate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project Rate</span>
                      <span className="font-semibold">{profile.project_rate}</span>
                    </div>
                  )}
                  {!profile.daily_rate && !profile.hourly_rate && !profile.project_rate && (
                    <p className="text-gray-500 text-sm">No rate information added</p>
                  )}
                </CardContent>
              </Card>

              {/* Languages Spoken */}
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.languages ? (
                    profile.languages.split(",").map((lang: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {lang.trim()}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No languages added</p>
                  )}
                </CardContent>
              </Card>

              {/* Gear and Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Gear & Special Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.gear_owned ? (
                    <div>
                      <h4 className="text-gray-700 font-semibold">Gear Owned:</h4>
                      <p className="text-gray-600">{profile.gear_owned}</p>
                    </div>
                  ) : null}

                  {profile.special_skills ? (
                    <div>
                      <h4 className="text-gray-700 font-semibold">Special Skills:</h4>
                      <p className="text-gray-600">{profile.special_skills}</p>
                    </div>
                  ) : null}

                  {!profile.gear_owned && !profile.special_skills && (
                    <p className="text-gray-500 text-sm">No gear or special skills added</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profile Views</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projects Completed</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Rate</span>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-semibold">{new Date(profile.created_at).getFullYear()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
