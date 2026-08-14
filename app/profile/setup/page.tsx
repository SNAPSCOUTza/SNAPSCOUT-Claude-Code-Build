"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  MapPin,
  Camera,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Star,
  Award,
  Briefcase,
  Check,
  Monitor,
  Zap,
} from "lucide-react"
import { motion } from "framer-motion"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/auth"
import { useRouter } from "next/navigation"

// South African provinces and cities data - matching the directory structure
const southAfricanLocations = {
  "Western Cape": ["Cape Town", "Stellenbosch", "George", "Hermanus", "Paarl", "Worcester", "Mossel Bay", "Knysna"],
  Gauteng: ["Johannesburg", "Pretoria", "Sandton", "Centurion", "Randburg", "Roodepoort", "Germiston", "Benoni"],
  "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Newcastle", "Richards Bay", "Ladysmith", "Empangeni", "Pinetown"],
  "Eastern Cape": ["Port Elizabeth", "East London", "Grahamstown", "Uitenhage", "King William's Town", "Queenstown"],
  Limpopo: ["Polokwane", "Tzaneen", "Mokopane", "Thohoyandou", "Musina", "Giyani"],
  Mpumalanga: ["Nelspruit", "Witbank", "Secunda", "Standerton", "Middelburg", "Ermelo"],
  "North West": ["Rustenburg", "Klerksdorp", "Potchefstroom", "Mahikeng", "Brits", "Vryburg"],
  "Northern Cape": ["Kimberley", "Upington", "Springbok", "De Aar", "Kuruman", "Postmasburg"],
  "Free State": ["Bloemfontein", "Welkom", "Kroonstad", "Bethlehem", "Sasolburg", "Parys"],
}

// Comprehensive software and skills options
const softwareAndSkills = {
  // Video Editing Software
  videoEditing: [
    "Adobe Premiere Pro",
    "DaVinci Resolve",
    "Final Cut Pro",
    "CyberLink PowerDirector",
    "Wondershare Filmora",
    "iMovie",
    "CapCut",
    "KineMaster",
    "LumaFusion",
    "Avid Media Composer",
    "Adobe After Effects",
  ],

  // Photo Editing Software
  photoEditing: [
    "Adobe Photoshop",
    "Adobe Lightroom Classic",
    "Adobe Lightroom",
    "Adobe Photoshop Elements",
    "DxO PhotoLab",
    "Capture One",
    "CyberLink PhotoDirector",
    "Luminar Neo",
    "Photopea",
    "Canva",
    "GIMP",
    "Affinity Photo",
  ],

  // Technical Skills
  technicalSkills: [
    "Color Grading",
    "Color Correction",
    "Retouching",
    "Compositing",
    "Motion Graphics",
    "Visual Effects",
    "Audio Editing",
    "Sound Design",
    "3D Animation",
    "Green Screen",
    "Chroma Keying",
    "HDR Processing",
  ],

  // Photography Skills
  photographySkills: [
    "Studio Lighting",
    "Natural Light Photography",
    "Portrait Photography",
    "Wedding Photography",
    "Commercial Photography",
    "Product Photography",
    "Fashion Photography",
    "Event Photography",
    "Landscape Photography",
    "Street Photography",
    "Macro Photography",
    "Architectural Photography",
  ],

  // Videography Skills
  videographySkills: [
    "Cinematography",
    "Drone Operations",
    "Multi-Camera Setup",
    "Live Streaming",
    "Documentary Filming",
    "Music Video Production",
    "Corporate Video",
    "Wedding Videography",
    "Event Videography",
    "Commercial Video",
    "Social Media Content",
    "YouTube Production",
  ],
}

// Specialization options by user type
const specializationOptions = {
  creator: [
    "Photography",
    "Videography",
    "Cinematography",
    "Drone Operations",
    "Photo Editing",
    "Video Editing",
    "Color Grading",
    "Motion Graphics",
    "Sound Recording",
    "Music Production",
    "Lighting",
    "Art Direction",
  ],
  studio: [
    "Portrait Photography",
    "Commercial Photography",
    "Product Photography",
    "Fashion Photography",
    "Wedding Photography",
    "Event Photography",
    "Video Production",
    "Live Streaming",
    "Podcast Recording",
    "Green Screen",
  ],
  store: [
    "Camera Sales",
    "Lens Rental",
    "Equipment Repair",
    "Photography Courses",
    "Printing Services",
    "Custom Framing",
    "Vintage Cameras",
    "Digital Cameras",
  ],
}

interface ProfileData {
  // Basic Info
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string

  // Location
  selectedProvinces: string[]
  selectedCities: string[]
  willingToTravel: boolean

  // Professional Info
  userType: "creator" | "studio" | "store"
  specializations: string[]
  experience: string
  hourlyRate: string
  availability: string

  // Skills & Software
  softwareSkills: string[]
  technicalSkills: string[]
  photographySkills: string[]
  videographySkills: string[]

  // Portfolio & Social
  website: string
  instagram: string
  twitter: string
  linkedin: string
  imdb: string
  portfolioImages: string[]

  // Equipment (for creators)
  equipment: string[]

  // Services (for studios/stores)
  services: string[]

  // Verification
  verified: boolean
}

export default function ProfileSetupPage() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    selectedProvinces: [],
    selectedCities: [],
    willingToTravel: false,
    userType: "creator",
    specializations: [],
    experience: "",
    hourlyRate: "",
    availability: "Available",
    softwareSkills: [],
    technicalSkills: [],
    photographySkills: [],
    videographySkills: [],
    website: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    imdb: "",
    portfolioImages: [],
    equipment: [],
    services: [],
    verified: false,
  })

  const updateProfileData = (updates: Partial<ProfileData>) => {
    setProfileData((prev) => ({ ...prev, ...updates }))
  }

  const toggleProvince = (province: string) => {
    const isSelected = profileData.selectedProvinces.includes(province)
    if (isSelected) {
      // Remove province and all its cities
      const provinceCities = southAfricanLocations[province as keyof typeof southAfricanLocations] || []
      updateProfileData({
        selectedProvinces: profileData.selectedProvinces.filter((p) => p !== province),
        selectedCities: profileData.selectedCities.filter((c) => !provinceCities.includes(c)),
      })
    } else {
      // Add province
      updateProfileData({
        selectedProvinces: [...profileData.selectedProvinces, province],
      })
    }
  }

  const toggleCity = (city: string, province: string) => {
    const isSelected = profileData.selectedCities.includes(city)
    if (isSelected) {
      updateProfileData({
        selectedCities: profileData.selectedCities.filter((c) => c !== city),
      })
    } else {
      // Add city and ensure province is selected
      const updatedProvinces = profileData.selectedProvinces.includes(province)
        ? profileData.selectedProvinces
        : [...profileData.selectedProvinces, province]

      updateProfileData({
        selectedProvinces: updatedProvinces,
        selectedCities: [...profileData.selectedCities, city],
      })
    }
  }

  const toggleSpecialization = (spec: string) => {
    const isSelected = profileData.specializations.includes(spec)
    if (isSelected) {
      updateProfileData({
        specializations: profileData.specializations.filter((s) => s !== spec),
      })
    } else {
      updateProfileData({
        specializations: [...profileData.specializations, spec],
      })
    }
  }

  const toggleSkill = (
    skill: string,
    category: "softwareSkills" | "technicalSkills" | "photographySkills" | "videographySkills",
  ) => {
    const currentSkills = profileData[category]
    const isSelected = currentSkills.includes(skill)

    if (isSelected) {
      updateProfileData({
        [category]: currentSkills.filter((s) => s !== skill),
      })
    } else {
      updateProfileData({
        [category]: [...currentSkills, skill],
      })
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError("")
    setSuccess(false)

    try {
      const { error } = await supabase.from("user_profiles").upsert({
        user_id: user.id,
        full_name: `${profileData.firstName} ${profileData.lastName}`,
        display_name: profileData.firstName,
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.bio,
        city: profileData.selectedCities?.[0] || null, // Use first selected city
        province: profileData.selectedProvinces?.[0] || null, // Use first selected province
        provinces: profileData.selectedProvinces?.join(", ") || null, // Keep existing provinces field
        willing_to_travel: profileData.willingToTravel,
        user_type: profileData.userType,
        specializations: profileData.specializations,
        experience_years: profileData.experience,
        hourly_rate: profileData.hourlyRate,
        availability: profileData.availability,
        software_skills: profileData.softwareSkills,
        technical_skills: profileData.technicalSkills,
        photography_skills: profileData.photographySkills,
        videography_skills: profileData.videographySkills,
        website: profileData.website,
        instagram: profileData.instagram,
        twitter: profileData.twitter,
        linkedin: profileData.linkedin,
        imdb: profileData.imdb,
        portfolio_images: profileData.portfolioImages,
        equipment: profileData.equipment,
        services: profileData.services,
        verified: profileData.verified,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/profile/${user.id}`)
        }, 2000)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const checkUserAndSubscription = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/auth/login")
        return
      }

      setUser(currentUser)

      // Check subscription status
      const { data: subData } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", currentUser.id)
        .single()

      if (!subData || subData.status !== "active") {
        router.push("/subscribe")
        return
      }

      setSubscription(subData)

      // Load existing profile data if it exists
      const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", currentUser.id)
        .single()

      if (existingProfile) {
        setProfileData({
          firstName: existingProfile.first_name || "",
          lastName: existingProfile.last_name || "",
          email: existingProfile.email || "",
          phone: existingProfile.phone || "",
          bio: existingProfile.bio || "",
          selectedProvinces: existingProfile.selected_provinces || [],
          selectedCities: existingProfile.selected_cities || [],
          willingToTravel: existingProfile.willing_to_travel || false,
          userType: existingProfile.user_type || "creator",
          specializations: existingProfile.specializations || [],
          experience: existingProfile.experience || "",
          hourlyRate: existingProfile.hourly_rate || "",
          availability: existingProfile.availability || "Available",
          softwareSkills: existingProfile.software_skills || [],
          technicalSkills: existingProfile.technical_skills || [],
          photographySkills: existingProfile.photography_skills || [],
          videographySkills: existingProfile.videography_skills || [],
          website: existingProfile.website || "",
          instagram: existingProfile.instagram || "",
          twitter: existingProfile.twitter || "",
          linkedin: existingProfile.linkedin || "",
          imdb: existingProfile.imdb || "",
          portfolioImages: existingProfile.portfolio_images || [],
          equipment: existingProfile.equipment || [],
          services: existingProfile.services || [],
          verified: existingProfile.verified || false,
        })
      }

      setLoading(false)
    }

    checkUserAndSubscription()
  }, [router])

  const isBasicComplete = profileData.firstName && profileData.lastName && profileData.email
  const isLocationComplete = profileData.selectedProvinces.length > 0
  const isProfessionalComplete = profileData.specializations.length > 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile setup...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Complete Your Profile</h1>
            <p className="text-xl text-gray-300">
              Set up your professional profile to start connecting with opportunities
            </p>
          </div>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-8">
                  <TabsTrigger value="basic" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Basic Info</span>
                    {isBasicComplete && <Check className="w-4 h-4 text-green-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="location" className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Location</span>
                    {isLocationComplete && <Check className="w-4 h-4 text-green-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="professional" className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Professional</span>
                    {isProfessionalComplete && <Check className="w-4 h-4 text-green-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Skills & Software</span>
                  </TabsTrigger>
                  <TabsTrigger value="portfolio" className="flex items-center space-x-2">
                    <Camera className="w-4 h-4" />
                    <span>Portfolio</span>
                  </TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => updateProfileData({ firstName: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => updateProfileData({ lastName: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => updateProfileData({ email: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => updateProfileData({ phone: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="+27 XX XXX XXXX"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userType" className="text-white">
                      Account Type *
                    </Label>
                    <Select
                      value={profileData.userType}
                      onValueChange={(value: "creator" | "studio" | "store") => updateProfileData({ userType: value })}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="creator">Creative Professional</SelectItem>
                        <SelectItem value="studio">Studio/Venue</SelectItem>
                        <SelectItem value="store">Equipment Store</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-white">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => updateProfileData({ bio: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                      placeholder="Tell us about yourself and your work..."
                    />
                  </div>
                </TabsContent>

                {/* Location Tab */}
                <TabsContent value="location" className="space-y-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Service Locations *</h3>
                        <p className="text-sm text-gray-300">Select provinces and cities where you operate</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="travel"
                          checked={profileData.willingToTravel}
                          onCheckedChange={(checked) => updateProfileData({ willingToTravel: checked })}
                        />
                        <Label htmlFor="travel" className="text-white text-sm">
                          Willing to travel
                        </Label>
                      </div>
                    </div>

                    {/* Province Grid - Matching the screenshot layout */}
                    <div className="space-y-4">
                      <h4 className="text-white font-medium">
                        Select Provinces ({profileData.selectedProvinces.length}/9)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(southAfricanLocations).map(([province, cities]) => {
                          const isSelected = profileData.selectedProvinces.includes(province)
                          const selectedCitiesInProvince = profileData.selectedCities.filter((city) =>
                            cities.includes(city),
                          )

                          return (
                            <Card
                              key={province}
                              className={`cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? "bg-red-500/20 border-red-500/50 ring-2 ring-red-500/30"
                                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                              }`}
                              onClick={() => toggleProvince(province)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <MapPin className={`w-4 h-4 ${isSelected ? "text-red-400" : "text-gray-400"}`} />
                                    <h5 className={`font-medium ${isSelected ? "text-white" : "text-gray-300"}`}>
                                      {province}
                                    </h5>
                                  </div>
                                  {isSelected && (
                                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                      <Check className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-1">
                                  {cities.slice(0, 3).map((city) => (
                                    <Badge
                                      key={city}
                                      variant="secondary"
                                      className={`text-xs ${
                                        selectedCitiesInProvince.includes(city)
                                          ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                      }`}
                                    >
                                      {city}
                                    </Badge>
                                  ))}
                                  {cities.length > 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-gray-500/20 text-gray-400 border-gray-500/30"
                                    >
                                      +{cities.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>

                    {/* City Selection for Selected Provinces */}
                    {profileData.selectedProvinces.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-white font-medium">
                          Select Cities ({profileData.selectedCities.length} selected)
                        </h4>
                        <div className="space-y-4">
                          {profileData.selectedProvinces.map((province) => (
                            <Card key={province} className="bg-white/5 border-white/10">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-white text-sm flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 text-red-400" />
                                  {province}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex flex-wrap gap-2">
                                  {southAfricanLocations[province as keyof typeof southAfricanLocations]?.map(
                                    (city) => {
                                      const isSelected = profileData.selectedCities.includes(city)
                                      return (
                                        <Badge
                                          key={city}
                                          variant={isSelected ? "default" : "secondary"}
                                          className={`cursor-pointer transition-all ${
                                            isSelected
                                              ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                                              : "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border-gray-500/30"
                                          }`}
                                          onClick={() => toggleCity(city, province)}
                                        >
                                          {city}
                                          {isSelected && <Check className="w-3 h-3 ml-1" />}
                                        </Badge>
                                      )
                                    },
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selected Summary */}
                    {(profileData.selectedProvinces.length > 0 || profileData.selectedCities.length > 0) && (
                      <Card className="bg-green-500/10 border-green-500/20">
                        <CardContent className="p-4">
                          <h4 className="text-green-400 font-medium mb-3">Your Service Area:</h4>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              <span className="text-sm text-gray-300">Provinces:</span>
                              {profileData.selectedProvinces.map((province) => (
                                <Badge key={province} className="bg-red-500/20 text-red-300 border-red-500/30">
                                  {province}
                                </Badge>
                              ))}
                            </div>
                            {profileData.selectedCities.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                <span className="text-sm text-gray-300">Cities:</span>
                                {profileData.selectedCities.map((city) => (
                                  <Badge key={city} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                    {city}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {profileData.willingToTravel && (
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  ✈️ Willing to travel
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Professional Tab */}
                <TabsContent value="professional" className="space-y-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-white">Specializations *</Label>
                      <p className="text-sm text-gray-400">Select your areas of expertise</p>
                      <div className="grid md:grid-cols-3 gap-3">
                        {specializationOptions[profileData.userType]?.map((spec) => {
                          const isSelected = profileData.specializations.includes(spec)
                          return (
                            <div
                              key={spec}
                              onClick={() => toggleSpecialization(spec)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                                isSelected
                                  ? "border-red-500 bg-red-500/20 text-white"
                                  : "border-white/20 bg-white/5 text-gray-300 hover:border-white/40"
                              }`}
                            >
                              <span className="text-sm font-medium">{spec}</span>
                              {isSelected && <Check className="w-4 h-4 mx-auto mt-1 text-red-400" />}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="experience" className="text-white">
                          Experience Level
                        </Label>
                        <Select
                          value={profileData.experience}
                          onValueChange={(value) => updateProfileData({ experience: value })}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                            <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                            <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                            <SelectItem value="expert">Expert (10+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate" className="text-white">
                          Hourly Rate (ZAR)
                        </Label>
                        <Input
                          id="hourlyRate"
                          value={profileData.hourlyRate}
                          onChange={(e) => updateProfileData({ hourlyRate: e.target.value })}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="e.g., 500-1500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availability" className="text-white">
                        Current Availability
                      </Label>
                      <Select
                        value={profileData.availability}
                        onValueChange={(value) => updateProfileData({ availability: value })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Available">Available Now</SelectItem>
                          <SelectItem value="Busy">Busy This Month</SelectItem>
                          <SelectItem value="Booked">Fully Booked</SelectItem>
                          <SelectItem value="Seasonal">Seasonal Availability</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Skills & Software Tab */}
                <TabsContent value="skills" className="space-y-6">
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
                        <Star className="w-6 h-6 mr-2 text-red-500" />
                        Special Skills & Software
                      </h3>
                      <p className="text-gray-300">Select the software and skills you're proficient in</p>
                    </div>

                    {/* Video Editing Software */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Monitor className="w-5 h-5 mr-2 text-blue-400" />
                          Video Editing Software (
                          {
                            profileData.softwareSkills.filter((skill) => softwareAndSkills.videoEditing.includes(skill))
                              .length
                          }
                          )
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {softwareAndSkills.videoEditing.map((software) => {
                            const isSelected = profileData.softwareSkills.includes(software)
                            return (
                              <Badge
                                key={software}
                                variant={isSelected ? "default" : "secondary"}
                                className={`cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                                    : "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border-gray-500/30"
                                }`}
                                onClick={() => toggleSkill(software, "softwareSkills")}
                              >
                                {software}
                                {isSelected && <Check className="w-3 h-3 ml-1" />}
                              </Badge>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Photo Editing Software */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Camera className="w-5 h-5 mr-2 text-purple-400" />
                          Photo Editing Software (
                          {
                            profileData.softwareSkills.filter((skill) => softwareAndSkills.photoEditing.includes(skill))
                              .length
                          }
                          )
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {softwareAndSkills.photoEditing.map((software) => {
                            const isSelected = profileData.softwareSkills.includes(software)
                            return (
                              <Badge
                                key={software}
                                variant={isSelected ? "default" : "secondary"}
                                className={`cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-purple-500 hover:bg-purple-600 text-white"
                                    : "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border-gray-500/30"
                                }`}
                                onClick={() => toggleSkill(software, "softwareSkills")}
                              >
                                {software}
                                {isSelected && <Check className="w-3 h-3 ml-1" />}
                              </Badge>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Technical Skills */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                          Technical Skills ({profileData.technicalSkills.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {softwareAndSkills.technicalSkills.map((skill) => {
                            const isSelected = profileData.technicalSkills.includes(skill)
                            return (
                              <Badge
                                key={skill}
                                variant={isSelected ? "default" : "secondary"}
                                className={`cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                                    : "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border-gray-500/30"
                                }`}
                                onClick={() => toggleSkill(skill, "technicalSkills")}
                              >
                                {skill}
                                {isSelected && <Check className="w-3 h-3 ml-1" />}
                              </Badge>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Photography Skills */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Camera className="w-5 h-5 mr-2 text-green-400" />
                          Photography Skills ({profileData.photographySkills.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {softwareAndSkills.photographySkills.map((skill) => {
                            const isSelected = profileData.photographySkills.includes(skill)
                            return (
                              <Badge
                                key={skill}
                                variant={isSelected ? "default" : "secondary"}
                                className={`cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border-gray-500/30"
                                }`}
                                onClick={() => toggleSkill(skill, "photographySkills")}
                              >
                                {skill}
                                {isSelected && <Check className="w-3 h-3 ml-1" />}
                              </Badge>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Videography Skills */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Monitor className="w-5 h-5 mr-2 text-red-400" />
                          Videography Skills ({profileData.videographySkills.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {softwareAndSkills.videographySkills.map((skill) => {
                            const isSelected = profileData.videographySkills.includes(skill)
                            return (
                              <Badge
                                key={skill}
                                variant={isSelected ? "default" : "secondary"}
                                className={`cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-red-500 hover:bg-red-600 text-white"
                                    : "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border-gray-500/30"
                                }`}
                                onClick={() => toggleSkill(skill, "videographySkills")}
                              >
                                {skill}
                                {isSelected && <Check className="w-3 h-3 ml-1" />}
                              </Badge>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Skills Summary */}
                    {(profileData.softwareSkills.length > 0 ||
                      profileData.technicalSkills.length > 0 ||
                      profileData.photographySkills.length > 0 ||
                      profileData.videographySkills.length > 0) && (
                      <Card className="bg-gradient-to-r from-red-500/10 to-purple-500/10 border-red-500/20">
                        <CardContent className="p-4">
                          <h4 className="text-white font-medium mb-3 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-yellow-400" />
                            Your Skills Summary
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-300">Software: </span>
                              <span className="text-white font-medium">
                                {profileData.softwareSkills.length} selected
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-300">Technical: </span>
                              <span className="text-white font-medium">
                                {profileData.technicalSkills.length} selected
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-300">Photography: </span>
                              <span className="text-white font-medium">
                                {profileData.photographySkills.length} selected
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-300">Videography: </span>
                              <span className="text-white font-medium">
                                {profileData.videographySkills.length} selected
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Portfolio Tab */}
                <TabsContent value="portfolio" className="space-y-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-2">Portfolio & Social Links</h3>
                      <p className="text-gray-300">Connect your professional profiles and showcase your work</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-white flex items-center">
                          <Globe className="w-4 h-4 mr-2" />
                          Website
                        </Label>
                        <Input
                          id="website"
                          value={profileData.website}
                          onChange={(e) => updateProfileData({ website: e.target.value })}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagram" className="text-white flex items-center">
                          <Instagram className="w-4 h-4 mr-2" />
                          Instagram
                        </Label>
                        <Input
                          id="instagram"
                          value={profileData.instagram}
                          onChange={(e) => updateProfileData({ instagram: e.target.value })}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="@yourusername"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="twitter" className="text-white flex items-center">
                          <Twitter className="w-4 h-4 mr-2" />
                          Twitter
                        </Label>
                        <Input
                          id="twitter"
                          value={profileData.twitter}
                          onChange={(e) => updateProfileData({ twitter: e.target.value })}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="@yourusername"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="text-white flex items-center">
                          <Linkedin className="w-4 h-4 mr-2" />
                          LinkedIn Profile
                        </Label>
                        <Input
                          id="linkedin"
                          value={profileData.linkedin}
                          onChange={(e) => updateProfileData({ linkedin: e.target.value })}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                    </div>

                    {/* Professional Links Section */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white">Professional Links</CardTitle>
                        <p className="text-sm text-gray-400">Add your professional profiles for credibility</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="imdb" className="text-white">
                            IMDB Profile
                          </Label>
                          <Input
                            id="imdb"
                            value={profileData.imdb}
                            onChange={(e) => updateProfileData({ imdb: e.target.value })}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            placeholder="https://imdb.com/name/yourprofile"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white">Portfolio Images</CardTitle>
                        <p className="text-sm text-gray-400">Upload your best work to showcase your skills</p>
                      </CardHeader>
                      <CardContent>
                        <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400 mb-2">Drag and drop images here, or click to browse</p>
                          <Button
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                          >
                            Choose Files
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-white/20">
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Save as Draft
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={!isBasicComplete || !isLocationComplete || saving}
                  className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Complete Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
