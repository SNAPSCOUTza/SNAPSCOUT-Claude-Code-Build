export type OnboardingRole = "scout" | "creator" | "studio_store"
export type OnboardingBranch = "content_creator" | "film_crew" | "studio" | "store"

// Legacy onboarding compatibility types used by existing dashboard/onboarding modules.
export type AccountType = "film_crew" | "content_creator"
export type TravelWillingness = "local" | "provincial" | "national" | "international"
export type RateStructure = "hourly" | "daily" | "project"

export type QuestionSelectionMode = "single" | "multi"
export type QuestionLayout = "cards" | "chips" | "three-col" | "two-col"

export interface QuestionOption {
  value: string
  label: string
  description?: string
}

export interface OnboardingQuestion {
  id: string
  prompt: string
  mode: QuestionSelectionMode
  layout: QuestionLayout
  options: QuestionOption[]
}

export interface OnboardingTrack {
  role: OnboardingRole
  branch?: OnboardingBranch
  title: string
  questions: OnboardingQuestion[]
}

export type OnboardingAnswers = Record<string, string | string[]>

export interface OnboardingState {
  role: OnboardingRole | null
  branch: OnboardingBranch | null
  answers: OnboardingAnswers
  email: string
  password: string
}

export interface AhaCardItem {
  id: string
  name: string
  subtitle: string
  rate: string
  badge: string
  availability: string
}

// Legacy interfaces/constants required by existing components.
export interface FilmCrewRole {
  id: string
  name: string
  department: string
  description: string
  icon: string
}

export interface ContentCreatorSpecialization {
  id: string
  name: string
  category: "photography" | "videography"
  description: string
  icon: string
}

export interface OnboardingStep {
  step: number
  title: string
  description: string
  isCompleted: boolean
  isActive: boolean
}

export interface OnboardingData {
  accountType: AccountType | null
  selectedRoles: string[]
  specializations: string[]
  province: string
  city: string
  availability: "available" | "busy" | "booking_advance"
  travelWillingness: TravelWillingness
  remoteCapable: boolean
  yearsExperience: number
  portfolioUrl: string
  sampleWorkUrls: string[]
  equipmentOwned: string[]
  certifications: string[]
  rateStructure: RateStructure
  hourlyRate: number
  dailyRate: number
  projectRateMin: number
  projectRateMax: number
  businessName: string
  vatRegistered: boolean
  contactPreferences: string[]
  bio: string
}

export const PHOTOGRAPHY_SPECIALIZATIONS: ContentCreatorSpecialization[] = [
  { id: "portrait", name: "Portrait Photography", category: "photography", description: "Professional headshots and personal portraits", icon: "👤" },
  { id: "wedding", name: "Wedding Photography", category: "photography", description: "Wedding ceremonies and celebrations", icon: "💒" },
  { id: "product", name: "Product Photography", category: "photography", description: "Commercial product shots for e-commerce", icon: "📦" },
  { id: "food", name: "Food Photography", category: "photography", description: "Restaurant and culinary photography", icon: "🍽️" },
  { id: "fashion", name: "Fashion Photography", category: "photography", description: "Fashion shoots and modeling", icon: "👗" },
  { id: "real_estate", name: "Real Estate Photography", category: "photography", description: "Property and architectural photography", icon: "🏠" },
  { id: "event", name: "Event Photography", category: "photography", description: "Corporate and social events", icon: "🎉" },
  { id: "corporate", name: "Corporate Photography", category: "photography", description: "Business and professional photography", icon: "🏢" },
  { id: "lifestyle", name: "Lifestyle Photography", category: "photography", description: "Authentic lifestyle and candid shots", icon: "🌟" },
  { id: "fine_art", name: "Fine Art Photography", category: "photography", description: "Artistic and creative photography", icon: "🎨" },
  { id: "street", name: "Street Photography", category: "photography", description: "Urban and street scene photography", icon: "🏙️" },
  { id: "nature", name: "Nature/Landscape Photography", category: "photography", description: "Natural landscapes and outdoor photography", icon: "🌄" },
  { id: "family", name: "Newborn/Family Photography", category: "photography", description: "Family portraits and newborn sessions", icon: "👶" },
  { id: "boudoir", name: "Boudoir Photography", category: "photography", description: "Intimate and artistic portrait photography", icon: "💄" },
  { id: "architectural", name: "Architectural Photography", category: "photography", description: "Building and structural photography", icon: "🏛️" },
]

export const VIDEOGRAPHY_SPECIALIZATIONS: ContentCreatorSpecialization[] = [
  { id: "social_media", name: "Social Media Content", category: "videography", description: "Short-form content for social platforms", icon: "📱" },
  { id: "corporate_video", name: "Corporate Videos", category: "videography", description: "Business and promotional videos", icon: "🏢" },
  { id: "wedding_video", name: "Wedding Videography", category: "videography", description: "Wedding ceremonies and celebrations", icon: "💒" },
  { id: "music_video", name: "Music Videos", category: "videography", description: "Music video production and editing", icon: "🎵" },
  { id: "commercial", name: "Commercial/Advertising", category: "videography", description: "TV commercials and advertising content", icon: "📺" },
  { id: "documentary", name: "Documentary", category: "videography", description: "Documentary filmmaking and storytelling", icon: "🎬" },
  { id: "real_estate_video", name: "Real Estate Videos", category: "videography", description: "Property tours and real estate content", icon: "🏠" },
  { id: "event_video", name: "Event Videography", category: "videography", description: "Corporate and social event coverage", icon: "🎉" },
  { id: "training", name: "Training/Educational Videos", category: "videography", description: "Educational and instructional content", icon: "📚" },
  { id: "drone", name: "Drone Videography", category: "videography", description: "Aerial photography and videography", icon: "🚁" },
  { id: "live_streaming", name: "Live Streaming", category: "videography", description: "Live event streaming and production", icon: "📡" },
  { id: "animation", name: "Animation/Motion Graphics", category: "videography", description: "Animated content and motion graphics", icon: "🎨" },
  { id: "youtube", name: "YouTube Content Creation", category: "videography", description: "Long-form YouTube video production", icon: "▶️" },
  { id: "tiktok", name: "TikTok/Reels Creation", category: "videography", description: "Short-form vertical video content", icon: "🎭" },
  { id: "brand_story", name: "Brand Storytelling", category: "videography", description: "Brand narrative and storytelling videos", icon: "📖" },
]

export const FILM_CREW_ROLES: FilmCrewRole[] = [
  { id: "director", name: "Director", department: "Direction", description: "Creative vision and overall project leadership", icon: "🎬" },
  { id: "producer", name: "Producer", department: "Production", description: "Project management and coordination", icon: "📋" },
  { id: "cinematographer", name: "Cinematographer", department: "Camera", description: "Director of Photography and visual storytelling", icon: "📹" },
  { id: "sound_engineer", name: "Sound Engineer", department: "Audio", description: "Audio recording and sound design", icon: "🎧" },
  { id: "gaffer", name: "Gaffer", department: "Lighting", description: "Chief lighting technician", icon: "💡" },
  { id: "editor", name: "Editor", department: "Post Production", description: "Video editing and post-production", icon: "✂️" },
  { id: "camera_operator", name: "Camera Operator", department: "Camera", description: "Camera operation and movement", icon: "📷" },
  { id: "boom_operator", name: "Boom Operator", department: "Audio", description: "Boom microphone operation", icon: "🎤" },
  { id: "script_supervisor", name: "Script Supervisor", department: "Production", description: "Continuity and script management", icon: "📝" },
  { id: "makeup_artist", name: "Makeup Artist", department: "Hair & Makeup", description: "Makeup and special effects", icon: "💄" },
]
