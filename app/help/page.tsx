"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HelpCircle, Search, User, CreditCard, Settings, Phone, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const faqSections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: User,
      faqs: [
        {
          question: "How do I create my profile?",
          answer:
            "Click 'Create Your Profile' and follow our step-by-step onboarding process. You'll add your experience, portfolio, rates, and contact information.",
        },
        {
          question: "What subscription plan should I choose?",
          answer:
            "Scout accounts are free forever. Creators and Crew pay R129/month, while Studios and Stores pay R489/month. Choose based on your professional role and needs.",
        },
        {
          question: "How long does profile approval take?",
          answer:
            "Most profiles are reviewed and approved within 24-48 hours. We verify your information to maintain platform quality.",
        },
      ],
    },
    {
      id: "account-management",
      title: "Account Management",
      icon: Settings,
      faqs: [
        {
          question: "How do I update my profile information?",
          answer:
            "Log into your dashboard and click 'Edit Profile'. You can update your bio, rates, portfolio, and availability anytime.",
        },
        {
          question: "Can I change my subscription plan?",
          answer:
            "Yes, you can upgrade or downgrade your plan from your account settings. Changes take effect at your next billing cycle.",
        },
        {
          question: "How do I delete my account?",
          answer:
            "Contact our support team to request account deletion. We'll remove all your data within 30 days as per our privacy policy.",
        },
      ],
    },
    {
      id: "finding-work",
      title: "Finding Work",
      icon: Search,
      faqs: [
        {
          question: "How do clients find me?",
          answer:
            "Clients search by location, specialization, availability, and experience level. Keep your profile updated and active to appear in more searches.",
        },
        {
          question: "What should I include in my portfolio?",
          answer:
            "Showcase your best, most recent work. Include variety while maintaining quality. Add context about each project and your role.",
        },
        {
          question: "How do I set competitive rates?",
          answer:
            "Check our Rate Guidelines page for industry standards. Consider your experience, equipment, and local market conditions.",
        },
      ],
    },
    {
      id: "technical-support",
      title: "Technical Support",
      icon: HelpCircle,
      faqs: [
        {
          question: "I'm having trouble uploading images",
          answer:
            "Ensure images are under 10MB and in JPG, PNG, or WebP format. Clear your browser cache and try again. Contact support if issues persist.",
        },
        {
          question: "Why can't I see my profile updates?",
          answer:
            "Profile changes may take a few minutes to appear. Clear your browser cache or try viewing in an incognito window.",
        },
        {
          question: "The website is loading slowly",
          answer:
            "Try refreshing the page or clearing your browser cache. Check your internet connection. Report persistent issues to our support team.",
        },
      ],
    },
    {
      id: "billing-payments",
      title: "Billing & Payments",
      icon: CreditCard,
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit cards, debit cards, and EFT payments. Payments are processed securely through our payment partners.",
        },
        {
          question: "When am I charged for my subscription?",
          answer:
            "You're charged monthly on the same date you signed up. You'll receive an email receipt for each payment.",
        },
        {
          question: "Can I get a refund?",
          answer:
            "We offer refunds within 7 days of payment if you haven't used the service. Contact support to request a refund.",
        },
      ],
    },
  ]

  const filteredFAQs = faqSections
    .map((section) => ({
      ...section,
      faqs: section.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((section) => section.faqs.length > 0)

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
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">Get the Support You Need</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Find answers to common questions, get technical support, or contact our team directly. We're here to help
            you succeed on SnapScout.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search FAQ topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/50 backdrop-blur-sm border-white/20"
            />
          </div>
        </motion.div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {(searchQuery ? filteredFAQs : faqSections).map((section, sectionIndex) => {
            const Icon = section.icon
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              >
                <Card className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                        <CardDescription>{section.faqs.length} frequently asked questions</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.faqs.map((faq, faqIndex) => {
                      const isExpanded = expandedFAQ === `${section.id}-${faqIndex}`
                      return (
                        <div key={faqIndex} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <button
                            onClick={() => setExpandedFAQ(isExpanded ? null : `${section.id}-${faqIndex}`)}
                            className="w-full text-left flex items-center justify-between py-2 hover:text-red-600 transition-colors duration-200"
                          >
                            <span className="font-medium">{faq.question}</span>
                            <HelpCircle
                              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.3 }}
                              className="mt-2 text-gray-600 leading-relaxed"
                            >
                              {faq.answer}
                            </motion.div>
                          )}
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Contact Support */}
        <motion.div
          className="mt-16 bg-white/25 backdrop-blur-md border border-white/18 rounded-xl p-8 shadow-lg text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is ready to help you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link href="/contact">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" className="border-red-200 hover:bg-red-50 bg-transparent">
              <Phone className="w-4 h-4 mr-2" />
              Schedule a Call
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
