"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Lock, UserCheck, AlertTriangle, Flag, Award } from "lucide-react"
import { motion } from "framer-motion"

export default function SafetyTrust() {
  const securityFeatures = [
    {
      icon: Shield,
      title: "Platform Security",
      description: "Enterprise-grade security protecting your data and communications",
      features: [
        "SSL encryption for all data transmission",
        "Secure payment processing with PCI compliance",
        "Regular security audits and penetration testing",
        "24/7 monitoring for suspicious activity",
        "Automatic backups and disaster recovery",
      ],
    },
    {
      icon: UserCheck,
      title: "User Verification",
      description: "Multi-step verification process to ensure authentic professionals",
      features: [
        "Identity verification for all professional accounts",
        "Portfolio and credential validation",
        "Social media and IMDB profile verification",
        "Reference checks for premium accounts",
        "Ongoing profile monitoring and updates",
      ],
    },
    {
      icon: Lock,
      title: "Safe Meeting Guidelines",
      description: "Best practices for secure in-person and virtual meetings",
      features: [
        "Meet in public places for initial consultations",
        "Video calls before in-person meetings",
        "Share meeting details with trusted contacts",
        "Trust your instincts and report concerns",
        "Use platform messaging for project communication",
      ],
    },
    {
      icon: AlertTriangle,
      title: "Project Safety",
      description: "Guidelines for safe and professional project execution",
      features: [
        "Clear contracts and scope documentation",
        "Milestone-based payment structures",
        "Equipment insurance recommendations",
        "Location safety assessments",
        "Emergency contact protocols",
      ],
    },
    {
      icon: Flag,
      title: "Reporting System",
      description: "Easy-to-use reporting tools for safety concerns",
      features: [
        "One-click reporting for inappropriate behavior",
        "Anonymous reporting options available",
        "24-hour response time for safety issues",
        "Dedicated safety team investigation",
        "Follow-up and resolution tracking",
      ],
    },
  ]

  const trustBadges = [
    { name: "SSL Secured", description: "256-bit encryption" },
    { name: "PCI Compliant", description: "Secure payments" },
    { name: "GDPR Compliant", description: "Data protection" },
    { name: "ISO 27001", description: "Security standards" },
  ]

  const safetyGuidelines = [
    {
      title: "Before Meeting Clients",
      guidelines: [
        "Verify client identity through platform messaging",
        "Research the client's business and project details",
        "Schedule initial meetings in public locations",
        "Share meeting details with a trusted contact",
        "Trust your instincts about potential red flags",
      ],
    },
    {
      title: "During Projects",
      guidelines: [
        "Maintain professional boundaries at all times",
        "Document all project communications and changes",
        "Use secure file sharing for sensitive materials",
        "Report any inappropriate behavior immediately",
        "Keep emergency contacts readily available",
      ],
    },
    {
      title: "Financial Safety",
      guidelines: [
        "Never share banking details outside secure channels",
        "Use milestone payments for larger projects",
        "Keep detailed records of all transactions",
        "Report suspicious payment requests",
        "Verify payment methods before starting work",
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
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            Your Safety is Our Priority
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've built comprehensive safety measures and guidelines to ensure a secure, professional environment for
            all SnapScout community members.
          </p>
        </motion.div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] h-full">
                  <CardHeader>
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-red-600" />
                    </div>
                    <CardTitle className="text-xl text-center">{feature.title}</CardTitle>
                    <CardDescription className="text-center">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Trust Badges */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Security Certifications</CardTitle>
              <CardDescription>Industry-standard security and compliance certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {trustBadges.map((badge, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-sm">{badge.name}</h3>
                    <p className="text-xs text-gray-600">{badge.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Safety Guidelines */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8">Safety Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {safetyGuidelines.map((section, index) => (
              <Card key={index} className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.guidelines.map((guideline, guidelineIndex) => (
                      <li key={guidelineIndex} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{guideline}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl p-8 shadow-lg text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold mb-4">Report Safety Concerns</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            If you encounter any safety issues, inappropriate behavior, or have concerns about another user, please
            report it immediately. Our safety team responds to all reports within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-red-600 hover:bg-red-700">
              <Flag className="w-4 h-4 mr-2" />
              Report Safety Issue
            </Button>
            <Button variant="outline" className="border-red-200 hover:bg-red-50 bg-transparent">
              <Shield className="w-4 h-4 mr-2" />
              Emergency Contact
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            For immediate emergencies, contact local authorities first, then report to SnapScout
          </p>
        </motion.div>
      </main>
    </div>
  )
}
