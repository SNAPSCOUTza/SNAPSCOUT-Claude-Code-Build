"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Video, Users, Calculator } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

export default function RateGuidelines() {
  const [calculatorValues, setCalculatorValues] = useState({
    role: "",
    experience: "",
    duration: "",
    location: "",
  })
  const [estimatedRate, setEstimatedRate] = useState<number | null>(null)

  const photographyRates = [
    { level: "Entry Level (0-2 years)", corporate: "R800-1200", wedding: "R1500-3000", commercial: "R1000-2000" },
    { level: "Mid Level (3-5 years)", corporate: "R1200-2000", wedding: "R3000-6000", commercial: "R2000-4000" },
    { level: "Senior Level (6+ years)", corporate: "R2000-3500", wedding: "R6000-12000", commercial: "R4000-8000" },
  ]

  const videographyRates = [
    { level: "Entry Level (0-2 years)", corporate: "R1200-2000", wedding: "R2500-5000", commercial: "R2000-4000" },
    { level: "Mid Level (3-5 years)", corporate: "R2000-3500", wedding: "R5000-10000", commercial: "R4000-7000" },
    { level: "Senior Level (6+ years)", corporate: "R3500-6000", wedding: "R10000-20000", commercial: "R7000-15000" },
  ]

  const crewRates = [
    { department: "Camera", role: "Director of Photography", rate: "R2500-4500/day" },
    { department: "Camera", role: "Camera Operator", rate: "R1800-3000/day" },
    { department: "Camera", role: "1st AC", rate: "R1200-2000/day" },
    { department: "Audio", role: "Sound Recordist", rate: "R1500-2500/day" },
    { department: "Audio", role: "Boom Operator", rate: "R800-1500/day" },
    { department: "Lighting", role: "Gaffer", rate: "R2000-3500/day" },
    { department: "Lighting", role: "Electrician", rate: "R1000-1800/day" },
    { department: "Post Production", role: "Editor", rate: "R1500-3000/day" },
    { department: "Post Production", role: "Colorist", rate: "R2000-4000/day" },
  ]

  const calculateRate = () => {
    // Simple rate calculation logic
    let baseRate = 1000

    if (calculatorValues.role === "photography") baseRate = 1500
    if (calculatorValues.role === "videography") baseRate = 2000
    if (calculatorValues.role === "crew") baseRate = 1800

    if (calculatorValues.experience === "entry") baseRate *= 0.8
    if (calculatorValues.experience === "senior") baseRate *= 1.5

    if (calculatorValues.duration === "half") baseRate *= 0.6
    if (calculatorValues.duration === "multi") baseRate *= 0.9

    if (calculatorValues.location === "remote") baseRate *= 1.2

    setEstimatedRate(Math.round(baseRate))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            Fair Pricing for South African Creatives
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Industry-standard rate guidelines to help you price your services competitively while ensuring fair
            compensation for your skills and experience.
          </p>
        </motion.div>

        {/* Photography Rates */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Photography Rates</CardTitle>
              <CardDescription>Day rates for different photography specializations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Experience Level</th>
                      <th className="text-left py-3 px-4">Corporate</th>
                      <th className="text-left py-3 px-4">Wedding</th>
                      <th className="text-left py-3 px-4">Commercial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {photographyRates.map((rate, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">{rate.level}</td>
                        <td className="py-3 px-4">{rate.corporate}</td>
                        <td className="py-3 px-4">{rate.wedding}</td>
                        <td className="py-3 px-4">{rate.commercial}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Videography Rates */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Videography Rates</CardTitle>
              <CardDescription>Day rates for video production services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Experience Level</th>
                      <th className="text-left py-3 px-4">Corporate</th>
                      <th className="text-left py-3 px-4">Wedding</th>
                      <th className="text-left py-3 px-4">Commercial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videographyRates.map((rate, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">{rate.level}</td>
                        <td className="py-3 px-4">{rate.corporate}</td>
                        <td className="py-3 px-4">{rate.wedding}</td>
                        <td className="py-3 px-4">{rate.commercial}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Film Crew Rates */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Film Crew Daily Rates</CardTitle>
              <CardDescription>Standard rates by department and role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crewRates.map((rate, index) => (
                  <div key={index} className="bg-white/50 rounded-lg p-4">
                    <Badge variant="secondary" className="mb-2">
                      {rate.department}
                    </Badge>
                    <h3 className="font-semibold">{rate.role}</h3>
                    <p className="text-lg font-bold text-green-600">{rate.rate}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rate Calculator */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Rate Calculator</CardTitle>
              <CardDescription>Get a personalized rate estimate for your services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Service Type</Label>
                  <Select
                    value={calculatorValues.role}
                    onValueChange={(value) => setCalculatorValues({ ...calculatorValues, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="videography">Videography</SelectItem>
                      <SelectItem value="crew">Film Crew</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select
                    value={calculatorValues.experience}
                    onValueChange={(value) => setCalculatorValues({ ...calculatorValues, experience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                      <SelectItem value="senior">Senior Level (6+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Project Duration</Label>
                  <Select
                    value={calculatorValues.duration}
                    onValueChange={(value) => setCalculatorValues({ ...calculatorValues, duration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="half">Half Day</SelectItem>
                      <SelectItem value="full">Full Day</SelectItem>
                      <SelectItem value="multi">Multi-Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={calculatorValues.location}
                    onValueChange={(value) => setCalculatorValues({ ...calculatorValues, location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local (Same City)</SelectItem>
                      <SelectItem value="remote">Remote/Travel Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-center">
                <Button onClick={calculateRate} className="bg-green-600 hover:bg-green-700">
                  Calculate Estimated Rate
                </Button>
                {estimatedRate && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-lg">
                      Estimated Rate: <span className="font-bold text-green-600">R{estimatedRate}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      This is a rough estimate. Adjust based on your specific circumstances and market conditions.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Tips */}
        <motion.div
          className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl p-8 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-center mb-6">Pricing Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Know Your Costs</h3>
              <p className="text-gray-600 text-sm">
                Factor in equipment, travel, insurance, and time for post-production
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2">Value Your Experience</h3>
              <p className="text-gray-600 text-sm">
                Don't undervalue your skills and experience - clients pay for quality
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2">Be Transparent</h3>
              <p className="text-gray-600 text-sm">
                Clearly communicate what's included in your rates and any additional costs
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
