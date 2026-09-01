// Mock creator data with Pexels images for testing
export interface MockCreatorProfile {
  id: string
  user_id: string
  display_name: string
  full_name: string
  profession: string
  city: string
  province: string
  profile_picture: string
  bio: string
  availability_status: "Available" | "Booked" | "Limited"
  skills: string[]
  specializations: string[]
  rating: number
  reviews: number
  pricing: string
  portfolioImages: string[]
  is_public: boolean
}

export const mockCreators: MockCreatorProfile[] = [
  {
    id: "creator-1",
    user_id: "creator-1",
    display_name: "Thandi Mokoena",
    full_name: "Thandi Mokoena",
    profession: "Photographer",
    city: "Cape Town",
    province: "Western Cape",
    profile_picture:
      "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Award-winning portrait and fashion photographer with 8 years experience. Featured in Vogue SA and Marie Claire.",
    availability_status: "Available",
    skills: ["Portrait", "Fashion", "Editorial", "Product", "Lifestyle"],
    specializations: ["Portrait Photography", "Fashion Shoots", "Brand Campaigns"],
    rating: 4.9,
    reviews: 127,
    pricing: "R2,500 - R8,000/day",
    portfolioImages: [
      "https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/2422290/pexels-photo-2422290.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    is_public: true,
  },
  {
    id: "creator-2",
    user_id: "creator-2",
    display_name: "Sipho Ndlovu",
    full_name: "Sipho Ndlovu",
    profession: "Videographer",
    city: "Johannesburg",
    province: "Gauteng",
    profile_picture:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Cinematic storyteller specializing in music videos, commercials, and documentary films. Sony Ambassador.",
    availability_status: "Available",
    skills: ["Music Videos", "Commercials", "Documentary", "Corporate", "Events"],
    specializations: ["Music Video Production", "Commercial Filmmaking", "Documentary"],
    rating: 4.8,
    reviews: 89,
    pricing: "R5,000 - R15,000/day",
    portfolioImages: [
      "https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    is_public: true,
  },
  {
    id: "creator-3",
    user_id: "creator-3",
    display_name: "Lerato van der Berg",
    full_name: "Lerato van der Berg",
    profession: "Photographer",
    city: "Durban",
    province: "KwaZulu-Natal",
    profile_picture:
      "https://images.pexels.com/photos/3768894/pexels-photo-3768894.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Wedding and event photographer capturing love stories across South Africa. Published in Wedding Inspirations.",
    availability_status: "Limited",
    skills: ["Weddings", "Events", "Portraits", "Engagement", "Family"],
    specializations: ["Wedding Photography", "Event Coverage", "Couple Portraits"],
    rating: 4.9,
    reviews: 203,
    pricing: "R12,000 - R35,000/event",
    portfolioImages: [
      "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/1067194/pexels-photo-1067194.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    is_public: true,
  },
]
