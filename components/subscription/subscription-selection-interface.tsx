"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Crown,
  Building2,
  Users,
  Camera,
  Star,
  Globe,
  Zap,
  ArrowRight,
  TrendingUp,
  Shield,
} from "lucide-react"
import Link from "next/link"

interface SubscriptionPlan {
  id: string
  name: string
  price: string
  interval: string
  description: string
  icon: React.ComponentType<any>
  popular?: boolean
  targetUsers: string[]
  features: string[]
  benefits: string[]
  gradient: string
  hoverGradient: string
  buttonColor: string
  buttonHoverColor: string
}

interface SubscriptionSelectionInterfaceProps {
  userAccountType?: string
  onPlanSelect?: (planId: string) => void
  showComparison?: boolean
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "creators-crew",
    name: "SnapScout Creators & Crew",
    price: "R129",
    interval: "month",
    description: "Perfect for individual creators, freelancers, and film crew professionals",
    icon: Camera,
    popular: true,
    targetUsers: ["Film Crew", "Creator", "Photographer", "Videographer"],
    features: [
      "Professional profile visibility",
      "Unlimited portfolio uploads",
      "Direct client messaging",
      "Gig application system",
      "Professional badge verification",
      "Basic analytics dashboard",
      "Mobile-optimized profile",
      "Social media integration",
    ],
    benefits: [
      "Get discovered by clients actively searching for talent",
      "Showcase your work with high-quality portfolio displays",
      "Receive direct project invitations from studios and brands",
      "Track profile views and engagement metrics",
    ],
    gradient: "from-red-500 to-red-600",
    hoverGradient: "from-red-600 to-red-700",
    buttonColor: "bg-red-600 hover:bg-red-700",
    buttonHoverColor: "hover:bg-red-800",
  },
  {
    id: "studios-stores",
    name: "SnapScout Studios & Stores",
    price: "R489",
    interval: "month",
    description: "Ideal for production companies, agencies, and equipment rental businesses",
    icon: Building2,
    targetUsers: ["Studio", "Production Company", "Agency", "Equipment Rental"],
    features: [
      "Enhanced profile visibility",
      "Priority placement in search results",
      "Team member profile management",
      "Advanced booking calendar",
      "Custom branding options",
      "Detailed analytics and insights",
      "Equipment rental listings",
      "Multi-location support",
      "Dedicated account manager",
      "API access for integrations",
    ],
    benefits: [
      "Attract top-tier talent with premium positioning",
      "Manage multiple team members and locations",
      "Advanced analytics to optimize your hiring strategy",
      "Custom branding to showcase your company identity",
    ],
    gradient: "from-blue-600 to-blue-700",
    hoverGradient: "from-blue-700 to-blue-800",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    buttonHoverColor: "hover:bg-blue-800",
  },
]

export default function SubscriptionSelectionInterface({
  userAccountType,
  onPlanSelect,
  showComparison = true,
}: SubscriptionSelectionInterfaceProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    onPlanSelect?.(planId)
  }

  const getRecommendedPlan = () => {
    if (userAccountType === "Studio" || userAccountType === "Production Company") {
      return "studios-stores"
    }
    return "creators-crew"
  }

  const recommendedPlanId = getRecommendedPlan()

  return (
    <div className="space-y-8">
      {/* Benefits Overview */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe className="h-6 w-6 text-red-600" />
            </div>
            <h4 className="font-medium text-gray-900">Go Live</h4>
            <p className="text-sm text-gray-600">Be visible to clients</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">Get Discovered</h4>
            <p className="text-sm text-gray-600">Find the right opportunities</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900">Grow Business</h4>
            <p className="text-sm text-gray-600">Receive project invites</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <h4 className="font-medium text-gray-900">Professional</h4>
            <p className="text-sm text-gray-600">Verified and trusted</p>
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {subscriptionPlans.map((plan) => {
          const Icon = plan.icon
          const isSelected = selectedPlan === plan.id
          const isHovered = hoveredPlan === plan.id
          const isRecommended = plan.id === recommendedPlanId
          const isPopular = plan.popular

          return (
            <div
              key={plan.id}
              className="relative"
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-yellow-400 text-black font-semibold px-4 py-2 shadow-lg">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Recommended Badge */}
              {isRecommended && !isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-green-500 text-white font-semibold px-4 py-2 shadow-lg">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Recommended for You
                  </Badge>
                </div>
              )}

              <Card
                className={`cursor-pointer transition-all duration-300 h-full border-2 overflow-hidden ${
                  isSelected
                    ? "border-red-500 shadow-2xl scale-105 bg-red-50"
                    : isHovered
                      ? "border-gray-300 shadow-xl scale-102"
                      : "border-gray-200 shadow-lg hover:shadow-xl"
                } ${isPopular ? "border-yellow-300 shadow-xl" : ""}`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {/* Header with Gradient */}
                <div
                  className={`bg-gradient-to-r ${isHovered ? plan.hoverGradient : plan.gradient} p-6 text-white relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      {isSelected && (
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-white/90 text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-white/80 ml-2">/{plan.interval}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Key Benefits */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                      Key Benefits
                    </h4>
                    <div className="space-y-2">
                      {plan.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700 leading-relaxed">{benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features List */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">What's Included</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    <Button
                      asChild
                      className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${plan.buttonColor} ${plan.buttonHoverColor} shadow-lg hover:shadow-xl`}
                    >
                      <Link href={`/subscribe?plan=${plan.id}`}>
                        <Globe className="h-5 w-5 mr-2" />
                        Go Live Now
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Link>
                    </Button>
                  </div>

                  {/* Target Users */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">Perfect for: {plan.targetUsers.join(", ")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Comparison Table */}
      {showComparison && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Plan Comparison</h3>
            <p className="text-gray-600">Compare features across both subscription plans</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Feature</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-900">Creators & Crew</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-900">Studios & Stores</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Profile Visibility</td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Portfolio Uploads</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Unlimited</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Search Priority</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Standard</td>
                  <td className="px-6 py-4 text-center">
                    <Badge className="bg-blue-100 text-blue-800">Priority</Badge>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Team Management</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Custom Branding</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Dedicated Support</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Standard</td>
                  <td className="px-6 py-4 text-center">
                    <Badge className="bg-blue-100 text-blue-800">Premium</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security & Trust */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Cancel Anytime</span>
          </div>
          <div className="flex items-center space-x-2">
            <Crown className="h-4 w-4 text-yellow-600" />
            <span>Instant Activation</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Powered by Paystack • All payments are secure and encrypted • No setup fees
        </p>
      </div>
    </div>
  )
}
