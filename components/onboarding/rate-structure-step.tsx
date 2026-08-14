"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Clock, DollarSign, Briefcase, TrendingUp } from "lucide-react"
import type { OnboardingData } from "@/types/account-types"

interface RateStructureStepProps {
  onNext: () => void
  onPrev: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const RATE_SUGGESTIONS = {
  film_crew: {
    hourly: { min: 200, max: 800 },
    daily: { min: 1500, max: 6000 },
    project: { min: 5000, max: 50000 },
  },
  content_creator: {
    hourly: { min: 150, max: 600 },
    daily: { min: 1200, max: 4500 },
    project: { min: 2000, max: 25000 },
  },
}

export default function RateStructureStep({ onNext, onPrev, data, updateData }: RateStructureStepProps) {
  const accountType = data.accountType as keyof typeof RATE_SUGGESTIONS
  const suggestions = RATE_SUGGESTIONS[accountType] || RATE_SUGGESTIONS.content_creator

  const canProceed =
    data.rateStructure === "hourly"
      ? data.hourlyRate > 0
      : data.rateStructure === "daily"
        ? data.dailyRate > 0
        : data.rateStructure === "project"
          ? data.projectRateMin > 0 && data.projectRateMax > 0
          : false

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Rate Structure</h1>
        <p className="text-lg text-gray-600">Set your professional rates and pricing structure</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-red-500" />
            Pricing Structure
          </CardTitle>
          <CardDescription>Choose how you prefer to charge for your services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={data.rateStructure}
            onValueChange={(value) => updateData({ rateStructure: value as "hourly" | "daily" | "project" })}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="hourly" id="hourly" />
              <div className="flex-1">
                <Label htmlFor="hourly" className="flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4" />
                  Hourly Rate
                </Label>
                <p className="text-sm text-gray-600">Charge by the hour for flexible projects</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="daily" id="daily" />
              <div className="flex-1">
                <Label htmlFor="daily" className="flex items-center gap-2 font-medium">
                  <Briefcase className="w-4 h-4" />
                  Daily Rate
                </Label>
                <p className="text-sm text-gray-600">Charge per day for longer shoots</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="project" id="project" />
              <div className="flex-1">
                <Label htmlFor="project" className="flex items-center gap-2 font-medium">
                  <TrendingUp className="w-4 h-4" />
                  Project-Based
                </Label>
                <p className="text-sm text-gray-600">Quote based on project scope and deliverables</p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Rate Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Set Your Rates</CardTitle>
          <CardDescription>Enter your professional rates in South African Rand (ZAR)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.rateStructure === "hourly" && (
            <div>
              <Label htmlFor="hourly-rate">Hourly Rate (ZAR) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                <Input
                  id="hourly-rate"
                  type="number"
                  placeholder="500"
                  className="pl-8"
                  value={data.hourlyRate || ""}
                  onChange={(e) => updateData({ hourlyRate: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Suggested range: R{suggestions.hourly.min} - R{suggestions.hourly.max} per hour
              </p>
            </div>
          )}

          {data.rateStructure === "daily" && (
            <div>
              <Label htmlFor="daily-rate">Daily Rate (ZAR) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                <Input
                  id="daily-rate"
                  type="number"
                  placeholder="3000"
                  className="pl-8"
                  value={data.dailyRate || ""}
                  onChange={(e) => updateData({ dailyRate: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Suggested range: R{suggestions.daily.min} - R{suggestions.daily.max} per day
              </p>
            </div>
          )}

          {data.rateStructure === "project" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project-min">Minimum Project Rate (ZAR) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                  <Input
                    id="project-min"
                    type="number"
                    placeholder="5000"
                    className="pl-8"
                    value={data.projectRateMin || ""}
                    onChange={(e) => updateData({ projectRateMin: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="project-max">Maximum Project Rate (ZAR) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                  <Input
                    id="project-max"
                    type="number"
                    placeholder="25000"
                    className="pl-8"
                    value={data.projectRateMax || ""}
                    onChange={(e) => updateData({ projectRateMax: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">
                  Suggested range: R{suggestions.project.min} - R{suggestions.project.max} per project
                </p>
              </div>
            </div>
          )}

          {/* Rate Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Pricing Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Consider your experience level and equipment when setting rates</li>
              <li>• Research market rates in your area for similar services</li>
              <li>• Factor in travel time, setup, and post-production work</li>
              <li>• You can always negotiate rates based on project requirements</li>
            </ul>
          </div>
        </CardContent>
      </Card>

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
