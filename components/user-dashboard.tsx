"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Save, X, MapPin, Briefcase, DollarSign, User, Link, Star, Users } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import RoleManagementModal from "./role-management-modal"
import type { AccountType } from "@/types/onboarding"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const departmentRoles = {
  Camera: ["Director of Photography", "Camera Operator", "Focus Puller", "Camera Assistant"],
  Audio: ["Sound Engineer", "Boom Operator", "Sound Mixer", "Audio Post Supervisor"],
  Lighting: ["Gaffer", "Best Boy Electric", "Lighting Technician", "Electrician"],
  Production: ["Script Supervisor", "Assistant Director", "Production Manager", "Location Manager"],
  Art: ["Production Designer", "Art Director", "Set Decorator", "Props Master"],
  "Hair & Makeup": ["Makeup Artist", "Hair Stylist", "Special Effects Makeup", "Wardrobe Stylist"],
  "Post Production": ["Editor", "Colorist", "VFX Artist", "Motion Graphics Designer"],
  Direction: ["Director", "Assistant Director", "Script Supervisor", "Continuity"],
}

const experienceLevels = ["Entry-level", "Mid", "Senior"]
const availabilityOptions = ["Available", "Booked", "Partially Available"]
const locations = ["Cape Town, SA", "Johannesburg, SA", "Durban, SA", "Pretoria, SA", "Port Elizabeth, SA"]

// Added years of experience dropdown options to match Find Crew format
const yearsExperienceOptions = [
  "1+ years",
  "2+ years",
  "3+ years",
  "4+ years",
  "5+ years",
  "6+ years",
  "7+ years",
  "8+ years",
  "9+ years",
  "10+ years",
  "15+ years",
  "20+ years",
]

const allSpecialties = [
  "Cinematic Lighting",
  "Drone Operations",
  "Color Grading",
  "Location Recording",
  "Post-Production Mixing",
  "Foley Design",
  "LED Systems",
  "Practical Lighting",
  "Color Temperature Matching",
  "Continuity Management",
  "Script Analysis",
  "Digital Workflows",
  "Period Accuracy",
  "Set Construction",
  "Prop Sourcing",
  "Special Effects Makeup",
  "Character Design",
  "Prosthetics",
  "Narrative Editing",
  "Color Correction",
  "Sound Design",
  "Character Direction",
  "Visual Storytelling",
  "Actor Coaching",
  "Boom Operation",
  "Wireless Systems",
  "Location Audio",
  "Compositing",
  "3D Animation",
  "Motion Graphics",
]

const allGear = [
  "RED Komodo 6K",
  "DJI Ronin 4D",
  "ARRI SkyPanel S60",
  "Canon CN-E Primes",
  "Sound Devices 833",
  "Sennheiser MKH 416",
  "Zoom F8n Pro",
  "Audio-Technica BP4029",
  "ARRI SkyPanel S120",
  "Aputure 600D Pro",
  "Astera Titan Tubes",
  "LiteGear LiteMat Plus",
  "iPad Pro with ScriptE",
  "Polaroid Camera",
  "Continuity Binders",
  "Digital Timers",
  "SketchBook Pro",
  "3D Modeling Software",
  "Color Swatches",
  "Measuring Tools",
  "Airbrush System",
  "Professional Makeup Kit",
  "Prosthetic Materials",
  "Color Palettes",
  "Avid Media Composer",
  "DaVinci Resolve Studio",
  "Pro Tools",
  "High-End Workstation",
  "Director's Viewfinder",
  "Shot Lists",
  "Storyboard Software",
  "Communication Systems",
  "Rode NTG3",
  "Sound Devices MixPre-6",
  "K-Tek Boom Poles",
  "Wireless Transmitters",
  "After Effects",
  "Cinema 4D",
  "Nuke",
  "High-Performance Workstation",
]

const languages = [
  "English",
  "Afrikaans",
  "Zulu",
  "Xhosa",
  "Sotho",
  "Tswana",
  "Venda",
  "Tsonga",
  "Ndebele",
  "Swati",
  "French",
  "German",
  "Portuguese",
]

const socialPlatforms = ["Instagram", "Vimeo", "LinkedIn", "Facebook", "YouTube", "TikTok", "Twitter"]

interface UserProfile {
  id?: string
  full_name: string
  display_name: string
  bio: string
  profile_picture: string
  city: string
  province_country: string
  departments: string[]
  roles: string[]
  primary_role: string
  experience_level: string
  years_experience: string
  availability: string
  daily_rate: string
  hourly_rate: string
  project_rate: string
  languages_spoken: string[]
  services_offered: string[]
  gear_owned: string[]
  special_skills: string[]
  instagram: string
  youtube_vimeo: string
  linkedin: string
  website: string
  account_type?: AccountType
  specializations?: string[]
  created_at?: string
  updated_at?: string
  // Added fields for Supabase integration
  portfolio_items?: string[]
  skills?: string[]
  rate_range?: string
  is_public?: boolean
  // Removed fields not present in Supabase
  //  locations: string[]; // This seems to be a global constant, not part of the user profile
}

const UserDashboard = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Added loading state
  const [activeTab, setActiveTab] = useState("profile")
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
    display_name: "",
    bio: "",
    profile_picture: "",
    city: "",
    province_country: "",
    departments: [],
    roles: [],
    primary_role: "",
    experience_level: "",
    years_experience: "",
    availability: "Available",
    daily_rate: "",
    hourly_rate: "",
    project_rate: "",
    languages_spoken: [],
    services_offered: [],
    gear_owned: [],
    special_skills: [],
    instagram: "",
    youtube_vimeo: "",
    linkedin: "",
    website: "",
    // Initialize Supabase specific fields
    portfolio_items: [],
    skills: [],
    rate_range: "",
    is_public: false,
  })
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile)
  const [showRoleManagement, setShowRoleManagement] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  // Helper function to get current user
  const getCurrentUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.user
  }

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push("/auth/login")
          return
        }

        // Load from user_profiles (single source of truth)
        const { data: profileData, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", currentUser.id)
          .maybeSingle()

        if (error) {
          console.error("[v0] Error loading profile:", error.message)
        }

        if (profileData) {
          // Map database profile to component profile structure
          const mappedProfile: UserProfile = {
            id: profileData.id,
            full_name: profileData.full_name || "",
            display_name: profileData.full_name || "", // Assuming full_name can be used as display_name initially
            bio: profileData.bio || "",
            profile_picture: profileData.profile_picture || profileData.profile_image_url || "",
            city: "", // City is not directly in Supabase profile, might need a separate field or mapping
            province_country: profileData.location || profileData.city || "",
            departments: [], // Departments are not directly in Supabase profile
            roles: [], // Roles are not directly in Supabase profile
            primary_role: profileData.primary_role || "",
            specializations: [], // Specializations are not directly in Supabase profile
            experience_level: "", // Experience level not directly in Supabase profile
            years_experience: "", // Years of experience not directly in Supabase profile
            availability: profileData.availability || "Available", // Ensure availability matches options
            daily_rate: "", // Daily rate not directly in Supabase profile
            hourly_rate: "", // Hourly rate not directly in Supabase profile
            project_rate: "", // Project rate not directly in Supabase profile
            languages_spoken: [], // Languages spoken not directly in Supabase profile
            services_offered: [], // Services offered not directly in Supabase profile
            gear_owned: [], // Gear owned not directly in Supabase profile
            special_skills: profileData.skills || [], // Mapping skills from Supabase
            instagram: profileData.instagram || "",
            youtube_vimeo: profileData.youtube || "",
            linkedin: profileData.linkedin || "",
            website: profileData.website || "",
            account_type: profileData.account_type || profileData.user_type || "film_crew",
            portfolio_items: profileData.portfolio_images || [],
            skills: profileData.skills || [], // Redundant if special_skills is used, but keeping for now
            rate_range: profileData.hourly_rate || profileData.daily_rate || profileData.project_rate || "",
            is_public: profileData.is_profile_visible ?? false,
            created_at: profileData.created_at,
            updated_at: profileData.updated_at,
          }
          setProfile(mappedProfile)
          setEditedProfile(mappedProfile)
        }
      } catch (error) {
        console.error("[v0] Error loading profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const updateEditedProfile = (field: keyof UserProfile, value: any) => {
    setEditedProfile((prevProfile) => ({
      ...prevProfile,
      [field]: value,
    }))
  }

  const handleDepartmentChange = (department: string) => {
    const currentDepts = editedProfile.departments || []
    const isSelected = currentDepts.includes(department)

    if (isSelected) {
      const newDepts = currentDepts.filter((d) => d !== department)
      const newRoles = (editedProfile.roles || []).filter(
        (role) => !departmentRoles[department as keyof typeof departmentRoles]?.includes(role),
      )
      updateEditedProfile("departments", newDepts)
      updateEditedProfile("roles", newRoles)
    } else {
      updateEditedProfile("departments", [...currentDepts, department])
    }
  }

  const handleRoleChange = (role: string) => {
    const currentRoles = editedProfile.roles || []
    const isSelected = currentRoles.includes(role)

    if (isSelected) {
      updateEditedProfile(
        "roles",
        currentRoles.filter((r) => r !== role),
      )
    } else {
      updateEditedProfile("roles", [...currentRoles, role])
    }
  }

  const handleSpecialtyChange = (specialty: string) => {
    const currentSkills = editedProfile.special_skills || []
    const isSelected = currentSkills.includes(specialty)

    if (isSelected) {
      updateEditedProfile(
        "special_skills",
        currentSkills.filter((s) => s !== specialty),
      )
    } else {
      updateEditedProfile("special_skills", [...currentSkills, specialty])
    }
  }

  const handleGearChange = (gear: string) => {
    const currentGear = editedProfile.gear_owned || []
    const isSelected = currentGear.includes(gear)

    if (isSelected) {
      updateEditedProfile(
        "gear_owned",
        currentGear.filter((g) => g !== gear),
      )
    } else {
      updateEditedProfile("gear_owned", [...currentGear, gear])
    }
  }

  const handleLanguageChange = (language: string) => {
    const currentLanguages = editedProfile.languages_spoken || []
    const isSelected = currentLanguages.includes(language)

    if (isSelected) {
      updateEditedProfile(
        "languages_spoken",
        currentLanguages.filter((l) => l !== language),
      )
    } else {
      updateEditedProfile("languages_spoken", [...currentLanguages, language])
    }
  }

  const getAvailableRoles = () => {
    const selectedDepts = editedProfile.departments || []
    if (selectedDepts.length === 0) {
      return Object.values(departmentRoles).flat()
    }
    return selectedDepts.flatMap((dept) => departmentRoles[dept as keyof typeof departmentRoles] || [])
  }

  const saveProfile = async () => {
    setIsSaving(true)
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        console.error("[v0] No user found")
        return
      }

      // Map component profile back to database structure
      const profileToSave = {
        user_id: currentUser.id,
        full_name: editedProfile.full_name,
        bio: editedProfile.bio,
        profile_picture: editedProfile.profile_picture,
        location: editedProfile.province_country || editedProfile.city,
        city: editedProfile.city || editedProfile.province_country,
        availability: editedProfile.availability,
        availability_status: editedProfile.availability,
        is_profile_visible: editedProfile.is_public,
        instagram: editedProfile.instagram,
        youtube: editedProfile.youtube_vimeo,
        linkedin: editedProfile.linkedin,
        website: editedProfile.website,
        portfolio_images: editedProfile.portfolio_items,
        skills: editedProfile.special_skills, // Mapping special_skills to skills in Supabase
        hourly_rate: editedProfile.hourly_rate || editedProfile.rate_range,
        daily_rate: editedProfile.daily_rate || null,
        project_rate: editedProfile.project_rate || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("user_profiles").upsert(profileToSave, { onConflict: "user_id" })

      if (error) {
        console.error("[v0] Error saving profile:", error.message)
      } else {
        console.log("[v0] Profile saved successfully")
        setProfile(editedProfile)
        setIsEditing(false)
      }
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const getAvailabilityBadgeColor = (availability: string) => {
    switch (availability) {
      case "Available":
        return "bg-green-100 text-green-800 border-green-200"
      case "Booked":
        return "bg-red-100 text-red-800 border-red-200"
      case "Partially Available":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    // Placeholder for actual update logic
    console.log("Updating profile with:", updates)
    // This function is used for the quick toggle and might need to be integrated with saveProfile
    // or have its own Supabase call.
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        console.error("No user found to update profile.")
        return
      }
      const { error } = await supabase.from("user_profiles").update(updates).eq("user_id", currentUser.id)
      if (error) {
        console.error("Error updating profile:", error.message)
      } else {
        console.log("Profile updated successfully.")
        // Update local state immediately for UI feedback
        setProfile((prev) => ({ ...prev, ...updates }))
        setEditedProfile((prev) => ({ ...prev, ...updates }))
      }
    } catch (error) {
      console.error("An unexpected error occurred during profile update:", error)
    }
  }

  const handleRoleManagementSave = (data: {
    accountType: AccountType
    roles: string[]
    specializations: string[]
  }) => {
    // Update profile with new role data
    updateEditedProfile("account_type", data.accountType)
    if (data.accountType === "film_crew") {
      updateEditedProfile("roles", data.roles)
      updateEditedProfile("specializations", [])
    } else {
      updateEditedProfile("specializations", data.specializations)
      updateEditedProfile("roles", [])
    }

    // Auto-save the changes
    handleSave()
  }

  const handleSave = () => {
    saveProfile()
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading profile...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profile Dashboard</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-red-600 hover:bg-red-700">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button onClick={saveProfile} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button onClick={cancelEdit} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Profile Preview - Fixed Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-gray-200 shadow-lg sticky top-6">
            <CardContent className="p-6 text-center space-y-4">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={profile.profile_picture || "/placeholder.svg"} alt={profile.display_name} />
                <AvatarFallback className="bg-red-100 text-red-600 text-2xl font-bold">
                  {profile.display_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-900">{profile.display_name}</h2>
                <p className="text-gray-600">{profile.primary_role}</p>

                <div className="flex items-center justify-center space-x-1 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile.province_country || profile.city}</span>
                </div>

                <Badge className={getAvailabilityBadgeColor(profile.availability)}>{profile.availability}</Badge>
              </div>

              {profile.departments && profile.departments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">Departments</h4>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {profile.departments.map((dept) => (
                      <Badge key={dept} variant="outline" className="text-xs">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.special_skills && profile.special_skills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">Top Skills</h4>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {profile.special_skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Tabbed Interface */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="professional" className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span>Professional</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Skills & Gear</span>
              </TabsTrigger>
              <TabsTrigger value="rates" className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Rates</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center space-x-2">
                <Link className="w-4 h-4" />
                <span>Social</span>
              </TabsTrigger>
              <TabsTrigger value="saved-gigs" className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span>Saved Gigs</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Basic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display Name *</Label>
                      {isEditing ? (
                        <Input
                          id="display_name"
                          value={editedProfile.display_name}
                          onChange={(e) => updateEditedProfile("display_name", e.target.value)}
                          placeholder="Your professional name"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profile.display_name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="full_name"
                          value={editedProfile.full_name}
                          onChange={(e) => updateEditedProfile("full_name", e.target.value)}
                          placeholder="Your full legal name"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profile.full_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={editedProfile.bio}
                        onChange={(e) => updateEditedProfile("bio", e.target.value)}
                        placeholder="Tell us about your experience and passion..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.bio}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile_picture">Profile Picture URL</Label>
                    {isEditing ? (
                      <Input
                        id="profile_picture"
                        value={editedProfile.profile_picture}
                        onChange={(e) => updateEditedProfile("profile_picture", e.target.value)}
                        placeholder="https://example.com/your-photo.jpg"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.profile_picture || "No image set"}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      {isEditing ? (
                        <Select
                          value={editedProfile.city}
                          onValueChange={(value) => updateEditedProfile("city", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your city" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-gray-900 py-2">{profile.city}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                      {isEditing ? (
                        <Select
                          value={editedProfile.availability}
                          onValueChange={(value) => updateEditedProfile("availability", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent>
                            {availabilityOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Badge className={getAvailabilityBadgeColor(profile.availability)}>
                            {profile.availability}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Quick Toggle:</span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm ${profile.availability === "Available" ? "text-green-600 font-medium" : "text-gray-400"}`}
                              >
                                Available
                              </span>
                              <Switch
                                checked={profile.availability === "Booked"}
                                onCheckedChange={async (checked) => {
                                  const newAvailability = checked ? "Booked" : "Available"
                                  await updateProfile({ availability: newAvailability })
                                }}
                                className="data-[state=checked]:bg-red-600"
                              />
                              <span
                                className={`text-sm ${profile.availability === "Booked" ? "text-red-600 font-medium" : "text-gray-400"}`}
                              >
                                Booked
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Professional Tab */}
            <TabsContent value="professional" className="space-y-6">
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="w-5 h-5" />
                      <span>Professional Information</span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => setShowRoleManagement(true)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Roles
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Departments */}
                  <div className="space-y-2">
                    <Label>
                      Departments{" "}
                      {(editedProfile.departments?.length || 0) > 0 && `(${editedProfile.departments?.length})`}
                    </Label>
                    {isEditing ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {Object.keys(departmentRoles).map((department) => (
                          <label
                            key={department}
                            className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={editedProfile.departments?.includes(department) || false}
                              onChange={() => handleDepartmentChange(department)}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{department}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.departments?.map((dept) => (
                          <Badge key={dept} variant="outline">
                            {dept}
                          </Badge>
                        )) || <p className="text-gray-500">No departments selected</p>}
                      </div>
                    )}
                  </div>

                  {/* Roles */}
                  {(isEditing ? editedProfile.departments?.length : profile.departments?.length) > 0 && (
                    <div className="space-y-2">
                      <Label>
                        Roles {(editedProfile.roles?.length || 0) > 0 && `(${editedProfile.roles?.length})`}
                      </Label>
                      {isEditing ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                          {getAvailableRoles().map((role, index) => (
                            <label
                              key={`${role}-${index}`}
                              className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={editedProfile.roles?.includes(role) || false}
                                onChange={() => handleRoleChange(role)}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                              <span className="text-xs text-gray-700">{role}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profile.roles?.map((role, index) => (
                            <Badge key={`role-${index}`} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          )) || <p className="text-gray-500">No roles selected</p>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Primary Role */}
                  {(isEditing ? editedProfile.roles?.length : profile.roles?.length) > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="primary_role">Primary Role</Label>
                      {isEditing ? (
                        <Select
                          value={editedProfile.primary_role}
                          onValueChange={(value) => updateEditedProfile("primary_role", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select primary role" />
                          </SelectTrigger>
                          <SelectContent>
                            {(editedProfile.roles || []).map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-gray-900 py-2">{profile.primary_role}</p>
                      )}
                    </div>
                  )}

                  {/* Experience */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience_level">Experience Level</Label>
                      {isEditing ? (
                        <Select
                          value={editedProfile.experience_level}
                          onValueChange={(value) => updateEditedProfile("experience_level", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {experienceLevels.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-gray-900 py-2">{profile.experience_level}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="years_experience">Years of Experience</Label>
                      {isEditing ? (
                        <Select
                          value={editedProfile.years_experience}
                          onValueChange={(value) => updateEditedProfile("years_experience", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience range" />
                          </SelectTrigger>
                          <SelectContent>
                            {yearsExperienceOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-gray-900 py-2">{profile.years_experience}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Languages Spoken{" "}
                      {(editedProfile.languages_spoken?.length || 0) > 0 &&
                        `(${editedProfile.languages_spoken?.length})`}
                    </Label>
                    {isEditing ? (
                      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                        {languages.map((language) => (
                          <label
                            key={language}
                            className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={editedProfile.languages_spoken?.includes(language) || false}
                              onChange={() => handleLanguageChange(language)}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-xs text-gray-700">{language}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.languages_spoken?.map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        )) || <p className="text-gray-500">No languages selected</p>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills & Gear Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5" />
                    <span>Skills & Equipment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>
                      Specialties{" "}
                      {(editedProfile.special_skills?.length || 0) > 0 && `(${editedProfile.special_skills?.length})`}
                    </Label>
                    {isEditing ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {allSpecialties.map((specialty) => (
                          <label
                            key={specialty}
                            className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={editedProfile.special_skills?.includes(specialty) || false}
                              onChange={() => handleSpecialtyChange(specialty)}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-xs text-gray-700">{specialty}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.special_skills?.map((skill, index) => (
                          <Badge key={`skill-${index}`} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        )) || <p className="text-gray-500">No specialties selected</p>}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Equipment & Gear{" "}
                      {(editedProfile.gear_owned?.length || 0) > 0 && `(${editedProfile.gear_owned?.length})`}
                    </Label>
                    {isEditing ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {allGear.map((gear) => (
                          <label
                            key={gear}
                            className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={editedProfile.gear_owned?.includes(gear) || false}
                              onChange={() => handleGearChange(gear)}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-xs text-gray-700">{gear}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.gear_owned?.map((gear, index) => (
                          <Badge key={`gear-${index}`} variant="outline" className="text-xs">
                            {gear}
                          </Badge>
                        )) || <p className="text-gray-500">No equipment selected</p>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rates Tab */}
            <TabsContent value="rates" className="space-y-6">
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5" />
                    <span>Rates & Pricing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourly_rate">Hourly Rate (R)</Label>
                      {isEditing ? (
                        <Input
                          id="hourly_rate"
                          type="number"
                          value={editedProfile.hourly_rate}
                          onChange={(e) => updateEditedProfile("hourly_rate", e.target.value)}
                          placeholder="500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">R{profile.hourly_rate || "Not set"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="daily_rate">Daily Rate (R)</Label>
                      {isEditing ? (
                        <Input
                          id="daily_rate"
                          type="number"
                          value={editedProfile.daily_rate}
                          onChange={(e) => updateEditedProfile("daily_rate", e.target.value)}
                          placeholder="2500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">R{profile.daily_rate || "Not set"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project_rate">Project Rate (R)</Label>
                      {isEditing ? (
                        <Input
                          id="project_rate"
                          type="number"
                          value={editedProfile.project_rate}
                          onChange={(e) => updateEditedProfile("project_rate", e.target.value)}
                          placeholder="15000"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">R{profile.project_rate || "Not set"}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Tab */}
            <TabsContent value="social" className="space-y-6">
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Link className="w-5 h-5" />
                    <span>Social & Portfolio Links</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      {isEditing ? (
                        <Input
                          id="instagram"
                          value={editedProfile.instagram}
                          onChange={(e) => updateEditedProfile("instagram", e.target.value)}
                          placeholder="@username"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profile.instagram || "Not set"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="youtube_vimeo">YouTube/Vimeo</Label>
                      {isEditing ? (
                        <Input
                          id="youtube_vimeo"
                          value={editedProfile.youtube_vimeo}
                          onChange={(e) => updateEditedProfile("youtube_vimeo", e.target.value)}
                          placeholder="Channel URL"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profile.youtube_vimeo || "Not set"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      {isEditing ? (
                        <Input
                          id="linkedin"
                          value={editedProfile.linkedin}
                          onChange={(e) => updateEditedProfile("linkedin", e.target.value)}
                          placeholder="LinkedIn profile URL"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profile.linkedin || "Not set"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      {isEditing ? (
                        <Input
                          id="website"
                          value={editedProfile.website}
                          onChange={(e) => updateEditedProfile("website", e.target.value)}
                          placeholder="https://yourwebsite.com"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profile.website || "Not set"}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Saved Gigs Tab */}
            <TabsContent value="saved-gigs" className="space-y-6">
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5" />
                    <span>Saved Gigs</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const savedGigs = JSON.parse(localStorage.getItem("savedGigs") || localStorage.getItem("savedJobs") || "[]")

                      if (savedGigs.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No saved gigs yet</p>
                            <p className="text-sm text-gray-400 mt-1">
                              Save gigs from the marketplace to view them here
                            </p>
                          </div>
                        )
                      }

                      return savedGigs.map((gig: any) => (
                        <div key={gig.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{gig.title}</h3>
                              <p className="text-gray-600">{gig.company}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>{gig.location}</span>
                                <span>{gig.budget}</span>
                                <span>{gig.duration}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updatedGigs = savedGigs.filter((savedGig: any) => savedGig.id !== gig.id)
                                  localStorage.setItem("savedGigs", JSON.stringify(updatedGigs))
                                  window.location.reload()
                                }}
                              >
                                Remove
                              </Button>
                              <Button size="sm" asChild>
                                <a href={`/marketplace/gigs/${gig.id}`}>View Gig</a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <RoleManagementModal
        isOpen={showRoleManagement}
        onClose={() => setShowRoleManagement(false)}
        currentAccountType={(profile.account_type as AccountType) || "content_creator"}
        currentRoles={profile.roles || []}
        currentSpecializations={profile.specializations || []}
        onSave={handleRoleManagementSave}
      />
    </div>
  )
}

export default UserDashboard

