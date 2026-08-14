"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Briefcase } from "lucide-react"

interface BusinessInfoStepProps {
  data?: any
  onUpdate?: (data: any) => void
  onNext?: () => void
  onBack?: () => void
}

const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({
  data = {},
  onUpdate = () => {},
  onNext = () => {},
  onBack = () => {},
}) => {
  const [formData, setFormData] = React.useState({
    businessName: data.businessName || "",
    website: data.website || "",
    instagram: data.instagram || "",
    linkedin: data.linkedin || "",
    facebook: data.facebook || "",
    ...data,
  })

  const handleInputChange = (field: string, value: string) => {
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
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-orange-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Business Information</CardTitle>
        <p className="text-gray-600">Complete your professional profile</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business/Professional Name</Label>
          <Input
            id="businessName"
            placeholder="Your business or professional name"
            value={formData.businessName}
            onChange={(e) => handleInputChange("businessName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            placeholder="https://yourwebsite.com"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <Label className="text-lg font-semibold">Social Media (Optional)</Label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                placeholder="@yourusername"
                value={formData.instagram}
                onChange={(e) => handleInputChange("instagram", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                placeholder="linkedin.com/in/yourprofile"
                value={formData.linkedin}
                onChange={(e) => handleInputChange("linkedin", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              placeholder="facebook.com/yourpage"
              value={formData.facebook}
              onChange={(e) => handleInputChange("facebook", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleNext} className="bg-red-600 hover:bg-red-700">
            Complete Setup
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default BusinessInfoStep
