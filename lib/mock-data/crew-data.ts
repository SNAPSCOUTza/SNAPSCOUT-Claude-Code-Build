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
  {
    id: "crew-004",
    user_id: "crew-004",
    display_name: "Priya Naidoo",
    full_name: "Priya Naidoo",
    profession: "Camera Operator",
    department: "Camera",
    role: "Camera Operator",
    city: "Durban",
    province: "SA",
    profile_picture:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Versatile camera operator with steadicam certification. Experienced in documentaries, music videos, and corporate productions.",
    availability_status: "available",
    experience_level: "Mid",
    skills: ["Steadicam", "Handheld", "Documentary", "Music Videos", "Gimbal Systems"],
    specialties: ["Steadicam", "Documentary Style", "Music Videos"],
    rating: 4.6,
    years_experience: "5+ years",
    recent_work: "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=600",
    recent_work_caption: "Music video shoot for local artist. Love the energy on set!",
    is_profile_visible: true,
  },
  {
    id: "crew-005",
    user_id: "crew-005",
    display_name: "David van der Berg",
    full_name: "David van der Berg",
    profession: "Production Manager",
    department: "Production",
    role: "Production Manager",
    city: "Cape Town",
    province: "SA",
    profile_picture:
      "https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Organized production manager handling budgets from R500K to R10M. Expert in logistics, scheduling, and crew coordination.",
    availability_status: "available",
    experience_level: "Expert",
    skills: ["Budget Management", "Scheduling", "Crew Coordination", "Location Scouting", "Vendor Relations"],
    specialties: ["Large Scale Productions", "International Co-Productions", "Commercial Shoots"],
    rating: 4.9,
    years_experience: "15+ years",
    recent_work: "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=600",
    recent_work_caption: "Pre-production meeting for our biggest project yet. Let's make magic happen!",
    is_profile_visible: true,
  },
  {
    id: "crew-006",
    user_id: "crew-006",
    display_name: "Thandi Molefe",
    full_name: "Thandi Molefe",
    profession: "Makeup Artist",
    department: "Hair & Makeup",
    role: "Makeup Artist",
    city: "Johannesburg",
    province: "SA",
    profile_picture:
      "https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Award-winning makeup artist specializing in SFX and beauty. Worked on major SA film productions and international commercials.",
    availability_status: "available",
    experience_level: "Senior",
    skills: ["SFX Makeup", "Beauty Makeup", "Prosthetics", "Period Looks", "Aging Techniques"],
    specialties: ["Special Effects", "Period Drama", "Commercial Beauty"],
    rating: 4.8,
    years_experience: "10+ years",
    recent_work: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600",
    recent_work_caption: "SFX transformation for the horror scene. 4 hours of work, worth every minute!",
    is_profile_visible: true,
  },
  {
    id: "crew-007",
    user_id: "crew-007",
    display_name: "James Kruger",
    full_name: "James Kruger",
    profession: "Focus Puller",
    department: "Camera",
    role: "Focus Puller",
    city: "Cape Town",
    province: "SA",
    profile_picture:
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Precision focus puller with experience on RED, ARRI, and Sony cinema cameras. Known for nailing difficult rack focus shots.",
    availability_status: "booked",
    experience_level: "Mid",
    skills: ["Wireless Focus", "Cine Lenses", "RED Systems", "ARRI Systems", "Sony Venice"],
    specialties: ["Complex Rack Focus", "Anamorphic Lenses", "Low Light"],
    rating: 4.5,
    years_experience: "4+ years",
    recent_work: "https://images.pexels.com/photos/2510428/pexels-photo-2510428.jpeg?auto=compress&cs=tinysrgb&w=600",
    recent_work_caption: "Setting up for a complex rack focus shot. Precision is key!",
    is_profile_visible: true,
  },
  {
    id: "crew-008",
    user_id: "crew-008",
    display_name: "Nomvula Dlamini",
    full_name: "Nomvula Dlamini",
    profession: "Art Director",
    department: "Art",
    role: "Art Director",
    city: "Johannesburg",
    province: "SA",
    profile_picture:
      "https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Creative art director with a background in interior design. Transforms spaces into cinematic environments for film and TV.",
    availability_status: "available",
    experience_level: "Senior",
    skills: ["Set Design", "Props Management", "Color Theory", "Period Design", "Budget Art Direction"],
    specialties: ["Period Pieces", "Contemporary Sets", "Music Video Design"],
    rating: 4.7,
    years_experience: "9+ years",
    recent_work: "https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=600",
    recent_work_caption: "Transformed this warehouse into a 1960s jazz club. Art direction magic!",
    is_profile_visible: true,
  },
  {
    id: "crew-009",
    user_id: "crew-009",
    display_name: "Ryan Peters",
    full_name: "Ryan Peters",
    profession: "Boom Operator",
    department: "Audio",
    role: "Boom Operator",
    city: "Pretoria",
    province: "SA",
    profile_picture:
      "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Experienced boom operator with excellent timing and awareness. Specialized in dialogue-heavy dramas and action sequences.",
    availability_status: "available",
    experience_level: "Entry",
    skills: ["Boom Operation", "Lavalier Placement", "Dialogue Recording", "Ambient Sound", "Sennheiser Systems"],
    specialties: ["Drama", "Action Sequences", "Outdoor Recording"],
    rating: 4.4,
    years_experience: "2+ years",
    recent_work: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=600",
    recent_work_caption: "Long dialogue scene today. Arms are tired but the audio is clean!",
    is_profile_visible: true,
  },
  {
    id: "crew-010",
    user_id: "crew-010",
    display_name: "Lisa van Wyk",
    full_name: "Lisa van Wyk",
    profession: "Hair Stylist",
    department: "Hair & Makeup",
    role: "Hair Stylist",
    city: "Cape Town",
    province: "SA",
    profile_picture:
      "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Versatile hair stylist experienced in period styles, contemporary looks, and wig work. Worked on major SA soapies and films.",
    availability_status: "available",
    experience_level: "Mid",
    skills: ["Period Hairstyles", "Wig Styling", "Extensions", "Braiding", "Men's Grooming"],
    specialties: ["Period Drama", "Wig Work", "Natural Hair"],
    rating: 4.6,
    years_experience: "7+ years",
    recent_work: "https://images.pexels.com/photos/3993320/pexels-photo-3993320.jpeg?auto=compress&cs=tinysrgb&w=600",
    recent_work_caption: "Period piece prep - Victorian updos for the whole cast!",
    is_profile_visible: true,
  },
  {
    id: "crew-011",
    user_id: "crew-011",
    display_name: "Sipho Mabena",
    full_name: "Sipho Mabena",
    profession: "Grip",
    department: "Lighting",
    role: "Key Grip",
    city: "Johannesburg",
    province: "SA",
    profile_picture:
      "https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Strong and reliable key grip with extensive knowledge of rigging and camera support systems. Safety-first approach.",
    availability_status: "booked",
    experience_level: "Senior",
    skills: ["Dolly Operation", "Crane Setup", "Rigging", "Camera Mounts", "Safety Protocols"],
    specialties: ["Complex Camera Moves", "Car Rigs", "Crane Operation"],
    rating: 4.8,
    years_experience: "11+ years",
    recent_work: "https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg?auto=compress&cs=tinysrgb&w=600",
    recent_work_caption: "Setting up the dolly track for a 50m tracking shot. Smooth moves ahead!",
    is_profile_visible: true,
  },
  {
    id: "crew-012",
    user_id: "crew-012",
    display_name: "Emma Botha",
    full_name: "Emma Botha",
    profession: "Script Supervisor",
    department: "Production",
    role: "Script Supervisor",
    city: "Cape Town",
    province: "SA",
    profile_picture:
      "https://images.pexels.com/photos/3768894/pexels-photo-3768894.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Detail-oriented script supervisor ensuring continuity perfection. Eagle eye for matching shots and tracking script changes.",
    availability_status: "available",
    experience_level: "Mid",
    skills: ["Continuity", "Script Timing", "Shot Logging", "Editor Notes", "Digital Workflows"],
    specialties: ["Feature Films", "TV Series", "Complex Narratives"],
    rating: 4.7,
    years_experience: "6+ years",
    recent_work: "https://images.pexels.com/photos/7991158/pexels-photo-7991158.jpeg?auto=compress&cs=tinysrgb&w=600",
    recent_work_caption: "Day 45 of shooting - continuity notes are looking good!",
    is_profile_visible: true,
  },
  {
    id: "crew-013",
    user_id: "crew-013",
    display_name: "Michael Chen",
    full_name: "Michael Chen",
    profession: "DIT",
    department: "Camera",
    role: "Camera Assistant",
    city: "Cape Town",
    province: "SA",
    profile_picture:
      "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Digital Imaging Technician specializing in on-set color management and data wrangling. Expert in DaVinci Resolve and Silverstack.",
    availability_status: "available",
    experience_level: "Mid",
    skills: ["Color Management", "Data Wrangling", "DaVinci Resolve", "Silverstack", "LUT Creation"],
    specialties: ["On-Set Color", "HDR Workflows", "Data Security"],
    rating: 4.6,
    years_experience: "5+ years",
    recent_work: "https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=600",
    recent_work_caption: "DIT cart setup for today's shoot. Color science is my passion!",
    is_profile_visible: true,
  },
  {
    id: "crew-014",
    user_id: "crew-014",
    display_name: "Zanele Khumalo",
    full_name: "Zanele Khumalo",
    profession: "Wardrobe Stylist",
    department: "Art",
    role: "Wardrobe Stylist",
    city: "Durban",
    province: "SA",
    profile_picture:
      "https://images.pexels.com/photos/3866555/pexels-photo-3866555.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Fashion-forward wardrobe stylist with connections to top SA designers. Creates character-defining looks for film and TV.",
    availability_status: "available",
    experience_level: "Senior",
    skills: ["Character Design", "Period Costumes", "Contemporary Fashion", "Fittings", "Wardrobe Organization"],
    specialties: ["Period Costumes", "Music Videos", "Character Development"],
    rating: 4.9,
    years_experience: "8+ years",
    recent_work: "https://images.pexels.com/photos/6626903/pexels-photo-6626903.jpeg?auto=compress&cs=tinysrgb&w=600",
    recent_work_caption: "Costume fitting day - every character needs their perfect look!",
    is_profile_visible: true,
  },
  {
    id: "crew-015",
    user_id: "crew-015",
    display_name: "Johan Venter",
    full_name: "Johan Venter",
    profession: "Best Boy Electric",
    department: "Lighting",
    role: "Best Boy Electric",
    city: "Johannesburg",
    province: "SA",
    profile_picture:
      "https://images.pexels.com/photos/2102415/pexels-photo-2102415.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Experienced best boy electric managing lighting crews and equipment. Strong background in electrical safety and generator operations.",
    availability_status: "available",
    experience_level: "Mid",
    skills: [
      "Crew Management",
      "Generator Operation",
      "Electrical Safety",
      "Equipment Inventory",
      "Power Distribution",
    ],
    specialties: ["Large Crew Management", "Location Power", "Night Shoots"],
    rating: 4.5,
    years_experience: "7+ years",
    recent_work: "https://images.pexels.com/photos/3062545/pexels-photo-3062545.jpeg?auto=compress&cs=tinysrgb&w=600",
    recent_work_caption: "Power distribution for 3 units running simultaneously. All systems go!",
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
