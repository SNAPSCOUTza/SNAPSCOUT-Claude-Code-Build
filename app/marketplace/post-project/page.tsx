"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProjectPostingForm } from "@/components/marketplace/project-posting-form"
import type { ProjectFormData } from "@/types/marketplace"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function PostProjectPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (formData: ProjectFormData) => {
    setIsLoading(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error("You must be logged in to post a project")
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({
          client_id: user.id,
          title: formData.title,
          category: formData.category,
          location: formData.location,
          province: formData.province,
          city: formData.city,
          is_remote: formData.is_remote,
          project_type: formData.project_type,
          shoot_date: formData.shoot_date || null,
          duration: formData.duration,
          description: formData.description,
          requirements: formData.requirements,
          equipment_needed: formData.equipment_needed,
          experience_level: formData.experience_level,
          portfolio_requirements: formData.portfolio_requirements,
          deliverables: formData.deliverables,
          quantity: formData.quantity,
          timeline: formData.timeline,
          file_formats: formData.file_formats,
          revision_rounds: formData.revision_rounds,
          rate_type: formData.rate_type,
          rate_amount: formData.rate_amount,
          is_negotiable: formData.is_negotiable,
          payment_terms: formData.payment_terms,
          whats_included: formData.whats_included,
          urgent: formData.urgent,
          status: "open",
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating project:", error)
        toast.error("Failed to create project. Please try again.")
        return
      }

      toast.success("Project posted successfully!")
      router.push(`/marketplace/projects/${data.id}`)
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Project</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find the perfect freelancer for your film or photography project. Fill out the details below and start
            receiving applications from talented professionals.
          </p>
        </div>

        <ProjectPostingForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}

