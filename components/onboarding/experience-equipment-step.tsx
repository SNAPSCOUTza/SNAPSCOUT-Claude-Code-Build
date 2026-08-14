"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Mic, Lightbulb, Monitor, Plus, X, Award } from "lucide-react"
import { useState } from "react"
import type { OnboardingData } from "@/types/account-types"

interface ExperienceEquipmentStepProps {
  onNext: () => void
  onPrev: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const EQUIPMENT_CATEGORIES = {
  cameras: {
    icon: Camera,
    label: "Cameras",
    items: [
      "RED Dragon",
      "ARRI Alexa",
      "Canon C300",
      "Sony FX9",
      "Blackmagic URSA",
      "Canon 5D Mark IV",
      "Sony A7S III",
      "Panasonic GH5",
      "DJI Pocket 2",
    ],
  },
  audio: {
    icon: Mic,
    label: "Audio Equipment",
    items: [
      "Rode NTG3",
      "Sennheiser MKE 600",
      "Zoom H6",
      "Audio-Technica AT875R",
      "Shure SM58",
      "Rode Wireless GO",
      "Boom Pole",
      "Audio Mixer",
    ],
  },
  lighting: {
    icon: Lightbulb,
    label: "Lighting",
    items: [
      "LED Panel Kit",
      "Softbox Kit",
      "Ring Light",
      "Aputure 120D",
      "Godox SL-60W",
      "Reflectors",
      "Light Stands",
      "Color Gels",
    ],
  },
  postProduction: {
    icon: Monitor,
    label: "Post-Production",
    items: [
      "Adobe Creative Suite",
      "Final Cut Pro",
      "DaVinci Resolve",
      "Avid Media Composer",
      "Pro Tools",
      "Logic Pro",
      "Color Grading Monitor",
      "Audio Interface",
    ],
  },
}

const CERTIFICATIONS = [
  "Adobe Certified Expert",
  "Apple Certified Pro",
  "Avid Certified User",
  "DaVinci Resolve Certified",
  "Drone Pilot License",
  "Safety Training",
  "Film School Graduate",
  "Photography Degree",
  "Audio Engineering Certificate",
]

export default function ExperienceEquipmentStep({ onNext, onPrev, data, updateData }: ExperienceEquipmentStepProps) {
  const [newEquipment, setNewEquipment] = useState("")
  const [newCertification, setNewCertification] = useState("")

  const addEquipment = (equipment: string) => {
    if (equipment && !data.equipmentOwned.includes(equipment)) {
      updateData({
        equipmentOwned: [...data.equipmentOwned, equipment],
      })
    }
  }

  const removeEquipment = (equipment: string) => {
    updateData({
      equipmentOwned: data.equipmentOwned.filter((item) => item !== equipment),
    })
  }

  const addCertification = (certification: string) => {
    if (certification && !data.certifications.includes(certification)) {
      updateData({
        certifications: [...data.certifications, certification],
      })
    }
  }

  const removeCertification = (certification: string) => {
    updateData({
      certifications: data.certifications.filter((item) => item !== certification),
    })
  }

  const addCustomEquipment = () => {
    if (newEquipment.trim()) {
      addEquipment(newEquipment.trim())
      setNewEquipment("")
    }
  }

  const addCustomCertification = () => {
    if (newCertification.trim()) {
      addCertification(newCertification.trim())
      setNewCertification("")
    }
  }

  const canProceed = data.yearsExperience > 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Experience & Equipment</h1>
        <p className="text-lg text-gray-600">Tell us about your professional experience and the equipment you own</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Experience Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-red-500" />
              Professional Experience
            </CardTitle>
            <CardDescription>Your background and qualifications in the industry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="years-experience">Years of Experience *</Label>
              <Select
                value={data.yearsExperience.toString()}
                onValueChange={(value) => updateData({ yearsExperience: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Less than 1 year</SelectItem>
                  <SelectItem value="2">1-2 years</SelectItem>
                  <SelectItem value="3">3-5 years</SelectItem>
                  <SelectItem value="6">6-10 years</SelectItem>
                  <SelectItem value="11">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="portfolio-url">Portfolio Website</Label>
              <Input
                id="portfolio-url"
                type="url"
                placeholder="https://yourportfolio.com"
                value={data.portfolioUrl}
                onChange={(e) => updateData({ portfolioUrl: e.target.value })}
              />
            </div>

            {/* Certifications */}
            <div>
              <Label>Certifications & Qualifications</Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {data.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="flex items-center gap-1">
                      {cert}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => removeCertification(cert)}
                      />
                    </Badge>
                  ))}
                </div>

                <Select onValueChange={addCertification}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add certification" />
                  </SelectTrigger>
                  <SelectContent>
                    {CERTIFICATIONS.filter((cert) => !data.certifications.includes(cert)).map((cert) => (
                      <SelectItem key={cert} value={cert}>
                        {cert}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Input
                    placeholder="Custom certification"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addCustomCertification()}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addCustomCertification}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-red-500" />
              Equipment Owned
            </CardTitle>
            <CardDescription>List the professional equipment you own and can bring to projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Equipment */}
            {data.equipmentOwned.length > 0 && (
              <div>
                <Label>Your Equipment</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.equipmentOwned.map((equipment) => (
                    <Badge key={equipment} variant="secondary" className="flex items-center gap-1">
                      {equipment}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => removeEquipment(equipment)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment Categories */}
            <div className="space-y-4">
              {Object.entries(EQUIPMENT_CATEGORIES).map(([key, category]) => {
                const Icon = category.icon
                return (
                  <div key={key}>
                    <Label className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" />
                      {category.label}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {category.items.map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                          <Checkbox
                            id={item}
                            checked={data.equipmentOwned.includes(item)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                addEquipment(item)
                              } else {
                                removeEquipment(item)
                              }
                            }}
                          />
                          <Label htmlFor={item} className="text-sm">
                            {item}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Custom Equipment */}
            <div>
              <Label>Custom Equipment</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add custom equipment"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomEquipment()}
                />
                <Button type="button" variant="outline" size="sm" onClick={addCustomEquipment}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="bg-red-600 hover:bg-red-700">
          Continue
        </Button>
      </div>
    </motion.div>
  )
}
