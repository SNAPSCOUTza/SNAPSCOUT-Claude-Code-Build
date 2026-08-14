"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Search, Building2, ArrowRight } from 'lucide-react'
import type { OnboardingData } from "@/app/onboarding/page"

interface WelcomePageProps {
  onNext: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const userTypes = [
  {
    id: 'creator',
    title: "I'm a Creator",
    icon: Camera,
    description: "Photographer, videographer, or creative professional"
  },
  {
    id: 'client',
    title: "I'm a Client/Scout",
    icon: Search,
    description: "Looking to hire creative professionals"
  },
  {
    id: 'studio',
    title: "I'm a Studio/Store",
    icon: Building2,
    description: "Rent equipment or studio space"
  }
]

export default function WelcomePage({ onNext, data, updateData }: WelcomePageProps) {
  const handleUserTypeSelection = (userType: 'creator' | 'client' | 'studio') => {
    updateData({ userType })
  }

  return (
    <div className="max-w-4xl mx-auto text-center space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-8"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Welcome to{" "}
              <span className="text-primary">Snap</span>
              <span>Scout</span>
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-600">
              Your Creative Playground
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Connect, Create, and Get Booked in South Africa's Premier Creative Network
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 px-4">
          {userTypes.map((type, index) => {
            const Icon = type.icon
            const isSelected = data.userType === type.id
            
            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    isSelected
                      ? 'border-primary bg-red-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-primary/50'
                  }`}
                  onClick={() => handleUserTypeSelection(type.id as 'creator' | 'client' | 'studio')}
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-primary/10' 
                        : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-8 h-8 transition-all ${
                        isSelected ? 'text-primary' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="space-y-2">
                      <h3 className={`text-xl font-semibold transition-all ${
                        isSelected ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {type.title}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {type.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {data.userType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-8 pb-8"
          >
            <Button
              onClick={onNext}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
