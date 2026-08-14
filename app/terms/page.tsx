"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Scale, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      content: `By accessing and using SnapScout ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

These Terms of Service ("Terms") govern your use of our website located at snapscout.co.za (the "Service") operated by SnapScout ("us", "we", or "our").

Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.`,
    },
    {
      id: "accounts",
      title: "User Accounts & Subscriptions",
      content: `When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.

Subscription Plans:
• Scout: Free - Browse and discover creative professionals
• Creator Membership: R129/month - Professional profile with portfolio showcase
• Crew Membership: R129/month - Team collaboration and crew networking
• Studio Membership: R489/month - Advanced features for professional studios
• Store Membership: R489/month - E-commerce integration and inventory management

Payment terms:
• Monthly subscriptions are billed in advance
• All fees are in South African Rand (ZAR)
• Refunds available within 7 days of payment if service unused
• Automatic renewal unless cancelled before billing cycle
• Scout accounts remain free forever`,
    },
    {
      id: "responsibilities",
      title: "User Responsibilities",
      content: `You are responsible for:
• Providing accurate and truthful information in your profile
• Maintaining the confidentiality of your account credentials
• All activities that occur under your account
• Complying with all applicable laws and regulations
• Respecting intellectual property rights of others
• Professional conduct in all interactions on the platform

Prohibited activities include:
• Posting false, misleading, or fraudulent information
• Harassment, abuse, or inappropriate behavior toward other users
• Attempting to circumvent platform fees or payment systems
• Using the platform for illegal activities
• Spamming or sending unsolicited communications
• Impersonating another person or entity`,
    },
    {
      id: "platform-usage",
      title: "Platform Usage",
      content: `SnapScout provides a platform for creative professionals to showcase their work and connect with clients. The platform includes:

• Professional profile creation and management
• Portfolio showcase and work samples
• Direct communication between users
• Search and discovery features
• Payment processing facilitation

Platform rules:
• Maintain professional standards in all communications
• Use the platform only for legitimate business purposes
• Respect other users' privacy and intellectual property
• Report inappropriate behavior or content
• Keep profile information current and accurate

We reserve the right to suspend or terminate accounts that violate these terms or engage in behavior that harms the platform or its users.`,
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      content: `The Service and its original content, features and functionality are and will remain the exclusive property of SnapScout and its licensors. The Service is protected by copyright, trademark, and other laws.

User Content:
• You retain ownership of content you upload to your profile
• You grant SnapScout a license to display your content on the platform
• You represent that you have rights to all content you upload
• You may not upload content that infringes others' intellectual property rights

SnapScout Content:
• All platform features, design, and functionality are proprietary to SnapScout
• Users may not copy, modify, or distribute platform content without permission
• Trademarks and logos are property of their respective owners`,
    },
    {
      id: "liability",
      title: "Liability and Disclaimers",
      content: `The information on this platform is provided on an "as is" basis. To the fullest extent permitted by law, SnapScout:

• Excludes all representations and warranties relating to this website and its contents
• Excludes all liability for damages arising out of or in connection with your use of this website

Limitations:
• SnapScout is not responsible for the quality of work performed by users
• We do not guarantee the accuracy of user-provided information
• Users engage with each other at their own risk
• SnapScout is not liable for disputes between users
• Maximum liability limited to subscription fees paid in the last 12 months

Users are encouraged to:
• Verify credentials and references independently
• Meet in safe, public locations for initial consultations
• Use secure payment methods and maintain records
• Report any safety concerns immediately`,
    },
    {
      id: "privacy",
      title: "Privacy and Data",
      content: `Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Service.

Data Collection:
• Profile information you provide
• Usage data and platform interactions
• Communication records for support purposes
• Payment information (processed securely by third parties)

Data Use:
• Providing and improving our services
• Facilitating connections between users
• Customer support and communication
• Legal compliance and safety

Data Protection:
• Industry-standard security measures
• Regular security audits and updates
• Limited access to personal information
• Secure data transmission and storage
• Right to access, correct, or delete your data

We do not sell personal information to third parties and only share data as necessary to provide our services or as required by law.`,
    },
    {
      id: "termination",
      title: "Termination",
      content: `We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever including but not limited to a breach of the Terms.

Grounds for termination:
• Violation of these Terms of Service
• Fraudulent or deceptive behavior
• Harassment or abuse of other users
• Illegal activities or content
• Non-payment of subscription fees
• Inactive accounts (after 12 months of inactivity)

Upon termination:
• Your right to use the Service will cease immediately
• Your profile and content may be removed from the platform
• Outstanding payments remain due
• Certain provisions of these Terms will survive termination

You may terminate your account at any time by contacting our support team. Upon termination, we will deactivate your account and remove your profile from public view.`,
    },
    {
      id: "governing-law",
      title: "Governing Law",
      content: `These Terms shall be interpreted and governed by the laws of South Africa. Any disputes arising from these terms or use of the platform shall be subject to the jurisdiction of South African courts.

Legal Framework:
• Governed by South African law
• Subject to Consumer Protection Act
• Compliant with Protection of Personal Information Act (POPIA)
• Electronic Communications and Transactions Act applicable

Dispute Resolution:
• Good faith negotiation encouraged for all disputes
• Mediation available through recognized South African mediation services
• Jurisdiction of South African courts for legal proceedings
• Class action waivers where legally permissible

International Users:
• Users outside South Africa subject to these terms
• Local laws may provide additional protections
• Users responsible for compliance with local regulations`,
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
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">Terms and Conditions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Please read these terms and conditions carefully before using SnapScout. These terms govern your use of our
            platform and services.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: January 15, 2024</span>
            </div>
            <div className="flex items-center space-x-1">
              <Scale className="w-4 h-4" />
              <span>Governed by South African Law</span>
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

          {/* Terms Content */}
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
          <h2 className="text-2xl font-bold mb-4">Questions About These Terms?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            If you have any questions about these Terms of Service, please contact our legal team. We're here to help
            clarify any aspects of our terms and conditions.
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
