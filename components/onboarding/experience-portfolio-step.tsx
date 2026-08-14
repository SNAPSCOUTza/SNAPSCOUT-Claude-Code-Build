"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Camera, Award, Plus, X } from "lucide-react"

interface ExperiencePortfolioStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onBack: () => void
}

const experienceOptions = [
  "Entry-level (0-2 years)",
  "Mid-level (3-5 years)",
  "Senior (6-10 years)",
  "Expert (10+ years)",
]

const equipmentSuggestions = [
  "Canon EOS R5",
  "Sony A7S III",
  "RED Komodo",
  "ARRI Alexa Mini",
  "DJI Ronin 4D",
  "Steadicam",
  "Drone (DJI Mavic)",
  "Lighting Kit",
  "Audio Equipment",
  "Tripods & Supports",
  "Lenses",
  "Monitors",
]

export default function ExperiencePortfolioStep({ data, onUpdate, onNext, onBack }: ExperiencePortfolioStepProps) {
  const [formData, setFormData] = useState({
    experienceLevel: data.experienceLevel || "",
    bio: data.bio || "",
    portfolioUrl: data.portfolioUrl || "",
    reelUrl: data.reelUrl || "",
    equipment: data.equipment || [],
    certifications: data.certifications || [],
    newEquipment: "",
    newCertification: "",
    ...data,
  })

  const handleUpdate = (field: string, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
  }

  const addEquipment = () => {
    if (formData.newEquipment.trim()) {
      const updated = [...formData.equipment, formData.newEquipment.trim()]
      handleUpdate("equipment", updated)
      setFormData((prev) => ({ ...prev, newEquipment: "" }))
    }
  }

  const removeEquipment = (index: number) => {
    const updated = formData.equipment.filter((_: any, i: number) => i !== index)
    handleUpdate("equipment", updated)
  }

  const addCertification = () => {
    if (formData.newCertification.trim()) {
      const updated = [...formData.certifications, formData.newCertification.trim()]
      handleUpdate("certifications", updated)
      setFormData((prev) => ({ ...prev, newCertification: "" }))
    }
  }

  const removeCertification = (index: number) => {
    const updated = formData.certifications.filter((_: any, i: number) => i !== index)
    handleUpdate("certifications", updated)
  }

  const handleNext = () => {
    if (formData.experienceLevel && formData.bio) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Experience & Portfolio</h2>
        <p className="text-gray-600 mt-2">Showcase your skills and experience</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-red-600" />
            Professional Experience
          </CardTitle>
          <CardDescription>Tell us about your experience level and background</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
            <Select value={formData.experienceLevel} onValueChange={(value) => handleUpdate("experienceLevel", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                {experienceOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
            <Textarea
              placeholder="Tell clients about your experience, style, and what makes you unique..."
              value={formData.bio}
              onChange={(e) => handleUpdate("bio", e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-red-600" />
            Portfolio & Work Samples
          </CardTitle>
          <CardDescription>Share your best work to attract clients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Website/URL</label>
            <Input
              placeholder="https://yourportfolio.com"
              value={formData.portfolioUrl}
              onChange={(e) => handleUpdate("portfolioUrl", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Demo Reel/Video URL</label>
            <Input
              placeholder="https://vimeo.com/your-reel or https://youtube.com/watch?v=..."
              value={formData.reelUrl}
              onChange={(e) => handleUpdate("reelUrl", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-red-600" />
            Equipment & Gear
          </CardTitle>
          <CardDescription>List your professional equipment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add equipment (e.g., Canon EOS R5)"
              value={formData.newEquipment}
              onChange={(e) => setFormData((prev) => ({ ...prev, newEquipment: e.target.value }))}
              onKeyPress={(e) => e.key === "Enter" && addEquipment()}
            />
            <Button onClick={addEquipment} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {equipmentSuggestions.slice(0, 6).map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="cursor-pointer hover:bg-red-50"
                onClick={() => {
                  if (!formData.equipment.includes(item)) {
                    handleUpdate("equipment", [...formData.equipment, item])
                  }
                }}
              >
                {item}
              </Badge>
            ))}
          </div>

          {formData.equipment.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Your Equipment:</p>
              <div className="flex flex-wrap gap-2">
                {formData.equipment.map((item: string, index: number) => (
                  <Badge key={index} className="bg-red-100 text-red-800">
                    {item}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeEquipment(index)} />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-red-600" />
            Certifications & Awards
          </CardTitle>
          <CardDescription>Professional certifications, awards, or notable achievements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add certification or award"
              value={formData.newCertification}
              onChange={(e) => setFormData((prev) => ({ ...prev, newCertification: e.target.value }))}
              onKeyPress={(e) => e.key === "Enter" && addCertification()}
            />
            <Button onClick={addCertification} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.certifications.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Your Certifications:</p>
              <div className="flex flex-wrap gap-2">
                {formData.certifications.map((item: string, index: number) => (
                  <Badge key={index} className="bg-green-100 text-green-800">
                    {item}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeCertification(index)} />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!formData.experienceLevel || !formData.bio}
          className="bg-red-600 hover:bg-red-700"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
