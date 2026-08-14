export interface StudioData {
  id: string
  user_profile_id: string
  business_name: string
  type: "studio" | "equipment_store"
  location: string
  city: string
  province: string
  bio: string
  services: string[]
  equipment: string[]
  profile_picture: string
  gallery_images: string[]
  rating: number
  total_reviews: number
  price_range: string
  availability_status: string
  is_verified: boolean
  featured: boolean
  phone: string
  email: string
  website: string
  instagram: string
  operating_hours: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  inventory?: {
    category: string
    items: { name: string; price: string; available: boolean }[]
  }[]
}

export const mockStudios: StudioData[] = [
  {
    id: "studio-1",
    user_profile_id: "studio-user-1",
    business_name: "Cape Town Film Studios",
    type: "studio",
    location: "Cape Town, Western Cape",
    city: "Cape Town",
    province: "Western Cape",
    bio: "Full-service film and television production studio with state-of-the-art equipment and experienced crew. Our 5,000 sqm facility includes 3 sound stages, green screen rooms, and post-production suites.",
    services: [
      "Film Production",
      "TV Production",
      "Commercial Shoots",
      "Equipment Rental",
      "Post-Production",
      "Sound Mixing",
    ],
    equipment: [
      "RED Cameras",
      "Lighting Rigs",
      "Sound Equipment",
      "Editing Suites",
      "Green Screen",
      "Cranes & Dollies",
    ],
    profile_picture: "https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg?auto=compress&cs=tinysrgb&w=600",
    gallery_images: [
      "https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/3062545/pexels-photo-3062545.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/2510428/pexels-photo-2510428.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/3062552/pexels-photo-3062552.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    rating: 4.8,
    total_reviews: 124,
    price_range: "R2,500 - R5,000",
    availability_status: "Available",
    is_verified: true,
    featured: true,
    phone: "+27 21 123 4567",
    email: "info@capetownfilmstudios.co.za",
    website: "www.capetownfilmstudios.co.za",
    instagram: "@ctfilmstudios",
    operating_hours: {
      monday: "06:00 - 22:00",
      tuesday: "06:00 - 22:00",
      wednesday: "06:00 - 22:00",
      thursday: "06:00 - 22:00",
      friday: "06:00 - 22:00",
      saturday: "08:00 - 18:00",
      sunday: "Closed",
    },
    inventory: [
      {
        category: "Cameras",
        items: [
          { name: "RED Komodo 6K", price: "R3,500/day", available: true },
          { name: "RED Gemini 5K", price: "R4,000/day", available: true },
          { name: "ARRI Alexa Mini", price: "R5,500/day", available: false },
        ],
      },
      {
        category: "Lenses",
        items: [
          { name: "Zeiss CP.3 Set", price: "R2,000/day", available: true },
          { name: "Canon CN-E Primes", price: "R1,800/day", available: true },
        ],
      },
    ],
  },
  {
    id: "studio-2",
    user_profile_id: "studio-user-2",
    business_name: "Johannesburg Camera Rentals",
    type: "equipment_store",
    location: "Johannesburg, Gauteng",
    city: "Johannesburg",
    province: "Gauteng",
    bio: "Premier camera and equipment rental house serving the Johannesburg film community. We stock the latest cinema cameras, lenses, and grip equipment with 24/7 support.",
    services: ["Camera Rental", "Lens Rental", "Lighting Equipment", "Audio Gear", "Grip Equipment", "Drone Rental"],
    equipment: ["ARRI Cameras", "Canon Cinema", "Sony FX Series", "Zeiss Lenses", "Cooke Anamorphic", "DJI Drones"],
    profile_picture:
      "https://images.pexels.com/photos/2510428/pexels-photo-2510428.jpeg?auto=compress&cs=tinysrgb&w=600",
    gallery_images: [
      "https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    rating: 4.6,
    total_reviews: 89,
    price_range: "R500 - R2,000",
    availability_status: "Available",
    is_verified: true,
    featured: false,
    phone: "+27 11 987 6543",
    email: "rentals@jhbcamera.co.za",
    website: "www.jhbcamerarentals.co.za",
    instagram: "@jhbcamerarentals",
    operating_hours: {
      monday: "07:00 - 19:00",
      tuesday: "07:00 - 19:00",
      wednesday: "07:00 - 19:00",
      thursday: "07:00 - 19:00",
      friday: "07:00 - 19:00",
      saturday: "08:00 - 14:00",
      sunday: "Closed",
    },
    inventory: [
      {
        category: "Cinema Cameras",
        items: [
          { name: "ARRI Alexa 35", price: "R6,000/day", available: true },
          { name: "Sony FX9", price: "R2,500/day", available: true },
          { name: "Canon C70", price: "R1,800/day", available: true },
          { name: "Blackmagic URSA 12K", price: "R3,000/day", available: false },
        ],
      },
      {
        category: "Lenses",
        items: [
          { name: "Cooke S7/i Full Frame Set", price: "R4,500/day", available: true },
          { name: "Zeiss Supreme Prime Set", price: "R3,500/day", available: true },
          { name: "Atlas Orion Anamorphic", price: "R3,000/day", available: false },
        ],
      },
      {
        category: "Drones",
        items: [
          { name: "DJI Inspire 3", price: "R2,500/day", available: true },
          { name: "DJI Mavic 3 Pro", price: "R800/day", available: true },
        ],
      },
    ],
  },
  {
    id: "studio-3",
    user_profile_id: "studio-user-3",
    business_name: "Durban Creative Studios",
    type: "studio",
    location: "Durban, KwaZulu-Natal",
    city: "Durban",
    province: "KwaZulu-Natal",
    bio: "Beachside creative studio perfect for music videos, photo shoots, and small productions. Natural light studio with ocean views and flexible booking options.",
    services: ["Music Video Production", "Photo Shoots", "Content Creation", "Podcast Recording", "Live Streaming"],
    equipment: ["Sony Cinema Cameras", "LED Panels", "Podcast Setup", "Live Stream Kit", "Drone"],
    profile_picture:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600",
    gallery_images: [
      "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/1434608/pexels-photo-1434608.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    rating: 4.5,
    total_reviews: 67,
    price_range: "R800 - R2,500",
    availability_status: "Available",
    is_verified: true,
    featured: false,
    phone: "+27 31 456 7890",
    email: "book@durbancreative.co.za",
    website: "www.durbancreativestudios.co.za",
    instagram: "@durbancreative",
    operating_hours: {
      monday: "08:00 - 20:00",
      tuesday: "08:00 - 20:00",
      wednesday: "08:00 - 20:00",
      thursday: "08:00 - 20:00",
      friday: "08:00 - 20:00",
      saturday: "09:00 - 17:00",
      sunday: "10:00 - 16:00",
    },
  },
  {
    id: "studio-4",
    user_profile_id: "studio-user-4",
    business_name: "Pretoria Grip & Lighting",
    type: "equipment_store",
    location: "Pretoria, Gauteng",
    city: "Pretoria",
    province: "Gauteng",
    bio: "Specialized grip and lighting rental for film and TV productions. We offer complete lighting packages with experienced technicians available for hire.",
    services: ["Lighting Rental", "Grip Equipment", "Generator Rental", "Technician Hire", "Truck Rental"],
    equipment: ["ARRI SkyPanels", "Aputure 600d", "HMI Lights", "C-Stands", "Flags & Scrims", "Generators"],
    profile_picture:
      "https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&w=600",
    gallery_images: [
      "https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/3062545/pexels-photo-3062545.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    rating: 4.7,
    total_reviews: 45,
    price_range: "R300 - R1,500",
    availability_status: "Available",
    is_verified: true,
    featured: false,
    phone: "+27 12 345 6789",
    email: "rentals@ptagrip.co.za",
    website: "www.pretoriagrip.co.za",
    instagram: "@ptagriplighting",
    operating_hours: {
      monday: "06:00 - 18:00",
      tuesday: "06:00 - 18:00",
      wednesday: "06:00 - 18:00",
      thursday: "06:00 - 18:00",
      friday: "06:00 - 18:00",
      saturday: "07:00 - 13:00",
      sunday: "Closed",
    },
    inventory: [
      {
        category: "LED Lighting",
        items: [
          { name: "ARRI SkyPanel S60-C", price: "R1,200/day", available: true },
          { name: "Aputure 600d Pro", price: "R600/day", available: true },
          { name: "Aputure 300d II", price: "R400/day", available: true },
        ],
      },
      {
        category: "HMI Lighting",
        items: [
          { name: "ARRI M18 HMI", price: "R800/day", available: true },
          { name: "ARRI M40 HMI", price: "R1,500/day", available: false },
        ],
      },
      {
        category: "Grip",
        items: [
          { name: "C-Stand Kit (10)", price: "R500/day", available: true },
          { name: "12x12 Butterfly Kit", price: "R800/day", available: true },
          { name: "Doorway Dolly", price: "R600/day", available: true },
        ],
      },
    ],
  },
  {
    id: "studio-5",
    user_profile_id: "studio-user-5",
    business_name: "Stellenbosch Sound Stage",
    type: "studio",
    location: "Stellenbosch, Western Cape",
    city: "Stellenbosch",
    province: "Western Cape",
    bio: "Purpose-built sound stage in the heart of the Winelands. Perfect for commercials, wine brand content, and boutique productions with stunning backdrop options.",
    services: ["Commercial Production", "Wine Brand Content", "Corporate Videos", "Photo Shoots", "Event Recording"],
    equipment: ["Full Lighting Grid", "Cyc Wall", "Makeup Stations", "Client Lounge", "Catering Kitchen"],
    profile_picture:
      "https://images.pexels.com/photos/3062552/pexels-photo-3062552.jpeg?auto=compress&cs=tinysrgb&w=600",
    gallery_images: [
      "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    rating: 4.9,
    total_reviews: 34,
    price_range: "R3,000 - R8,000",
    availability_status: "Booked",
    is_verified: true,
    featured: true,
    phone: "+27 21 876 5432",
    email: "bookings@stellenboschsoundstage.co.za",
    website: "www.stellenboschsoundstage.co.za",
    instagram: "@stellenboschstudio",
    operating_hours: {
      monday: "07:00 - 21:00",
      tuesday: "07:00 - 21:00",
      wednesday: "07:00 - 21:00",
      thursday: "07:00 - 21:00",
      friday: "07:00 - 21:00",
      saturday: "08:00 - 18:00",
      sunday: "By Appointment",
    },
  },
  {
    id: "studio-6",
    user_profile_id: "studio-user-6",
    business_name: "East London Audio Visual",
    type: "equipment_store",
    location: "East London, Eastern Cape",
    city: "East London",
    province: "Eastern Cape",
    bio: "Eastern Cape's leading audio visual equipment supplier. We service productions across the region with reliable gear and fast delivery.",
    services: ["Audio Rental", "Visual Equipment", "Event Tech", "Live Sound", "Projection"],
    equipment: ["Wireless Mics", "Speakers", "Projectors", "LED Walls", "Mixing Consoles"],
    profile_picture:
      "https://images.pexels.com/photos/6954174/pexels-photo-6954174.jpeg?auto=compress&cs=tinysrgb&w=600",
    gallery_images: [
      "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    rating: 4.3,
    total_reviews: 28,
    price_range: "R200 - R1,000",
    availability_status: "Available",
    is_verified: false,
    featured: false,
    phone: "+27 43 123 4567",
    email: "info@elav.co.za",
    website: "www.eastlondonav.co.za",
    instagram: "@eastlondonav",
    operating_hours: {
      monday: "08:00 - 17:00",
      tuesday: "08:00 - 17:00",
      wednesday: "08:00 - 17:00",
      thursday: "08:00 - 17:00",
      friday: "08:00 - 17:00",
      saturday: "09:00 - 12:00",
      sunday: "Closed",
    },
    inventory: [
      {
        category: "Audio",
        items: [
          { name: "Sennheiser G4 Wireless Kit", price: "R350/day", available: true },
          { name: "Rode NTG5 Boom Kit", price: "R250/day", available: true },
          { name: "Sound Devices 833 Mixer", price: "R800/day", available: true },
        ],
      },
      {
        category: "Projection",
        items: [
          { name: "Epson 10K Lumen Projector", price: "R1,500/day", available: true },
          { name: "LED Video Wall (3x2m)", price: "R3,500/day", available: false },
        ],
      },
    ],
  },
]

export const getStudioById = (id: string): StudioData | undefined => {
  return mockStudios.find((studio) => studio.id === id)
}

export const getStudiosByType = (type: "studio" | "equipment_store"): StudioData[] => {
  return mockStudios.filter((studio) => studio.type === type)
}

export const getStudiosByLocation = (province: string): StudioData[] => {
  return mockStudios.filter((studio) => studio.province.toLowerCase() === province.toLowerCase())
}
