// Mock portfolio data for testing
export interface PortfolioItem {
  id: string
  type: "image" | "video"
  thumbnail: string
  fullUrl?: string
  title?: string
  platform?: "instagram" | "youtube" | "vimeo" | "facebook" | "local"
  duration?: number
  link?: string
}

export interface MockCreator {
  id: string
  name: string
  profession: string
  location: string
  bio: string
  avatar: string
  rating: number
  reviews: number
  portfolioCount: number
  portfolioItems: PortfolioItem[]
  isOwnProfile?: boolean
}

// Generate mock portfolio items
export const mockPortfolioItems: PortfolioItem[] = [
  // Instagram posts
  {
    id: "1",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Golden Hour Portrait",
    platform: "instagram",
    link: "https://instagram.com/p/example1",
  },
  {
    id: "2",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Urban Street Photography",
    platform: "instagram",
    link: "https://instagram.com/p/example2",
  },
  {
    id: "3",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Product Shoot - Tech",
    platform: "instagram",
    link: "https://instagram.com/p/example3",
  },
  {
    id: "4",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/2422290/pexels-photo-2422290.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Fashion Editorial",
    platform: "instagram",
    link: "https://instagram.com/p/example4",
  },
  {
    id: "5",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Event Coverage",
    platform: "instagram",
    link: "https://instagram.com/p/example5",
  },
  {
    id: "6",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/3062552/pexels-photo-3062552.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Lifestyle Brand Collab",
    platform: "instagram",
    link: "https://instagram.com/p/example6",
  },

  // YouTube videos
  {
    id: "7",
    type: "video",
    thumbnail: "https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Brand Commercial - Nike",
    platform: "youtube",
    duration: 62,
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "8",
    type: "video",
    thumbnail: "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Documentary Short",
    platform: "youtube",
    duration: 480,
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "9",
    type: "video",
    thumbnail: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Music Video - Indie Band",
    platform: "youtube",
    duration: 245,
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "10",
    type: "video",
    thumbnail: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Corporate Training Video",
    platform: "youtube",
    duration: 600,
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },

  // Vimeo videos
  {
    id: "11",
    type: "video",
    thumbnail: "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Wedding Highlight Reel",
    platform: "vimeo",
    duration: 180,
    link: "https://vimeo.com/1084537",
  },
  {
    id: "12",
    type: "video",
    thumbnail: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Real Estate Tour",
    platform: "vimeo",
    duration: 120,
    link: "https://vimeo.com/1084537",
  },
  {
    id: "13",
    type: "video",
    thumbnail: "https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Product Launch Event",
    platform: "vimeo",
    duration: 90,
    link: "https://vimeo.com/1084537",
  },
  {
    id: "14",
    type: "video",
    thumbnail: "https://images.pexels.com/photos/1434608/pexels-photo-1434608.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Travel Film - Cape Town",
    platform: "vimeo",
    duration: 300,
    link: "https://vimeo.com/1084537",
  },

  // More Instagram
  {
    id: "15",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/3062545/pexels-photo-3062545.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Behind the Scenes",
    platform: "instagram",
    link: "https://instagram.com/p/example15",
  },
  {
    id: "16",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Food Photography",
    platform: "instagram",
    link: "https://instagram.com/p/example16",
  },
  {
    id: "17",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Architecture Shoot",
    platform: "instagram",
    link: "https://instagram.com/p/example17",
  },
  {
    id: "18",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Concert Photography",
    platform: "instagram",
    link: "https://instagram.com/p/example18",
  },
  {
    id: "19",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Headshot Session",
    platform: "instagram",
    link: "https://instagram.com/p/example19",
  },
  {
    id: "20",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Nature & Wildlife",
    platform: "instagram",
    link: "https://instagram.com/p/example20",
  },

  // Local uploads
  {
    id: "21",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Studio Setup",
    platform: "local",
  },
  {
    id: "22",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Drone Aerial Shot",
    platform: "local",
  },
  {
    id: "23",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Macro Photography",
    platform: "local",
  },
  {
    id: "24",
    type: "image",
    thumbnail: "https://images.pexels.com/photos/1434580/pexels-photo-1434580.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Night Photography",
    platform: "local",
  },
]

// Mock creators for search results
export const mockCreators: MockCreator[] = [
  {
    id: "creator-1",
    name: "Thandi Mokoena",
    profession: "Photographer",
    location: "Cape Town, Western Cape",
    bio: "Award-winning portrait and fashion photographer with 8 years experience. Featured in Vogue SA and Marie Claire.",
    avatar: "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=200",
    rating: 4.9,
    reviews: 127,
    portfolioCount: 6,
    portfolioItems: mockPortfolioItems.slice(0, 6),
  },
  {
    id: "creator-2",
    name: "Sipho Ndlovu",
    profession: "Videographer",
    location: "Johannesburg, Gauteng",
    bio: "Cinematic storyteller specializing in music videos, commercials, and documentary films. Sony Ambassador.",
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
    rating: 4.8,
    reviews: 89,
    portfolioCount: 4,
    portfolioItems: mockPortfolioItems.slice(6, 10),
  },
  {
    id: "creator-3",
    name: "Lerato van der Berg",
    profession: "Photographer",
    location: "Durban, KwaZulu-Natal",
    bio: "Wedding and event photographer capturing love stories across South Africa. Published in Wedding Inspirations.",
    avatar: "https://images.pexels.com/photos/3768894/pexels-photo-3768894.jpeg?auto=compress&cs=tinysrgb&w=200",
    rating: 4.9,
    reviews: 203,
    portfolioCount: 4,
    portfolioItems: mockPortfolioItems.slice(10, 14),
  },
]

// Get platform counts from portfolio items
export function getPlatformCounts(items: PortfolioItem[]) {
  const counts: Record<string, number> = {}
  items.forEach((item) => {
    const platform = item.platform || "local"
    counts[platform] = (counts[platform] || 0) + 1
  })
  return Object.entries(counts).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count,
  }))
}

// Filter items by platform
export function filterByPlatform(items: PortfolioItem[], platform: string) {
  if (platform === "all") return items
  return items.filter((item) => (item.platform || "local").toLowerCase() === platform)
}
