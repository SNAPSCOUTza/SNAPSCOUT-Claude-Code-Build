"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Star,
  Search,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Instagram,
  Linkedin,
  Heart,
  Eye,
  Award,
  Youtube,
  UserPlus,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Facebook } from "lucide-react"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { PreviewButtonWithRedHover } from "@/components/ui/preview-button-with-red-hover"
import { motion } from "framer-motion"

export default function DesktopLanding() {
  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32 bg-white">
          <BackgroundBeams className="absolute inset-0 w-full h-full max-w-none" />
          <div className="relative z-10">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-4xl text-center">
                <motion.div>
                  <Badge variant="secondary" className="mb-4 bg-red-50 text-red-700">
                    ✨ Your Local Companion
                  </Badge>
                </motion.div>

                <motion.h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Connecting you with the people and tools to give you the utility to create
                  <Badge variant="secondary" className="ml-4 bg-yellow-100 text-yellow-800 text-sm">
                    Coming Soon
                  </Badge>
                </motion.h1>

                <motion.p className="mt-6 text-lg leading-8 text-gray-700 max-w-2xl mx-auto">
                  Discover talented local photographers, videographers, and content creators in your area based on
                  portfolio quality. Your local companion for finding the perfect creative partner
                </motion.p>

                <motion.div className="mt-10 flex items-center justify-center gap-x-6">
                  <PreviewButtonWithRedHover
                    onClick={() => window.open("https://www.youtube.com/watch?v=cpQKutRoglo", "_blank")}
                    className="h-11 px-6"
                  >
                    Preview
                  </PreviewButtonWithRedHover>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 px-6 bg-transparent hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <Link href="/onboarding">
                      <UserPlus className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                      Create Your Profile
                    </Link>
                  </Button>
                </motion.div>

                <motion.p className="mt-4 text-sm text-gray-600">
                  Launching Soon • Be the first to know • Join our waitlist
                </motion.p>
              </div>
            </div>

            {/* Trust Indicators */}
            <motion.div className="mt-16 container mx-auto px-4">
              <div className="flex items-center justify-center space-x-8 text-gray-700">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">Verified Creators</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">Secure Payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span className="text-sm">Quality Guaranteed</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Creators Section */}
        <section id="creators" className="py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-2xl text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Discover Amazing Creators</h2>
              <p className="mt-4 text-lg text-gray-600">
                Browse portfolios from talented creatives across different specialties
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Creator Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]">
                  <div className="relative">
                    <Image
                      src="/images/photography-workspace.jpg"
                      alt="Photography workspace with DSLR camera and laptop"
                      width={400}
                      height={300}
                      priority={true}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-gray-700 group-hover:bg-red-100 group-hover:text-red-800 transition-colors duration-300">
                        Camera - DP
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Sarah Chen</CardTitle>
                      <Badge className="bg-green-100 text-green-800 text-xs">Available</Badge>
                    </div>
                    <CardDescription>Director of Photography</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>5 years exp</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>Senior Level</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      DP with a love for moody lighting & guerrilla shoots. RED Komodo owner, fluent in drone ops.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">From R2500/day</span>
                      <Button size="sm" variant="outline" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Creator Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]">
                  <div className="relative">
                    <Image
                      src="/images/videography-camera.jpg"
                      alt="Professional videography camera in golden hour"
                      width={400}
                      height={300}
                      priority={true}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-gray-700 group-hover:bg-red-100 group-hover:text-red-800 transition-colors duration-300">
                        Audio - Sound Engineer
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Marcus Rodriguez</CardTitle>
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">Booked</Badge>
                    </div>
                    <CardDescription>Sound Engineer & Mixer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>8 years exp</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>Senior Level</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Netflix's Blood & Water - Sound Engineer. Owns full Zoom F8n setup, specializes in location
                      recording.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">From R1800/day</span>
                      <Button size="sm" variant="outline" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Creator Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]">
                  <div className="relative">
                    <Image
                      src="/images/film-clapperboard.jpg"
                      alt="Film production clapperboard in desert setting"
                      width={400}
                      height={300}
                      priority={true}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-gray-700 group-hover:bg-red-100 group-hover:text-red-800 transition-colors duration-300">
                        Camera - 1st AC
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Emma Thompson</CardTitle>
                      <Badge className="bg-green-100 text-green-800 text-xs">Available</Badge>
                    </div>
                    <CardDescription>1st Assistant Camera</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>4 years exp</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>Mid Level</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      KFC Commercial 2023 - 1st AC. Steadicam certified, owns wireless follow focus system. Fluent in
                      English & Afrikaans.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">From R1200/day</span>
                      <Button size="sm" variant="outline" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="text-center mt-12">
              <Button size="lg" variant="outline" className="px-8 bg-transparent" disabled>
                Launching Soon
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-gray-50 py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Simple. Transparent. Effective.
              </h2>
              <p className="mt-4 text-lg text-gray-600">Book the perfect creative in just a few clicks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-6xl mx-auto">
              {/* How it works steps */}
              {[...Array(5)].map((_, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {index === 0 && (
                    <>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mx-auto mb-6">
                        <UserPlus className="h-8 w-8 text-red-700" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4">1. Create Your Profile</h3>
                      <p className="text-gray-600">
                        Sign up for R129/month and create your professional profile with credits, gear, rates, and
                        social links.
                      </p>
                    </>
                  )}
                  {index === 1 && (
                    <>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mx-auto mb-6">
                        <Search className="h-8 w-8 text-red-700" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4">2. Get Discovered</h3>
                      <p className="text-gray-600">
                        Clients find you through our directory, filtering by department, location, experience level, and
                        availability.
                      </p>
                    </>
                  )}
                  {index === 2 && (
                    <>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mx-auto mb-6">
                        <MessageCircle className="h-8 w-8 text-red-700" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4">3. Connect & Plan</h3>
                      <p className="text-gray-600">
                        Clients contact you directly based on your rates, availability, and past work. No bidding or
                        competition.
                      </p>
                    </>
                  )}
                  {index === 3 && (
                    <>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mx-auto mb-6">
                        <CheckCircle className="h-8 w-8 text-red-700" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4">4. Book & Create</h3>
                      <p className="text-gray-600">
                        Secure your booking with transparent pricing. Work on amazing projects and build your
                        professional network.
                      </p>
                    </>
                  )}
                  {index === 4 && (
                    <>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mx-auto mb-6">
                        <Star className="h-8 w-8 text-red-700" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4">5. No Algorithm Needed</h3>
                      <p className="text-gray-600">
                        SnapScout gets you booked without the algorithm — no reels, no trends, just real work seen by
                        real clients.
                      </p>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Trusted by Brands & Creators
              </h2>
              <p className="mt-4 text-lg text-gray-600">See what our community has to say about SnapScout</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial Cards */}
              {[...Array(3)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  {index === 0 && (
                    <Card className="bg-white border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Found our perfect DP</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">
                          "SnapScout helped us find an amazing DP for our commercial. We could see their exact rates,
                          gear, and past credits upfront. No more guessing or endless back-and-forth!"
                        </p>
                        <div className="flex items-center space-x-3">
                          <Image
                            src="/images/janelle-hiroshige-gfG_csFvelY-unsplash.jpg"
                            alt="Profile picture of Jessica Park"
                            width={40}
                            height={40}
                            loading="lazy"
                            className="rounded-full"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">Jessica Park</p>
                            <p className="text-sm text-gray-600">Marketing Director, TechFlow</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {index === 1 && (
                    <Card className="bg-white border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Game-changer for crew</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">
                          "Finally, a platform where my experience and gear matter more than social media followers.
                          I've been booked consistently since joining. Clients can see my real credentials!"
                        </p>
                        <div className="flex items-center space-x-3">
                          <Image
                            src="/images/marco-xu-ToUPBCO62Lw-unsplash.jpg"
                            alt="Profile picture of David Kim"
                            width={40}
                            height={40}
                            loading="lazy"
                            className="rounded-full"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">David Kim</p>
                            <p className="text-sm text-gray-600">Sound Engineer & Mixer</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {index === 2 && (
                    <Card className="bg-white border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Transparent and professional</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">
                          "Love that I can see everyone's rates, availability, and actual film credits. Makes hiring
                          decisions so much easier when you have all the professional info upfront."
                        </p>
                        <div className="flex items-center space-x-3">
                          <Image
                            src="/images/kyle-loftus-FtQE89f3EXA-unsplash.jpg"
                            alt="Profile picture of Maria Santos"
                            width={40}
                            height={40}
                            loading="lazy"
                            className="rounded-full"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">Maria Santos</p>
                            <p className="text-sm text-gray-600">Producer, Indie Films SA</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="bg-gray-50 py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple Monthly Plans</h2>
              <p className="mt-4 text-lg text-gray-600">
                Choose the plan that fits your creative business. Clients always browse and book for free.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Pricing Cards */}
              {[...Array(3)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.15 }}
                  viewport={{ once: true }}
                >
                  {index === 0 && (
                    <Card className="bg-white border-2 border-gray-200">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Clients</CardTitle>
                        <CardDescription>Find and book amazing creators</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <span className="text-4xl font-bold text-green-600">Free</span>
                          <p className="text-gray-600">Always free to use</p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>Browse unlimited profiles</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>See rates, gear, and credits</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>Contact crew directly</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>Filter by location & availability</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>24/7 customer support</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          asChild
                          className="w-full bg-green-600 hover:bg-green-700 hover:scale-105 hover:shadow-lg transition-all duration-300"
                        >
                          <Link href="/onboarding">Create Your Profile</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                  {index === 1 && (
                    <Card className="bg-white border-2 border-red-200 relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-red-700">Most Popular</Badge>
                      </div>
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Crew Members</CardTitle>
                        <CardDescription>Individual film & content professionals</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <span className="text-4xl font-bold">R129</span>
                          <p className="text-gray-600">/month</p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>Professional profile with rates</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>Showcase credits & gear owned</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>Link social media & IMDB</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>Get discovered by clients</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>Priority support</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          asChild
                          className="w-full bg-red-700 hover:bg-red-800 hover:scale-105 hover:shadow-lg transition-all duration-300 hover:animate-pulse"
                        >
                          <Link href="/onboarding">Create Your Profile</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                  {index === 2 && (
                    <Card className="bg-white border-2 border-gray-200">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Studios</CardTitle>
                        <CardDescription>Production companies & creative agencies</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <span className="text-4xl font-bold">R489</span>
                          <p className="text-gray-600">/month</p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>Team profile management</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>Multiple crew profiles</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>Advanced project tools</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>Studio branding options</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>Dedicated account manager</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          asChild
                          className="w-full bg-purple-600 hover:bg-purple-700 hover:scale-105 hover:shadow-lg transition-all duration-300"
                        >
                          <Link href="/onboarding">Create Your Profile</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-red-700 py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-2xl text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Get Discovered by Your Next Client?
              </h2>
              <p className="mt-4 text-lg text-red-50">
                Join SnapScout and create your professional profile. Show your rates, credits, gear, and get booked
                directly.
              </p>

              <div className="mt-8">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-red-700 hover:bg-red-50 hover:text-red-800 hover:scale-110 hover:shadow-2xl hover:shadow-red-200/50 transition-all duration-300 border-2 border-transparent hover:border-red-200"
                >
                  <Link href="/onboarding">
                    <UserPlus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                    Create Your Profile - R129/month
                  </Link>
                </Button>
              </div>

              <p className="mt-4 text-sm text-red-100">Coming Soon • Be the first to experience SnapScout</p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="lg:col-span-1">
                  <div className="flex items-center space-x-2">
                    <Image
                      src="/images/snapscout-new-logo.jpeg"
                      alt="SnapScout Logo: People Create Utility Tools"
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full bg-white border border-gray-700"
                    />
                    <div>
                      <span className="text-xl font-bold">SnapScout</span>
                      <p className="text-xs text-gray-400">Your Local Companion</p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-400">
                    Your local companion for connecting with talented creators based on professional credentials, not
                    follower count.
                  </p>
                  <div className="mt-6 flex space-x-4">
                    <Link
                      href="https://www.instagram.com/snapscout_int/"
                      className="text-gray-400 hover:text-white hover:scale-125 hover:rotate-12 transition-all duration-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="h-5 w-5" />
                    </Link>
                    <Link
                      href="https://www.linkedin.com/company/snapscout-int-za/"
                      className="text-gray-400 hover:text-white hover:scale-125 hover:rotate-12 transition-all duration-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-5 w-5" />
                    </Link>
                    <Link
                      href="https://www.youtube.com/watch?v=cpQKutRoglo"
                      className="text-gray-400 hover:text-white hover:scale-125 hover:rotate-12 transition-all duration-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Youtube className="h-5 w-5" />
                    </Link>
                    <Link
                      href="https://www.facebook.com/people/SnapScoutZA/61556883658539/?mibextid=kFxxJD&rdid=N2Juv3pTTWNI7iWh&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2FwafakqCvNNiLoHnQ%2F%3Fmibextid%3DkFxxJD"
                      className="text-gray-400 hover:text-white hover:scale-125 hover:rotate-12 transition-all duration-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Facebook className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider">For Clients</h3>
                  <ul className="mt-4 space-y-2">
                    <li>
                      <Link
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
                      >
                        Browse Crew
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
                      >
                        How It Works
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
                      >
                        Pricing
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
                      >
                        Success Stories
                      </Link>
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider">For Crew</h3>
                  <ul className="mt-4 space-y-2">
                    <li>
                      <Link
                        href="/join"
                        className="text-gray-400 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
                      >
                        Join SnapScout
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/profile-tips"
                        className="text-gray-400 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
                      >
                        Profile Tips
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/rate-guidelines"
                        className="text-gray-400 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
                      >
                        Rate Guidelines
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/community"
                        className="text-gray-400 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
                      >
                        Community
                      </Link>
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Support</h3>
                  <ul className="mt-4 space-y-2">
                    <li>
                      <Link
                        href="/help"
                        className="text-gray-400 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
                      >
                        Help Center
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact"
                        className="text-gray-400 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
                      >
                        Contact Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/safety"
                        className="text-gray-400 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
                      >
                        Safety & Trust
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terms"
                        className="text-gray-400 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
                      >
                        Terms of Service
                      </Link>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>

            <div className="mt-12 border-t border-gray-800 pt-8">
              <div className="flex flex-col items-center justify-between lg:flex-row">
                <p className="text-gray-400">© {new Date().getFullYear()} SnapScout. All rights reserved.</p>
                <div className="mt-4 flex space-x-6 lg:mt-0">
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
                  >
                    Terms of Service
                  </Link>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-500 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
                  >
                    Cookie Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
