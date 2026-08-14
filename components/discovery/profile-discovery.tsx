"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Grid3X3,
  List,
  MapPin,
  Star,
  Eye,
  Heart,
  Filter,
  Loader2,
  Camera,
  Video,
  Users,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ProfileData {
  user_id: string
  full_name: string
  display_name: string
  bio: string
  profession: string
  account_type: string
  city: string
  profile_picture: string
  rating: number
  total_reviews: number
  profile_views: number
  is_profile_visible: boolean
  is_verified: boolean
  subscription_status: string
  skills: string[]
  portfolio_images: string[]
  hourly_rate: string
  daily_rate: string
  availability_status: string
}

interface FilterOptions {
  accountType: string
  location: string
  profession: string
  availability: string
  sortBy: string
}

export default function ProfileDiscovery() {
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<FilterOptions>({
    accountType: "all",
    location: "all",
    profession: "all",
    availability: "all",
    sortBy: "rating",
  })

  const supabase = createClient()
  const profilesPerPage = 12

  const fetchProfiles = async () => {
    try {
      setLoading(true)

      // Fetch profiles with subscription data
      const { data, error } = await supabase
        .from("user_profiles")
        .select(
          `
          user_id,
          full_name,
          display_name,
          bio,
          profession,
          account_type,
          city,
          profile_picture,
          rating,
          total_reviews,
          profile_views,
          is_profile_visible,
          is_verified,
          skills,
          portfolio_images,
          hourly_rate,
          daily_rate,
          availability_status,
          user_subscriptions!inner(status)
        `,
        )
        .eq("is_profile_visible", true)
        .or("account_type.eq.Scout,user_subscriptions.status.eq.active")

      if (error) {
        console.error("[v0] Error fetching profiles:", error)
        return
      }

      // Transform data to include subscription status
      const transformedProfiles =
        data?.map((profile: any) => ({
          ...profile,
          subscription_status:
            profile.user_subscriptions?.status || (profile.account_type === "Scout" ? "free" : "none"),
        })) || []

      setProfiles(transformedProfiles)
      setFilteredProfiles(transformedProfiles)
    } catch (error) {
      console.error("[v0] Error fetching profiles:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...profiles]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (profile) =>
          profile.full_name?.toLowerCase().includes(query) ||
          profile.display_name?.toLowerCase().includes(query) ||
          profile.profession?.toLowerCase().includes(query) ||
          profile.bio?.toLowerCase().includes(query) ||
          profile.skills?.some((skill) => skill.toLowerCase().includes(query)),
      )
    }

    // Account type filter
    if (filters.accountType !== "all") {
      filtered = filtered.filter((profile) => profile.account_type === filters.accountType)
    }

    // Location filter
    if (filters.location !== "all") {
      filtered = filtered.filter((profile) => profile.city === filters.location)
    }

    // Profession filter
    if (filters.profession !== "all") {
      filtered = filtered.filter((profile) => profile.profession === filters.profession)
    }

    // Availability filter
    if (filters.availability !== "all") {
      filtered = filtered.filter((profile) => profile.availability_status === filters.availability)
    }

    // Sort profiles
    switch (filters.sortBy) {
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case "reviews":
        filtered.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0))
        break
      case "views":
        filtered.sort((a, b) => (b.profile_views || 0) - (a.profile_views || 0))
        break
      case "name":
        filtered.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""))
        break
      default:
        break
    }

    setFilteredProfiles(filtered)
    setTotalPages(Math.ceil(filtered.length / profilesPerPage))
    setCurrentPage(1)
  }

  const getPaginatedProfiles = () => {
    const startIndex = (currentPage - 1) * profilesPerPage
    const endIndex = startIndex + profilesPerPage
    return filteredProfiles.slice(startIndex, endIndex)
  }

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case "Film Crew":
        return <Camera className="h-4 w-4" />
      case "Content Creator":
      case "Creator":
        return <Video className="h-4 w-4" />
      case "Studio":
        return <Building className="h-4 w-4" />
      case "Scout":
        return <Eye className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getSubscriptionBadge = (accountType: string, subscriptionStatus: string) => {
    if (accountType === "Scout") {
      return <Badge variant="secondary">Free Scout</Badge>
    }

    switch (subscriptionStatus) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active Subscriber</Badge>
      case "free":
        return <Badge variant="secondary">Free</Badge>
      default:
        return null
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchQuery, filters, profiles])

  const uniqueLocations = [...new Set(profiles.map((p) => p.city).filter(Boolean))]
  const uniqueProfessions = [...new Set(profiles.map((p) => p.profession).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading profiles...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Discover Talent</h2>
          <p className="text-muted-foreground">Find verified professionals for your next project</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, profession, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Select
              value={filters.accountType}
              onValueChange={(value) => setFilters({ ...filters, accountType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Account Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Scout">Scout</SelectItem>
                <SelectItem value="Film Crew">Film Crew</SelectItem>
                <SelectItem value="Content Creator">Creator</SelectItem>
                <SelectItem value="Studio">Studio</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.profession} onValueChange={(value) => setFilters({ ...filters, profession: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Profession" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Professions</SelectItem>
                {uniqueProfessions.map((profession) => (
                  <SelectItem key={profession} value={profession}>
                    {profession}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.availability}
              onValueChange={(value) => setFilters({ ...filters, availability: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Busy">Busy</SelectItem>
                <SelectItem value="Unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {getPaginatedProfiles().length} of {filteredProfiles.length} profiles
        </p>
      </div>

      {/* Profile Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {getPaginatedProfiles().map((profile) => (
            <Card key={profile.user_id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src={profile.profile_picture || "/placeholder.svg?height=48&width=48"}
                        alt={profile.full_name || "Profile"}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                      {profile.is_verified && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                          <Star className="h-3 w-3 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{profile.display_name || profile.full_name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        {getAccountTypeIcon(profile.account_type)}
                        {profile.profession}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>

                <div className="flex items-center gap-2">
                  {getSubscriptionBadge(profile.account_type, profile.subscription_status)}
                  {profile.city && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {profile.city}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{profile.rating?.toFixed(1) || "0.0"}</span>
                    <span className="text-muted-foreground">({profile.total_reviews || 0})</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{profile.profile_views || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {profile.hourly_rate && <span>From {profile.hourly_rate}/hr</span>}
                    {profile.daily_rate && <span>From {profile.daily_rate}/day</span>}
                  </div>
                  <Link href={`/crew/${profile.user_id}`}>
                    <Button size="sm">View Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {getPaginatedProfiles().map((profile) => (
            <Card key={profile.user_id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Image
                      src={profile.profile_picture || "/placeholder.svg?height=64&width=64"}
                      alt={profile.full_name || "Profile"}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                    {profile.is_verified && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                        <Star className="h-4 w-4 text-white fill-current" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{profile.display_name || profile.full_name}</h3>
                        <p className="text-muted-foreground flex items-center gap-1">
                          {getAccountTypeIcon(profile.account_type)}
                          {profile.profession}
                          {profile.city && (
                            <>
                              <span className="mx-1">•</span>
                              <MapPin className="h-4 w-4" />
                              {profile.city}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Link href={`/crew/${profile.user_id}`}>
                          <Button size="sm">View Profile</Button>
                        </Link>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>

                    <div className="flex items-center gap-2">
                      {getSubscriptionBadge(profile.account_type, profile.subscription_status)}
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{profile.rating?.toFixed(1) || "0.0"}</span>
                        <span className="text-sm text-muted-foreground">({profile.total_reviews || 0} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{profile.profile_views || 0} views</span>
                      </div>
                    </div>

                    {profile.skills && profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {profile.skills.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {profile.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
