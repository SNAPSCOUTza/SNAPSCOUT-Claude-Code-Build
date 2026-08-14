"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Clock, Car, Wifi } from "lucide-react"

interface LocationAvailabilityStepProps {
  data?: any
  onUpdate?: (data: any) => void
  onNext?: () => void
  onBack?: () => void
}

const provinces = [
  "Western Cape",
  "Eastern Cape",
  "Northern Cape",
  "Free State",
  "KwaZulu-Natal",
  "North West",
  "Gauteng",
  "Mpumalanga",
  "Limpopo",
]

const cities = {
  "Western Cape": ["Cape Town", "Stellenbosch", "George", "Worcester"],
  "Eastern Cape": ["Port Elizabeth", "East London", "Grahamstown"],
  "Northern Cape": ["Kimberley", "Upington", "Springbok"],
  "Free State": ["Bloemfontein", "Welkom", "Kroonstad"],
  "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Newcastle"],
  "North West": ["Mahikeng", "Potchefstroom", "Klerksdorp"],
  Gauteng: ["Johannesburg", "Pretoria", "Soweto"],
  Mpumalanga: ["Nelspruit", "Witbank", "Secunda"],
  Limpopo: ["Polokwane", "Tzaneen", "Thohoyandou"],
}

export default function LocationAvailabilityStep({
  data = {},
  onUpdate = () => {},
  onNext = () => {},
  onBack = () => {},
}: LocationAvailabilityStepProps) {
  const [formData, setFormData] = useState({
    province: data.province || "",
    city: data.city || "",
    availability: data.availability || "available",
    willingToTravel: data.willingToTravel || false,
    remoteWork: data.remoteWork || false,
    travelRadius: data.travelRadius || "50km",
    ...data,
  })

  const handleUpdate = (field: string, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)

    if (typeof onUpdate === "function") {
      onUpdate(updated)
    } else {
      console.error("onUpdate is not a function:", typeof onUpdate)
    }
  }

  const handleNext = () => {
    if (formData.province && formData.city) {
      if (typeof onNext === "function") {
        onNext()
      }
    }
  }

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack()
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Location & Availability</h2>
        <p className="text-gray-600 mt-2">Where are you based and when are you available?</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-600" />
            Location
          </CardTitle>
          <CardDescription>Your primary work location helps clients find you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
              <Select value={formData.province} onValueChange={(value) => handleUpdate("province", value)}>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <Select
                value={formData.city}
                onValueChange={(value) => handleUpdate("city", value)}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-600" />
            Availability
          </CardTitle>
          <CardDescription>Let clients know your current availability status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={formData.availability} onValueChange={(value) => handleUpdate("availability", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available for new projects</SelectItem>
              <SelectItem value="busy">Busy but accepting select projects</SelectItem>
              <SelectItem value="booked">Fully booked</SelectItem>
            </SelectContent>
          </Select>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="travel"
                checked={formData.willingToTravel}
                onCheckedChange={(checked) => handleUpdate("willingToTravel", checked)}
              />
              <label htmlFor="travel" className="flex items-center gap-2 text-sm font-medium">
                <Car className="h-4 w-4" />
                Willing to travel for projects
              </label>
            </div>

            {formData.willingToTravel && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Travel radius</label>
                <Select value={formData.travelRadius} onValueChange={(value) => handleUpdate("travelRadius", value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50km">Within 50km</SelectItem>
                    <SelectItem value="100km">Within 100km</SelectItem>
                    <SelectItem value="province">Within province</SelectItem>
                    <SelectItem value="national">Anywhere in South Africa</SelectItem>
                    <SelectItem value="international">International projects</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remote"
                checked={formData.remoteWork}
                onCheckedChange={(checked) => handleUpdate("remoteWork", checked)}
              />
              <label htmlFor="remote" className="flex items-center gap-2 text-sm font-medium">
                <Wifi className="h-4 w-4" />
                Available for remote work (editing, post-production, etc.)
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
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
    </div>
  )
}
