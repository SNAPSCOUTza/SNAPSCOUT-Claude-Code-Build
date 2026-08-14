"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  ArrowRight,
  Camera,
  Film,
  Users,
  Mic,
  Lightbulb,
  Palette,
  Video,
  Clapperboard,
  Sparkles,
  Building,
} from "lucide-react"
import type { OnboardingData } from "@/types/account-types"

interface ClientServicesNeededStepProps {
  onNext: () => void
  onPrev: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const servicesOptions = {
  studio: [
    {
      id: "studio_space",
      label: "Studio Space Rental",
      icon: Building,
      description: "Soundstages, filming studios, production facilities",
    },
    {
      id: "equipment_rental",
      label: "Equipment Rental",
      icon: Camera,
      description: "Cameras, lighting, grip, sound equipment",
    },
    {
      id: "post_production",
      label: "Post-Production Services",
      icon: Palette,
      description: "Editing suites, color grading, VFX, sound design",
    },
    {
      id: "production_services",
      label: "Production Services",
      icon: Film,
      description: "Full production support, crew facilitation",
    },
    {
      id: "location_services",
      label: "Location Services",
      icon: Lightbulb,
      description: "Location scouting, permits, location management",
    },
    {
      id: "casting_services",
      label: "Casting Services",
      icon: Users,
      description: "Casting, talent management, extras coordination",
    },
  ],
  store: [
    {
      id: "product_photography",
      label: "Product Photography",
      icon: Camera,
      description: "Professional product photography services",
    },
    {
      id: "lifestyle_shoots",
      label: "Lifestyle Photography",
      icon: Sparkles,
      description: "Brand lifestyle and model photography",
    },
    {
      id: "video_production",
      label: "Video Production",
      icon: Video,
      description: "Commercial and promotional video production",
    },
    {
      id: "social_content",
      label: "Social Media Content",
      icon: Palette,
      description: "Content creation for social platforms",
    },
    {
      id: "commercial_production",
      label: "Commercial Production",
      icon: Clapperboard,
      description: "TV and online commercial production",
    },
    {
      id: "brand_photography",
      label: "Brand Photography",
      icon: Camera,
      description: "Brand identity and marketing photography",
    },
  ],
  scout: [
    { id: "actors", label: "Actors", icon: Users, description: "Film, TV, and theater actors" },
    { id: "models", label: "Models", icon: Camera, description: "Fashion, commercial, and lifestyle models" },
    { id: "voice_talent", label: "Voice Talent", icon: Mic, description: "Voice actors and narrators" },
    { id: "presenters", label: "Presenters", icon: Users, description: "TV presenters and hosts" },
    { id: "extras", label: "Background Extras", icon: Users, description: "Background actors and extras" },
    {
      id: "specialists",
      label: "Specialty Talent",
      icon: Lightbulb,
      description: "Stunt performers, dancers, musicians",
    },
  ],
}

const budgetRanges = [
  "Under R5,000",
  "R5,000 - R15,000",
  "R15,000 - R50,000",
  "R50,000 - R100,000",
  "R100,000 - R500,000",
  "R500,000+",
  "Varies by project",
]

export default function ClientServicesNeededStep({ onNext, onPrev, data, updateData }: ClientServicesNeededStepProps) {
  const accountType = data.accountType!
  const isStudio = accountType === "studio"
  const isStore = accountType === "store"
  const isScout = accountType === "scout"

  const getTitle = () => {
    if (isStudio) return "What Services Does Your Studio Provide?"
    if (isStore) return "What Services Does Your Business Provide?"
    if (isScout) return "What Talent Do You Scout?"
    return "Services Information"
  }

  const getSubtitle = () => {
    if (isStudio) return "Select the services and facilities your studio offers to clients"
    if (isStore) return "Select the content creation services your business offers"
    if (isScout) return "Select the types of talent you scout and cast"
    return "Tell us about your services"
  }

  const getServicesOptions = () => {
    if (isStudio) return servicesOptions.studio
    if (isStore) return servicesOptions.store
    if (isScout) return servicesOptions.scout
    return []
  }

  const handleServiceToggle = (serviceId: string) => {
    const currentServices = data.servicesNeeded || []
    const isSelected = currentServices.includes(serviceId)

    if (isSelected) {
      updateData({ servicesNeeded: currentServices.filter((id) => id !== serviceId) })
    } else {
      updateData({ servicesNeeded: [...currentServices, serviceId] })
    }
  }

  const handleBudgetChange = (budget: string) => {
    updateData({ typicalBudgetRange: budget })
  }

  const canProceed = (data.servicesNeeded || []).length > 0

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
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
            <CardTitle className="text-xl text-gray-900">
              {isStudio ? "Studio Services & Facilities" : isStore ? "Services Offered" : "Talent Categories"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getServicesOptions().map((service) => {
                const Icon = service.icon
                const isSelected = (data.servicesNeeded || []).includes(service.id)

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                      }`}
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <CardContent className="p-6 text-center space-y-3">
                        <div
                          className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                            isSelected ? "bg-blue-500" : "bg-gray-100"
                          }`}
                        >
                          <Icon className={`w-6 h-6 ${isSelected ? "text-white" : "text-gray-600"}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900">{service.label}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        {isSelected && <Badge className="bg-blue-500 text-white">Selected</Badge>}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-900">
              {isScout ? "Budget Range" : "Typical Project Range"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm font-medium text-gray-700">
                {isScout ? "Typical Budget Per Project" : "Typical Project Value Range"}
              </Label>
              <Select value={data.typicalBudgetRange} onValueChange={handleBudgetChange}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue
                    placeholder={isScout ? "Select your typical budget range" : "Select your typical project range"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            Continue to Location & Projects
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}
