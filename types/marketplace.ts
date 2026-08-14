// TypeScript interfaces for the freelance marketplace system

export interface Project {
  id: string
  client_id: string
  title: string
  category: ProjectCategory
  location?: string
  province?: string
  city?: string
  is_remote: boolean
  project_type?: ProjectType
  shoot_date?: string
  duration?: string
  description: string
  requirements?: string
  equipment_needed: string[]
  experience_level: ExperienceLevel
  portfolio_requirements: boolean

  // Deliverables
  deliverables: string[]
  quantity?: string
  timeline?: string
  file_formats: string[]
  revision_rounds: number

  // Rate and Budget
  rate_type: RateType
  rate_amount?: number
  currency: string
  is_negotiable: boolean
  payment_terms?: string
  whats_included?: string

  // Status and metadata
  urgent: boolean
  status: ProjectStatus
  applications_count: number
  created_at: string
  updated_at: string

  // Populated fields
  client?: {
    id: string
    display_name: string
    profile_picture?: string
  }
}

export interface ProjectApplication {
  id: string
  project_id: string
  freelancer_id: string
  cover_message: string
  proposed_rate?: number
  proposed_timeline?: string
  portfolio_samples: string[]
  status: ApplicationStatus
  created_at: string
  updated_at: string

  // Populated fields
  project?: Project
  freelancer?: {
    id: string
    display_name: string
    profile_picture?: string
    primary_role?: string
    experience_level?: string
    city?: string
  }
}

export interface Favorite {
  id: string
  client_id: string
  freelancer_id: string
  category?: string
  created_at: string

  // Populated fields
  freelancer?: {
    id: string
    display_name: string
    profile_picture?: string
    primary_role?: string
    city?: string
  }
}

export interface ProjectReview {
  id: string
  project_id: string
  client_id: string
  freelancer_id: string
  rating: number
  review_text?: string
  created_at: string
}

// Enums and types
export type ProjectCategory =
  | "Photography"
  | "Videography"
  | "Editing"
  | "Sound"
  | "Lighting"
  | "Production"
  | "Post-Production"
  | "Hair & Makeup"
  | "Art Direction"

export type ProjectType =
  | "Wedding"
  | "Corporate"
  | "Fashion"
  | "Product"
  | "Documentary"
  | "Event"
  | "Portrait"
  | "Commercial"
  | "Music Video"
  | "Short Film"

export type ExperienceLevel = "Beginner" | "Intermediate" | "Professional" | "Expert"

export type RateType = "Per Hour" | "Per Day" | "Per Project" | "Per Photo" | "Per Video"

export type ProjectStatus = "open" | "in_progress" | "completed" | "cancelled"

export type ApplicationStatus = "pending" | "shortlisted" | "hired" | "rejected"

// Form data interfaces
export interface ProjectFormData {
  // Tab 1: Project Basics
  title: string
  category: ProjectCategory
  location: string
  province: string
  city: string
  is_remote: boolean
  project_type: ProjectType
  shoot_date: string
  duration: string
  urgent: boolean

  // Tab 2: Project Requirements
  description: string
  requirements: string
  experience_level: ExperienceLevel
  equipment_needed: string[]
  portfolio_requirements: boolean

  // Tab 3: Deliverables & Timeline
  deliverables: string[]
  quantity: string
  timeline: string
  file_formats: string[]
  revision_rounds: number

  // Tab 4: Rate & Budget
  rate_type: RateType
  rate_amount: number
  is_negotiable: boolean
  payment_terms: string
  whats_included: string
}

export interface ApplicationFormData {
  cover_message: string
  proposed_rate?: number
  proposed_timeline: string
  portfolio_samples: string[]
}

// Filter interfaces
export interface ProjectFilters {
  category?: ProjectCategory
  location?: string
  rate_min?: number
  rate_max?: number
  experience_level?: ExperienceLevel
  urgent_only?: boolean
  remote_only?: boolean
  search?: string
}
