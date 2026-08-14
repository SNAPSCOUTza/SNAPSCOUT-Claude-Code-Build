"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { User, Upload, Check, ChevronRight, ChevronLeft } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

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

const locations = ["Cape Town, SA", "Johannesburg, SA", "Durban, SA", "Pretoria, SA", "Port Elizabeth, SA"]

interface UserProfile {
  // Basic Info
  name: string
  email: string
  phone: string
  location: string

  // Professional Info
  departments: string[]
  roles: string[]
  primaryRole: string
  experienceLevel: "Entry" | "Mid" | "Senior"
  yearsExperience: number
  bio: string

  // Profile Details
  profilePicture: string
  specialties: string[]
  gear: string[]
  recentWork: string

  // Availability
  availability: "Available" | "Booked" | "Limited availability"

  // Social Media
  instagram: string
  facebook: string
  linkedin: string
  vimeo: string
}

export function AccountCreation() {
  const [currentStep, setCurrentStep] = useState(1)
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    location: "",
    departments: [],
    roles: [],
    primaryRole: "",
    experienceLevel: "Entry",
    yearsExperience: 1,
    bio: "",
    profilePicture: "",
    specialties: [],
    gear: [],
    recentWork: "",
    availability: "Available",
    instagram: "",
    facebook: "",
    linkedin: "",
    vimeo: "",
  })

  const totalSteps = 4

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSpecialtyToggle = (specialty: string) => {
    setProfile((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }))
  }

  const handleGearAdd = (gear: string) => {
    if (gear.trim() && !profile.gear.includes(gear.trim())) {
      setProfile((prev) => ({
        ...prev,
        gear: [...prev.gear, gear.trim()],
      }))
    }
  }

  const handleGearRemove = (gear: string) => {
    setProfile((prev) => ({
      ...prev,
      gear: prev.gear.filter((g) => g !== gear),
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleDepartmentToggle = (department: string) => {
    setProfile((prev) => {
      const newDepartments = prev.departments.includes(department)
        ? prev.departments.filter((d) => d !== department)
        : [...prev.departments, department]

      // Reset roles when departments change
      const availableRoles = newDepartments.flatMap(
        (dept) => departmentRoles[dept as keyof typeof departmentRoles] || [],
      )
      const validRoles = prev.roles.filter((role) => availableRoles.includes(role))

      return {
        ...prev,
        departments: newDepartments,
        roles: validRoles,
        primaryRole: validRoles.includes(prev.primaryRole) ? prev.primaryRole : "",
      }
    })
  }

  const handleRoleToggle = (role: string) => {
    setProfile((prev) => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
    }))
  }

  const availableRoles =
    profile.departments.length > 0
      ? [...new Set(profile.departments.flatMap((dept) => departmentRoles[dept as keyof typeof departmentRoles] || []))]
      : []

  const getSpecialtiesForDepartment = (department: string) => {
    const specialtyMap: Record<string, string[]> = {
      Camera: ["Steadicam", "Drone Operation", "Underwater", "Macro", "Time-lapse", "360° Video"],
      Audio: ["Location Recording", "Post-Production", "Foley", "ADR", "Music Recording", "Live Sound"],
      Lighting: ["LED Systems", "HMI", "Tungsten", "Color Temperature", "Practical Lighting", "Night Shooting"],
      Production: ["Scheduling", "Budgeting", "Permits", "Casting", "Script Analysis", "Continuity"],
      Art: ["Set Construction", "Props", "Wardrobe", "Makeup", "Special Effects", "Period Pieces"],
      "Hair & Makeup": [
        "Special Effects",
        "Period Looks",
        "Character Design",
        "Prosthetics",
        "Body Paint",
        "Hair Styling",
      ],
    }
    return specialtyMap[department] || []
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Create Your Profile</h1>
            <span className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-red-700 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Professional Details"}
              {currentStep === 3 && "Skills & Equipment"}
              {currentStep === 4 && "Profile & Social Media"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input
                    value={profile.name}
                    onChange={(e) => updateProfile("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateProfile("email", e.target.value)}
                    placeholder="your.email@example.com"
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => updateProfile("phone", e.target.value)}
                    placeholder="+27 XX XXX XXXX"
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={profile.location}
                    onChange={(e) => updateProfile("location", e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500"
                  >
                    <option value="">Select your location</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {/* Step 2: Professional Details */}
            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Departments</label>
                  <p className="text-xs text-gray-500 mb-3">Select all departments you work in</p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(departmentRoles).map((department) => (
                      <label
                        key={department}
                        className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={profile.departments.includes(department)}
                          onChange={() => handleDepartmentToggle(department)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700 font-medium">{department}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {availableRoles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Roles</label>
                    <p className="text-xs text-gray-500 mb-3">Select all roles you can perform</p>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {availableRoles.map((role, index) => (
                        <label
                          key={`${role}-${index}`}
                          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={profile.roles.includes(role)}
                            onChange={() => handleRoleToggle(role)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {profile.roles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Role</label>
                    <p className="text-xs text-gray-500 mb-2">Choose your main specialization</p>
                    <select
                      value={profile.primaryRole}
                      onChange={(e) => updateProfile("primaryRole", e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500"
                    >
                      <option value="">Select primary role</option>
                      {profile.roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                    <div className="space-y-2">
                      {["Entry", "Mid", "Senior"].map((level) => (
                        <label
                          key={level}
                          className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="experienceLevel"
                            value={level}
                            checked={profile.experienceLevel === level}
                            onChange={(e) => updateProfile("experienceLevel", e.target.value)}
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={profile.yearsExperience}
                      onChange={(e) => updateProfile("yearsExperience", Number.parseInt(e.target.value) || 1)}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => updateProfile("bio", e.target.value)}
                    placeholder="Tell us about yourself and your experience..."
                    rows={4}
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Skills & Equipment */}
            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {profile.departments
                      .flatMap((dept) => getSpecialtiesForDepartment(dept))
                      .map((specialty) => (
                        <label key={specialty} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profile.specialties.includes(specialty)}
                            onChange={() => handleSpecialtyToggle(specialty)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{specialty}</span>
                        </label>
                      ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment & Gear</label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Add equipment (press Enter)"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleGearAdd(e.currentTarget.value)
                          e.currentTarget.value = ""
                        }
                      }}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                    <div className="flex flex-wrap gap-2">
                      {profile.gear.map((item, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100"
                          onClick={() => handleGearRemove(item)}
                        >
                          {item} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recent Work</label>
                  <Input
                    value={profile.recentWork}
                    onChange={(e) => updateProfile("recentWork", e.target.value)}
                    placeholder="e.g., Netflix Series 'The Crown'"
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <div className="space-y-2">
                    {["Available", "Booked", "Limited availability"].map((status) => (
                      <label key={status} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="availability"
                          value={status}
                          checked={profile.availability === status}
                          onChange={(e) => updateProfile("availability", e.target.value)}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Profile & Social Media */}
            {currentStep === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {profile.profilePicture ? (
                        <Image
                          src={profile.profilePicture || "/placeholder.svg"}
                          alt="Profile"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <Button variant="outline" className="border-gray-300 hover:border-red-300 bg-transparent">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Social Media Profiles</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                    <Input
                      value={profile.instagram}
                      onChange={(e) => updateProfile("instagram", e.target.value)}
                      placeholder="https://instagram.com/username"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                    <Input
                      value={profile.facebook}
                      onChange={(e) => updateProfile("facebook", e.target.value)}
                      placeholder="https://facebook.com/username"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                    <Input
                      value={profile.linkedin}
                      onChange={(e) => updateProfile("linkedin", e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vimeo</label>
                    <Input
                      value={profile.vimeo}
                      onChange={(e) => updateProfile("vimeo", e.target.value)}
                      placeholder="https://vimeo.com/username"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="border-gray-300 hover:border-red-300 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={nextStep} className="bg-red-700 hover:bg-red-800">
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="bg-red-700 hover:bg-red-800"
                  onClick={() => {
                    // Handle profile creation
                    console.log("Profile created:", profile)
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Create Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
