"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "lucide-react"

interface AvailabilitySetupStepProps {
  data?: any
  onUpdate?: (data: any) => void
  onNext?: () => void
  onBack?: () => void
}

const AvailabilitySetupStep: React.FC<AvailabilitySetupStepProps> = ({
  data = {},
  onUpdate = () => {},
  onNext = () => {},
  onBack = () => {},
}) => {
  const [formData, setFormData] = React.useState({
    availability: data.availability || "",
    willTravel: data.willTravel || false,
    remoteWork: data.remoteWork || false,
    ...data,
  })

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
          <Calendar className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Availability Setup</CardTitle>
        <p className="text-gray-600">When are you available for work?</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="availability">Current Availability</Label>
          <Select value={formData.availability} onValueChange={(value) => handleInputChange("availability", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available Now</SelectItem>
              <SelectItem value="booked">Currently Booked</SelectItem>
              <SelectItem value="limited">Limited Availability</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="willTravel"
              checked={formData.willTravel}
              onCheckedChange={(checked) => handleInputChange("willTravel", checked)}
            />
            <Label
              htmlFor="willTravel"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Willing to travel for projects
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remoteWork"
              checked={formData.remoteWork}
              onCheckedChange={(checked) => handleInputChange("remoteWork", checked)}
            />
            <Label
              htmlFor="remoteWork"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Available for remote work
            </Label>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={!formData.availability} className="bg-red-600 hover:bg-red-700">
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AvailabilitySetupStep
