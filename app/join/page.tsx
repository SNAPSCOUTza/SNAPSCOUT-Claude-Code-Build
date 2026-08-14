"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Camera, Users, Building2, Search } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function JoinSnapScout() {
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
            Start Your Creative Journey Today
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join South Africa's premier platform for creative professionals. Get discovered by clients who value your
            skills, experience, and professional credentials.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Creators */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] h-full">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-xl">Creators</CardTitle>
                <CardDescription>Photographers & Videographers</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-red-600">R129</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Professional portfolio showcase</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Set your own rates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Client discovery tools</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Social media integration</span>
                </div>
                <Button asChild className="w-full mt-6 bg-red-600 hover:bg-red-700">
                  <Link href="/onboarding">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Film Crew */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] h-full relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white">
                Most Popular
              </Badge>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Film Crew</CardTitle>
                <CardDescription>Professional Film & TV Crew</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-blue-600">R129</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Showcase film credits</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Equipment inventory</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Department specialization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">IMDB integration</span>
                </div>
                <Button asChild className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                  <Link href="/onboarding">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Studios/Stores */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] h-full">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Studios/Stores</CardTitle>
                <CardDescription>Production & Equipment Rental</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-purple-600">R489</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Business profile showcase</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Equipment rental listings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Studio space promotion</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Advanced analytics</span>
                </div>
                <Button asChild className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
                  <Link href="/onboarding">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Scouts */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] h-full">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Scouts</CardTitle>
                <CardDescription>Talent Discovery & Networking</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-green-600">FREE</span>
                  <span className="text-gray-600">/forever</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Browse all profiles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Contact professionals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Network building tools</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Industry insights</span>
                </div>
                <Button asChild className="w-full mt-6 bg-green-600 hover:bg-green-700">
                  <Link href="/onboarding">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl p-8 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-center mb-8">What Every Subscription Includes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">Professional Profiles</h3>
              <p className="text-gray-600 text-sm">Showcase your work, rates, and experience professionally</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Client Discovery</h3>
              <p className="text-gray-600 text-sm">Get found by clients looking for your specific skills</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Direct Communication</h3>
              <p className="text-gray-600 text-sm">Connect directly with clients without platform interference</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of South African creatives who are building their careers on SnapScout. Start your
            professional journey today.
          </p>
          <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 px-8 py-3">
            <Link href="/onboarding">Create Your Profile Now</Link>
          </Button>
        </motion.div>
      </main>
    </div>
  )
}
