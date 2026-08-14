"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, ArrowLeft } from "lucide-react"
import type { OnboardingData } from "@/app/onboarding/page"

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
const locations = ["Cape Town, SA", "Johannesburg, SA", "Durban, SA", "Pretoria, SA", "Port Elizabeth, SA"]

interface SpecializationSelectionProps {
  onNext: () => void
  onPrev: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

export default function SpecializationSelection({ onNext, onPrev, data, updateData }: SpecializationSelectionProps) {
  const handleDepartmentChange = (department: string) => {
    const currentDepts = data.departments || []
    const isSelected = currentDepts.includes(department)

    if (isSelected) {
      updateData({
        departments: currentDepts.filter((d) => d !== department),
        roles: (data.roles || []).filter(
          (role) => !departmentRoles[department as keyof typeof departmentRoles]?.includes(role),
        ),
      })
    } else {
      updateData({
        departments: [...currentDepts, department],
      })
    }
  }

  const handleRoleChange = (role: string) => {
    const currentRoles = data.roles || []
    const isSelected = currentRoles.includes(role)

    if (isSelected) {
      updateData({
        roles: currentRoles.filter((r) => r !== role),
      })
    } else {
      updateData({
        roles: [...currentRoles, role],
      })
    }
  }

  const getAvailableRoles = () => {
    const selectedDepts = data.departments || []
    if (selectedDepts.length === 0) {
      return Object.values(departmentRoles).flat()
    }
    return selectedDepts.flatMap((dept) => departmentRoles[dept as keyof typeof departmentRoles] || [])
  }

  const isFormValid = (data.departments?.length || 0) > 0 && (data.roles?.length || 0) > 0

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Professional Details</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tell us about your professional background and expertise
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-8"
      >
        {/* Department Selection */}
        <Card className="bg-white border-gray-300 shadow-lg">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Department {(data.departments?.length || 0) > 0 && `(${data.departments?.length})`}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.keys(departmentRoles).map((department) => (
                <label
                  key={department}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={data.departments?.includes(department) || false}
                    onChange={() => handleDepartmentChange(department)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{department}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Selection */}
        {(data.departments?.length || 0) > 0 && (
          <Card className="bg-white border-gray-300 shadow-lg">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Roles {(data.roles?.length || 0) > 0 && `(${data.roles?.length})`}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {getAvailableRoles().map((role, index) => (
                  <label
                    key={`${role}-${index}`}
                    className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={data.roles?.includes(role) || false}
                      onChange={() => handleRoleChange(role)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{role}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience and Location */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white border-gray-300 shadow-lg">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Experience Level</h3>
              <div className="space-y-2">
                {experienceLevels.map((level) => (
                  <label key={level} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="experienceLevel"
                      value={level}
                      checked={data.experienceLevel === level}
                      onChange={(e) => updateData({ experienceLevel: e.target.value })}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{level}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-300 shadow-lg">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Primary Location</h3>
              <select
                value={data.city || ""}
                onChange={(e) => updateData({ city: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500"
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-8 pb-8">
          <Button variant="ghost" onClick={onPrev} className="text-gray-900 hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={onNext}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg"
            size="lg"
            disabled={!isFormValid}
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
