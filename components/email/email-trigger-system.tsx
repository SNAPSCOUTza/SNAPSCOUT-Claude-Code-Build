"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Zap,
  Mail,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Database,
  Webhook,
  Code,
  Play,
  Settings,
} from "lucide-react"

interface EmailTrigger {
  id: string
  name: string
  event: string
  template: string
  status: "active" | "inactive" | "error"
  lastTriggered?: Date
  totalSent: number
  successRate: number
}

const emailTriggers: EmailTrigger[] = [
  {
    id: "welcome_creators",
    name: "Welcome Email - Creators & Crew",
    event: "subscription.created",
    template: "welcome_creators",
    status: "active",
    lastTriggered: new Date(Date.now() - 1000 * 60 * 30),
    totalSent: 127,
    successRate: 98.4,
  },
  {
    id: "welcome_studios",
    name: "Welcome Email - Studios & Stores",
    event: "subscription.created",
    template: "welcome_studios",
    status: "active",
    lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 2),
    totalSent: 43,
    successRate: 100,
  },
  {
    id: "subscription_confirmation",
    name: "Subscription Confirmation",
    event: "payment.successful",
    template: "subscription_confirmation",
    status: "active",
    lastTriggered: new Date(Date.now() - 1000 * 60 * 15),
    totalSent: 89,
    successRate: 97.8,
  },
  {
    id: "profile_activation",
    name: "Profile Activation",
    event: "profile.activated",
    template: "profile_activation",
    status: "active",
    lastTriggered: new Date(Date.now() - 1000 * 60 * 45),
    totalSent: 156,
    successRate: 99.2,
  },
]

const supabaseEdgeFunctions = [
  {
    name: "send-welcome-email",
    description: "Sends welcome emails to new subscribers",
    status: "deployed",
    lastDeployed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    name: "handle-subscription-webhook",
    description: "Processes Paystack subscription webhooks",
    status: "deployed",
    lastDeployed: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    name: "activate-profile",
    description: "Activates user profiles after successful payment",
    status: "deployed",
    lastDeployed: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
]

export default function EmailTriggerSystem() {
  const [selectedTrigger, setSelectedTrigger] = useState<EmailTrigger>(emailTriggers[0])
  const [testEmailSending, setTestEmailSending] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      case "deployed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "deployed":
        return <CheckCircle className="h-4 w-4" />
      case "inactive":
        return <Clock className="h-4 w-4" />
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const sendTestEmail = async () => {
    setTestEmailSending(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setTestEmailSending(false)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Trigger System</h2>
          <p className="text-gray-600">Automated email sending via Supabase Edge Functions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">All Systems Active</Badge>
          <Button size="sm" className="bg-red-600 hover:bg-red-700">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      <Tabs defaultValue="triggers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="triggers">Email Triggers</TabsTrigger>
          <TabsTrigger value="functions">Edge Functions</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook Events</TabsTrigger>
        </TabsList>

        {/* Email Triggers Tab */}
        <TabsContent value="triggers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trigger List */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Active Triggers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {emailTriggers.map((trigger) => (
                    <div
                      key={trigger.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedTrigger.id === trigger.id
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedTrigger(trigger)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{trigger.name}</h4>
                        <Badge className={`${getStatusColor(trigger.status)} border text-xs`}>
                          {getStatusIcon(trigger.status)}
                          <span className="ml-1">{trigger.status}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">Event: {trigger.event}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{trigger.totalSent} sent</span>
                        <span>{trigger.successRate}% success</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Trigger Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      {selectedTrigger.name}
                    </CardTitle>
                    <Badge className={`${getStatusColor(selectedTrigger.status)} border`}>
                      {getStatusIcon(selectedTrigger.status)}
                      <span className="ml-1">{selectedTrigger.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Trigger Configuration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Event</label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <code className="text-sm text-gray-800">{selectedTrigger.event}</code>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Template</label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <code className="text-sm text-gray-800">{selectedTrigger.template}</code>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedTrigger.totalSent}</div>
                      <div className="text-sm text-blue-800">Total Sent</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedTrigger.successRate}%</div>
                      <div className="text-sm text-green-800">Success Rate</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedTrigger.lastTriggered ? formatDate(selectedTrigger.lastTriggered) : "Never"}
                      </div>
                      <div className="text-sm text-purple-800">Last Triggered</div>
                    </div>
                  </div>

                  {/* Test Email */}
                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Test Email Trigger</h4>
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={sendTestEmail}
                        disabled={testEmailSending}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {testEmailSending ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Test Email
                          </>
                        )}
                      </Button>
                      <p className="text-sm text-gray-600">
                        This will send a test email using the {selectedTrigger.template} template
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Edge Functions Tab */}
        <TabsContent value="functions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supabaseEdgeFunctions.map((func) => (
              <Card key={func.name}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    {func.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{func.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatusColor(func.status)} border`}>
                      {getStatusIcon(func.status)}
                      <span className="ml-1">{func.status}</span>
                    </Badge>
                    <span className="text-xs text-gray-500">Deployed {formatDate(func.lastDeployed)}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Play className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Function Code Example */}
          <Card>
            <CardHeader>
              <CardTitle>Edge Function Example</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  <code>{`// supabase/functions/send-welcome-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { user_id, plan_type, user_name, profile_url } = await req.json()
  
  const template = plan_type === 'studios' ? 'welcome_studios' : 'welcome_creators'
  
  const emailHTML = generateEmailTemplate(template, {
    user_name,
    profile_url,
    plan_name: plan_type === 'studios' ? 'Studios & Stores' : 'Creators & Crew',
    monthly_price: plan_type === 'studios' ? 'R300' : 'R60'
  })
  
  // Send email via your email service
  const result = await sendEmail({
    to: user_email,
    subject: 'Welcome to SnapScout!',
    html: emailHTML
  })
  
  return new Response(JSON.stringify({ success: true }))
})`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <Alert>
            <Webhook className="h-4 w-4" />
            <AlertDescription>
              Webhook events are automatically processed by Supabase Edge Functions. Configure your Paystack webhook URL
              to point to your Supabase function endpoint.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Paystack Webhook Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <div className="font-medium text-green-800">subscription.create</div>
                    <div className="text-sm text-green-600">New subscription created</div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <div className="font-medium text-green-800">subscription.enable</div>
                    <div className="text-sm text-green-600">Subscription activated</div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-800">charge.success</div>
                    <div className="text-sm text-blue-600">Payment successful</div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm text-gray-800 break-all">
                      https://your-project.supabase.co/functions/v1/handle-subscription-webhook
                    </code>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
                  <div className="space-y-2">
                    <Badge variant="outline">subscription.create</Badge>
                    <Badge variant="outline">subscription.enable</Badge>
                    <Badge variant="outline">charge.success</Badge>
                  </div>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <Database className="h-4 w-4 mr-2" />
                  Update Webhook Configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
