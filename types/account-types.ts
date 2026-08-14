export type AccountType = "film_crew" | "content_creator" | "studio" | "store" | "scout"

export interface AccountTypeInfo {
  id: AccountType
  title: string
  subtitle: string
  description: string
  icon: string
  category: "service_provider" | "client"
  pricing: "paid" | "free"
  features: string[]
}

export interface ClientProfile {
  company_name?: string
  company_size?: string
  industry?: string
  services_needed?: string[]
  typical_budget_range?: string
  content_needs?: string[]
  project_types?: string[]
  casting_focus?: string[]
  talent_types?: string[]
  organization_type?: string
  client_base_info?: string
}

export interface ServiceProviderProfile {
  specializations?: string[]
  departments?: string[]
  roles?: string[]
  experience_level?: string
  years_experience?: string
  equipment?: string[]
  certifications?: string[]
  portfolio_links?: string[]
  hourly_rate?: number
  daily_rate?: number
  project_rate?: number
}

export interface UserProfile extends ClientProfile, ServiceProviderProfile {
  id?: string
  user_id: string
  account_type: AccountType
  display_name?: string
  full_name?: string
  email?: string
  bio?: string
  profession?: string
  location?: string
  city?: string
  cities?: string
  province?: string
  provinces?: string
  phone?: string
  website?: string
  website_url?: string
  instagram?: string
  facebook?: string
  linkedin?: string
  youtube?: string
  youtube_vimeo?: string
  twitter?: string
  imdb_profile?: string
  profile_picture?: string
  portfolio_images?: string[]
  sample_work_urls?: string[]
  portfolio_url?: string
  skills?: string[]
  availability?: string
  availability_status?: string
  travel_willingness?: string
  willing_to_travel?: boolean
  remote_capable?: boolean
  is_profile_visible?: boolean
  is_verified?: boolean
  featured?: boolean
  onboarding_completed?: boolean
  profile_completion_percentage?: number
  subscription_status?: string
  subscription_plan?: string
  created_at?: string
  updated_at?: string
}

export const ACCOUNT_TYPES: Record<AccountType, AccountTypeInfo> = {
  film_crew: {
    id: "film_crew",
    title: "Film Crew Professional",
    subtitle: "Work on film & TV productions",
    description: "Join film and television productions as crew. Get hired for movies, series, commercials, and more.",
    icon: "🎬",
    category: "service_provider",
    pricing: "paid",
    features: [
      "Professional crew profile",
      "Showcase your film credits",
      "Connect with production studios",
      "Get hired for film & TV projects",
      "Access to exclusive crew gigs",
    ],
  },
  content_creator: {
    id: "content_creator",
    title: "Creator",
    subtitle: "Create content for brands",
    description: "Offer photography and videography services. Work with brands, businesses, and individuals.",
    icon: "📸",
    category: "service_provider",
    pricing: "paid",
    features: [
      "Creator portfolio showcase",
      "Display your photography & video work",
      "Connect with brands and businesses",
      "Offer content creation services",
      "Build your creative business",
    ],
  },
  studio: {
    id: "studio",
    title: "Studio",
    subtitle: "Hire talent for productions",
    description: "Production studios looking to hire crew, creators, and talent for film, TV, and commercial projects.",
    icon: "🏢",
    category: "client",
    pricing: "free",
    features: [
      "Post casting calls and gig listings",
      "Browse and hire crew members",
      "Manage production teams",
      "Access to verified professionals",
      "Project management tools",
    ],
  },
  store: {
    id: "store",
    title: "Store/Brand",
    subtitle: "Get content for your business",
    description:
      "Businesses and brands looking for creators to produce marketing materials, product photos, and promotional content.",
    icon: "🛍️",
    category: "client",
    pricing: "free",
    features: [
      "Find creators for your brand",
      "Commission product photography",
      "Get social media content",
      "Access to marketing professionals",
      "Brand content management",
    ],
  },
  scout: {
    id: "scout",
    title: "Scout",
    subtitle: "Discover and cast talent",
    description:
      "Talent scouts and casting directors looking to discover new talent for film, TV, commercials, and other projects.",
    icon: "🔍",
    category: "client",
    pricing: "free",
    features: [
      "Discover new talent",
      "Browse actor and model profiles",
      "Manage casting processes",
      "Connect with agencies",
      "Talent database access",
    ],
  },
}

export const getAccountTypeDisplay = (type: string | null | undefined): string => {
  if (!type) return ""

  // Normalize to lowercase to match keys
  const normalizedType = type.toLowerCase().replace(" ", "_") as AccountType

  if (ACCOUNT_TYPES[normalizedType]) {
    return ACCOUNT_TYPES[normalizedType].title
  }

  // Fallback formatting if not in map
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ")
}

export interface OnboardingData {
  // Step 1: Account Type & Roles
  accountType: AccountType | null
  selectedRoles: string[]
  specializations: string[]

  // Step 2: Location & Availability (Service Providers)
  province: string
  city: string
  availability: string
  travelWillingness: string
  remoteCapable: boolean

  // Step 3: Experience & Portfolio (Service Providers)
  yearsExperience: number
  portfolioUrl: string
  sampleWorkUrls: string[]
  equipmentOwned: string[]
  certifications: string[]

  // Step 4: Rates & Business Info (Service Providers)
  rateStructure: string
  hourlyRate: number
  dailyRate: number
  projectRateMin: number
  projectRateMax: number
  businessName: string
  vatRegistered: boolean
  contactPreferences: string[]
  bio: string

  // Client-specific fields
  companyName: string
  companySize: string
  industry: string
  servicesNeeded: string[]
  typicalBudgetRange: string
  contentNeeds: string[]
  projectTypes: string[]
  castingFocus: string[]
  talentTypes: string[]
  organizationType: string
  clientBaseInfo: string
}
