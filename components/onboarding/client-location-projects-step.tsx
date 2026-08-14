"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, MapPin, Calendar } from "lucide-react"
import type { OnboardingData } from "@/types/account-types"

interface ClientLocationProjectsStepProps {
  onNext: () => void
  onPrev: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const southAfricanProvinces = [
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

const projectTypesOptions = {
  studio: [
    "Feature Films",
    "TV Series",
    "Documentaries",
    "Commercials",
    "Music Videos",
    "Corporate Videos",
    "Short Films",
    "Web Series",
    "Live Events",
    "Animation Projects",
  ],
  store: [
    "Product Photography",
    "Brand Photography",
    "Social Media Content",
    "E-commerce Photography",
    "Lifestyle Photography",
    "Event Photography",
    "Corporate Photography",
    "Video Advertisements",
    "Product Videos",
    "Brand Storytelling",
  ],
  scout: [
    "Film Casting",
    "TV Casting",
    "Commercial Casting",
    "Theater Casting",
    "Fashion Casting",
    "Print Advertising",
    "Voice Over Casting",
    "Background Casting",
    "Specialty Casting",
    "International Casting",
  ],
}

export default function ClientLocationProjectsStep({
  onNext,
  onPrev,
  data,
  updateData,
}: ClientLocationProjectsStepProps) {
  const accountType = data.accountType!
  const isStudio = accountType === "studio"
  const isStore = accountType === "store"
  const isScout = accountType === "scout"

  const getTitle = () => {
    if (isStudio) return "Location & Project Types"
    if (isStore) return "Location & Content Types"
    if (isScout) return "Location & Casting Focus"
    return "Location & Projects"
  }

  const getSubtitle = () => {
    if (isStudio) return "Where do you operate and what types of productions do you work on?"
    if (isStore) return "Where is your business located and what content do you typically need?"
    if (isScout) return "Where do you operate and what types of casting do you focus on?"
    return "Tell us about your location and project focus"
  }

  const getProjectTypesOptions = () => {
    if (isStudio) return projectTypesOptions.studio
    if (isStore) return projectTypesOptions.store
    if (isScout) return projectTypesOptions.scout
    return []
  }

  const handleProvinceChange = (province: string) => {
    updateData({ province })
  }

  const handleProjectTypeToggle = (projectType: string) => {
    const currentTypes = data.projectTypes || []
    const isSelected = currentTypes.includes(projectType)

    if (isSelected) {
      updateData({ projectTypes: currentTypes.filter((type) => type !== projectType) })
    } else {
      updateData({ projectTypes: [...currentTypes, projectType] })
    }
  }

  const handleRemoteCapableChange = (checked: boolean) => {
    updateData({ remoteCapable: checked })
  }

  const canProceed = data.province && (data.projectTypes || []).length > 0

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center">
            <MapPin className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{getTitle()}</h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">{getSubtitle()}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-6"
      >
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="province" className="text-sm font-medium text-gray-700">
                  Primary Province *
                </Label>
                <Select value={data.province} onValueChange={handleProvinceChange}>
                  <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Select your primary province" />
                  </SelectTrigger>
                  <SelectContent>
                    {southAfricanProvinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-3 pt-6">
                <Checkbox
                  id="remoteCapable"
                  checked={data.remoteCapable}
                  onCheckedChange={handleRemoteCapableChange}
                  className="border-gray-300"
                />
                <div className="space-y-1">
                  <Label htmlFor="remoteCapable" className="text-sm font-medium text-gray-700 cursor-pointer">
                    {isStudio ? "Work with remote talent" : isStore ? "Work with remote creators" : "Remote casting"}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {isStudio
                      ? "Open to working with talent from other provinces"
                      : isStore
                        ? "Open to working with creators from other provinces"
                        : "Conduct casting sessions remotely"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {isStudio ? "Production Types" : isStore ? "Content Types" : "Casting Focus"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getProjectTypesOptions().map((projectType) => {
                const isSelected = (data.projectTypes || []).includes(projectType)

                return (
                  <motion.div
                    key={projectType}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                        isSelected
                          ? "border-green-500 bg-green-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-green-300 hover:shadow-sm"
                      }`}
                      onClick={() => handleProjectTypeToggle(projectType)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{projectType}</span>
                        {isSelected && <Badge className="bg-green-500 text-white text-xs">Selected</Badge>}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {canProceed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center pt-6"
        >
          <Button
            onClick={onNext}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            Complete Setup
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}
