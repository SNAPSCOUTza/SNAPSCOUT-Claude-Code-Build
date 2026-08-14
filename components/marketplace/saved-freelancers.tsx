"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Search, MapPin, Star, Eye, MessageSquare, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Favorite } from "@/types/marketplace"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

export function SavedFreelancers() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const supabase = createClient()

  const categories = [
    "photographers",
    "videographers",
    "editors",
    "sound engineers",
    "lighting technicians",
    "producers",
    "directors",
    "makeup artists",
  ]

  const fetchFavorites = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("User not authenticated")
        return
      }

      const { data, error } = await supabase
        .from("favorites")
        .select(`
          *,
          freelancer:freelancer_id (
            id,
            display_name,
            profile_picture,
            primary_role,
            experience_level,
            city,
            bio,
            years_experience
          )
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching favorites:", error)
        return
      }

      setFavorites(data || [])
      setFilteredFavorites(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase.from("favorites").delete().eq("id", favoriteId)

      if (error) {
        console.error("Error removing favorite:", error)
        toast.error("Failed to remove favorite")
        return
      }

      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId))
      setFilteredFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId))
      toast.success("Removed from favorites")
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred")
    }
  }

  // Apply filters
  const applyFilters = () => {
    let filtered = [...favorites]

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (favorite) =>
          favorite.freelancer?.display_name?.toLowerCase().includes(searchLower) ||
          favorite.freelancer?.primary_role?.toLowerCase().includes(searchLower) ||
          favorite.freelancer?.city?.toLowerCase().includes(searchLower),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((favorite) => favorite.category === categoryFilter)
    }

    setFilteredFavorites(filtered)
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchQuery, categoryFilter, favorites])

  const getFavoritesByCategory = (category: string) => {
    return favorites.filter((fav) => fav.category === category)
  }

  if (loading) {
    return <div className="text-center py-8">Loading your saved freelancers...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Saved Freelancers</h2>
        <p className="text-gray-600">Your bookmarked freelancers for future projects</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search saved freelancers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({favorites.length})</TabsTrigger>
          <TabsTrigger value="photographers">
            Photographers ({getFavoritesByCategory("photographers").length})
          </TabsTrigger>
          <TabsTrigger value="videographers">
            Videographers ({getFavoritesByCategory("videographers").length})
          </TabsTrigger>
          <TabsTrigger value="editors">Editors ({getFavoritesByCategory("editors").length})</TabsTrigger>
          <TabsTrigger value="other">Other ({getFavoritesByCategory("").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <FreelancerGrid favorites={filteredFavorites} onRemove={removeFavorite} />
        </TabsContent>

        <TabsContent value="photographers" className="space-y-4 mt-6">
          <FreelancerGrid favorites={getFavoritesByCategory("photographers")} onRemove={removeFavorite} />
        </TabsContent>

        <TabsContent value="videographers" className="space-y-4 mt-6">
          <FreelancerGrid favorites={getFavoritesByCategory("videographers")} onRemove={removeFavorite} />
        </TabsContent>

        <TabsContent value="editors" className="space-y-4 mt-6">
          <FreelancerGrid favorites={getFavoritesByCategory("editors")} onRemove={removeFavorite} />
        </TabsContent>

        <TabsContent value="other" className="space-y-4 mt-6">
          <FreelancerGrid favorites={getFavoritesByCategory("")} onRemove={removeFavorite} />
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {favorites.length === 0 && (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved freelancers yet</h3>
          <p className="text-gray-600 mb-4">
            Start browsing freelancer profiles and save your favorites for future projects.
          </p>
          <Button className="bg-red-600 hover:bg-red-700">Browse Freelancers</Button>
        </div>
      )}
    </div>
  )
}

interface FreelancerGridProps {
  favorites: Favorite[]
  onRemove: (favoriteId: string) => void
}

function FreelancerGrid({ favorites, onRemove }: FreelancerGridProps) {
  if (favorites.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No freelancers found in this category.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((favorite) => (
        <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {favorite.freelancer?.profile_picture ? (
                    <img
                      src={favorite.freelancer.profile_picture || "/placeholder.svg"}
                      alt={favorite.freelancer.display_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 font-medium">
                      {favorite.freelancer?.display_name?.charAt(0) || "?"}
                    </span>
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">{favorite.freelancer?.display_name}</CardTitle>
                  <p className="text-sm text-gray-600">{favorite.freelancer?.primary_role}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onRemove(favorite.id)} className="text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Experience and Location */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>{favorite.freelancer?.experience_level}</span>
                </div>
                {favorite.freelancer?.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{favorite.freelancer.city}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {favorite.freelancer?.bio && (
                <p className="text-sm text-gray-600 line-clamp-2">{favorite.freelancer.bio}</p>
              )}

              {/* Category Badge */}
              {favorite.category && (
                <div>
                  <Badge variant="secondary">{favorite.category}</Badge>
                </div>
              )}

              {/* Saved Date */}
              <p className="text-xs text-gray-500">Saved {formatDistanceToNow(new Date(favorite.created_at))} ago</p>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Eye className="h-4 w-4 mr-1" />
                  View Profile
                </Button>
                <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Contact
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

