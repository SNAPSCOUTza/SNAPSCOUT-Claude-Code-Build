export type StudioStoreItem = {
  id: number
  name: string
  // "both" means this listing should match a search/filter for either
  // "studio" or "store" - see the filter-matching logic in the Studios &
  // Stores listing page.
  type: "studio" | "store" | "both"
  location: string
  fullAddress?: string
  province?: string
  city?: string
  neighbourhood?: string
  rating: number
  reviews: number
  image: string
  logo?: string
  gallery?: string[]
  description: string
  about?: string
  services: string[]
  packages?: Array<{
    id?: string
    name: string
    price: string
    description: string
    image?: string
    badge?: string
    duration?: string
    availability?: string
    included?: string[]
  }>
  equipment: string[]
  gearInventory?: Array<{
    name: string
    rate: string
    availability: string
  }>
  amenities: string[]
  rules?: string[]
  termsSummary?: string
  rentalTermsLink?: string
  operatingHours?: string
  depositPolicy?: string
  spaceCount?: number
  hourlyRate: string
  halfDayRate?: string
  fullDayRate?: string
  peakRate?: string
  offPeakRate?: string
  contact: {
    phone: string
    email: string
    website: string
  }
  verified: boolean
  availability: string
}

export const studiosStoresData: StudioStoreItem[] = [
  {
    id: 1,
    name: "Cape Town Film Studios",
    type: "studio",
    location: "Cape Town, Western Cape",
    fullAddress: "88 Sir Lowry Road, Woodstock, Cape Town, 7925",
    province: "Western Cape",
    city: "Cape Town",
    neighbourhood: "Woodstock",
    rating: 4.8,
    reviews: 124,
    image: "/images/film-clapperboard.jpg",
    gallery: [
      "/images/film-clapperboard.jpg",
      "/images/photography-workspace.jpg",
      "/images/kyle-loftus-FtQE89f3EXA-unsplash.jpg",
      "/images/janelle-hiroshige-gfG_csFvelY-unsplash.jpg",
      "/images/videography-camera.jpg",
      "/images/marco-xu-ToUPBCO62Lw-unsplash.jpg",
    ],
    description:
      "Full-service film and television production studio with premium natural light zones, controlled black-out areas, and production-ready support.",
    about:
      "Cape Town Film Studios is a multi-room production space used for commercials, branded campaigns, interviews, product shoots, and long-form sets. The team offers on-site support, flexible packages, and optional gear rentals for lean crews and larger productions.",
    services: ["Film Production", "TV Production", "Commercial Shoots", "Equipment Rental"],
    packages: [
      {
        id: "hourly-studio-access",
        name: "Hourly Studio Access",
        price: "R2,500/hr",
        description: "Ideal for short shoots, interviews, and content days.",
        image: "/images/photography-workspace.jpg",
        badge: "2 hr minimum",
        availability: "Available",
        included: ["Natural Light", "Wi-Fi"],
      },
      {
        id: "half-day-package",
        name: "Half Day Package",
        price: "R9,800",
        description: "Up to 5 hours with base lighting setup and parking.",
        image: "/images/film-clapperboard.jpg",
        badge: "Up to 5 hours",
        availability: "Available",
        included: ["Parking", "Power"],
      },
      {
        id: "full-day-production",
        name: "Full Day Production",
        price: "R17,500",
        description: "Up to 10 hours, support crew desk, and makeup bay access.",
        image: "/images/studio-lighting.png",
        badge: "Full day",
        availability: "Available",
        included: ["Makeup Room", "Client Lounge"],
      },
    ],
    equipment: ["RED Cameras", "Lighting Rigs", "Sound Equipment", "Editing Suites"],
    gearInventory: [
      { name: "RED Komodo 6K Kit", rate: "R3,900/day", availability: "Available" },
      { name: "Aputure 600D Pro Lighting Set", rate: "R1,250/day", availability: "Available" },
      { name: "Sennheiser Wireless Audio Kit", rate: "R780/day", availability: "Limited" },
      { name: "Motorized Slider + Tripod Combo", rate: "R640/day", availability: "Available" },
    ],
    amenities: [
      "Natural Light",
      "Wi-Fi",
      "Parking",
      "Power",
      "Makeup Room",
      "Editing Bay",
      "Client Lounge",
      "Load-in Access",
    ],
    rules: [
      "No smoking inside the studio.",
      "Overtime billed in 30-minute increments.",
      "Music volume after 20:00 must be kept moderate.",
      "All rented gear must be checked at return.",
    ],
    termsSummary:
      "50% deposit to confirm booking. Damage liability applies to rented gear. Cancellations within 24h are non-refundable.",
    rentalTermsLink: "https://www.capetownfilmstudios.co.za/terms",
    operatingHours: "Daily · 07:00 - 22:00",
    depositPolicy: "50% upfront · balance due before wrap",
    spaceCount: 4,
    hourlyRate: "R2,500 - R5,000",
    halfDayRate: "R9,800",
    fullDayRate: "R17,500",
    peakRate: "R3,100/hr",
    offPeakRate: "R2,200/hr",
    contact: {
      phone: "+27 21 123 4567",
      email: "info@capetownfilmstudios.co.za",
      website: "https://www.capetownfilmstudios.co.za",
    },
    verified: true,
    availability: "Available",
  },
  {
    id: 2,
    name: "Johannesburg Camera Rentals",
    type: "store",
    location: "Johannesburg, Gauteng",
    rating: 4.6,
    reviews: 89,
    image: "/images/camera-viewfinder.jpg",
    description: "Premier camera and equipment rental house serving the Johannesburg film community.",
    services: ["Camera Rental", "Lens Rental", "Lighting Equipment", "Audio Gear"],
    equipment: ["ARRI Cameras", "Canon Cinema", "Sony FX Series", "Zeiss Lenses"],
    amenities: ["Gear Insurance", "Wi-Fi", "Parking", "Backup Power"],
    hourlyRate: "R500 - R2,000",
    contact: {
      phone: "+27 11 987 6543",
      email: "rentals@jhbcamera.co.za",
      website: "www.jhbcamerarentals.co.za",
    },
    verified: true,
    availability: "Available",
  },
  {
    id: 3,
    name: "Durban Production House",
    type: "studio",
    location: "Durban, KwaZulu-Natal",
    rating: 4.7,
    reviews: 67,
    image: "/images/videography-camera.jpg",
    description: "Creative production studio specializing in commercials, music videos, and corporate content.",
    services: ["Commercial Production", "Music Videos", "Corporate Videos", "Post-Production"],
    equipment: ["Blackmagic Cameras", "DaVinci Resolve", "Pro Tools", "Green Screen"],
    amenities: ["Natural Light", "Editing Bay", "Parking", "Power"],
    hourlyRate: "R1,800 - R3,500",
    contact: {
      phone: "+27 31 456 7890",
      email: "hello@durbanproduction.co.za",
      website: "www.durbanproduction.co.za",
    },
    verified: false,
    availability: "Booked",
  },
]

export const getStudioStoreById = (id: string | number) =>
  studiosStoresData.find((item) => String(item.id) === String(id))
