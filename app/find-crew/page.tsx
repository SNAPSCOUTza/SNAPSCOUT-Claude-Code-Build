"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Check, Search, MapPin, Star, Briefcase, Filter, Clock, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { createBrowserClient } from "@/lib/supabase/client"
import { MessageButton } from "@/components/messaging/message-button"
import { SaveProfileButton } from "@/components/messaging/save-profile-button"
import { DemoCardWrap } from "@/components/ui/demo-card-wrap"
import { DemoProfileBadge } from "@/components/ui/demo-profile-badge"
import { SaveToPoolButton } from "@/components/crew/SaveToPoolButton"
import { mockCrewMembers } from "@/lib/mock-data/crew-data"
import Link from "next/link"
import MobileShell from "@/components/mobile/mobile-shell"
import { motion } from "framer-motion"
import { AvailabilityStatusBadge } from "@/components/availability/availability-status-badge"
import { HireRequestSheet } from "@/components/booking/hire-request-sheet"
import { AnimatedCount } from "@/components/ui/animated-count"
import { MotionRevealGroup, MotionRevealItem } from "@/components/ui/motion-reveal"
import { StickyScrollCard } from "@/components/ui/sticky-scroll-card"
import { SnapScoutStateArt } from "@/components/mobile/snapscout-state-art"

interface CrewMember {
  id: string
  user_id: string
  display_name: string
  profession: string
  department?: string
  role?: string
  city: string
  province: string
  profile_picture: string
  bio: string
  availability_status: string
  experience_level?: string
  skills: string[]
  specialties?: string[]
  rating?: number
  reviews?: number
  years_experience?: string
  recent_work?: string
  recent_work_caption?: string
  is_profile_visible: boolean
  isLiveProfile: boolean
  pricing?: string
}

const departments = ["Camera", "Audio", "Lighting", "Production", "Art", "Hair & Makeup"]
const roles = [
  "Director of Photography",
  "Camera Operator",
  "Focus Puller",
  "Camera Assistant",
  "Sound Engineer",
  "Boom Operator",
  "Gaffer",
  "Best Boy Electric",
  "Key Grip",
  "Art Director",
  "Wardrobe Stylist",
  "Makeup Artist",
  "Hair Stylist",
  "Production Manager",
  "Script Supervisor",
]
const locations = ["Cape Town, SA", "Johannesburg, SA", "Durban, SA", "Pretoria, SA", "Port Elizabeth, SA"]

export default function FindCrewPage() {
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hireRequestMember, setHireRequestMember] = useState<CrewMember | null>(null)
  const [hireSheetOpen, setHireSheetOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [showMobileSearchFilters, setShowMobileSearchFilters] = useState(true)

  // Filter states
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedAvailability, setSelectedAvailability] = useState("")
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState("")

  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([])
  const [loading, setLoading] = useState(true)
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    fetchCrewMembers()
  }, [])

  useEffect(() => {
    let ticking = false

    const syncSearchFiltersVisibility = () => {
      const shouldShow = window.scrollY <= 8
      setShowMobileSearchFilters((current) => (current === shouldShow ? current : shouldShow))
      ticking = false
    }

    const handleScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(syncSearchFiltersVisibility)
    }

    syncSearchFiltersVisibility()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const fetchCrewMembers = async () => {
    try {
      setLoading(true)
      const supabase = createBrowserClient()

      // If Supabase client is not available, use mock data
      if (!supabase) {
        console.warn("[v0] Supabase client not available, using mock data")
        setCrewMembers(mockCrewMembers.map((m) => ({ ...m, isLiveProfile: false })))
        setUsingMockData(true)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select(`
          id, user_id, full_name, display_name, username, email, profession, bio, location, city, province,
          profile_image_url, profile_picture, avatar_url, cover_image_url, availability, availability_status, pricing,
          hourly_rate, daily_rate, project_rate, skills, social_links, portfolio_images,
          is_public, is_profile_visible, subscription_status, created_at, rating, review_count,
          years_experience, experience_level
        `)
        .eq("is_profile_visible", true)
        .eq("talent_type", "crew")
        .eq("subscription_status", "active")
        .order("created_at", { ascending: false })

      if (error) throw error

      const liveProfiles = (data || []).map((profile: any) => {
        const profileId = profile.user_id || profile.id
        const location = profile.location || [profile.city, profile.province].filter(Boolean).join(", ")
        const pricing =
          profile.pricing ||
          (profile.hourly_rate ? `R${profile.hourly_rate}/hr` : profile.daily_rate ? `R${profile.daily_rate}/day` : "")
        // There's no dedicated "recent work" column - use the first real
        // portfolio upload as the card's preview image/gallery shot instead.
        const portfolioImages: string[] = Array.isArray(profile.portfolio_images) ? profile.portfolio_images : []

        return {
          id: profileId,
          user_id: profileId,
          display_name: profile.display_name || profile.full_name || profile.username || "Unknown",
          full_name: profile.full_name || profile.display_name || profile.username || "Unknown",
          profession: profile.profession || "Film Crew",
          department: getDepartmentFromProfession(profile.profession),
          role: profile.profession,
          city: profile.city || location?.split(",")[0]?.trim() || "",
          province: profile.province || location?.split(",")[1]?.trim() || "SA",
          profile_picture:
            profile.cover_image_url || profile.profile_image_url || profile.profile_picture || profile.avatar_url || "",
          bio: profile.bio,
          availability_status: profile.availability_status || profile.availability || "available",
          skills: profile.skills || [],
          specialties: profile.skills || [],
          is_profile_visible: profile.is_profile_visible ?? profile.is_public ?? true,
          rating: profile.rating || 0,
          reviews: profile.review_count || 0,
          years_experience: profile.years_experience || "",
          experience_level: profile.experience_level || "",
          recent_work: portfolioImages[0] || "",
          isLiveProfile: true, // Flag to identify live profiles
          pricing,
        }
      })

      // Live profiles appear first, then mock profiles
      const combinedProfiles = [...liveProfiles, ...mockCrewMembers.map((m) => ({ ...m, isLiveProfile: false }))]

      setCrewMembers(combinedProfiles)
      setUsingMockData(liveProfiles.length === 0)
    } catch (error: any) {
      console.warn("[v0] Error fetching crew members, using mock data:", error?.message || error)
      setCrewMembers(mockCrewMembers.map((m) => ({ ...m, isLiveProfile: false })))
      setUsingMockData(true)
    } finally {
      setLoading(false)
    }
  }

  const getDepartmentFromProfession = (profession: string | null): string => {
    if (!profession) return "Production"
    const lowerProfession = profession.toLowerCase()
    if (
      lowerProfession.includes("camera") ||
      lowerProfession.includes("dop") ||
      lowerProfession.includes("cinematographer") ||
      lowerProfession.includes("videographer")
    )
      return "Camera"
    if (lowerProfession.includes("sound") || lowerProfession.includes("audio") || lowerProfession.includes("boom"))
      return "Audio"
    if (lowerProfession.includes("light") || lowerProfession.includes("gaffer") || lowerProfession.includes("grip"))
      return "Lighting"
    if (lowerProfession.includes("makeup") || lowerProfession.includes("hair") || lowerProfession.includes("stylist"))
      return "Hair & Makeup"
    if (lowerProfession.includes("art") || lowerProfession.includes("set") || lowerProfession.includes("props"))
      return "Art"
    return "Production"
  }

  // Filter crew members
  const filteredCrew = crewMembers.filter((member) => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const matchesSearch =
        member.display_name?.toLowerCase().includes(term) ||
        member.profession?.toLowerCase().includes(term) ||
        member.role?.toLowerCase().includes(term) ||
        member.city?.toLowerCase().includes(term) ||
        member.skills?.some((skill) => skill.toLowerCase().includes(term))
      if (!matchesSearch) return false
    }

    // Department filter
    if (selectedDepartments.length > 0 && member.department) {
      if (!selectedDepartments.includes(member.department)) return false
    }

    // Role filter
    if (selectedRoles.length > 0 && member.role) {
      if (!selectedRoles.includes(member.role)) return false
    }

    // Location filter
    if (selectedLocation && selectedLocation !== "All Locations") {
      const memberLocation = `${member.city}, ${member.province}`
      if (memberLocation !== selectedLocation) return false
    }

    // Availability filter
    if (selectedAvailability && selectedAvailability !== "All") {
      if (member.availability_status !== selectedAvailability.toLowerCase()) return false
    }

    // Experience level filter
    if (selectedExperienceLevel && selectedExperienceLevel !== "All Levels" && member.experience_level) {
      if (member.experience_level !== selectedExperienceLevel) return false
    }

    return true
  })

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedDepartments([])
    setSelectedRoles([])
    setSelectedLocation("")
    setSelectedAvailability("")
    setSelectedExperienceLevel("")
  }

  const hasActiveFilters =
    searchTerm ||
    selectedDepartments.length > 0 ||
    selectedRoles.length > 0 ||
    selectedLocation ||
    selectedAvailability ||
    selectedExperienceLevel

  const activeMobileFilterCount =
    selectedDepartments.length +
    selectedRoles.length +
    (selectedLocation && selectedLocation !== "All Locations" ? 1 : 0) +
    (selectedAvailability ? 1 : 0) +
    (selectedExperienceLevel && selectedExperienceLevel !== "All Levels" ? 1 : 0)

  const handleViewProfile = (member: CrewMember) => {
    setSelectedMember(member)
    setIsModalOpen(true)
  }

  const openHireRequest = (member: CrewMember) => {
    setHireRequestMember(member)
    setHireSheetOpen(true)
  }

  const toggleDepartment = (dept: string) => {
    setSelectedDepartments((prev) => (prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]))
  }

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  const setAvailabilityFilter = (status: string) => {
    setSelectedAvailability(status === "All" ? "" : status.toLowerCase())
  }

  // Filter sidebar component
  const FilterSidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`space-y-6 ${mobile ? "" : "sticky top-4"}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-primary hover:text-primary/80">
            Clear all
          </Button>
        )}
      </div>

      {/* Department Filter */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Department</h4>
        <div className="no-scrollbar space-y-2 max-h-40 overflow-y-auto pr-2">
          {departments.map((dept) => (
            <label key={dept} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={selectedDepartments.includes(dept)} onCheckedChange={() => toggleDepartment(dept)} />
              <span className="text-sm text-muted-foreground">{dept}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Role Filter */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Role</h4>
        <div className="no-scrollbar space-y-2 max-h-48 overflow-y-auto pr-2">
          {roles.map((role) => (
            <label key={role} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={selectedRoles.includes(role)} onCheckedChange={() => toggleRole(role)} />
              <span className="text-sm text-muted-foreground">{role}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Location</h4>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger>
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Locations">All Locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Availability Filter */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Availability</h4>
        <div className="space-y-2">
          {["All", "Available", "Booked"].map((status) => (
            <label key={status} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="availability"
                checked={selectedAvailability === status.toLowerCase() || (!selectedAvailability && status === "All")}
                onChange={() => setAvailabilityFilter(status)}
                className="text-primary"
              />
              <span className="text-sm text-muted-foreground">{status}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level Filter */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Experience Level</h4>
        <Select value={selectedExperienceLevel} onValueChange={setSelectedExperienceLevel}>
          <SelectTrigger>
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Levels">All Levels</SelectItem>
            <SelectItem value="Entry">Entry Level</SelectItem>
            <SelectItem value="Mid">Mid Level</SelectItem>
            <SelectItem value="Senior">Senior</SelectItem>
            <SelectItem value="Expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="md:hidden">
        <MobileShell
          title="Find Crew"
          rightAction={
            <Button
              variant="outline"
              className="w-full border-[#e8e0d5] bg-white text-[#111318]"
              onClick={() => setShowMobileFilters(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Open Filters
            </Button>
          }
        >
          <MotionRevealGroup className="rounded-[28px] border border-[#ece4da] bg-white p-4 shadow-[0_14px_34px_rgba(0,0,0,0.05)]">
            <motion.div
              initial={false}
              animate={
                showMobileSearchFilters
                  ? { opacity: 1, y: 0, maxHeight: 220, marginBottom: 12 }
                  : { opacity: 0, y: -18, maxHeight: 0, marginBottom: 0 }
              }
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="sticky top-[calc(72px+env(safe-area-inset-top))] z-20 -mx-1 shrink-0 overflow-hidden"
              style={{ pointerEvents: showMobileSearchFilters ? "auto" : "none" }}
            >
              <div className="space-y-3 rounded-[24px] bg-white/92 px-1 pb-3 pt-1 backdrop-blur-md supports-[backdrop-filter]:bg-white/84">
                <MotionRevealItem className="flex items-center gap-2 rounded-2xl border border-[#e7e0d6] bg-white px-3 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                  <Search className="h-4 w-4 text-[#73757d]" />
                  <Input
                    type="text"
                    placeholder="Search crew, role, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 border-0 bg-transparent p-0 text-[16px] shadow-none focus-visible:ring-0 md:text-[14px]"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowMobileFilters(true)}
                    whileTap={{ scale: 0.92 }}
                    className="grid h-9 w-9 min-w-9 shrink-0 place-items-center rounded-full border border-[#e7e0d6] bg-white"
                    aria-label="Open filters"
                  >
                    <SlidersHorizontal className="h-4 w-4 text-[#111318]" />
                  </motion.button>
                </MotionRevealItem>

                <MotionRevealItem className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {departments.slice(0, 5).map((dept) => (
                    <motion.button
                      key={dept}
                      type="button"
                      onClick={() => toggleDepartment(dept)}
                      whileTap={{ scale: 0.96 }}
                      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                        selectedDepartments.includes(dept)
                          ? "border-[#0d0f13] bg-[#0d0f13] text-white"
                          : "border-[#e7e0d6] bg-white text-[#20232b]"
                      }`}
                    >
                      {dept}
                    </motion.button>
                  ))}
                </MotionRevealItem>
              </div>
            </motion.div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={`mobile-skeleton-${i}`} className="rounded-[22px] border-[#eee6db]">
                      <CardContent className="p-4">
                        <Skeleton className="h-20 w-full rounded-xl" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredCrew.length > 0 ? (
                <MotionRevealGroup className="space-y-4">
                  {filteredCrew.map((member, index) => {
                  const projectCount = Math.round(((member.rating || 4.8) - 3.8) * 120)
                  const yearsCount = Number(member.years_experience?.replace(/\D/g, "").slice(0, 1) || 4)
                  const responseRate = Math.min(99, Math.round((member.rating || 4.8) * 20))

                  return (
                  <StickyScrollCard key={member.id} top="88px" delay={0.08 + index * 0.08}>
                  <DemoCardWrap isDemo={!member.isLiveProfile} borderRadius={22}>
                  <Card className="overflow-hidden rounded-[22px] border-[#eee6db] bg-white shadow-sm">
                    <CardContent className="p-0">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.38, ease: "easeOut" }}>
                        <Link href={`/crew/${member.id}`} className="relative block h-40 w-full overflow-hidden bg-[#f3f5f8]">
                        <img
                          src={member.recent_work || member.profile_picture || "/placeholder.svg"}
                          alt={member.display_name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#111318]">
                          {member.department || "Crew"}
                        </span>
                        {!member.isLiveProfile && (
                          <DemoProfileBadge className="absolute right-3 top-3 bg-white/95 shadow-md" />
                        )}
                        </Link>
                      </motion.div>
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[16px] font-semibold leading-tight text-[#111318]">{member.display_name}</p>
                            <p className="mt-0.5 text-[14px] font-medium text-[#ef1218]">{member.profession}</p>
                            <div className="mt-1 flex items-center gap-1 text-[12px] text-[#666b75]">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>
                                {member.city}, {member.province}
                              </span>
                            </div>
                            <div className="mt-2">
                              <AvailabilityStatusBadge ownerId={member.user_id || member.id} ownerType="crew" />
                            </div>
                          </div>
                          <SaveProfileButton
                            profileId={member.user_id || member.id}
                            profileName={member.display_name}
                            profileRole={member.profession}
                            profileLocation={[member.city, member.province].filter(Boolean).join(", ")}
                            profileImage={member.profile_picture || member.recent_work}
                            profileHref={`/crew/${member.id}`}
                            category="crew"
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 rounded-full border border-[#e7e0d6] bg-white"
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[12px]">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-current text-[#0d0f13]" />
                            <span className="font-semibold">
                              {member.rating ? `${member.rating.toFixed(1)} (${member.reviews || 0})` : "New"}
                            </span>
                          </div>
                          <span className="font-semibold text-[#0d0f13]">{member.pricing || "R950/hr"}</span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[#666b75]">{member.bio}</p>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="rounded-[20px] border border-[#e8edf5] bg-[#fbfcfe] px-2 py-3 text-center">
                            <p className="text-[18px] font-semibold leading-none text-[#111318]">
                              <AnimatedCount value={projectCount} suffix="+" />
                            </p>
                            <p className="mt-1 text-[11px] text-[#676b75]">Projects</p>
                          </div>
                          <div className="rounded-[20px] border border-[#e8edf5] bg-[#fbfcfe] px-2 py-3 text-center">
                            <p className="text-[18px] font-semibold leading-none text-[#111318]">
                              <AnimatedCount value={yearsCount} />
                            </p>
                            <p className="mt-1 text-[11px] text-[#676b75]">Years</p>
                          </div>
                          <div className="rounded-[20px] border border-[#e8edf5] bg-[#fbfcfe] px-2 py-3 text-center">
                            <p className="text-[18px] font-semibold leading-none text-[#111318]">
                              <AnimatedCount value={responseRate} suffix="%" />
                            </p>
                            <p className="mt-1 text-[11px] text-[#676b75]">Response</p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(member.specialties || member.skills || []).slice(0, 4).map((tag, i) => (
                            <Badge key={`${member.id}-tag-${i}`} className="rounded-full border-0 bg-[#111318] px-3 py-1 text-[11px] font-medium text-white">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <MessageButton recipientId={member.user_id} recipientName={member.display_name} variant="outline" className="h-9 w-full rounded-full border-[#e7e0d6] bg-white text-[12px]" />
                            {member.isLiveProfile ? (
                              <Button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault()
                                  event.stopPropagation()
                                  openHireRequest(member)
                                }}
                                className="h-9 w-full rounded-full bg-[#ef1218] text-[12px] font-semibold text-white shadow-[0_14px_26px_rgba(242,13,20,0.18)] hover:bg-[#d90d12]"
                              >
                                Hire
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                disabled
                                className="h-9 w-full rounded-full bg-[#ef1218]/40 text-[12px] font-semibold text-white"
                              >
                                Not hireable
                              </Button>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </DemoCardWrap>
                  </StickyScrollCard>
                  )
                  })}
                </MotionRevealGroup>
              ) : (
                <MotionRevealItem>
                  <div className="py-8">
                    <SnapScoutStateArt variant="empty">
                    <Button
                      variant="outline"
                      className="mt-3 rounded-full border-[#e7e0d6] bg-white"
                      onClick={clearAllFilters}
                    >
                      Clear Filters
                    </Button>
                    </SnapScoutStateArt>
                  </div>
                </MotionRevealItem>
              )}
            </div>
          </MotionRevealGroup>

            <Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
             <DialogContent
               unstyled
               showCloseButton={false}
               overlayClassName="fixed inset-0 z-[169] bg-white/22 backdrop-blur-[12px] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] supports-[backdrop-filter]:bg-white/16"
               className="fixed inset-x-0 bottom-0 top-auto z-[170] max-h-[88dvh] w-full max-w-none isolate gap-0 overflow-hidden rounded-b-none rounded-t-[30px] border-x-0 border-b-0 border-t border-[#e5e9f2] bg-white p-0 text-[#0b0b0d] shadow-[0_-24px_70px_rgba(0,0,0,0.22)] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:max-w-none"
             >
              <motion.div
                initial={{ y: 48, opacity: 0.94 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 48, opacity: 0.96 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex max-h-[88dvh] flex-col"
              >
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-[#d7dce6]" />
              <DialogHeader className="border-b border-[#e8edf5] bg-white px-5 pb-4 pt-4 text-left">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="text-[22px] leading-tight">Filters</DialogTitle>
                    <DialogDescription className="mt-1">
                      {activeMobileFilterCount ? `${activeMobileFilterCount} active` : `${filteredCrew.length} crew available`}
                    </DialogDescription>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    aria-label="Close filters"
                    whileTap={{ scale: 0.9, rotate: -8 }}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e1e7f1] bg-white text-[#111318] shadow-sm transition-colors hover:bg-[#f6f8fc]"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </DialogHeader>

              <div className="no-scrollbar max-h-[calc(88dvh-156px)] overflow-y-auto bg-white px-5 py-5">
                {activeMobileFilterCount > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {selectedDepartments.map((dept) => (
                      <Button
                        key={`active-dept-${dept}`}
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleDepartment(dept)}
                        className="h-8 rounded-full px-3 text-xs"
                      >
                        {dept}
                        <X className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    ))}
                    {selectedRoles.map((role) => (
                      <Button
                        key={`active-role-${role}`}
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleRole(role)}
                        className="h-8 rounded-full px-3 text-xs"
                      >
                        {role}
                        <X className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    ))}
                  </div>
                )}

                <div className="space-y-6">
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Department</p>
                      <span className="text-xs text-muted-foreground">{selectedDepartments.length} selected</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {departments.map((dept) => {
                        const selected = selectedDepartments.includes(dept)
                        return (
                          <Button
                            key={dept}
                            type="button"
                            variant={selected ? "default" : "outline"}
                            aria-pressed={selected}
                            onClick={() => toggleDepartment(dept)}
                            className="h-11 justify-start rounded-full px-4 text-sm"
                          >
                            {dept}
                          </Button>
                        )
                      })}
                    </div>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Role</p>
                      <span className="text-xs text-muted-foreground">{selectedRoles.length} selected</span>
                    </div>
                    <div className="no-scrollbar grid max-h-48 gap-2 overflow-y-auto pr-1">
                      {roles.map((role) => {
                        const selected = selectedRoles.includes(role)
                        return (
                          <button
                            key={role}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => toggleRole(role)}
                            className={`flex min-h-11 items-center justify-between rounded-2xl border px-3 text-left text-sm transition-colors ${
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-[#e1e7f1] bg-white text-[#111318] hover:bg-[#f6f8fc]"
                            }`}
                          >
                            <span>{role}</span>
                            <span
                              className={`ml-3 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                                selected ? "border-primary-foreground" : "border-border"
                              }`}
                              aria-hidden="true"
                            >
                              {selected && <Check className="h-3.5 w-3.5" />}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </section>

                  <section className="grid gap-4">
                    <div>
                      <p className="mb-3 text-sm font-semibold text-foreground">Location</p>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger className="h-12 rounded-2xl">
                          <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Locations">All Locations</SelectItem>
                          {locations.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-semibold text-foreground">Experience</p>
                      <Select value={selectedExperienceLevel} onValueChange={setSelectedExperienceLevel}>
                        <SelectTrigger className="h-12 rounded-2xl">
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Levels">All Levels</SelectItem>
                          <SelectItem value="Entry">Entry Level</SelectItem>
                          <SelectItem value="Mid">Mid Level</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </section>

                  <section>
                    <p className="mb-3 text-sm font-semibold text-foreground">Availability</p>
                    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-muted p-1">
                      {[
                        { label: "All", value: "" },
                        { label: "Available", value: "available" },
                        { label: "Booked", value: "booked" },
                      ].map((status) => (
                        <button
                          key={status.label}
                          type="button"
                          onClick={() => setSelectedAvailability(status.value)}
                          className={`h-10 rounded-xl text-sm font-medium transition-colors ${
                            selectedAvailability === status.value
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1.5fr] gap-3 border-t border-[#e8edf5] bg-white px-5 pb-[max(28px,calc(env(safe-area-inset-bottom)+14px))] pt-4">
                <Button
                  variant="outline"
                  className="h-[54px] rounded-full text-[15px] font-semibold"
                  onClick={() => {
                    clearAllFilters()
                  }}
                >
                  Reset
                </Button>
                <Button className="h-[54px] rounded-full text-[15px] font-semibold" onClick={() => setShowMobileFilters(false)}>
                  Show {filteredCrew.length} profiles
                </Button>
              </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        </MobileShell>
      </div>

      <div className="hidden md:block">
      {/* Header */}
      <div className="bg-background border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Find Film Crew</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Connect with talented film crew members in your area. From directors of photography to sound engineers, find
            the perfect team for your next production.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, role, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-card border-border"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Link href="/marketplace/post-gig">
              <Button className="bg-[#ffd6bf] text-[#4a1d12] hover:bg-[#ffc8a8]">Post a Gig</Button>
            </Link>
            <Link href="/marketplace/available-gigs">
              <Button className="bg-[#d40000] text-white hover:bg-[#b80000]">View Available Gigs</Button>
            </Link>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <Card className="p-6 bg-card border-border">
              <FilterSidebar />
            </Card>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
            <Button
              onClick={() => setShowDesktopFilters(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters{" "}
              {hasActiveFilters &&
                `(${selectedDepartments.length + selectedRoles.length + (selectedLocation ? 1 : 0)})`}
            </Button>
          </div>

          {/* Mobile Filters Modal */}
          <Dialog open={showDesktopFilters} onOpenChange={setShowDesktopFilters}>
            <DialogContent className="no-scrollbar max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Filters</DialogTitle>
              </DialogHeader>
              <FilterSidebar mobile />
              <Button onClick={() => setShowDesktopFilters(false)} className="mt-4">
                Apply Filters
              </Button>
            </DialogContent>
          </Dialog>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Available Crew Members ({filteredCrew.length})
                </h2>
                <p className="text-sm text-muted-foreground">Browse through our verified film crew professionals</p>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredCrew.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredCrew.map((member, index) => (
                  <StickyScrollCard key={member.id} top="116px" delay={0.08 + index * 0.06}>
                  <DemoCardWrap isDemo={!member.isLiveProfile} borderRadius={12}>
                  <Card
                    className="relative overflow-hidden bg-card border-border hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleViewProfile(member)}
                  >
                    <div className="relative h-48 w-full bg-muted">
                      <Image
                        src={member.profile_picture || member.recent_work || "/placeholder.svg?height=192&width=384"}
                        alt={member.display_name}
                        fill
                        className="object-cover"
                      />
                      {!member.isLiveProfile && (
                        <DemoProfileBadge className="absolute right-3 top-3 z-10 bg-white/95 shadow-md" />
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground truncate">{member.display_name}</h3>
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="text-sm font-medium">{(member.rating ?? 0) > 0 ? member.rating!.toFixed(1) : "New"}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{member.profession}</p>
                          {member.recent_work_caption && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {member.recent_work_caption}
                            </p>
                          )}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {member.department && (
                          <Badge variant="secondary" className="text-xs">
                            {member.department}
                          </Badge>
                        )}
                        <Badge
                          variant={member.availability_status === "available" ? "default" : "secondary"}
                          className={`text-xs ${
                            member.availability_status === "available"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {member.availability_status === "available" ? "Available" : "Booked"}
                        </Badge>
                        <AvailabilityStatusBadge ownerId={member.user_id || member.id} ownerType="crew" />
                        {member.experience_level && (
                          <Badge variant="outline" className="text-xs">
                            {member.experience_level}
                          </Badge>
                        )}
                      </div>

                      {/* Specialties */}
                      {member.specialties && member.specialties.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-1">Specialties:</p>
                          <div className="flex flex-wrap gap-1">
                            {member.specialties.slice(0, 3).map((specialty, i) => (
                              <span key={i} className="text-xs text-primary">
                                {specialty}
                                {i < Math.min(member.specialties!.length, 3) - 1 && " •"}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Location & Experience */}
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {member.city}, {member.province}
                          </span>
                        </div>
                        {member.years_experience && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            <span>{member.years_experience}</span>
                          </div>
                        )}
                      </div>

                      {/* Recent Work Preview */}
                      {member.recent_work && (
                        <div className="mt-4">
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Recent post
                          </p>
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                            <img
                              src={member.recent_work || "/placeholder.svg"}
                              alt="Recent work"
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {member.recent_work_caption && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {member.recent_work_caption}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <MessageButton
                            recipientId={member.user_id}
                            recipientName={member.display_name}
                            size="icon"
                            variant="outline"
                            className="shrink-0"
                          />
                          <SaveProfileButton
                            profileId={member.user_id || member.id}
                            profileName={member.display_name}
                            profileRole={member.profession}
                            profileLocation={[member.city, member.province].filter(Boolean).join(", ")}
                            profileImage={member.profile_picture || member.recent_work}
                            profileHref={`/crew/${member.id}`}
                            category="crew"
                            size="icon"
                            variant="outline"
                            className="shrink-0"
                          />
                          <SaveToPoolButton
                            profileId={member.user_id || member.id}
                            profileName={member.display_name}
                            size="icon"
                            variant="outline"
                            className="shrink-0"
                          />
                        </div>
                        <Link href={`/crew/${member.id}`} className="block w-full">
                          <Button className="w-full bg-red-700 hover:bg-red-800 text-white">View Full Profile</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                  </DemoCardWrap>
                  </StickyScrollCard>
                ))}
              </div>
            ) : (
              <Card className="border-border bg-card p-4">
                <SnapScoutStateArt variant="empty">
                {hasActiveFilters && (
                  <Button onClick={clearAllFilters} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Clear All Filters
                  </Button>
                )}
                </SnapScoutStateArt>
              </Card>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Profile Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-2 border-gray-200 shadow-2xl">
          {selectedMember && (
            <>
              <DialogHeader className="pb-4 border-b border-border">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20 border-2 border-border flex-shrink-0">
                    <AvatarImage
                      src={selectedMember.profile_picture || "/placeholder.svg"}
                      alt={selectedMember.display_name}
                    />
                    <AvatarFallback className="text-xl bg-muted text-muted-foreground">
                      {selectedMember.display_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-2xl font-bold text-foreground">
                      {selectedMember.display_name}
                    </DialogTitle>
                    <p className="text-base font-semibold text-primary mt-1">{selectedMember.profession}</p>
                    {selectedMember.recent_work_caption && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedMember.recent_work_caption}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      {(selectedMember.rating ?? 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-foreground">{selectedMember.rating!.toFixed(1)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">
                          {selectedMember.city}, {selectedMember.province}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {selectedMember.department && (
                    <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                      {selectedMember.department}
                    </Badge>
                  )}
                  <Badge
                    className={`text-xs font-semibold ${
                      selectedMember.availability_status === "available"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                    }`}
                  >
                    {selectedMember.availability_status === "available" ? "Available" : "Booked"}
                  </Badge>
                  {selectedMember.experience_level && (
                    <Badge variant="outline" className="text-xs">
                      {selectedMember.experience_level}
                    </Badge>
                  )}
                </div>

                {/* Bio */}
                {selectedMember.bio && (
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2 text-sm">About</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{selectedMember.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedMember.skills && selectedMember.skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 text-sm">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialties */}
                {selectedMember.specialties && selectedMember.specialties.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 text-sm">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.specialties.map((specialty, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-background">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Years Experience */}
                {selectedMember.years_experience && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Experience</p>
                      <p className="text-sm font-semibold text-foreground">{selectedMember.years_experience}</p>
                    </div>
                  </div>
                )}

                {/* Recent Work */}
                {selectedMember.recent_work && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 text-sm">Recent Work</h4>
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border">
                      <img
                        src={selectedMember.recent_work || "/placeholder.svg"}
                        alt="Recent work"
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {selectedMember.recent_work_caption && (
                      <p className="text-sm text-muted-foreground mt-2">{selectedMember.recent_work_caption}</p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-border sm:gap-3">
                  <MessageButton
                    recipientId={selectedMember.user_id}
                    recipientName={selectedMember.display_name}
                    className="h-12 w-12 min-w-12 shrink-0 rounded-full bg-primary p-0 text-primary-foreground hover:bg-primary/90"
                  />
                  <SaveProfileButton
                    profileId={selectedMember.user_id || selectedMember.id}
                    profileName={selectedMember.display_name}
                    profileRole={selectedMember.profession}
                    profileLocation={[selectedMember.city, selectedMember.province].filter(Boolean).join(", ")}
                    profileImage={selectedMember.profile_picture || selectedMember.recent_work}
                    profileHref={`/crew/${selectedMember.id}`}
                    category="crew"
                    className="h-12 w-12 min-w-12 shrink-0 rounded-full p-0"
                  />
                  <SaveToPoolButton
                    profileId={selectedMember.user_id || selectedMember.id}
                    profileName={selectedMember.display_name}
                    className="h-12 shrink-0 rounded-full"
                  />
                  <Link href={`/crew/${selectedMember.id}`} className="flex-1">
                    <Button className="h-12 w-full rounded-full bg-red-700 text-[14px] font-semibold text-white hover:bg-red-800">
                      View Full Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <HireRequestSheet
        open={hireSheetOpen && !!hireRequestMember}
        onOpenChange={(open) => {
          setHireSheetOpen(open)
          if (!open) setHireRequestMember(null)
        }}
        talentId={hireRequestMember?.user_id || hireRequestMember?.id || ""}
        talentName={hireRequestMember?.display_name || "Crew Member"}
        talentType="crew"
        priceLabel={hireRequestMember?.pricing || "R950/hr"}
      />
    </div>
  )
}
