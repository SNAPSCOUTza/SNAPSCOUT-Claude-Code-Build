"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin } from "lucide-react"

interface LocationSetupStepProps {
  data?: any
  onUpdate?: (data: any) => void
  onNext?: () => void
  onBack?: () => void
}

const LocationSetupStep: React.FC<LocationSetupStepProps> = ({
  data = {},
  onUpdate = () => {},
  onNext = () => {},
  onBack = () => {},
}) => {
  const [formData, setFormData] = React.useState({
    province: data.province || "",
    city: data.city || "",
    address: data.address || "",
    ...data,
  })

  const provinces = [
    "Western Cape",
    "Gauteng",
    "KwaZulu-Natal",
    "Eastern Cape",
    "Free State",
    "Limpopo",
    "Mpumalanga",
    "Northern Cape",
    "North West",
  ]

  const cities = {
    "Western Cape": ["Cape Town", "Stellenbosch", "Paarl", "George"],
    Gauteng: ["Johannesburg", "Pretoria", "Sandton", "Randburg"],
    "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Newcastle", "Richards Bay"],
    "Eastern Cape": ["Port Elizabeth", "East London", "Grahamstown", "Uitenhage"],
    "Free State": ["Bloemfontein", "Welkom", "Kroonstad", "Bethlehem"],
    Limpopo: ["Polokwane", "Tzaneen", "Thohoyandou", "Giyani"],
    Mpumalanga: ["Nelspruit", "Witbank", "Secunda", "Standerton"],
    "Northern Cape": ["Kimberley", "Upington", "Springbok", "De Aar"],
    "North West": ["Mahikeng", "Potchefstroom", "Klerksdorp", "Rustenburg"],
  }

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
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-red-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Location Setup</CardTitle>
        <p className="text-gray-600">Where are you based?</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="province">Province</Label>
            <Select value={formData.province} onValueChange={(value) => handleInputChange("province", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Select
              value={formData.city}
              onValueChange={(value) => handleInputChange("city", value)}
              disabled={!formData.province}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {formData.province &&
                  cities[formData.province as keyof typeof cities]?.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address (Optional)</Label>
          <Input
            id="address"
            placeholder="Enter your business address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
          />
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!formData.province || !formData.city}
            className="bg-red-600 hover:bg-red-700"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default LocationSetupStep
