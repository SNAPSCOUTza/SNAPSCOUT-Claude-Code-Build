"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Search, Building2, ArrowRight } from "lucide-react"
import type { OnboardingData } from "@/app/onboarding/page"

interface SubscriptionSelectionProps {
  onNext: () => void
  onPrev: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const plans = {
  scout: {
    name: "Scout",
    price: "Free",
    period: "forever",
    icon: Search,
    color: "#10B981",
    features: [
      "Browse unlimited creator profiles",
      "View portfolios and rates",
      "Direct messaging with creatives",
      "Basic search and filters",
      "Save favorite profiles",
      "Request quotes",
    ],
  },
  creator: {
    name: "Creator Membership",
    price: "R129",
    period: "month",
    icon: Crown,
    color: "#E63946",
    popular: true,
    features: [
      "Everything in Scout",
      "Professional profile page",
      "Portfolio showcase",
      "Social media integration",
      "Client discovery",
      "Direct messaging",
      "Profile analytics",
      "Priority support",
    ],
  },
  crew: {
    name: "Crew Membership",
    price: "R129",
    period: "month",
    icon: Crown,
    color: "#F59E0B",
    features: [
      "Everything in Scout",
      "Team collaboration tools",
      "Priority support",
      "Enhanced visibility",
      "Crew networking",
      "Project management",
      "Booking calendar",
      "Client reviews",
    ],
  },
  studio: {
    name: "Studio Membership",
    price: "R489",
    period: "month",
    icon: Building2,
    color: "#2B2D42",
    features: [
      "Everything in Scout",
      "Advanced analytics",
      "Custom branding",
      "API access",
      "Priority listing",
      "Dedicated support",
      "Team management",
      "Multiple locations",
    ],
  },
  store: {
    name: "Store Membership",
    price: "R489",
    period: "month",
    icon: Building2,
    color: "#8B5CF6",
    features: [
      "Everything in Scout",
      "E-commerce integration",
      "Inventory management",
      "Sales analytics",
      "Product showcase",
      "Payment processing",
      "Order management",
      "Customer database",
    ],
  },
}

export default function SubscriptionSelection({ onNext, onPrev, data, updateData }: SubscriptionSelectionProps) {
  const handlePlanSelection = (planType: string) => {
    updateData({ selectedPlan: planType })
  }

  const getRecommendedPlan = () => {
    return data.userType || "creator"
  }

  const recommendedPlan = getRecommendedPlan()

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Choose your plan</h1>
          <p className="text-xl text-gray-700">Select the plan that fits your needs. Start with a 14-day free trial.</p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(plans).map(([key, plan]) => {
            const Icon = plan.icon
            const isSelected = data.selectedPlan === key
            const isRecommended = key === recommendedPlan
            const isFree = plan.price === "Free"

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: Object.keys(plans).indexOf(key) * 0.1 }}
                className="relative"
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-yellow-400 text-black font-semibold px-4 py-1">Most Popular</Badge>
                  </div>
                )}

                {/* Recommended Badge */}
                {isRecommended && !plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-green-500 text-white font-semibold px-4 py-1">Recommended</Badge>
                  </div>
                )}

                <Card
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 h-full border-2 ${
                    isSelected
                      ? "border-primary shadow-lg bg-red-50"
                      : "border-gray-200 hover:border-primary/50 bg-white"
                  } ${plan.popular ? "border-yellow-400 shadow-lg" : ""}`}
                  onClick={() => handlePlanSelection(key)}
                >
                  <CardHeader className="text-center space-y-4 pb-6">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center`}
                      style={{ backgroundColor: `${plan.color}20` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: plan.color }} />
                    </div>

                    <div className="space-y-2">
                      <CardTitle className="text-2xl text-gray-900">{plan.name}</CardTitle>
                      <div className="space-y-1">
                        <div className="text-4xl font-bold text-gray-900">{plan.price}</div>
                        <p className="text-gray-600">{isFree ? plan.period : `per ${plan.period}`}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Features List */}
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                            style={{ backgroundColor: `${plan.color}20` }}
                          >
                            <Check className="w-3 h-3" style={{ color: plan.color }} />
                          </div>
                          <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button
                      className={`w-full py-3 font-semibold transition-all ${
                        isFree
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : key === "creator"
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                            : "bg-gray-800 hover:bg-gray-900 text-white"
                      }`}
                      onClick={() => handlePlanSelection(key)}
                    >
                      {isFree ? "Get Started Free" : "Start Free Trial"}
                    </Button>

                    {!isFree && (
                      <p className="text-xs text-gray-500 text-center">14-day free trial • No credit card required</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Free Trial Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center space-y-4"
        >
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">14-Day Free Trial</h3>
            <p className="text-gray-700 text-sm">
              Try any paid plan free for 14 days. No credit card required. Cancel anytime during the trial period with
              no charges.
            </p>
          </div>

          {/* Skip Option */}
          <div className="space-y-2">
            <Button variant="ghost" onClick={onNext} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              Skip for now
            </Button>
            <p className="text-xs text-gray-500">You can upgrade your plan anytime from your dashboard</p>
          </div>
        </motion.div>

        {/* Continue Button */}
        {data.selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center pt-4"
          >
            <Button
              onClick={onNext}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
              size="lg"
            >
              Continue with {plans[data.selectedPlan as keyof typeof plans]?.name}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
