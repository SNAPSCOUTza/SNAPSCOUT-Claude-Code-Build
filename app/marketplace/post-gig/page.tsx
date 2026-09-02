"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Briefcase, DollarSign, Clock, CheckCircle, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import MobileShell from "@/components/mobile/mobile-shell"

const gigCategories = [
  "Photography",
  "Videography",
  "Editing",
  "Sound",
  "Lighting",
  "Production",
  "Post-Production",
  "Hair & Makeup",
  "Art Direction",
  "Commercial",
  "Wedding",
  "Short Film",
  "Music Video",
  "Documentary",
  "Corporate",
  "Event",
  "Fashion",
  "Product",
  "Portrait",
  "Real Estate",
]

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

const gigTypes = [
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contract", value: "contract" },
  { label: "Freelance", value: "freelance" },
  { label: "Internship", value: "internship" },
]

const normalizeGigType = (value: string) => {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-")
  return normalized === "one-time" ? "contract" : normalized
}

const experienceLevels = [
  { label: "Entry Level", value: "entry" },
  { label: "Mid Level", value: "mid" },
  { label: "Senior", value: "senior" },
  { label: "Expert", value: "expert" },
]

const skillOptions = [
  "Cinematography",
  "Photography",
  "Video Editing",
  "Color Grading",
  "Sound Recording",
  "Lighting",
  "Directing",
  "Producing",
  "Drone Operation",
  "Motion Graphics",
  "VFX",
  "Makeup & Hair",
]

export default function PostGigPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submitAttemptedRef = useRef(false)

  // Form state - collected on submit, not onChange
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    gig_type: "",
    experience_level: "", // Updated to store values like 'entry', 'mid', etc.
    province: "",
    city: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "ZAR",
    positions_available: "1",
    application_deadline: "",
    remote_option: false,
    required_skills: [] as string[],
    responsibilities: "",
    qualifications: "",
  })

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.includes(skill)
        ? prev.required_skills.filter((s) => s !== skill)
        : [...prev.required_skills, skill],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent duplicate submissions
    if (isSubmitting || submitAttemptedRef.current) return
    submitAttemptedRef.current = true
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      // Get current user session - single call
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setError("Please sign in to post a gig")
        setIsSubmitting(false)
        submitAttemptedRef.current = false
        return
      }

      const { error: insertError } = await supabase.from("gigs").insert({
        client_id: session.user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        gig_type: normalizeGigType(formData.gig_type),
        experience_level: formData.experience_level,
        location: formData.city && formData.province ? `${formData.city}, ${formData.province}` : formData.city || formData.province,
        salary_min: formData.salary_min ? Number.parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number.parseFloat(formData.salary_max) : null,
        salary_currency: formData.salary_currency,
        positions_available: Number.parseInt(formData.positions_available) || 1,
        application_deadline: formData.application_deadline || null,
        remote_option: formData.remote_option,
        required_skills: formData.required_skills,
        responsibilities: formData.responsibilities,
        qualifications: formData.qualifications,
        status: "active",
      })

      if (insertError) {
        console.error("Error posting gig:", insertError)
        setError(insertError.message)
        setIsSubmitting(false)
        submitAttemptedRef.current = false
        return
      }

      setSubmitSuccess(true)

      // Redirect after short delay to show success
      setTimeout(() => {
        router.push("/marketplace/available-gigs?posted=true")
      }, 1500)
    } catch (err) {
      console.error("Error:", err)
      setError("An unexpected error occurred")
      setIsSubmitting(false)
      submitAttemptedRef.current = false
    }
  }

  if (submitSuccess) {
    return (
      <MobileShell title="Post a Gig">
        <div className="flex min-h-[65vh] items-center justify-center px-5">
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-sm ring-1 ring-black/5"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black tracking-[-0.03em] text-black">Gig posted.</h2>
            <p className="mt-2 text-sm font-medium text-neutral-500">Redirecting to available gigs...</p>
          </motion.div>
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell title="Post a Gig">
      <div className="space-y-5 px-4 pb-28 pt-3 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[32px] bg-[#111] p-5 text-white shadow-sm"
        >
          <Link
            href="/marketplace/available-gigs"
            className="inline-flex h-11 items-center rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gigs
          </Link>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">SnapScout Gigs</p>
              <h1 className="mt-2 max-w-[290px] text-[34px] font-black leading-[0.95] tracking-[-0.04em]">
                Post a gig that finds the right crew.
              </h1>
            </div>
            <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#d40000] sm:flex">
              <Briefcase className="h-7 w-7" />
            </div>
          </div>
          <p className="mt-4 max-w-[350px] text-[15px] leading-6 text-white/70">
            Create a polished brief for photographers, film crew, studios, and production specialists.
          </p>
        </motion.section>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Card className="overflow-hidden rounded-[30px] border-0 bg-white shadow-sm ring-1 ring-black/5">
            <CardHeader className="space-y-2 p-5">
              <CardTitle className="flex items-center gap-2 text-[22px] font-black tracking-[-0.02em]">
                <Briefcase className="h-5 w-5" />
                Gig Details
              </CardTitle>
              <CardDescription className="text-[15px]">Provide information about the position.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-5 pt-0">
              {error && (
                <div className="rounded-[22px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              {/* Gig Title */}
              <div>
                <Label htmlFor="title">Gig Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Corporate Video Production"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="mt-2 h-12 rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus-visible:ring-[#d40000]"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Gig Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the gig, requirements, and what you're looking for..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                  rows={5}
                  className="mt-2 min-h-[120px] rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus-visible:ring-[#d40000]"
                />
              </div>

              {/* Category & Type Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus:ring-[#d40000]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {gigCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Gig Type *</Label>
                  <Select
                    value={formData.gig_type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, gig_type: value }))}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus:ring-[#d40000]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {gigTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Experience Row */}
              <div>
                <Label>Experience Level *</Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, experience_level: value }))}
                >
                  <SelectTrigger className="mt-2 h-12 rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus:ring-[#d40000]">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Province *</Label>
                  <Select
                    value={formData.province}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, province: value }))}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus:ring-[#d40000]">
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
                  <Label>City *</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus:ring-[#d40000]">
                      <SelectValue placeholder="Select city" />
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
              </div>

              {/* Salary Range */}
              <div>
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget Range (ZAR)
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Min (e.g., 5000)"
                    value={formData.salary_min}
                    onChange={(e) => setFormData((prev) => ({ ...prev, salary_min: e.target.value }))}
                    className="h-12 rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus-visible:ring-[#d40000]"
                  />
                  <Input
                    type="number"
                    placeholder="Max (e.g., 15000)"
                    value={formData.salary_max}
                    onChange={(e) => setFormData((prev) => ({ ...prev, salary_max: e.target.value }))}
                    className="h-12 rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus-visible:ring-[#d40000]"
                  />
                </div>
              </div>

              {/* Positions & Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="positions">Positions Available</Label>
                  <Input
                    id="positions"
                    type="number"
                    min="1"
                    value={formData.positions_available}
                    onChange={(e) => setFormData((prev) => ({ ...prev, positions_available: e.target.value }))}
                    className="mt-2 h-12 rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus-visible:ring-[#d40000]"
                  />
                </div>
                <div>
                  <Label htmlFor="deadline" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Application Deadline
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, application_deadline: e.target.value }))}
                    className="mt-2 h-12 rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus-visible:ring-[#d40000]"
                  />
                </div>
              </div>

              {/* Remote Option */}
              <div className="flex items-center gap-3 rounded-[22px] bg-[#f7f7f4] p-4">
                <Checkbox
                  id="remote"
                  checked={formData.remote_option}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, remote_option: checked as boolean }))}
                />
                <Label htmlFor="remote" className="text-sm font-semibold">
                  This gig can be done remotely
                </Label>
              </div>

              {/* Required Skills */}
              <div>
                <Label>Required Skills</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skillOptions.map((skill) => (
                    <Badge
                      key={skill}
                      variant={formData.required_skills.includes(skill) ? "default" : "outline"}
                      className={`cursor-pointer rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                        formData.required_skills.includes(skill)
                          ? "bg-[#d40000] text-white hover:bg-[#b80000]"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-[#f7f7f4]"
                      }`}
                      onClick={() => handleSkillToggle(skill)}
                    >
                      {skill}
                      {formData.required_skills.includes(skill) && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <Label htmlFor="responsibilities">Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  placeholder="List the main responsibilities..."
                  value={formData.responsibilities}
                  onChange={(e) => setFormData((prev) => ({ ...prev, responsibilities: e.target.value }))}
                  rows={3}
                  className="mt-2 min-h-[96px] rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus-visible:ring-[#d40000]"
                />
              </div>

              {/* Qualifications */}
              <div>
                <Label htmlFor="qualifications">Qualifications</Label>
                <Textarea
                  id="qualifications"
                  placeholder="List required qualifications..."
                  value={formData.qualifications}
                  onChange={(e) => setFormData((prev) => ({ ...prev, qualifications: e.target.value }))}
                  rows={3}
                  className="mt-2 min-h-[96px] rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus-visible:ring-[#d40000]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="h-[52px] flex-1 rounded-full border-neutral-200 text-[15px] font-bold"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-[52px] flex-1 rounded-full bg-[#d40000] text-[15px] font-bold text-white hover:bg-[#b80000]"
                  disabled={
                    isSubmitting ||
                    !formData.title ||
                    !formData.description ||
                    !formData.category ||
                    !formData.gig_type ||
                    !formData.experience_level ||
                    !formData.province ||
                    !formData.city
                  }
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                      Posting...
                    </>
                  ) : (
                    "Post Gig"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MobileShell>
  )
}
