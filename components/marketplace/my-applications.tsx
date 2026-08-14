"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, Eye, MessageSquare, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"

export function MyApplications() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  const supabase = createClient()

  const fetchApplications = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("User not authenticated")
        return
      }

      const { data, error } = await supabase
        .from("gig_applications")
        .select(`
          *,
          gig:gig_id (
            id,
            title,
            category,
            gig_type,
            location,
            salary_min,
            salary_max,
            salary_currency,
            status,
            client:client_id (
              id,
              display_name,
              profile_picture
            )
          )
        `)
        .eq("freelancer_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching applications:", error)
        return
      }

      setApplications(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "shortlisted":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "accepted":
      case "hired":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "shortlisted":
        return "bg-blue-100 text-blue-800"
      case "accepted":
      case "hired":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filterApplications = (status?: string) => {
    if (!status) return applications
    return applications.filter((app) => app.status === status)
  }

  const formatRate = (application: any) => {
    if (application.proposed_rate) {
      return `R${application.proposed_rate.toLocaleString()}`
    }
    if (application.gig?.salary_min && application.gig?.salary_max) {
      return `R${application.gig.salary_min.toLocaleString()} - R${application.gig.salary_max.toLocaleString()}`
    }
    return "Rate negotiable"
  }

  if (loading) {
    return <div className="text-center py-8">Loading your applications...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h2>
        <p className="text-gray-600">Track the status of your gig applications</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filterApplications("pending").length})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({filterApplications("accepted").length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({filterApplications("rejected").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filterApplications("pending").map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          {filterApplications("accepted").map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {filterApplications("rejected").map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>
      </Tabs>

      {applications.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600 mb-4">Start applying to gigs to see your applications here.</p>
          <Button className="bg-red-600 hover:bg-red-700">Browse Gigs</Button>
        </div>
      )}
    </div>
  )
}

function ApplicationCard({ application }: { application: any }) {
  const status = application.status || "pending"
  const portfolioSamples = Array.isArray(application.portfolio_samples) ? application.portfolio_samples : []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "shortlisted":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "accepted":
      case "hired":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "shortlisted":
        return "bg-blue-100 text-blue-800"
      case "accepted":
      case "hired":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatRate = (application: any) => {
    if (application.proposed_rate) {
      return `R${application.proposed_rate.toLocaleString()}`
    }
    if (application.gig?.salary_min && application.gig?.salary_max) {
      return `R${application.gig.salary_min.toLocaleString()} - R${application.gig.salary_max.toLocaleString()}`
    }
    return "Rate negotiable"
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{application.gig?.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary">{application.gig?.category}</Badge>
              {application.gig?.gig_type && <Badge variant="outline">{application.gig.gig_type}</Badge>}
              <Badge className={getStatusColor(status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(status)}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-green-600">{formatRate(application)}</p>
            {application.proposed_timeline && <p className="text-sm text-gray-500">{application.proposed_timeline}</p>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Application Message Preview */}
          <div>
            <p className="text-sm text-gray-600 line-clamp-2">{application.cover_message}</p>
          </div>

          {/* Gig Details */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {application.gig?.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{application.gig.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Applied {formatDistanceToNow(new Date(application.created_at))} ago</span>
            </div>
          </div>

          {/* Portfolio Samples */}
          {portfolioSamples.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Portfolio samples:</p>
              <div className="flex flex-wrap gap-2">
                {portfolioSamples.slice(0, 3).map((url: string, index: number) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                  >
                    Sample {index + 1}
                  </a>
                ))}
                {portfolioSamples.length > 3 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{portfolioSamples.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">Gig status: {application.gig?.status}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View Gig
              </Button>
              {status === "accepted" && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Contact Client
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

