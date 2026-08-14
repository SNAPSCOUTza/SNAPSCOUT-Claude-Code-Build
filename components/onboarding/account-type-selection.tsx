"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Film, ArrowRight, Building2, Search } from "lucide-react"
import type { AccountType } from "@/types/account-types"

interface AccountTypeSelectionProps {
  onNext: () => void
  onPrev: () => void
  selectedAccountType: AccountType | null
  onAccountTypeSelect: (accountType: AccountType) => void
}

const accountTypes = [
  // Service Providers (Paid)
  {
    id: "film_crew" as AccountType,
    title: "Crew Membership",
    icon: Film,
    description: "Traditional film & TV production roles",
    subtitle: "Work on film & TV productions",
    category: "Service Provider",
    pricing: "R129/month",
    features: [
      "Everything in Scout (free features)",
      "Director, Producer, Cinematographer roles",
      "Sound Engineer, Gaffer, Editor positions",
      "Professional film industry network",
      "Movie and TV production opportunities",
    ],
    gradient: "from-slate-600 to-slate-800",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
  },
  {
    id: "content_creator" as AccountType,
    title: "Creator Membership",
    icon: Camera,
    description: "Photography & videography specialists",
    subtitle: "Create content for brands & clients",
    category: "Service Provider",
    pricing: "R129/month",
    features: [
      "Everything in Scout (free features)",
      "Photography specializations (Portrait, Wedding, Product)",
      "Videography services (Social Media, Corporate, Events)",
      "Commercial and creative projects",
      "Brand partnerships and client work",
    ],
    gradient: "from-red-500 to-red-700",
    iconBg: "bg-red-100",
    iconColor: "text-red-700",
    popular: true,
  },
  // Clients
  {
    id: "studio" as AccountType,
    title: "Studio Membership",
    icon: Building2,
    description: "Production studios providing equipment rental and services",
    subtitle: "Hire talent & rent equipment",
    category: "Client",
    pricing: "R489/month",
    features: [
      "Everything in Scout (free features)",
      "Post gig listings for crew and creators",
      "Browse and hire crew members",
      "List camera and equipment rentals",
      "Manage production teams and gear inventory",
      "Advanced analytics and reporting",
    ],
    gradient: "from-blue-600 to-blue-800",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
  },
  {
    id: "scout" as AccountType,
    title: "Scout",
    icon: Search,
    description: "Talent scouts discovering crew and creators",
    subtitle: "Discover professional talent",
    category: "Client",
    pricing: "Free",
    features: [
      "Discover new crew and creators",
      "Browse videographer and photographer profiles",
      "Connect with production professionals",
      "Find talent for projects",
      "Save favorite profiles",
    ],
    gradient: "from-purple-600 to-purple-800",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
  },
]

export default function AccountTypeSelection({
  onNext,
  onPrev,
  selectedAccountType,
  onAccountTypeSelect,
}: AccountTypeSelectionProps) {
  const serviceProviders = accountTypes.filter((type) => type.category === "Service Provider")
  const clients = accountTypes.filter((type) => type.category === "Client")

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Choose Your Account Type</h1>
        <p className="text-lg text-gray-700 max-w-4xl mx-auto">
          Are you offering services as a professional, or looking to hire talent for your projects?
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Providers</h2>
          <p className="text-gray-600">Offer your professional services and get hired</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 px-4">
          {serviceProviders.map((type, index) => {
            const Icon = type.icon
            const isSelected = selectedAccountType === type.id

            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {type.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-red-600 text-white font-semibold px-4 py-1">Most Popular</Badge>
                  </div>
                )}

                <Card
                  className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl h-full overflow-hidden ${
                    isSelected
                      ? "border-red-500 bg-red-50 shadow-xl ring-2 ring-red-200"
                      : "border-gray-200 bg-white hover:border-red-300"
                  } ${type.popular ? "border-red-200 shadow-lg" : ""}`}
                  onClick={() => onAccountTypeSelect(type.id)}
                >
                  <CardContent className="p-0 h-full flex flex-col">
                    <div className={`bg-gradient-to-r ${type.gradient} p-6 text-white relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-16 h-16 rounded-full ${type.iconBg} flex items-center justify-center`}>
                            <Icon className={`w-8 h-8 ${type.iconColor}`} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">{type.title}</h3>
                            <p className="text-white/90 text-sm mt-1">{type.subtitle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{type.pricing}</div>
                          <div className="text-white/80 text-xs">Professional Plan</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-4">
                        <p className="text-gray-600 text-base leading-relaxed">{type.description}</p>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                            What you'll get:
                          </h4>
                          {type.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-start space-x-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                  isSelected ? "bg-red-500" : "bg-gray-400"
                                }`}
                              />
                              <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="pt-4 border-t border-red-100">
                          <Badge className="bg-red-500 text-white border-red-500 w-full justify-center py-2">
                            Selected
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Clients</h2>
          <p className="text-gray-600">Find and hire professional talent for your projects</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 px-4">
          {clients.map((type, index) => {
            const Icon = type.icon
            const isSelected = selectedAccountType === type.id

            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (index + 2) * 0.1 }}
                className="relative"
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl h-full overflow-hidden ${
                    isSelected
                      ? "border-red-500 bg-red-50 shadow-xl ring-2 ring-red-200"
                      : "border-gray-200 bg-white hover:border-red-300"
                  }`}
                  onClick={() => onAccountTypeSelect(type.id)}
                >
                  <CardContent className="p-0 h-full flex flex-col">
                    <div className={`bg-gradient-to-r ${type.gradient} p-6 text-white relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="relative z-10 text-center">
                        <div
                          className={`w-16 h-16 rounded-full ${type.iconBg} flex items-center justify-center mx-auto mb-4`}
                        >
                          <Icon className={`w-8 h-8 ${type.iconColor}`} />
                        </div>
                        <h3 className="text-xl font-bold">{type.title}</h3>
                        <p className="text-white/90 text-sm mt-1">{type.subtitle}</p>
                        <div className="mt-3">
                          <div className="text-2xl font-bold">{type.pricing}</div>
                          <div className="text-white/80 text-xs">
                            {type.pricing === "Free" ? "Free Account" : "Premium Account"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-4">
                        <p className="text-gray-600 text-base leading-relaxed">{type.description}</p>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                            What you can do:
                          </h4>
                          {type.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-start space-x-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                  isSelected ? "bg-red-500" : "bg-gray-400"
                                }`}
                              />
                              <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="pt-4 border-t border-red-100">
                          <Badge className="bg-red-500 text-white border-red-500 w-full justify-center py-2">
                            Selected
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {selectedAccountType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center pt-8 pb-8"
        >
          <Button
            onClick={onNext}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            Continue as {accountTypes.find((t) => t.id === selectedAccountType)?.title}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-gray-500 text-sm mt-3">You can change this later in your profile settings</p>
        </motion.div>
      )}
    </div>
  )
}
