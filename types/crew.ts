export interface SocialPost {
  id: string
  platform: "instagram" | "facebook" | "linkedin" | "vimeo"
  type: "image" | "video" | "text"
  content: string
  caption?: string
  likes: number
  comments: number
  timestamp: string
  url?: string
}

export interface SocialProfile {
  platform: "instagram" | "facebook" | "linkedin" | "vimeo"
  username: string
  url: string
  followers: number
  verified: boolean
}

export interface CrewMember {
  id: number
  name: string
  role: string
  department: string
  location: string
  availability: string
  experienceLevel: string
  experience: string
  rating: number
  profilePicture: string
  recentWork: string
  specialties: string[]
  gear: string[]
  socialProfiles: SocialProfile[]
  socialPosts: SocialPost[]
}
