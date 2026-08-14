"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Film, Camera, Users, Target, Briefcase, Star } from "lucide-react"
import type { OnboardingData } from "@/types/account-types"

interface ClientProjectTypesStepProps {
  onNext: () => void
  onPrev: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const PROJECT_TYPES = {
  studio: {
    icon: Film,
    title: "Production Types",
    options: [
      { id: "commercials", label: "TV Commercials", description: "Brand advertising and marketing videos" },
      { id: "corporate", label: "Corporate Videos", description: "Training, presentations, company profiles" },
      { id: "music-videos", label: "Music Videos", description: "Artist promotional content" },
      { id: "documentaries", label: "Documentaries", description: "Non-fiction storytelling projects" },
      { id: "short-films", label: "Short Films", description: "Independent narrative projects" },
      { id: "web-series", label: "Web Series", description: "Online episodic content" },
      { id: "live-events", label: "Live Events", description: "Conferences, concerts, ceremonies" },
      { id: "social-content", label: "Social Media Content", description: "Platform-specific video content" },
    ],
  },
  store: {
    icon: Camera,
    title: "Content Needs",
    options: [
      { id: "product-photography", label: "Product Photography", description: "E-commerce and catalog images" },
      {
        id: "lifestyle-photography",
        label: "Lifestyle Photography",
        description: "Brand storytelling through imagery",
      },
      { id: "social-media-content", label: "Social Media Content", description: "Instagram, TikTok, Facebook content" },
      { id: "brand-videos", label: "Brand Videos", description: "Promotional and marketing videos" },
      {
        id: "influencer-content",
        label: "Influencer Collaborations",
        description: "Creator partnerships and campaigns",
      },
      { id: "event-coverage", label: "Event Coverage", description: "Store openings, launches, exhibitions" },
      { id: "user-generated-content", label: "UGC Campaigns", description: "Customer-created content initiatives" },
      { id: "seasonal-campaigns", label: "Seasonal Campaigns", description: "Holiday and seasonal marketing" },
    ],
  },
  scout: {
    icon: Users,
    title: "Talent Focus",
    options: [
      { id: "actors", label: "Actors", description: "Film, TV, and commercial talent" },
      { id: "models", label: "Models", description: "Fashion, commercial, and lifestyle models" },
      { id: "voice-talent", label: "Voice Talent", description: "Voice-over artists and narrators" },
      { id: "dancers", label: "Dancers", description: "Choreographers and dance performers" },
      { id: "musicians", label: "Musicians", description: "Recording artists and live performers" },
      { id: "presenters", label: "Presenters", description: "TV hosts and event presenters" },
      { id: "extras", label: "Background Extras", description: "Crowd and background talent" },
      { id: "specialty-acts", label: "Specialty Acts", description: "Unique performers and entertainers" },
    ],
  },
}

const CASTING_FOCUS = [
  { id: "age-diverse", label: "Age Diverse", description: "All age groups" },
  { id: "youth-focused", label: "Youth Focused", description: "18-35 years" },
  { id: "family-friendly", label: "Family Friendly", description: "All ages, family content" },
  { id: "professional", label: "Professional", description: "Corporate and business" },
  { id: "creative", label: "Creative", description: "Artistic and expressive" },
  { id: "authentic", label: "Authentic", description: "Real people, not actors" },
]

export default function ClientProjectTypesStep({ onNext, onPrev, data, updateData }: ClientProjectTypesStepProps) {
  const accountType = data.accountType as keyof typeof PROJECT_TYPES
  const projectConfig = PROJECT_TYPES[accountType]

  const toggleProjectType = (typeId: string) => {
    const currentTypes = data.projectTypes || []
    const updatedTypes = currentTypes.includes(typeId)
      ? currentTypes.filter((id) => id !== typeId)
      : [...currentTypes, typeId]

    updateData({ projectTypes: updatedTypes })
  }

  const toggleCastingFocus = (focusId: string) => {
    const currentFocus = data.castingFocus || []
    const updatedFocus = currentFocus.includes(focusId)
      ? currentFocus.filter((id) => id !== focusId)
      : [...currentFocus, focusId]

    updateData({ castingFocus: updatedFocus })
  }

  const canProceed = (data.projectTypes?.length || 0) > 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Project Types & Goals</h1>
        <p className="text-lg text-gray-600">What types of projects do you typically work on?</p>
      </div>

      <div className="space-y-6">
        {/* Project Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <projectConfig.icon className="w-5 h-5 text-red-500" />
              {projectConfig.title}
            </CardTitle>
            <CardDescription>Select all the types of projects you typically work on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {projectConfig.options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    data.projectTypes?.includes(option.id) ? "bg-red-50 border-red-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleProjectType(option.id)}
                >
                  <Checkbox checked={data.projectTypes?.includes(option.id) || false} readOnly className="mt-1" />
                  <div className="flex-1">
                    <Label className="font-medium cursor-pointer">{option.label}</Label>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Project Types */}
        {data.projectTypes && data.projectTypes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Your Selected Focus Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.projectTypes.map((typeId) => {
                  const option = projectConfig.options.find((opt) => opt.id === typeId)
                  return option ? (
                    <Badge key={typeId} variant="secondary" className="px-3 py-1">
                      {option.label}
                    </Badge>
                  ) : null
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Casting Focus (for Scouts) */}
        {accountType === "scout" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-red-500" />
                Casting Focus
              </CardTitle>
              <CardDescription>What type of talent do you typically look for?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {CASTING_FOCUS.map((focus) => (
                  <div
                    key={focus.id}
                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      data.castingFocus?.includes(focus.id) ? "bg-purple-50 border-purple-200" : "hover:bg-gray-50"
                    }`}
                    onClick={() => toggleCastingFocus(focus.id)}
                  >
                    <Checkbox checked={data.castingFocus?.includes(focus.id) || false} readOnly className="mt-1" />
                    <div className="flex-1">
                      <Label className="font-medium cursor-pointer">{focus.label}</Label>
                      <p className="text-sm text-gray-600 mt-1">{focus.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Type Benefits */}
        <div
          className={`${
            accountType === "studio"
              ? "bg-blue-50 border-blue-200"
              : accountType === "store"
                ? "bg-green-50 border-green-200"
                : "bg-purple-50 border-purple-200"
          } border rounded-lg p-4`}
        >
          <h4
            className={`font-medium mb-2 flex items-center gap-2 ${
              accountType === "studio"
                ? "text-blue-900"
                : accountType === "store"
                  ? "text-green-900"
                  : "text-purple-900"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            What You Can Do Next
          </h4>
          <ul
            className={`text-sm space-y-1 ${
              accountType === "studio"
                ? "text-blue-800"
                : accountType === "store"
                  ? "text-green-800"
                  : "text-purple-800"
            }`}
          >
            {accountType === "studio" && (
              <>
                <li>• Post gig listings for your selected project types</li>
                <li>• Browse and hire crew members for productions</li>
                <li>• Manage multiple projects and teams</li>
                <li>• Access equipment rental services</li>
              </>
            )}
            {accountType === "store" && (
              <>
                <li>• Find creators specializing in your content needs</li>
                <li>• Commission custom content for your brand</li>
                <li>• Build ongoing partnerships with creators</li>
                <li>• Access marketing and social media experts</li>
              </>
            )}
            {accountType === "scout" && (
              <>
                <li>• Search our extensive talent database</li>
                <li>• Discover new and emerging performers</li>
                <li>• Manage casting calls and auditions</li>
                <li>• Connect with talent agencies</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="bg-red-600 hover:bg-red-700">
          Complete Setup
        </Button>
      </div>
    </motion.div>
  )
}
