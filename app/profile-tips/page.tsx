"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Star, DollarSign, Tag, MessageCircle, ImageIcon } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

export default function ProfileTips() {
  const [expandedTip, setExpandedTip] = useState<string | null>(null)

  const tips = [
    {
      id: "photo",
      icon: ImageIcon,
      title: "Profile Photo Tips",
      description: "Make a great first impression with your profile photo",
      content: [
        "Use a high-quality, professional headshot",
        "Ensure good lighting - natural light works best",
        "Dress professionally but authentically",
        "Smile genuinely and make eye contact with the camera",
        "Keep the background simple and uncluttered",
        "Update your photo regularly (every 1-2 years)",
      ],
    },
    {
      id: "portfolio",
      icon: Camera,
      title: "Portfolio Best Practices",
      description: "Showcase your best work effectively",
      content: [
        "Lead with your strongest, most recent work",
        "Show variety while maintaining consistency in quality",
        "Include behind-the-scenes shots to show your process",
        "Add context to each project (client, role, equipment used)",
        "Keep portfolio updated with latest projects",
        "Quality over quantity - 10-15 excellent pieces are better than 50 mediocre ones",
      ],
    },
    {
      id: "bio",
      icon: MessageCircle,
      title: "Writing Your Bio",
      description: "Tell your professional story compellingly",
      content: [
        "Start with your current role and years of experience",
        "Mention notable clients, projects, or achievements",
        "Include your specializations and unique skills",
        "Add personality while keeping it professional",
        "Mention equipment you own if relevant",
        "End with what you're passionate about or looking for",
      ],
    },
    {
      id: "rates",
      icon: DollarSign,
      title: "Setting Competitive Rates",
      description: "Price your services appropriately for the SA market",
      content: [
        "Research industry standards for your experience level",
        "Consider your overhead costs and desired profit margin",
        "Factor in travel time and expenses for location work",
        "Offer different rate structures (half-day, full-day, project-based)",
        "Be transparent about what's included in your rates",
        "Review and adjust rates annually based on experience and demand",
      ],
    },
    {
      id: "tags",
      icon: Tag,
      title: "Specialization Tags",
      description: "Help clients find you with the right keywords",
      content: [
        "Use specific, industry-standard terms",
        "Include equipment you specialize in (RED, ARRI, etc.)",
        "Add genre specializations (corporate, wedding, documentary)",
        "Include technical skills (color grading, sound mixing)",
        "Mention software proficiency (Avid, Premiere, Pro Tools)",
        "Keep tags relevant and honest to your actual experience",
      ],
    },
    {
      id: "response",
      icon: Star,
      title: "Response Best Practices",
      description: "Professional communication that wins clients",
      content: [
        "Respond to inquiries within 24 hours",
        "Ask clarifying questions about the project scope",
        "Provide detailed quotes with breakdown of costs",
        "Share relevant portfolio pieces for the specific project",
        "Be professional but personable in your communication",
        "Follow up appropriately without being pushy",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">Create a Winning Profile</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stand out from the crowd with a professional profile that showcases your skills, experience, and
            personality. Follow these expert tips to attract your ideal clients.
          </p>
        </motion.div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tips.map((tip, index) => {
            const Icon = tip.icon
            const isExpanded = expandedTip === tip.id

            return (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] cursor-pointer h-full"
                  onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-red-600" />
                    </div>
                    <CardTitle className="text-xl text-center">{tip.title}</CardTitle>
                    <CardDescription className="text-center">{tip.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isExpanded ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                      >
                        {tip.content.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{item}</span>
                          </div>
                        ))}
                        <Badge variant="secondary" className="mt-4">
                          Click to collapse
                        </Badge>
                      </motion.div>
                    ) : (
                      <div className="text-center">
                        <Badge variant="outline" className="hover:bg-red-50">
                          Click to expand tips
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Resources */}
        <motion.div
          className="mt-16 bg-white/25 backdrop-blur-md border border-white/18 rounded-xl p-8 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-center mb-6">Need More Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="font-semibold mb-2">Profile Review Service</h3>
              <p className="text-gray-600 text-sm">Get personalized feedback on your profile from industry experts</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Community Forum</h3>
              <p className="text-gray-600 text-sm">Connect with other professionals and share tips and experiences</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Success Stories</h3>
              <p className="text-gray-600 text-sm">
                Learn from professionals who've built successful careers on SnapScout
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
