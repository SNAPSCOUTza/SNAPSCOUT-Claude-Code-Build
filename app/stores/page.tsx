"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Star, ShoppingBag, Filter, Instagram, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@/lib/supabase/client"
import { InstagramFeed } from "@/components/ui/instagram-feed"

interface Store {
  id: string
  user_profile_id: string
  business_name: string
  display_name: string
  location: string
  city: string
  province: string
  bio: string
  services_provided: string[]
  profile_picture: string
  rating: number
  total_reviews: number
  is_verified: boolean
  featured: boolean
  instagram: string
  website: string
  created_at: string
}

export default function StoresPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [filterService, setFilterService] = useState("")
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("account_type", "store")
        .eq("is_profile_visible", true)
        .order("featured", { ascending: false })
        .order("rating", { ascending: false })

      if (error) throw error

      setStores(data || [])
    } catch (error) {
      console.error("[v0] Error fetching stores:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.province?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.services_provided?.some((service: string) => service.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = !filterService || store.services_provided?.includes(filterService)
    return matchesSearch && matchesFilter
  })

  const allServices = Array.from(new Set(stores.flatMap((store) => store.services_provided || [])))

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (selectedStore) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="outline" onClick={() => setSelectedStore(null)} className="mb-6">
            ← Back to Stores
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        {selectedStore.business_name || selectedStore.display_name}
                        {selectedStore.is_verified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Verified
                          </Badge>
                        )}
                        {selectedStore.featured && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Featured
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center mt-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedStore.city}, {selectedStore.province}
                      </div>
                      {selectedStore.rating && (
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 font-medium">{selectedStore.rating}</span>
                          <span className="ml-1 text-muted-foreground">({selectedStore.total_reviews} reviews)</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Since {new Date(selectedStore.created_at).getFullYear()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedStore.profile_picture && (
                    <img
                      src={selectedStore.profile_picture || "/placeholder.svg"}
                      alt={selectedStore.business_name || selectedStore.display_name}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                  )}
                  <p className="text-foreground mb-4">{selectedStore.bio}</p>

                  {selectedStore.services_provided && selectedStore.services_provided.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Services & Products</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedStore.services_provided.map((service: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    {selectedStore.website && (
                      <Button asChild>
                        <a href={selectedStore.website} target="_blank" rel="noopener noreferrer">
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Visit Store
                        </a>
                      </Button>
                    )}
                    {selectedStore.instagram && (
                      <Button variant="outline" asChild>
                        <a
                          href={`https://instagram.com/${selectedStore.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Instagram className="h-4 w-4 mr-2" />
                          {selectedStore.instagram}
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {selectedStore.instagram && (
              <div className="lg:col-span-1">
                <InstagramFeed handle={selectedStore.instagram} className="sticky top-8" postCount={6} />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Equipment Stores & Brands</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover equipment stores, camera shops, and brands. Find gear, rentals, and services.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search stores, locations, or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Services</option>
              {allServices.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <Card
              key={store.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedStore(store)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {store.business_name || store.display_name}
                      {store.is_verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          Verified
                        </Badge>
                      )}
                      {store.featured && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          Featured
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center mt-1 text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {store.city}, {store.province}
                    </div>
                  </div>
                  {store.rating && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">{store.rating}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {store.profile_picture && (
                  <img
                    src={store.profile_picture || "/placeholder.svg"}
                    alt={store.business_name || store.display_name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{store.bio}</p>

                {store.services_provided && store.services_provided.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {store.services_provided.slice(0, 3).map((service: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                    {store.services_provided.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{store.services_provided.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{store.total_reviews || 0} reviews</span>
                  <Button size="sm">View Store</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No stores found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
