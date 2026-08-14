import type { AhaCardItem, OnboardingBranch, OnboardingQuestion, OnboardingRole, OnboardingTrack } from "@/types/onboarding"

const provinces = [
  { value: "eastern_cape", label: "Eastern Cape" },
  { value: "free_state", label: "Free State" },
  { value: "gauteng", label: "Gauteng" },
  { value: "kwazulu_natal", label: "KwaZulu-Natal" },
  { value: "limpopo", label: "Limpopo" },
  { value: "mpumalanga", label: "Mpumalanga" },
  { value: "northern_cape", label: "Northern Cape" },
  { value: "north_west", label: "North West" },
  { value: "western_cape", label: "Western Cape" },
]

const optionize = (labels: string[]) =>
  labels.map((label) => ({
    label,
    value: label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
  }))

export const roleCards = [
  {
    role: "scout" as const,
    icon: "search",
    badgeLabel: "Browse",
    badgeClass: "bg-red-50 text-red-700 border border-red-200",
    title: "Scout",
    description: "I want to find, compare, and book creative people or places.",
    price: "Free",
    features: ["Search by city", "Compare rates", "Message before booking"],
    ctaClass: "bg-[#ff111b] hover:bg-[#e60012] text-white",
  },
  {
    role: "creator" as const,
    icon: "camera",
    badgeLabel: "Get booked",
    badgeClass: "bg-red-700 text-white",
    title: "Creator",
    description: "I want clients to discover my work and send booking enquiries.",
    price: "R129/month",
    features: ["Portfolio profile", "Booking requests", "Client messages"],
    ctaClass: "bg-[#ff111b] hover:bg-[#e60012] text-white",
  },
  {
    role: "studio_store" as const,
    icon: "building",
    badgeLabel: "List space",
    badgeClass: "bg-red-50 text-red-700 border border-red-200",
    title: "Studio & Store",
    description: "I want productions to book my studio, location, or rental gear.",
    price: "R489/month",
    features: ["Package listings", "Availability", "Rental enquiries"],
    ctaClass: "bg-[#ff111b] hover:bg-[#e60012] text-white",
  },
]

export const branchOptions: Record<Exclude<OnboardingRole, "scout">, { id: OnboardingBranch; title: string; subtitle: string }[]> = {
  creator: [
    { id: "content_creator", title: "Creator", subtitle: "Photographer / Videographer" },
    { id: "film_crew", title: "Film Crew", subtitle: "Director, DOP, sound and more" },
  ],
  studio_store: [
    { id: "studio", title: "Studio", subtitle: "List spaces and in-house gear" },
    { id: "store", title: "Store", subtitle: "List rental or sales inventory" },
  ],
}

export const tracks: Record<string, OnboardingTrack> = {
  scout: {
    role: "scout",
    title: "Scout onboarding",
    questions: [
      { id: "q1", prompt: "What are you mainly looking for?", mode: "single", layout: "cards", options: optionize(["Photographers & Videographers", "Film & Production Crew", "Studios, Spaces & Gear"]) },
      { id: "q2", prompt: "What industry are you in?", mode: "single", layout: "cards", options: optionize(["Fashion & Lifestyle", "Music & Entertainment", "Corporate & Brand"]) },
      { id: "q3", prompt: "How often do you hire creatives?", mode: "single", layout: "cards", options: optionize(["Once off project", "A few times a year", "Regularly / Ongoing"]) },
      { id: "q4", prompt: "What's your typical project size?", mode: "single", layout: "cards", options: optionize(["Solo or small shoot", "Small crew (2–5 people)", "Full production team"]) },
      { id: "q5", prompt: "Where are you based?", mode: "single", layout: "cards", options: provinces },
      { id: "q6", prompt: "What's your usual budget range per project?", mode: "single", layout: "cards", options: optionize(["Under R5,000", "R5,000 – R20,000", "R20,000+"]) },
      { id: "q7", prompt: "How do you prefer to communicate with creatives?", mode: "single", layout: "cards", options: optionize(["Direct message on SnapScout", "Email", "Phone or WhatsApp"]) },
      { id: "q8", prompt: "What matters most when hiring?", mode: "single", layout: "cards", options: optionize(["Portfolio quality", "Price and availability", "Reviews and reputation"]) },
    ],
  },
  content_creator: {
    role: "creator",
    branch: "content_creator",
    title: "Creator onboarding",
    questions: [
      { id: "q1", prompt: "What's your craft?", mode: "single", layout: "cards", options: optionize(["Photography", "Videography", "Both"]) },
      {
        id: "q2",
        prompt: "What are your specialisations?",
        mode: "multi",
        layout: "chips",
        options: optionize([
          "Portrait", "Wedding", "Fashion", "Product", "Food", "Events", "Corporate", "Lifestyle", "Fine Art", "Street", "Real Estate", "Nature", "Family/Newborn", "Boudoir", "Architectural",
          "Music Videos", "Social Media", "Commercial/Ads", "Documentary", "Drone", "YouTube", "TikTok/Reels", "Live Streaming", "Animation", "Brand Story", "Training/Ed",
        ]),
      },
      { id: "q3", prompt: "How experienced are you?", mode: "single", layout: "three-col", options: optionize(["Beginner (0–2 years)", "Intermediate (2–5 years)", "Professional (5+ years)"]) },
      { id: "q4", prompt: "What's your gear situation?", mode: "single", layout: "cards", options: optionize(["Fully equipped", "Some gear, rent the rest", "I rent everything I need"]) },
      { id: "q5", prompt: "How do you work?", mode: "single", layout: "cards", options: optionize(["Freelance, on my own", "Part of a collective or agency", "I run my own studio"]) },
      { id: "q6", prompt: "What's your typical availability?", mode: "single", layout: "three-col", options: optionize(["Full time, most days", "Part time / weekends", "Project by project"]) },
      { id: "q7", prompt: "What type of clients do you mainly work with?", mode: "single", layout: "cards", options: optionize(["Individual clients and small businesses", "Brands and marketing teams", "Agencies and productions"]) },
      { id: "q8", prompt: "Where are you based?", mode: "single", layout: "cards", options: provinces },
    ],
  },
  film_crew: {
    role: "creator",
    branch: "film_crew",
    title: "Film crew onboarding",
    questions: [
      { id: "q1", prompt: "What's your primary role?", mode: "single", layout: "two-col", options: optionize(["Director", "Producer", "Cinematographer / DOP", "Camera Operator", "Sound Engineer", "Boom Operator", "Gaffer", "Editor", "Script Supervisor", "Makeup Artist"]) },
      { id: "q2", prompt: "How experienced are you?", mode: "single", layout: "three-col", options: optionize(["Beginner (0–2 years)", "Intermediate (2–5 years)", "Professional (5+ years)"]) },
      { id: "q3", prompt: "What type of productions do you work on?", mode: "multi", layout: "chips", options: optionize(["Film & TV", "Commercials & Brand", "Music Videos", "Events & Corporate", "Documentary"]) },
      { id: "q4", prompt: "Do you own your own equipment?", mode: "single", layout: "three-col", options: optionize(["Yes, fully equipped", "Some, rent the rest", "Productions supply everything"]) },
      { id: "q5", prompt: "Are you available to travel?", mode: "single", layout: "cards", options: optionize(["Yes, anywhere in SA", "Local to my city only", "International too"]) },
      { id: "q6", prompt: "How do you prefer to be contracted?", mode: "single", layout: "three-col", options: optionize(["Day rate", "Project rate", "Either works"]) },
      { id: "q7", prompt: "How do you work?", mode: "single", layout: "cards", options: optionize(["Freelance, independently", "Part of a crew or collective", "Employed by a production company"]) },
      { id: "q8", prompt: "Where are you based?", mode: "single", layout: "cards", options: provinces },
    ],
  },
  studio: {
    role: "studio_store",
    branch: "studio",
    title: "Studio onboarding",
    questions: [
      { id: "q1", prompt: "What does your studio offer?", mode: "single", layout: "cards", options: optionize(["Space & location rental", "Gear rental", "Both space and gear"]) },
      { id: "q2", prompt: "What type of space are you listing?", mode: "single", layout: "cards", options: optionize(["Photo / Film Studio", "Home or Residential", "Outdoor / Unique Venue"]) },
      { id: "q3", prompt: "How big is your space?", mode: "single", layout: "three-col", options: optionize(["Small (under 50sqm)", "Medium (50–150sqm)", "Large (150sqm+)"]) },
      { id: "q4", prompt: "What kind of shoots do you accommodate?", mode: "multi", layout: "chips", options: optionize(["Photography", "Film & Video", "Music Videos", "Fashion & Editorial", "Corporate & Brand", "Events"]) },
      { id: "q5", prompt: "Do you take a deposit for bookings?", mode: "single", layout: "cards", options: optionize(["Yes, always upfront", "No deposits", "Depends on the booking"]) },
      { id: "q6", prompt: "What's your minimum booking duration?", mode: "single", layout: "three-col", options: optionize(["By the hour", "Half day minimum", "Full day minimum"]) },
      { id: "q7", prompt: "Do you have in-house gear available?", mode: "single", layout: "cards", options: optionize(["Yes, included in booking", "Yes, available to hire separately", "No, bring your own"]) },
      { id: "q8", prompt: "Where is your studio located?", mode: "single", layout: "cards", options: provinces },
    ],
  },
  store: {
    role: "studio_store",
    branch: "store",
    title: "Store onboarding",
    questions: [
      { id: "q1", prompt: "What does your store offer?", mode: "single", layout: "cards", options: optionize(["Gear rental only", "Gear sales only", "Rental and sales"]) },
      { id: "q2", prompt: "What type of gear do you carry?", mode: "multi", layout: "chips", options: optionize(["Camera bodies & lenses", "Lighting & grip", "Audio & sound", "Drones", "Stabilisers & rigs", "Accessories & small gear"]) },
      { id: "q3", prompt: "What brands do you carry?", mode: "multi", layout: "chips", options: optionize(["Sony", "Canon", "Nikon", "Arri", "RED", "DJI", "Aputure", "Rode", "Other"]) },
      { id: "q4", prompt: "Do you take a deposit for rentals?", mode: "single", layout: "cards", options: optionize(["Yes, always upfront", "No deposits", "Depends on the gear"]) },
      { id: "q5", prompt: "How do you handle rental terms?", mode: "single", layout: "cards", options: optionize(["Standard terms for all rentals", "Custom terms per client", "Still figuring this out"]) },
      { id: "q6", prompt: "Do you offer delivery?", mode: "single", layout: "three-col", options: optionize(["Collection only", "Delivery available", "Both options"]) },
      { id: "q7", prompt: "Who do you mainly supply?", mode: "single", layout: "cards", options: optionize(["Photographers and videographers", "Film and production crews", "Both equally"]) },
      { id: "q8", prompt: "Where is your store located?", mode: "single", layout: "cards", options: provinces },
    ],
  },
}

export const roleTheme: Record<OnboardingRole, { primary: string; light: string; selection: string; label: string; accountType: string }> = {
  scout: {
    primary: "bg-[#ff111b] hover:bg-[#e60012] text-white",
    light: "bg-red-50 text-red-700 border-red-200",
    selection: "border-[#ff111b] bg-red-50",
    label: "Scout",
    accountType: "scout",
  },
  creator: {
    primary: "bg-[#ff111b] hover:bg-[#e60012] text-white",
    light: "bg-red-50 text-red-700 border-red-200",
    selection: "border-[#ff111b] bg-red-50",
    label: "Creator",
    accountType: "content_creator",
  },
  studio_store: {
    primary: "bg-[#ff111b] hover:bg-[#e60012] text-white",
    light: "bg-red-50 text-red-700 border-red-200",
    selection: "border-[#ff111b] bg-red-50",
    label: "Studio & Store",
    accountType: "studio",
  },
}

export const ahaCards: AhaCardItem[] = [
  { id: "a1", name: "Lebo M.", subtitle: "Photographer", rate: "From R950 /hr", badge: "Portrait", availability: "Available this week" },
  { id: "a2", name: "Nandi S.", subtitle: "Stylist", rate: "From R600 /hr", badge: "Fashion", availability: "Available this week" },
  { id: "a3", name: "Jaden R.", subtitle: "Editor", rate: "From R800 /hr", badge: "Post", availability: "Available this week" },
  { id: "a4", name: "Urban Loft Studio", subtitle: "Studio", rate: "From R850 /hr", badge: "Space", availability: "Available this week" },
]

export const featureTourSteps = [
  { id: "tour1", title: "Save the right people", text: "Keep profiles, studios, and stores ready for your next brief.", target: "heart" },
  { id: "tour2", title: "Build a trusted shortlist", text: "Your saved collection becomes your private production pool.", target: "dashboard" },
  { id: "tour3", title: "Message or enquire", text: "Open a profile and start the booking conversation from one place.", target: "cta" },
  { id: "tour4", title: "Filter by real needs", text: "City, rate, availability, and craft keep discovery focused.", target: "filters" },
]

export function getTrack(role: OnboardingRole | null, branch: OnboardingBranch | null): OnboardingTrack | null {
  if (!role) return null
  if (role === "scout") return tracks.scout
  if (!branch) return null
  return tracks[branch] || null
}

export function getPersonaLine(role: OnboardingRole | null, branch: OnboardingBranch | null, answers: Record<string, string | string[]>) {
  if (role === "scout") {
    const priority = answers.q8
    return `A feed tuned for your hiring priorities${priority ? `: ${String(priority).replace(/_/g, " ")}` : ""}.`
  }
  if (role === "creator" && branch === "film_crew") {
    return "Your crew-facing profile is matched to productions actively hiring."
  }
  if (role === "studio_store") {
    return "Your listing can attract nearby productions looking to book now."
  }
  return "Your profile is ready to match with the right projects."
}
