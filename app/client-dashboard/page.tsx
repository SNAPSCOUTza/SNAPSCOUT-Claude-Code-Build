"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, ShoppingBag, Search, Users, Briefcase, Calendar, TrendingUp } from "lucide-react"

export default function ClientDashboard() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user profile from localStorage or API
    const demoProfile = localStorage.getItem("snapscout-demo-profile")
    if (demoProfile) {
      setUserProfile(JSON.parse(demoProfile))
    } else {
      const onboardingData = localStorage.getItem("snapscout-onboarding")
      if (onboardingData) {
        const { data } = JSON.parse(onboardingData)
        setUserProfile(data)
      }
    }
    setLoading(false)
  }, [])

  const getAccountTypeInfo = () => {
    const accountType = userProfile?.accountType || userProfile?.account_type
    switch (accountType) {
      case "studio":
        return {
          title: "Studio Dashboard",
          icon: Building2,
          color: "blue",
          description: "Manage your productions and hire talent",
        }
      case "store":
        return {
          title: "Brand Dashboard",
          icon: ShoppingBag,
          color: "green",
          description: "Manage your content needs and creator relationships",
        }
      case "scout":
        return {
          title: "Scout Dashboard",
          icon: Search,
          color: "purple",
          description: "Manage your casting calls and talent discovery",
        }
      default:
        return {
          title: "Client Dashboard",
          icon: Building2,
          color: "blue",
          description: "Manage your projects and talent relationships",
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const accountInfo = getAccountTypeInfo()
  const Icon = accountInfo.icon

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-16 h-16 bg-${accountInfo.color}-500 rounded-full flex items-center justify-center`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{accountInfo.title}</h1>
              <p className="text-gray-600">{accountInfo.description}</p>
            </div>
          </div>
          {userProfile?.companyName && (
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                {userProfile.companyName}
              </Badge>
              {userProfile.industry && (
                <Badge variant="secondary" className="text-sm">
                  {userProfile.industry}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hired Talent</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">R45,000</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="talent">Hired Talent</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-4">Start by posting your first gig or hiring talent</p>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Post a Gig</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="talent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hired Talent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No talent hired yet</h3>
                  <p className="text-gray-600 mb-4">Browse our talent database to find the perfect match</p>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Browse Talent</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gig Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600 mb-4">Post gigs to start receiving applications from talent</p>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Post Your First Gig
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Company Information</h3>
                    <p className="text-gray-600">Update your company details and preferences</p>
                  </div>
                  <Button variant="outline">Edit Company Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
