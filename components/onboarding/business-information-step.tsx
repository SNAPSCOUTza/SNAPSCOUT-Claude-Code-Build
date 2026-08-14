"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, FileText, Phone, Mail, MessageSquare, X, Plus } from "lucide-react"
import { useState } from "react"
import type { OnboardingData } from "@/types/account-types"

interface BusinessInformationStepProps {
  onNext: () => void
  onPrev: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const CONTACT_PREFERENCES = [
  { id: "email", label: "Email", icon: Mail },
  { id: "phone", label: "Phone", icon: Phone },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { id: "in_app", label: "In-App Messages", icon: MessageSquare },
]

export default function BusinessInformationStep({ onNext, onPrev, data, updateData }: BusinessInformationStepProps) {
  const [customPreference, setCustomPreference] = useState("")

  const addContactPreference = (preference: string) => {
    if (preference && !data.contactPreferences.includes(preference)) {
      updateData({
        contactPreferences: [...data.contactPreferences, preference],
      })
    }
  }

  const removeContactPreference = (preference: string) => {
    updateData({
      contactPreferences: data.contactPreferences.filter((item) => item !== preference),
    })
  }

  const addCustomPreference = () => {
    if (customPreference.trim()) {
      addContactPreference(customPreference.trim())
      setCustomPreference("")
    }
  }

  const canProceed = data.bio.trim().length > 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Business Information</h1>
        <p className="text-lg text-gray-600">Complete your professional profile with business details and bio</p>
      </div>

      <div className="space-y-6">
        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-red-500" />
              Business Details
            </CardTitle>
            <CardDescription>Optional business information for professional clients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="business-name">Business/Company Name</Label>
              <Input
                id="business-name"
                placeholder="Your Business Name (Optional)"
                value={data.businessName}
                onChange={(e) => updateData({ businessName: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="vat-registered"
                checked={data.vatRegistered}
                onCheckedChange={(checked) => updateData({ vatRegistered: !!checked })}
              />
              <Label htmlFor="vat-registered">VAT Registered</Label>
            </div>
          </CardContent>
        </Card>

        {/* Professional Bio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              Professional Bio
            </CardTitle>
            <CardDescription>Tell clients about yourself, your style, and what makes you unique</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="bio">About You *</Label>
              <Textarea
                id="bio"
                placeholder="Write a compelling bio that showcases your experience, style, and what clients can expect when working with you. Mention your specialties, notable projects, and what sets you apart..."
                className="min-h-[120px]"
                value={data.bio}
                onChange={(e) => updateData({ bio: e.target.value })}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-600">{data.bio.length}/500 characters</p>
                <p className="text-sm text-gray-500">Minimum 50 characters required</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-500" />
              Contact Preferences
            </CardTitle>
            <CardDescription>How would you prefer clients to contact you?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Preferences */}
            {data.contactPreferences.length > 0 && (
              <div>
                <Label>Your Preferred Contact Methods</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.contactPreferences.map((preference) => (
                    <Badge key={preference} variant="secondary" className="flex items-center gap-1">
                      {preference}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => removeContactPreference(preference)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Method Options */}
            <div>
              <Label>Available Contact Methods</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {CONTACT_PREFERENCES.map((method) => {
                  const Icon = method.icon
                  const isSelected = data.contactPreferences.includes(method.id)
                  return (
                    <div
                      key={method.id}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? "bg-red-50 border-red-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          removeContactPreference(method.id)
                        } else {
                          addContactPreference(method.id)
                        }
                      }}
                    >
                      <Checkbox checked={isSelected} readOnly />
                      <Icon className="w-4 h-4" />
                      <Label className="cursor-pointer">{method.label}</Label>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Custom Contact Method */}
            <div>
              <Label>Custom Contact Method</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="e.g., Telegram, Signal, etc."
                  value={customPreference}
                  onChange={(e) => setCustomPreference(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomPreference()}
                />
                <Button type="button" variant="outline" size="sm" onClick={addCustomPreference}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tips */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Profile Tips</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• A compelling bio increases your chances of being hired by 60%</li>
            <li>• Mention specific skills, equipment, and notable projects</li>
            <li>• Keep it professional but let your personality shine through</li>
            <li>• Update your bio regularly as you gain more experience</li>
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
