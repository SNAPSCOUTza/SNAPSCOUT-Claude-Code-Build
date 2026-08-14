"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    accountType: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Support",
      details: [
        { label: "General Inquiries", value: "hello@snapscout.co.za" },
        { label: "Technical Support", value: "support@snapscout.co.za" },
        { label: "Business Partnerships", value: "partnerships@snapscout.co.za" },
        { label: "Media Inquiries", value: "media@snapscout.co.za" },
      ],
    },
    {
      icon: MapPin,
      title: "Office Address",
      details: [
        { label: "Address", value: "Atrium on 5th, 9th Floor" },
        { label: "Street", value: "5th Street, Sandton" },
        { label: "City", value: "Johannesburg, Gauteng 2196" },
        { label: "Country", value: "South Africa" },
      ],
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: [
        { label: "Monday - Friday", value: "8:00 AM - 6:00 PM SAST" },
        { label: "Saturday", value: "9:00 AM - 1:00 PM SAST" },
        { label: "Sunday", value: "Closed" },
        { label: "Response Time", value: "Within 24 hours" },
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
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">We're Here to Help</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have a question, need support, or want to partner with us? Get in touch with our team and we'll get back to
            you as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <Icon className="w-6 h-6 text-red-600" />
                        </div>
                        <CardTitle className="text-xl">{info.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {info.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">{detail.label}:</span>
                          <span className="font-medium text-sm">{detail.value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-white/25 backdrop-blur-md border border-white/18 rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white/50 backdrop-blur-sm border-white/20"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white/50 backdrop-blur-sm border-white/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountType">Account Type</Label>
                      <Select
                        value={formData.accountType}
                        onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                      >
                        <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/20">
                          <SelectValue placeholder="Select your account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="content-creator">Creator</SelectItem>
                          <SelectItem value="film-crew">Film Crew</SelectItem>
                          <SelectItem value="studio">Studio</SelectItem>
                          <SelectItem value="scout">Scout</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="bg-white/50 backdrop-blur-sm border-white/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-white/50 backdrop-blur-sm border-white/20"
                      placeholder="Tell us how we can help you..."
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Support Options */}
        <motion.div
          className="mt-16 bg-white/25 backdrop-blur-md border border-white/18 rounded-xl p-8 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-center mb-6">Other Ways to Get Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Schedule a Call</h3>
              <p className="text-gray-600 text-sm mb-4">
                Book a 15-minute call with our support team for personalized help
              </p>
              <Button variant="outline" size="sm">
                Book Call
              </Button>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Help Center</h3>
              <p className="text-gray-600 text-sm mb-4">Browse our comprehensive FAQ and troubleshooting guides</p>
              <Button variant="outline" size="sm">
                Visit Help Center
              </Button>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Community Forum</h3>
              <p className="text-gray-600 text-sm mb-4">Connect with other users and get peer-to-peer support</p>
              <Button variant="outline" size="sm">
                Join Community
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
