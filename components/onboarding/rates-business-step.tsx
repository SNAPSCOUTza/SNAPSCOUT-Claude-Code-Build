"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DollarSign, Clock, FileText, Building } from "lucide-react"

interface RatesBusinessStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export default function RatesBusinessStep({ data, onUpdate, onNext, onBack }: RatesBusinessStepProps) {
  const [formData, setFormData] = useState({
    rateStructure: data.rateStructure || "hourly",
    hourlyRate: data.hourlyRate || "",
    dayRate: data.dayRate || "",
    projectRate: data.projectRate || "",
    currency: data.currency || "ZAR",
    negotiableRates: data.negotiableRates || false,
    businessName: data.businessName || "",
    vatNumber: data.vatNumber || "",
    invoicing: data.invoicing || false,
    ...data,
  })

  const handleUpdate = (field: string, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
  }

  const handleNext = () => {
    const hasRate = formData.hourlyRate || formData.dayRate || formData.projectRate
    if (hasRate) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Rates & Business Info</h2>
        <p className="text-gray-600 mt-2">Set your rates and business details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-red-600" />
            Rate Structure
          </CardTitle>
          <CardDescription>How do you prefer to charge for your services?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Rate Structure</label>
            <Select value={formData.rateStructure} onValueChange={(value) => handleUpdate("rateStructure", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
                <SelectItem value="daily">Day Rate</SelectItem>
                <SelectItem value="project">Project-based</SelectItem>
                <SelectItem value="flexible">Flexible (depends on project)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate ({formData.currency})</label>
              <Input
                type="number"
                placeholder="500"
                value={formData.hourlyRate}
                onChange={(e) => handleUpdate("hourlyRate", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Day Rate ({formData.currency})</label>
              <Input
                type="number"
                placeholder="3000"
                value={formData.dayRate}
                onChange={(e) => handleUpdate("dayRate", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Rate (from {formData.currency})
              </label>
              <Input
                type="number"
                placeholder="10000"
                value={formData.projectRate}
                onChange={(e) => handleUpdate("projectRate", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="negotiable"
              checked={formData.negotiableRates}
              onCheckedChange={(checked) => handleUpdate("negotiableRates", checked)}
            />
            <label htmlFor="negotiable" className="text-sm font-medium">
              My rates are negotiable depending on project scope
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-red-600" />
            Business Information
          </CardTitle>
          <CardDescription>Optional business details for professional invoicing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business/Company Name (Optional)</label>
            <Input
              placeholder="Your Business Name"
              value={formData.businessName}
              onChange={(e) => handleUpdate("businessName", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">VAT Number (Optional)</label>
            <Input
              placeholder="4123456789"
              value={formData.vatNumber}
              onChange={(e) => handleUpdate("vatNumber", e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="invoicing"
              checked={formData.invoicing}
              onCheckedChange={(checked) => handleUpdate("invoicing", checked)}
            />
            <label htmlFor="invoicing" className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />I can provide professional invoices
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Rate Guidelines</h4>
              <p className="text-sm text-blue-700 mt-1">
                • Hourly rates in South Africa typically range from R300-R1500+ depending on experience • Day rates
                usually range from R2000-R8000+ for professional work • Project rates vary widely based on scope and
                deliverables • Consider your experience level, equipment, and local market rates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!formData.hourlyRate && !formData.dayRate && !formData.projectRate}
          className="bg-red-600 hover:bg-red-700"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  )
}
