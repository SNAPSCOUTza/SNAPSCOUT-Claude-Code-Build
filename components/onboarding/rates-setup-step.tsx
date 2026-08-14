"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign } from "lucide-react"

interface RatesSetupStepProps {
  data?: any
  onUpdate?: (data: any) => void
  onNext?: () => void
  onBack?: () => void
}

const RatesSetupStep: React.FC<RatesSetupStepProps> = ({
  data = {},
  onUpdate = () => {},
  onNext = () => {},
  onBack = () => {},
}) => {
  const [formData, setFormData] = React.useState({
    rateType: data.rateType || "",
    hourlyRate: data.hourlyRate || "",
    dayRate: data.dayRate || "",
    projectRate: data.projectRate || "",
    currency: data.currency || "ZAR",
    ...data,
  })

  const rateTypes = ["Hourly", "Daily", "Project-based", "Negotiable"]

  const handleInputChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value }
    setFormData(updatedData)
    if (typeof onUpdate === "function") {
      onUpdate(updatedData)
    }
  }

  const handleNext = () => {
    if (typeof onNext === "function") {
      onNext()
    }
  }

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack()
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Rates Setup</CardTitle>
        <p className="text-gray-600">Set your professional rates</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="rateType">Rate Structure</Label>
          <Select value={formData.rateType} onValueChange={(value) => handleInputChange("rateType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select rate type" />
            </SelectTrigger>
            <SelectContent>
              {rateTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.rateType === "Hourly" && (
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate (ZAR)</Label>
            <Input
              id="hourlyRate"
              type="number"
              placeholder="e.g. 500"
              value={formData.hourlyRate}
              onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
            />
          </div>
        )}

        {formData.rateType === "Daily" && (
          <div className="space-y-2">
            <Label htmlFor="dayRate">Daily Rate (ZAR)</Label>
            <Input
              id="dayRate"
              type="number"
              placeholder="e.g. 3000"
              value={formData.dayRate}
              onChange={(e) => handleInputChange("dayRate", e.target.value)}
            />
          </div>
        )}

        {formData.rateType === "Project-based" && (
          <div className="space-y-2">
            <Label htmlFor="projectRate">Starting Project Rate (ZAR)</Label>
            <Input
              id="projectRate"
              type="number"
              placeholder="e.g. 15000"
              value={formData.projectRate}
              onChange={(e) => handleInputChange("projectRate", e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={!formData.rateType} className="bg-red-600 hover:bg-red-700">
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default RatesSetupStep
