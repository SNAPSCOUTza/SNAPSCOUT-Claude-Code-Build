export type CommunityPost = {
  id: string
  slug: string
  title: string
  headline: string
  body: string
  category: "News" | "Resources" | "Tutorials" | "Spotlights" | "Announcements"
  cover_image_url: string
  published_at: string
  access_level: "preview" | "subscribers"
  status: "draft" | "published"
}

export const communityCategories = ["All", "News", "Resources", "Tutorials", "Spotlights", "Announcements"] as const

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: "post-1",
    slug: "winter-location-scouting-cape-town",
    title: "Winter location scouting in Cape Town",
    headline: "How to plan light, weather windows, and crew call times for colder production days.",
    body:
      "Winter shoots reward preparation. Keep your location shortlist tight, build in weather holds, and confirm indoor backup spaces before deposit day. For smaller crews, choose locations with strong natural light, easy parking, and quick load-in access.",
    category: "Tutorials",
    cover_image_url: "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=900",
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    access_level: "subscribers",
    status: "published",
  },
  {
    id: "post-2",
    slug: "snapscout-creator-spotlight-lebo",
    title: "Creator spotlight: Lebo M.",
    headline: "A Cape Town photographer building a clean natural-light portfolio for local brands.",
    body:
      "Lebo's work shows how strong visual consistency helps clients understand your style before the first call. His strongest profile signals are clear categories, honest response times, and a portfolio that opens with recent commercial work.",
    category: "Spotlights",
    cover_image_url: "https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=900",
    published_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    access_level: "preview",
    status: "published",
  },
  {
    id: "post-3",
    slug: "gear-checklist-for-brand-shoots",
    title: "Gear checklist for brand shoots",
    headline: "A practical pre-shoot checklist for cameras, audio, power, backups, and files.",
    body:
      "Bring more batteries than you think, label media before arrival, and keep one clean audio backup rolling during interviews. For fast turnarounds, align card naming, file transfer, and editor handoff before the first shot.",
    category: "Resources",
    cover_image_url: "https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg?auto=compress&cs=tinysrgb&w=900",
    published_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    access_level: "subscribers",
    status: "published",
  },
  {
    id: "post-4",
    slug: "platform-update-availability-calendar",
    title: "Platform update: availability calendar",
    headline: "Bookable profiles can now surface live availability directly on profile pages.",
    body:
      "Availability is one of the strongest booking signals for clients. The new calendar makes it easier to choose the right profile, request a date, and avoid slow back-and-forth messages.",
    category: "Announcements",
    cover_image_url: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=900",
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    access_level: "preview",
    status: "published",
  },
]

export const communitySuccessStories = [
  {
    name: "Thabo Mthembu",
    role: "Director of Photography",
    location: "Johannesburg",
    rating: "4.9",
    quote:
      "Joined SnapScout 6 months ago and have been consistently booked for corporate videos. The platform helped me connect with clients who value professional experience over social media following.",
    projects: "12 projects completed",
  },
  {
    name: "Sarah van der Merwe",
    role: "Wedding Photographer",
    location: "Cape Town",
    rating: "5",
    quote:
      "SnapScout transformed my business. I can showcase my real work and rates upfront, which attracts serious clients. Booked solid for the next 8 months.",
    projects: "28 projects completed",
  },
  {
    name: "Mandla Ndlovu",
    role: "Sound Engineer",
    location: "Durban",
    rating: "4.8",
    quote:
      "Finally found a platform where my technical skills and equipment matter. Connected with production companies that need professional sound recording.",
    projects: "15 projects completed",
  },
]

export const regionalGroups = [
  { province: "Gauteng", city: "Johannesburg & Pretoria", members: "1247 members" },
  { province: "Western Cape", city: "Cape Town", members: "892 members" },
  { province: "KwaZulu-Natal", city: "Durban", members: "634 members" },
  { province: "Eastern Cape", city: "Port Elizabeth", members: "298 members" },
  { province: "Free State", city: "Bloemfontein", members: "156 members" },
  { province: "Limpopo", city: "Polokwane", members: "134 members" },
  { province: "Mpumalanga", city: "Nelspruit", members: "187 members" },
  { province: "North West", city: "Rustenburg", members: "112 members" },
  { province: "Northern Cape", city: "Kimberley", members: "89 members" },
]

export const upcomingCommunityEvents = [
  {
    title: "Johannesburg Creative Meetup",
    date: "March 15, 2026",
    type: "Networking",
    attending: "45 attending",
    location: "Sandton Convention Centre",
  },
  {
    title: "Cape Town Film Workshop",
    date: "March 22, 2026",
    type: "Workshop",
    attending: "32 attending",
    location: "Cape Town Film Studios",
  },
  {
    title: "Durban Photography Walk",
    date: "March 29, 2026",
    type: "Social",
    attending: "28 attending",
    location: "V&A Waterfront",
  },
]

export const communityGuidelines = [
  {
    title: "Be Respectful",
    body: "Treat all community members with respect and professionalism.",
  },
  {
    title: "Support Each Other",
    body: "Share knowledge, opportunities, and help fellow creatives grow.",
  },
  {
    title: "Maintain Quality",
    body: "Share high-quality work and constructive feedback.",
  },
  {
    title: "Stay Professional",
    body: "Keep interactions professional and industry-focused.",
  },
]
