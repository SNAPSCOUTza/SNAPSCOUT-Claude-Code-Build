"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Search, MapPin, Clock, Users, AlertCircle, Filter, Calendar, Briefcase } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Project, ProjectFilters, ProjectCategory, ExperienceLevel } from "@/types/marketplace"
import { formatDistanceToNow } from "date-fns"

interface ProjectListingsProps {
  initialProjects?: Project[]
}

export function ProjectListings({ initialProjects = [] }: ProjectListingsProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(initialProjects)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<ProjectFilters>({
    category: "All Categories",
    location: "All Locations",
    rate_min: undefined,
    rate_max: undefined,
    experience_level: "All Levels",
    urgent_only: false,
    remote_only: false,
    search: "",
  })

  const supabase = createClient()

  const categories: ProjectCategory[] = [
    "Photography",
    "Videography",
    "Editing",
    "Sound",
    "Lighting",
    "Production",
    "Post-Production",
    "Hair & Makeup",
    "Art Direction",
  ]

  const experienceLevels: ExperienceLevel[] = ["Beginner", "Intermediate", "Professional", "Expert"]

  const provinces = [
    "Western Cape",
    "Eastern Cape",
    "Northern Cape",
    "Free State",
    "KwaZulu-Natal",
    "North West",
    "Gauteng",
    "Mpumalanga",
    "Limpopo",
  ]

  // Fetch projects from database
  const fetchProjects = async () => {
    setLoading(true)
    try {
      const query = supabase
        .from("projects")
        .select(`
          *,
          client:user_profiles!projects_client_id_fkey (
            id,
            display_name,
            profile_picture
          )
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error("Error fetching projects:", error)
        return
      }

      setProjects(data || [])
      setFilteredProjects(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters to projects
  const applyFilters = () => {
    let filtered = [...projects]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.category.toLowerCase().includes(searchLower),
      )
    }

    // Category filter
    if (filters.category !== "All Categories") {
      filtered = filtered.filter((project) => project.category === filters.category)
    }

    // Location filter
    if (filters.location !== "All Locations") {
      filtered = filtered.filter(
        (project) => project.province?.includes(filters.location) || project.city?.includes(filters.location),
      )
    }

    // Rate filters
    if (filters.rate_min) {
      filtered = filtered.filter((project) => project.rate_amount && project.rate_amount >= filters.rate_min)
    }
    if (filters.rate_max) {
      filtered = filtered.filter((project) => project.rate_amount && project.rate_amount <= filters.rate_max)
    }

    // Experience level filter
    if (filters.experience_level !== "All Levels") {
      filtered = filtered.filter((project) => project.experience_level === filters.experience_level)
    }

    // Urgent only filter
    if (filters.urgent_only) {
      filtered = filtered.filter((project) => project.urgent)
    }

    // Remote only filter
    if (filters.remote_only) {
      filtered = filtered.filter((project) => project.is_remote)
    }

    setFilteredProjects(filtered)
  }

  // Load projects on mount
  useEffect(() => {
    if (initialProjects.length === 0) {
      fetchProjects()
    }
  }, [])

  // Apply filters when they change
  useEffect(() => {
    applyFilters()
  }, [filters, projects])

  const clearFilters = () => {
    setFilters({
      category: "All Categories",
      location: "All Locations",
      rate_min: undefined,
      rate_max: undefined,
      experience_level: "All Levels",
      urgent_only: false,
      remote_only: false,
      search: "",
    })
  }

  const formatRate = (project: Project) => {
    if (!project.rate_amount) return "Rate negotiable"
    return `R${project.rate_amount.toLocaleString()} ${project.rate_type.toLowerCase()}`
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects by title, description, or category..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters({ ...filters, category: value as ProjectCategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Categories">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Locations">All Locations</SelectItem>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level Filter */}
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select
                  value={filters.experience_level}
                  onValueChange={(value) => setFilters({ ...filters, experience_level: value as ExperienceLevel })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Levels">All Levels</SelectItem>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rate Range */}
              <div className="space-y-2">
                <Label>Rate Range (ZAR)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.rate_min || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, rate_min: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.rate_max || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, rate_max: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Checkbox Filters */}
            <div className="flex gap-6 mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent_only"
                  checked={filters.urgent_only}
                  onCheckedChange={(checked) => setFilters({ ...filters, urgent_only: !!checked })}
                />
                <Label htmlFor="urgent_only">Urgent projects only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote_only"
                  checked={filters.remote_only}
                  onCheckedChange={(checked) => setFilters({ ...filters, remote_only: !!checked })}
                />
                <Label htmlFor="remote_only">Remote work only</Label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">{loading ? "Loading..." : `${filteredProjects.length} projects found`}</p>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 hover:text-red-600 transition-colors">{project.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="secondary">{project.category}</Badge>
                    {project.project_type && <Badge variant="outline">{project.project_type}</Badge>}
                    {project.urgent && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Urgent
                      </Badge>
                    )}
                    {project.is_remote && <Badge variant="outline">Remote OK</Badge>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatRate(project)}</p>
                  {project.is_negotiable && <p className="text-xs text-gray-500">Negotiable</p>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4 line-clamp-3">{project.description}</CardDescription>

              <div className="space-y-2 mb-4">
                {/* Location and Date */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {(project.city || project.province) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{[project.city, project.province].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                  {project.shoot_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(project.shoot_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Duration and Experience */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {project.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{project.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{project.experience_level}</span>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Footer */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{project.applications_count} applications</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">
                    Posted {formatDistanceToNow(new Date(project.created_at))} ago
                  </span>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Apply Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or search terms to find more projects.</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}

