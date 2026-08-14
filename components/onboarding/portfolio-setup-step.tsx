"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Plus, X } from "lucide-react"

interface PortfolioSetupStepProps {
  data?: any
  onUpdate?: (data: any) => void
  onNext?: () => void
  onBack?: () => void
}

const PortfolioSetupStep: React.FC<PortfolioSetupStepProps> = ({
  data = {},
  onUpdate = () => {},
  onNext = () => {},
  onBack = () => {},
}) => {
  const [formData, setFormData] = React.useState({
    portfolioItems: data.portfolioItems || [{ title: "", description: "", url: "" }],
    equipment: data.equipment || [],
    ...data,
  })

  const handleInputChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value }
    setFormData(updatedData)
    if (typeof onUpdate === "function") {
      onUpdate(updatedData)
    }
  }

  const addPortfolioItem = () => {
    const newItems = [...formData.portfolioItems, { title: "", description: "", url: "" }]
    handleInputChange("portfolioItems", newItems)
  }

  const removePortfolioItem = (index: number) => {
    const newItems = formData.portfolioItems.filter((_: any, i: number) => i !== index)
    handleInputChange("portfolioItems", newItems)
  }

  const updatePortfolioItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.portfolioItems]
    newItems[index] = { ...newItems[index], [field]: value }
    handleInputChange("portfolioItems", newItems)
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
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-purple-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Portfolio Setup</CardTitle>
        <p className="text-gray-600">Showcase your best work</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Portfolio Items</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPortfolioItem}
              className="flex items-center gap-2 bg-transparent"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>

          {formData.portfolioItems.map((item: any, index: number) => (
            <Card key={index} className="p-4 border-2 border-dashed">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Portfolio Item {index + 1}</Label>
                  {formData.portfolioItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePortfolioItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Project title"
                    value={item.title}
                    onChange={(e) => updatePortfolioItem(index, "title", e.target.value)}
                  />
                  <Input
                    placeholder="Project URL or link"
                    value={item.url}
                    onChange={(e) => updatePortfolioItem(index, "url", e.target.value)}
                  />
                </div>

                <Textarea
                  placeholder="Project description"
                  value={item.description}
                  onChange={(e) => updatePortfolioItem(index, "description", e.target.value)}
                  rows={2}
                />
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleNext} className="bg-red-600 hover:bg-red-700">
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default PortfolioSetupStep
