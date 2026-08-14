"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Clock, DollarSign, CheckCircle, AlertCircle, Users, Briefcase } from "lucide-react"
import type { ProjectFormData, ProjectCategory, ProjectType, ExperienceLevel, RateType } from "@/types/marketplace"

interface ProjectPostingFormProps {
  onSubmit: (data: ProjectFormData) => void
  isLoading?: boolean
}

export function ProjectPostingForm({ onSubmit, isLoading = false }: ProjectPostingFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    // Tab 1: Project Basics
    title: "",
    category: "Photography" as ProjectCategory,
    location: "",
    province: "",
    city: "",
    is_remote: false,
    project_type: "Corporate" as ProjectType,
    shoot_date: "",
    duration: "",
    urgent: false,

    // Tab 2: Project Requirements
    description: "",
    requirements: "",
    experience_level: "Professional" as ExperienceLevel,
    equipment_needed: [],
    portfolio_requirements: false,

    // Tab 3: Deliverables & Timeline
    deliverables: [],
    quantity: "",
    timeline: "",
    file_formats: [],
    revision_rounds: 2,

    // Tab 4: Rate & Budget
    rate_type: "Per Project" as RateType,
    rate_amount: 0,
    is_negotiable: true,
    payment_terms: "",
    whats_included: "",
  })

  const [currentTab, setCurrentTab] = useState("basics")
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([])
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

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

  const cities = [
    "Cape Town",
    "Johannesburg",
    "Durban",
    "Pretoria",
    "Port Elizabeth",
    "Bloemfontein",
    "East London",
    "Pietermaritzburg",
    "Kimberley",
    "Polokwane",
  ]

  const categories: ProjectCategory[] = [
    "Photography",
    "Videography",
    "Editing",
    "Sound",
    "Lighting",
    "Production",
    "Post-Production",
    "Hair & Makeup",
    "Art Direction",
  ]

  const projectTypes: ProjectType[] = [
    "Wedding",
    "Corporate",
    "Fashion",
    "Product",
    "Documentary",
    "Event",
    "Portrait",
    "Commercial",
    "Music Video",
    "Short Film",
  ]

  const experienceLevels: ExperienceLevel[] = ["Beginner", "Intermediate", "Professional", "Expert"]
  const rateTypes: RateType[] = ["Per Hour", "Per Day", "Per Project", "Per Photo", "Per Video"]

  const equipmentOptions = [
    "DSLR Camera",
    "Mirrorless Camera",
    "Cinema Camera",
    "Drone",
    "Gimbal Stabilizer",
    "Professional Lighting Kit",
    "Softbox Lighting",
    "LED Panels",
    "Reflectors",
    "Wireless Microphones",
    "Boom Pole",
    "Audio Recorder",
    "Tripods",
    "Slider",
    "Jib Arm",
    "Green Screen",
    "Backdrop Stand",
    "Lens Kit",
    "Memory Cards",
    "Batteries",
  ]

  const deliverableOptions = [
    "Raw Files",
    "Edited Photos",
    "Video Cuts",
    "Color Grading",
    "Audio Mixing",
    "Motion Graphics",
    "Thumbnails",
    "Social Media Versions",
    "Print-Ready Files",
    "Web-Optimized Files",
    "Behind-the-Scenes Content",
    "Highlight Reel",
  ]

  const formatOptions = ["JPEG", "PNG", "RAW", "TIFF", "MP4", "MOV", "AVI", "ProRes", "H.264", "WAV", "MP3"]

  const departmentRoles = {
    Camera: ["Director of Photography", "Camera Operator", "Focus Puller", "Camera Assistant"],
    Audio: ["Sound Engineer", "Boom Operator", "Sound Mixer", "Audio Post Supervisor"],
    Lighting: ["Gaffer", "Best Boy Electric", "Lighting Technician", "Electrician"],
    Production: ["Script Supervisor", "Assistant Director", "Production Manager", "Location Manager"],
    Art: ["Production Designer", "Art Director", "Set Decorator", "Props Master"],
    "Hair & Makeup": ["Makeup Artist", "Hair Stylist", "Special Effects Makeup", "Wardrobe Stylist"],
    "Post Production": ["Editor", "Colorist", "VFX Artist", "Motion Graphics Designer"],
    Direction: ["Director", "Assistant Director", "Script Supervisor", "Continuity"],
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalData = {
      ...formData,
      equipment_needed: selectedEquipment,
      deliverables: selectedDeliverables,
      file_formats: selectedFormats,
      departments: selectedDepartments,
      roles: selectedRoles,
    }
    onSubmit(finalData)
  }

  const toggleArrayItem = (item: string, array: string[], setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter((i) => i !== item))
    } else {
      setter([...array, item])
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-red-600" />
          Post a New Project
        </CardTitle>
        <CardDescription>
          Create a detailed project posting to find the perfect freelancer for your film or photo project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basics" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Basics
              </TabsTrigger>
              <TabsTrigger value="departments" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Departments
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="requirements" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Requirements
              </TabsTrigger>
              <TabsTrigger value="deliverables" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Deliverables
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Project Basics */}
            <TabsContent value="basics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Corporate headshots for tech startup"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: ProjectCategory) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Select
                    value={formData.province}
                    onValueChange={(value) => setFormData({ ...formData, province: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Province" />
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
                  <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="remote"
                    checked={formData.is_remote}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_remote: !!checked })}
                  />
                  <Label htmlFor="remote">Remote work possible</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project_type">Project Type</Label>
                  <Select
                    value={formData.project_type}
                    onValueChange={(value: ProjectType) => setFormData({ ...formData, project_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 4 hours, 2 days"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shoot_date">Shoot/Work Date</Label>
                  <Input
                    id="shoot_date"
                    type="date"
                    value={formData.shoot_date}
                    onChange={(e) => setFormData({ ...formData, shoot_date: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="urgent"
                    checked={formData.urgent}
                    onCheckedChange={(checked) => setFormData({ ...formData, urgent: !!checked })}
                  />
                  <Label htmlFor="urgent" className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Rush gig (urgent)
                  </Label>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Departments */}
            <TabsContent value="departments" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Departments</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose which film industry departments you need for this project.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.keys(departmentRoles).map((department) => (
                    <div key={department} className="flex items-center space-x-2">
                      <Checkbox
                        id={department}
                        checked={selectedDepartments.includes(department)}
                        onCheckedChange={() => toggleArrayItem(department, selectedDepartments, setSelectedDepartments)}
                      />
                      <Label htmlFor={department} className="text-sm font-medium">
                        {department}
                      </Label>
                    </div>
                  ))}
                </div>

                {selectedDepartments.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Departments:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDepartments.map((dept, index) => (
                        <Badge key={`dept-${index}`} variant="secondary" className="bg-red-100 text-red-800">
                          {dept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab 3: Roles */}
            <TabsContent value="roles" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Specific Roles</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose the specific roles you need. Roles are organized by department.
                  </p>
                </div>

                {selectedDepartments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Please select departments first to see available roles.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedDepartments.map((department, index) => (
                      <div key={`dept-${index}`} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-red-600" />
                          {department} Roles
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {departmentRoles[department as keyof typeof departmentRoles].map((role, roleIndex) => (
                            <div key={`${department}-${role}-${roleIndex}`} className="flex items-center space-x-2">
                              <Checkbox
                                id={role}
                                checked={selectedRoles.includes(role)}
                                onCheckedChange={() => toggleArrayItem(role, selectedRoles, setSelectedRoles)}
                              />
                              <Label htmlFor={role} className="text-sm">
                                {role}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedRoles.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Roles:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoles.map((role, index) => (
                        <Badge key={`role-${index}`} variant="secondary" className="bg-red-100 text-red-800">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab 4: Project Requirements */}
            <TabsContent value="requirements" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project in detail..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Specific Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Any specific requirements, style preferences, or special considerations..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_level">Experience Level Required</Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value: ExperienceLevel) => setFormData({ ...formData, experience_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Equipment Needed</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {equipmentOptions.map((equipment) => (
                    <div key={equipment} className="flex items-center space-x-2">
                      <Checkbox
                        id={equipment}
                        checked={selectedEquipment.includes(equipment)}
                        onCheckedChange={() => toggleArrayItem(equipment, selectedEquipment, setSelectedEquipment)}
                      />
                      <Label htmlFor={equipment} className="text-sm">
                        {equipment}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="portfolio_requirements"
                  checked={formData.portfolio_requirements}
                  onCheckedChange={(checked) => setFormData({ ...formData, portfolio_requirements: !!checked })}
                />
                <Label htmlFor="portfolio_requirements">Require portfolio examples with application</Label>
              </div>
            </TabsContent>

            {/* Tab 5: Deliverables & Timeline */}
            <TabsContent value="deliverables" className="space-y-6">
              <div className="space-y-3">
                <Label>What do you expect to receive?</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {deliverableOptions.map((deliverable) => (
                    <div key={deliverable} className="flex items-center space-x-2">
                      <Checkbox
                        id={deliverable}
                        checked={selectedDeliverables.includes(deliverable)}
                        onCheckedChange={() =>
                          toggleArrayItem(deliverable, selectedDeliverables, setSelectedDeliverables)
                        }
                      />
                      <Label htmlFor={deliverable} className="text-sm">
                        {deliverable}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity Expected</Label>
                  <Input
                    id="quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g., 50 edited photos, 3-minute video"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeline">Delivery Timeline</Label>
                  <Input
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    placeholder="e.g., 3 days, 1 week"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>File Formats Needed</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {formatOptions.map((format) => (
                    <div key={format} className="flex items-center space-x-2">
                      <Checkbox
                        id={format}
                        checked={selectedFormats.includes(format)}
                        onCheckedChange={() => toggleArrayItem(format, selectedFormats, setSelectedFormats)}
                      />
                      <Label htmlFor={format} className="text-sm">
                        {format}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="revision_rounds">Revision Rounds Included</Label>
                <Select
                  value={formData.revision_rounds.toString()}
                  onValueChange={(value) => setFormData({ ...formData, revision_rounds: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 revision</SelectItem>
                    <SelectItem value="2">2 revisions</SelectItem>
                    <SelectItem value="3">3 revisions</SelectItem>
                    <SelectItem value="4">4 revisions</SelectItem>
                    <SelectItem value="5">5 revisions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Tab 6: Rate & Budget */}
            <TabsContent value="budget" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate_type">Rate Type</Label>
                  <Select
                    value={formData.rate_type}
                    onValueChange={(value: RateType) => setFormData({ ...formData, rate_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                <div className="space-y-2">
                  <Label htmlFor="rate_amount">Rate Amount (ZAR)</Label>
                  <Input
                    id="rate_amount"
                    type="number"
                    value={formData.rate_amount}
                    onChange={(e) => setFormData({ ...formData, rate_amount: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_negotiable"
                  checked={formData.is_negotiable}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_negotiable: !!checked })}
                />
                <Label htmlFor="is_negotiable">Rate is negotiable</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Textarea
                  id="payment_terms"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  placeholder="e.g., 50% upfront, 50% on delivery"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whats_included">What's Included in Rate</Label>
                <Textarea
                  id="whats_included"
                  value={formData.whats_included}
                  onChange={(e) => setFormData({ ...formData, whats_included: e.target.value })}
                  placeholder="Specify what's included vs. what costs extra..."
                  rows={3}
                />
              </div>

              <div className="pt-6 border-t">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Project Summary</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{formData.category}</Badge>
                      <Badge variant="secondary">{formData.project_type}</Badge>
                      {formData.urgent && <Badge variant="destructive">Urgent</Badge>}
                      {formData.is_remote && <Badge variant="outline">Remote OK</Badge>}
                      {selectedDepartments.map((dept, index) => (
                        <Badge key={`summary-dept-${index}`} variant="secondary" className="bg-red-100 text-red-800">
                          {dept}
                        </Badge>
                      ))}
                      {selectedRoles.map((role, index) => (
                        <Badge key={`summary-role-${index}`} variant="secondary" className="bg-red-100 text-red-800">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                    {isLoading ? "Posting..." : "Post Project"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
    </Card>
  )
}
