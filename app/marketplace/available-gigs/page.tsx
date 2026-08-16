"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Clock, DollarSign, Users, Plus, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import MobileShell from "@/components/mobile/mobile-shell"

// Mock data fallback when database is empty
const mockGigs = [
  {
    id: "mock-1",
    title: "Corporate Video Production",
    location: "Cape Town, Western Cape",
    category: "Commercial",
    gig_type: "contract",
    salary_min: 15000,
    salary_max: 25000,
    salary_currency: "ZAR",
    experience_level: "mid", // Changed from "Mid-level" to "mid"
    description:
      "Looking for a complete video production team for corporate training videos. Need director, cinematographer, and editor.",
    required_skills: ["Cinematography", "Video Editing", "Directing"],
    remote_option: false,
    positions_available: 3,
    status: "active",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    application_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      full_name: "Sarah Johnson",
      profile_image_url:
        "https://images.pexels.com/photos/2327360/pexels-photo-2327360.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  },
  {
    id: "mock-2",
    title: "Wedding Photography & Videography",
    location: "Johannesburg, Gauteng",
    category: "Wedding",
    gig_type: "contract",
    salary_min: 8000,
    salary_max: 12000,
    salary_currency: "ZAR",
    experience_level: "senior", // Changed from "Senior" to "senior"
    description: "Seeking experienced wedding photographer and videographer for luxury wedding in Sandton.",
    required_skills: ["Photography", "Cinematography", "Lighting"],
    remote_option: false,
    positions_available: 2,
    status: "active",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    application_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      full_name: "Michael Chen",
      profile_image_url:
        "https://images.pexels.com/photos/31847340/pexels-photo-31847340.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  },
  {
    id: "mock-3",
    title: "Music Video Production",
    location: "Cape Town, Western Cape",
    category: "Music Video",
    gig_type: "freelance",
    salary_min: 30000,
    salary_max: 50000,
    salary_currency: "ZAR",
    experience_level: "expert", // Changed from "Expert" to "expert"
    description: "High-energy music video for upcoming artist. Need creative director and full production team.",
    required_skills: ["Directing", "Cinematography", "Color Grading", "Motion Graphics"],
    remote_option: false,
    positions_available: 5,
    status: "active",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    application_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      full_name: "David Mthembu",
      profile_image_url:
        "https://images.pexels.com/photos/11627682/pexels-photo-11627682.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  },
  {
    id: "mock-4",
    title: "Documentary Series",
    location: "Remote/Various",
    category: "Documentary",
    gig_type: "contract",
    salary_min: 40000,
    salary_max: 60000,
    salary_currency: "ZAR",
    experience_level: "senior", // Changed from "Senior" to "senior"
    description: "Wildlife documentary series needs experienced crew comfortable with remote locations.",
    required_skills: ["Cinematography", "Sound Recording", "Producing"],
    remote_option: true,
    positions_available: 4,
    status: "active",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    application_deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      full_name: "Lisa van der Merwe",
      profile_image_url:
        "https://images.pexels.com/photos/27442268/pexels-photo-27442268.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  },
]

const gigCategories = [
  "All Types",
  "Commercial",
  "Wedding",
  "Short Film",
  "Music Video",
  "Documentary",
  "Corporate",
  "Event",
  "Fashion",
]
const locationOptions = ["All Locations", "Cape Town", "Johannesburg", "Durban", "Pretoria", "Remote"]

export default function AvailableGigsPage() {
  const searchParams = useSearchParams()
  const [gigs, setGigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [usingMockData, setUsingMockData] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [sortBy, setSortBy] = useState("newest")
  const [successMessage, setSuccessMessage] = useState("")

  // Cache ref to prevent refetching
  const dataFetchedRef = useRef(false)

  useEffect(() => {
    if (searchParams.get("posted") === "true") {
      setSuccessMessage("Your gig has been posted successfully.")
      setTimeout(() => setSuccessMessage(""), 5000)
    }
    if (searchParams.get("applied") === "true") {
      setSuccessMessage("Application sent. We will notify you when they respond.")
      setTimeout(() => setSuccessMessage(""), 5000)
    }
  }, [searchParams])

  useEffect(() => {
    if (dataFetchedRef.current) return

    const fetchGigs = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data: gigsData, error: gigsError } = await supabase
          .from("gigs")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })

        if (gigsError) {
          console.error("Error fetching gigs:", gigsError)
          setGigs(mockGigs)
          setUsingMockData(true)
          dataFetchedRef.current = true
          setLoading(false)
          return
        }

        if (!gigsData || gigsData.length === 0) {
          setGigs(mockGigs)
          setUsingMockData(true)
          dataFetchedRef.current = true
          setLoading(false)
          return
        }

        // Fetch client profiles separately for each unique client_id
        const clientIds = [...new Set(gigsData.map((gig) => gig.client_id).filter(Boolean))]

        const { data: clientsData, error: clientsError } =
          clientIds.length > 0
            ? await supabase
                .from("user_profiles")
                .select("id, user_id, full_name, display_name, username, profile_image_url, profile_picture, avatar_url")
                .in("user_id", clientIds)
            : { data: [], error: null }

        if (clientsError) {
          console.error("Error fetching clients:", clientsError)
        }

        // Map clients to gigs
        const clientsMap = new Map(
          clientsData?.map((client) => [
            client.user_id || client.id,
            {
              id: client.user_id || client.id,
              full_name: client.display_name || client.full_name || client.username || "Client",
              profile_image_url: client.profile_image_url || client.profile_picture || client.avatar_url || "",
            },
          ]) || [],
        )
        const gigsWithClients = gigsData.map((gig) => ({
          ...gig,
          client: gig.client_id ? clientsMap.get(gig.client_id) : null,
        }))

        setGigs(gigsWithClients)
        setUsingMockData(false)

        dataFetchedRef.current = true
      } catch (err) {
        console.error("Error:", err)
        setGigs(mockGigs)
        setUsingMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchGigs()
  }, [])

  // Client-side filtering (no API calls)
  const filteredGigs = gigs.filter((gig) => {
    const matchesSearch =
      gig.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "All Types" || gig.category === selectedType
    const matchesLocation = selectedLocation === "All Locations" || gig.location?.includes(selectedLocation)
    return matchesSearch && matchesType && matchesLocation
  })

  // Client-side sorting (no API calls)
  const sortedGigs = [...filteredGigs].sort((a, b) => {
    switch (sortBy) {
      case "budget-high":
        return (b.salary_max || 0) - (a.salary_max || 0)
      case "budget-low":
        return (a.salary_min || 0) - (b.salary_min || 0)
      case "deadline":
        return new Date(a.application_deadline || 0).getTime() - new Date(b.application_deadline || 0).getTime()
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const formatBudget = (gig: any) => {
    if (gig.salary_min && gig.salary_max) {
      return `R${gig.salary_min.toLocaleString()} - R${gig.salary_max.toLocaleString()}`
    }
    if (gig.salary_max) return `Up to R${gig.salary_max.toLocaleString()}`
    if (gig.salary_min) return `From R${gig.salary_min.toLocaleString()}`
    return "Negotiable"
  }

  const formatGigType = (value: string | null | undefined) => {
    const labelMap: Record<string, string> = {
      "full-time": "Full-time",
      "part-time": "Part-time",
      contract: "Contract",
      freelance: "Freelance",
      internship: "Internship",
    }
    const normalized = (value || "").trim().toLowerCase()
    return labelMap[normalized] || value || "Project"
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  }

  const formatDeadline = (dateString: string | null) => {
    if (!dateString) return null
    const deadline = new Date(dateString)
    const now = new Date()
    const diffMs = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Expired"
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    return `${diffDays} days left`
  }

  const formatExperienceLevel = (level: string) => {
    const levelMap: Record<string, string> = {
      entry: "Entry Level",
      mid: "Mid Level",
      senior: "Senior",
      expert: "Expert",
    }
    return levelMap[level] || level
  }

  if (loading) {
    return (
      <MobileShell title="Gigs">
        <div className="flex min-h-[65vh] items-center justify-center px-5">
          <div className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-black/10 border-b-[#d40000]" />
            <p className="text-[15px] font-semibold text-black">Loading available gigs...</p>
            <p className="mt-1 text-sm text-neutral-500">Finding productions that need talent.</p>
          </div>
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell title="Gigs">
      <div className="space-y-5 px-4 pb-28 pt-3 sm:px-6">
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-[24px] bg-emerald-50 px-4 py-3 text-emerald-800 ring-1 ring-emerald-100"
          >
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </motion.div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[32px] bg-[#111] text-white shadow-sm"
        >
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Badge className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/10">
                {sortedGigs.length} open gig{sortedGigs.length === 1 ? "" : "s"}
              </Badge>
              {usingMockData && (
                <Badge className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100">
                  Sample gigs
                </Badge>
              )}
            </div>
            <h1 className="max-w-[300px] text-[34px] font-black leading-[0.95] tracking-[-0.04em]">
              Available gigs for creative crews.
            </h1>
            <p className="mt-3 max-w-[330px] text-[15px] leading-6 text-white/70">
              Browse paid production, photo, film, and content gigs that match your craft.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/marketplace/post-gig" className="w-full sm:w-auto">
                <Button className="h-12 w-full rounded-full bg-[#d40000] px-6 text-white hover:bg-[#b80000]">
                  <Plus className="mr-2 h-4 w-4" />
                  Post a Gig
                </Button>
              </Link>
              <Link href="/find-crew" className="w-full sm:w-auto">
                <Button variant="secondary" className="h-12 w-full rounded-full bg-white text-black hover:bg-white/90">
                  Find crew
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search gigs, location, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-[52px] rounded-full border-neutral-200 bg-[#f7f7f4] pl-11 text-[15px] shadow-none focus-visible:ring-[#d40000]"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-12 rounded-full border-neutral-200 bg-white px-4">
                <SelectValue placeholder="Gig Type" />
              </SelectTrigger>
              <SelectContent>
                {gigCategories.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="h-12 rounded-full border-neutral-200 bg-white px-4">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12 rounded-full border-neutral-200 bg-white px-4">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="budget-high">Budget: High to Low</SelectItem>
                <SelectItem value="budget-low">Budget: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <div className="space-y-4">
          {sortedGigs.map((gig, index) => (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
            >
              <Card className="overflow-hidden rounded-[30px] border-0 bg-white shadow-sm ring-1 ring-black/5">
                <CardHeader className="space-y-3 p-5 pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge className="rounded-full bg-[#f3f0ea] px-3 py-1 text-xs font-bold text-black hover:bg-[#f3f0ea]">
                          {gig.category}
                        </Badge>
                        {gig.remote_option && (
                          <Badge className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white hover:bg-black">
                            Remote OK
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-[22px] font-black leading-tight tracking-[-0.02em] text-black">
                        {gig.title}
                      </CardTitle>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold text-neutral-500">{formatTimeAgo(gig.created_at)}</p>
                      {gig.application_deadline && (
                        <p className="mt-1 text-xs font-black text-[#d40000]">
                          {formatDeadline(gig.application_deadline)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm font-semibold text-neutral-600 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#d40000]" />
                      <span className="truncate">{gig.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#d40000]" />
                      <span>{formatGigType(gig.gig_type)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-[#d40000]" />
                      <span>{formatBudget(gig)}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-2">
                  <p className="line-clamp-2 text-[15px] leading-6 text-neutral-700">{gig.description}</p>

                  {gig.required_skills && gig.required_skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {gig.required_skills.slice(0, 5).map((skill: string, skillIndex: number) => (
                        <Badge
                          key={`${gig.id}-skill-${skillIndex}`}
                          variant="outline"
                          className="rounded-full border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {gig.required_skills.length > 5 && (
                        <Badge variant="outline" className="rounded-full border-neutral-200 px-3 py-1 text-xs">
                          +{gig.required_skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {gig.client && (
                    <div className="mt-4 flex items-center gap-3 rounded-[22px] bg-[#f7f7f4] p-3">
                      <img
                        src={gig.client.profile_image_url || "/placeholder.svg?height=48&width=48&query=professional"}
                        alt={gig.client.full_name || "Client"}
                        loading="lazy"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-black">{gig.client.full_name || "Client"}</p>
                        <p className="text-xs font-semibold text-neutral-500">Posted by client</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
                      <Users className="h-4 w-4" />
                      {gig.positions_available || 1} position{(gig.positions_available || 1) > 1 ? "s" : ""} available
                    </div>
                    <Link href={`/marketplace/gigs/${gig.id}`} className="w-full sm:w-auto">
                      <Button className="h-12 w-full rounded-full bg-[#d40000] px-6 text-white hover:bg-[#b80000]">
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {sortedGigs.length === 0 && (
          <div className="rounded-[30px] bg-white px-6 py-12 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-lg font-black text-black">No gigs found</p>
            <p className="mt-2 text-sm text-neutral-500">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </MobileShell>
  )
}

