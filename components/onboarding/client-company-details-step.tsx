"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Building2, ShoppingBag, Search } from "lucide-react"
import type { OnboardingData } from "@/types/account-types"

interface ClientCompanyDetailsStepProps {
  onNext: () => void
  onPrev: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const companySizeOptions = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-1000 employees",
  "1000+ employees",
]

const industryOptions = {
  studio: [
    "Film Production",
    "Television Production",
    "Commercial Production",
    "Music Video Production",
    "Documentary Production",
    "Animation Studio",
    "Post-Production Services",
    "Independent Production",
  ],
  store: [
    "Fashion & Apparel",
    "Beauty & Cosmetics",
    "Food & Beverage",
    "Technology & Electronics",
    "Home & Garden",
    "Sports & Fitness",
    "Automotive",
    "Healthcare",
    "Real Estate",
    "Professional Services",
    "E-commerce",
    "Retail",
  ],
  scout: [
    "Talent Agency",
    "Casting Agency",
    "Model Agency",
    "Entertainment Company",
    "Advertising Agency",
    "Production Company",
    "Independent Scout",
    "Freelance Casting Director",
  ],
}

const organizationTypes = [
  "Production Company",
  "Talent Agency",
  "Casting Agency",
  "Independent Scout",
  "Freelance Professional",
]

export default function ClientCompanyDetailsStep({ onNext, onPrev, data, updateData }: ClientCompanyDetailsStepProps) {
  const accountType = data.accountType!
  const isStudio = accountType === "studio"
  const isStore = accountType === "store"
  const isScout = accountType === "scout"

  const getIcon = () => {
    if (isStudio) return Building2
    if (isStore) return ShoppingBag
    if (isScout) return Search
    return Building2
  }

  const getTitle = () => {
    if (isStudio) return "Studio Details"
    if (isStore) return "Business Details"
    if (isScout) return "Organization Details"
    return "Company Details"
  }

  const getSubtitle = () => {
    if (isStudio) return "Tell us about your production studio"
    if (isStore) return "Tell us about your business or brand"
    if (isScout) return "Tell us about your scouting organization"
    return "Tell us about your organization"
  }

  const getIndustryOptions = () => {
    if (isStudio) return industryOptions.studio
    if (isStore) return industryOptions.store
    if (isScout) return industryOptions.scout
    return []
  }

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    updateData({ [field]: value })
  }

  const canProceed = data.companyName && data.industry

  const Icon = getIcon()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
            <Icon className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{getTitle()}</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">{getSubtitle()}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-900">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                  {isStudio ? "Studio Name" : isStore ? "Business Name" : "Organization Name"} *
                </Label>
                <Input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  placeholder={
                    isStudio
                      ? "e.g., Sunset Studios"
                      : isStore
                        ? "e.g., Trendy Fashion Co."
                        : "e.g., Elite Talent Agency"
                  }
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize" className="text-sm font-medium text-gray-700">
                  Company Size
                </Label>
                <Select value={data.companySize} onValueChange={(value) => handleInputChange("companySize", value)}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizeOptions.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-sm font-medium text-gray-700">
                {isStudio ? "Production Focus" : isStore ? "Industry" : "Organization Type"} *
              </Label>
              <Select value={data.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue
                    placeholder={
                      isStudio
                        ? "Select production focus"
                        : isStore
                          ? "Select your industry"
                          : "Select organization type"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {getIndustryOptions().map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isScout && (
              <div className="space-y-2">
                <Label htmlFor="organizationType" className="text-sm font-medium text-gray-700">
                  Organization Structure
                </Label>
                <Select
                  value={data.organizationType}
                  onValueChange={(value) => handleInputChange("organizationType", value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select organization structure" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="clientBaseInfo" className="text-sm font-medium text-gray-700">
                {isStudio ? "About Your Studio" : isStore ? "About Your Business" : "About Your Organization"}
              </Label>
              <Textarea
                id="clientBaseInfo"
                value={data.clientBaseInfo}
                onChange={(e) => handleInputChange("clientBaseInfo", e.target.value)}
                placeholder={
                  isStudio
                    ? "Describe your studio, typical projects, and what makes you unique..."
                    : isStore
                      ? "Describe your business, target audience, and brand values..."
                      : "Describe your organization, client base, and areas of expertise..."
                }
                rows={4}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {canProceed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center pt-6"
        >
          <Button
            onClick={onNext}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            Continue to Services
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}
