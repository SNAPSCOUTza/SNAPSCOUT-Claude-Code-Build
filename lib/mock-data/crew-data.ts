// Mock data for testing Find Film Crew page
export interface MockCrewMember {
  id: string
  user_id: string
  display_name: string
  full_name: string
  profession: string
  department: string
  role: string
  city: string
  province: string
  profile_picture: string
  bio: string
  availability_status: "available" | "booked" | "unavailable"
  experience_level: "Entry" | "Mid" | "Senior" | "Expert"
  skills: string[]
  specialties: string[]
  rating: number
  years_experience: string
  recent_work: string
  recent_work_caption: string
  is_profile_visible: boolean
}

export const mockCrewMembers: MockCrewMember[] = [
  {
    id: "crew-001",
    user_id: "crew-001",
    display_name: "Alex Thompson",
    full_name: "Alex Thompson",
    profession: "Director of Photography",
    department: "Camera",
    role: "Director of Photography",
    city: "Cape Town",
    province: "SA",
    profile_picture:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Award-winning cinematographer with 12+ years experience in feature films and commercials. Specialized in natural lighting and drone cinematography.",
    availability_status: "available",
    experience_level: "Senior",
    skills: ["Cinematic Lighting", "Drone Operations", "Color Grading", "ARRI Alexa", "RED Camera"],
    specialties: ["Cinematic Lighting", "Drone Operations", "Color Grading"],
    rating: 4.9,
    years_experience: "12+ years",
    recent_work: "https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=600",
    recent_work_caption: "Behind the scenes with the RED Dragon. Studio work never gets old!",
    is_profile_visible: true,
  },
  {
    id: "crew-002",
    user_id: "crew-002",
    display_name: "Sarah Mitchell",
    full_name: "Sarah Mitchell",
    profession: "Sound Engineer",
    department: "Audio",
    role: "Sound Engineer",
    city: "Johannesburg",
    province: "SA",
    profile_picture:
      "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Expert sound engineer specializing in location recording and post-production mixing. Worked on Netflix and Amazon Prime productions.",
    availability_status: "booked",
    experience_level: "Senior",
    skills: ["Location Recording", "Post-Production Mixing", "Foley Design", "ADR", "Dolby Atmos"],
    specialties: ["Location Recording", "Post-Production Mixing", "Foley Design"],
    rating: 4.8,
    years_experience: "8+ years",
    recent_work: "https://images.pexels.com/photos/6954174/pexels-photo-6954174.jpeg?auto=compress&cs=tinysrgb&w=600",
    recent_work_caption: "Perfect audio setup for today's interview. Clean sound is everything!",
    is_profile_visible: true,
  },
  {
    id: "crew-003",
    user_id: "crew-003",
    display_name: "Marcus Johnson",
    full_name: "Marcus Johnson",
    profession: "Gaffer",
    department: "Lighting",
    role: "Gaffer",
    city: "Cape Town",
    province: "SA",
    profile_picture:
      "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Creative gaffer with expertise in LED systems and practical lighting. Known for creating atmospheric mood lighting for indie films.",
    availability_status: "available",
    experience_level: "Mid",
    skills: ["LED Systems", "Practical Lighting", "Color Temperature", "Grip Equipment", "Generator Management"],
    specialties: ["LED Systems", "Practical Lighting", "Color Temperature Matching"],
    rating: 4.7,
    years_experience: "6+ years",
    recent_work: "https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg?auto=compress&cs=tinysrgb&w=600",
    recent_work_caption: "Creating the perfect mood lighting for this restaurant scene. Atmosphere is everything!",
    is_profile_visible: true,
  },
]

// Helper function to filter mock crew by department
export function filterCrewByDepartment(crew: MockCrewMember[], departments: string[]) {
  if (departments.length === 0) return crew
  return crew.filter((member) => departments.includes(member.department))
}

// Helper function to filter mock crew by role
export function filterCrewByRole(crew: MockCrewMember[], roles: string[]) {
  if (roles.length === 0) return crew
  return crew.filter((member) => roles.includes(member.role))
}

// Helper function to filter mock crew by location
export function filterCrewByLocation(crew: MockCrewMember[], location: string) {
  if (!location || location === "All Locations") return crew
  return crew.filter((member) => `${member.city}, ${member.province}` === location)
}

// Helper function to filter mock crew by availability
export function filterCrewByAvailability(crew: MockCrewMember[], availability: string) {
  if (!availability || availability === "All") return crew
  return crew.filter((member) => member.availability_status === availability.toLowerCase())
}

// Helper function to filter mock crew by experience level
export function filterCrewByExperience(crew: MockCrewMember[], level: string) {
  if (!level || level === "All Levels") return crew
  return crew.filter((member) => member.experience_level === level)
}

// Helper function to search mock crew
export function searchCrew(crew: MockCrewMember[], searchTerm: string) {
  if (!searchTerm) return crew
  const term = searchTerm.toLowerCase()
  return crew.filter(
    (member) =>
      member.display_name.toLowerCase().includes(term) ||
      member.profession.toLowerCase().includes(term) ||
      member.role.toLowerCase().includes(term) ||
      member.city.toLowerCase().includes(term) ||
      member.skills.some((skill) => skill.toLowerCase().includes(term)),
  )
}
