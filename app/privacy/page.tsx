"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Lock, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = [
    {
      id: "overview",
      title: "Overview",
      content: `Your privacy is important to us. This Privacy Policy explains how SnapScout ("we", "us", "our") collects, uses, discloses, and protects your information when you use our website and services (the "Service") at snapscout.co.za.

By using the Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Service.`,
    },
    {
      id: "information-we-collect",
      title: "Information We Collect",
      content: `We collect information to provide and improve our Service:

• Profile information you provide, such as your name, contact details, professional credentials, portfolio, and rates
• Usage data and platform interactions, including pages visited and features used
• Communication records for support and safety purposes
• Payment information, which is processed securely by third-party payment providers and is not stored on our servers`,
    },
    {
      id: "how-we-use-information",
      title: "How We Use Your Information",
      content: `We use the information we collect to:

• Provide, operate, and improve our services
• Facilitate connections and communication between users
• Provide customer support and respond to inquiries
• Maintain the safety, security, and integrity of the platform
• Comply with legal obligations and enforce our Terms of Service`,
    },
    {
      id: "cookies",
      title: "Cookies and Similar Technologies",
      content: `We use cookies and similar technologies to keep you signed in and remember your session. These are required for core features like authentication and cannot be disabled without affecting your ability to use the Service.

We also use analytics tools to understand how the Service is used, which helps us improve performance and the overall experience. These tools do not sell your data to third parties.`,
    },
    {
      id: "data-protection",
      title: "How We Protect Your Information",
      content: `We take the security of your information seriously and apply industry-standard measures, including:

• Secure data transmission and storage
• Regular security audits and updates
• Limited access to personal information on a need-to-know basis

No method of transmission or storage is 100% secure, and we cannot guarantee absolute security. If we become aware of a data breach affecting your information, we will notify you as required by law.`,
    },
    {
      id: "data-sharing",
      title: "Data Sharing and Third Parties",
      content: `We do not sell your personal information to third parties. We only share data as necessary to:

• Provide our services, such as processing payments through trusted third-party providers
• Comply with legal obligations or respond to lawful requests
• Protect the rights, property, or safety of SnapScout, our users, or the public`,
    },
    {
      id: "your-rights",
      title: "Your Rights",
      content: `You have the right to:

• Access the personal information we hold about you
• Correct inaccurate or incomplete information
• Request deletion of your account and associated data
• Object to or restrict certain processing of your information

To exercise any of these rights, contact us using the details below. We will respond within a reasonable timeframe in accordance with applicable law.`,
    },
    {
      id: "data-retention",
      title: "Data Retention",
      content: `We retain your information for as long as your account is active or as needed to provide the Service. If you terminate your account, we will deactivate it and remove your profile from public view; some information may be retained where required for legal, safety, or record-keeping purposes.`,
    },
    {
      id: "governing-law",
      title: "Governing Law",
      content: `This Privacy Policy is governed by the laws of South Africa, including the Protection of Personal Information Act (POPIA) and the Electronic Communications and Transactions Act. If you are located outside South Africa, local laws may provide you with additional rights.`,
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will post the updated policy on this page with a revised "Last Updated" date.`,
    },
  ]

  const tableOfContents = sections.map((section) => ({
    id: section.id,
    title: section.title,
  }))

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setActiveSection(sectionId)
    }
  }

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
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">Privacy Policy</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            This Privacy Policy explains how we collect, use, and protect your information when you use SnapScout.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: January 15, 2024</span>
            </div>
            <div className="flex items-center space-x-1">
              <Lock className="w-4 h-4" />
              <span>POPIA Compliant</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Table of Contents</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {tableOfContents.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                        activeSection === item.id
                          ? "bg-red-100 text-red-700 font-medium"
                          : "hover:bg-white/50 text-gray-700"
                      }`}
                    >
                      {index + 1}. {item.title}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy Policy Content */}
          <div className="lg:col-span-3 space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {index + 1}
                      </Badge>
                      <span>{section.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-gray max-w-none">
                      {section.content.split("\n\n").map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <motion.div
          className="mt-16 bg-white/25 backdrop-blur-md border border-white/18 rounded-xl p-8 shadow-lg text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            If you have any questions about this Privacy Policy or want to exercise your data rights, please contact
            our team. We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:legal@snapscout.co.za"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Contact Legal Team
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              General Contact
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
