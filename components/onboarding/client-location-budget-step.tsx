"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MapPin, DollarSign, Globe, Building } from "lucide-react"
import type { OnboardingData } from "@/types/account-types"

interface ClientLocationBudgetStepProps {
  onNext: () => void
  onPrev: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const SOUTH_AFRICAN_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
]

const BUDGET_RANGES = {
  studio: [
    { value: "under-10k", label: "Under R10,000", description: "Small productions, short content" },
    { value: "10k-50k", label: "R10,000 - R50,000", description: "Medium productions, commercials" },
    { value: "50k-200k", label: "R50,000 - R200,000", description: "Large productions, campaigns" },
    { value: "200k-plus", label: "R200,000+", description: "Major productions, series" },
  ],
  store: [
    { value: "under-5k", label: "Under R5,000", description: "Product photos, social content" },
    { value: "5k-20k", label: "R5,000 - R20,000", description: "Brand campaigns, lookbooks" },
    { value: "20k-100k", label: "R20,000 - R100,000", description: "Major campaigns, video content" },
    { value: "100k-plus", label: "R100,000+", description: "Large scale brand productions" },
  ],
  scout: [
    { value: "project-based", label: "Project-based", description: "Varies by casting requirements" },
    { value: "retainer", label: "Monthly retainer", description: "Ongoing talent sourcing" },
    { value: "commission", label: "Commission-based", description: "Percentage of talent fees" },
  ],
}

export default function ClientLocationBudgetStep({ onNext, onPrev, data, updateData }: ClientLocationBudgetStepProps) {
  const accountType = data.accountType as keyof typeof BUDGET_RANGES
  const budgetOptions = BUDGET_RANGES[accountType] || BUDGET_RANGES.studio

  const canProceed = data.province && data.typicalBudgetRange

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Location & Budget</h1>
        <p className="text-lg text-gray-600">Tell us where you're based and your typical project budgets</p>
      </div>

      <div className="space-y-6">
        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Location Preferences
            </CardTitle>
            <CardDescription>Where are you based and where do you typically work?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="province">Primary Province *</Label>
              <Select value={data.province} onValueChange={(value) => updateData({ province: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your province" />
                </SelectTrigger>
                <SelectContent>
                  {SOUTH_AFRICAN_PROVINCES.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="city">Primary City</Label>
              <Select value={data.city} onValueChange={(value) => updateData({ city: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="johannesburg">Johannesburg</SelectItem>
                  <SelectItem value="cape-town">Cape Town</SelectItem>
                  <SelectItem value="durban">Durban</SelectItem>
                  <SelectItem value="pretoria">Pretoria</SelectItem>
                  <SelectItem value="port-elizabeth">Port Elizabeth</SelectItem>
                  <SelectItem value="bloemfontein">Bloemfontein</SelectItem>
                  <SelectItem value="kimberley">Kimberley</SelectItem>
                  <SelectItem value="polokwane">Polokwane</SelectItem>
                  <SelectItem value="nelspruit">Nelspruit</SelectItem>
                  <SelectItem value="mafikeng">Mafikeng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <Label className="text-sm text-gray-600">
                We'll show you talent from your area first, but you can always search nationwide
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Budget Range */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-500" />
              Typical Budget Range
            </CardTitle>
            <CardDescription>
              What's your typical budget for{" "}
              {accountType === "studio"
                ? "productions"
                : accountType === "store"
                  ? "content creation"
                  : "casting projects"}
              ?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={data.typicalBudgetRange}
              onValueChange={(value) => updateData({ typicalBudgetRange: value })}
              className="space-y-3"
            >
              {budgetOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className="flex-1">
                    <Label htmlFor={option.value} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Account Type Specific Info */}
        {accountType === "studio" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Studio Benefits
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Access to verified film crew professionals</li>
              <li>• Post casting calls and gig listings</li>
              <li>• Manage production teams and schedules</li>
              <li>• Connect with equipment rental services</li>
            </ul>
          </div>
        )}

        {accountType === "store" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Store/Brand Benefits
            </h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Find creators and photographers</li>
              <li>• Commission product photography and videos</li>
              <li>• Access to marketing and social media professionals</li>
              <li>• Build long-term creator partnerships</li>
            </ul>
          </div>
        )}

        {accountType === "scout" && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Scout Benefits
            </h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Browse extensive talent database</li>
              <li>• Discover new and emerging talent</li>
              <li>• Manage casting processes and auditions</li>
              <li>• Connect with agencies and talent representatives</li>
            </ul>
          </div>
        )}
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
