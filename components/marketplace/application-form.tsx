"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Send, Paperclip, DollarSign, Clock, User } from "lucide-react"
import type { Project, ApplicationFormData } from "@/types/marketplace"

interface ApplicationFormProps {
  project: Project
  onSubmit: (data: ApplicationFormData) => void
  isLoading?: boolean
  trigger?: React.ReactNode
}

export function ApplicationForm({ project, onSubmit, isLoading = false, trigger }: ApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    cover_message: "",
    proposed_rate: project.rate_amount || undefined,
    proposed_timeline: project.timeline || "",
    portfolio_samples: [],
  })

  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setOpen(false)
  }

  const addPortfolioSample = () => {
    if (portfolioUrl.trim()) {
      setFormData({
        ...formData,
        portfolio_samples: [...formData.portfolio_samples, portfolioUrl.trim()],
      })
      setPortfolioUrl("")
    }
  }

  const removePortfolioSample = (index: number) => {
    setFormData({
      ...formData,
      portfolio_samples: formData.portfolio_samples.filter((_, i) => i !== index),
    })
  }

  const formatRate = () => {
    if (!project.rate_amount) return "Rate negotiable"
    return `R${project.rate_amount.toLocaleString()} ${project.rate_type.toLowerCase()}`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
            <Send className="h-4 w-4" />
            Apply for Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for Project</DialogTitle>
          <DialogDescription>
            Submit your application for this project. Make sure to highlight your relevant experience.
          </DialogDescription>
        </DialogHeader>

        {/* Project Summary */}
        <Card className="bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{project.category}</Badge>
              {project.project_type && <Badge variant="outline">{project.project_type}</Badge>}
              <Badge variant="outline">{formatRate()}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Message */}
          <div className="space-y-2">
            <Label htmlFor="cover_message">Cover Message *</Label>
            <Textarea
              id="cover_message"
              value={formData.cover_message}
              onChange={(e) => setFormData({ ...formData, cover_message: e.target.value })}
              placeholder="Introduce yourself and explain why you're the perfect fit for this project..."
              rows={4}
              required
            />
            <p className="text-xs text-gray-500">Tip: Mention specific experience relevant to this project type</p>
          </div>

          {/* Proposed Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proposed_rate">Your Rate (ZAR) {project.rate_type}</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="proposed_rate"
                  type="number"
                  value={formData.proposed_rate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, proposed_rate: e.target.value ? Number(e.target.value) : undefined })
                  }
                  placeholder="Enter your rate"
                  className="pl-10"
                />
              </div>
              {project.is_negotiable && <p className="text-xs text-gray-500">Client is open to negotiation</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposed_timeline">Your Timeline</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="proposed_timeline"
                  value={formData.proposed_timeline}
                  onChange={(e) => setFormData({ ...formData, proposed_timeline: e.target.value })}
                  placeholder="e.g., 3 days, 1 week"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Portfolio Samples */}
          <div className="space-y-3">
            <Label>Portfolio Samples {project.portfolio_requirements && <span className="text-red-500">*</span>}</Label>
            <p className="text-sm text-gray-600">
              Add links to relevant work samples (Behance, Instagram, Vimeo, etc.)
            </p>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Paperclip className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://..."
                  className="pl-10"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPortfolioSample())}
                />
              </div>
              <Button type="button" variant="outline" onClick={addPortfolioSample}>
                Add
              </Button>
            </div>

            {formData.portfolio_samples.length > 0 && (
              <div className="space-y-2">
                {formData.portfolio_samples.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate"
                    >
                      {url}
                    </a>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removePortfolioSample(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {project.portfolio_requirements && formData.portfolio_samples.length === 0 && (
              <p className="text-sm text-red-500">Portfolio samples are required for this project</p>
            )}
          </div>

          <Separator />

          {/* Submit Button */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <User className="inline h-4 w-4 mr-1" />
              Your application will be sent to the client
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.cover_message.trim() ||
                  (project.portfolio_requirements && formData.portfolio_samples.length === 0)
                }
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
