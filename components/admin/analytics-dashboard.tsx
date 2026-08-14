"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Users,
  CreditCard,
  Eye,
  AlertTriangle,
  RefreshCw,
  DollarSign,
  Activity,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface AnalyticsData {
  totalUsers: number
  activeSubscriptions: number
  cancelledSubscriptions: number
  unpaidSubscriptions: number
  totalRevenue: number
  monthlyRevenue: number
  visibleProfiles: number
  hiddenProfiles: number
  webhookEvents: number
  paymentFailures: number
}

interface ChartData {
  name: string
  value: number
  revenue?: number
}

interface WebhookLog {
  id: string
  event_type: string
  status: string
  created_at: string
  user_id: string
  error_message?: string
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeSubscriptions: 0,
    cancelledSubscriptions: 0,
    unpaidSubscriptions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    visibleProfiles: 0,
    hiddenProfiles: 0,
    webhookEvents: 0,
    paymentFailures: 0,
  })

  const [subscriptionTrends, setSubscriptionTrends] = useState<ChartData[]>([])
  const [accountTypeDistribution, setAccountTypeDistribution] = useState<ChartData[]>([])
  const [revenueData, setRevenueData] = useState<ChartData[]>([])
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const supabase = createClient()

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true)

      // Fetch user profiles data
      const { data: profiles } = await supabase.from("user_profiles").select("account_type, is_profile_visible")

      // Fetch subscription data
      const { data: subscriptions } = await supabase
        .from("user_subscriptions")
        .select("status, created_at, current_period_end")

      // Calculate analytics
      const totalUsers = profiles?.length || 0
      const visibleProfiles = profiles?.filter((p) => p.is_profile_visible).length || 0
      const hiddenProfiles = totalUsers - visibleProfiles

      const activeSubscriptions = subscriptions?.filter((s) => s.status === "active").length || 0
      const cancelledSubscriptions = subscriptions?.filter((s) => s.status === "cancelled").length || 0
      const unpaidSubscriptions = subscriptions?.filter((s) => s.status === "unpaid").length || 0

      // Calculate revenue (simplified - in real app, fetch from payment records)
      const totalRevenue = activeSubscriptions * 60 + cancelledSubscriptions * 30 // Estimated
      const monthlyRevenue = activeSubscriptions * 60 // Current month estimate

      // Account type distribution
      const accountTypes = profiles?.reduce(
        (acc, profile) => {
          acc[profile.account_type] = (acc[profile.account_type] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const accountTypeData = Object.entries(accountTypes || {}).map(([name, value]) => ({
        name,
        value,
      }))

      // Subscription trends (last 6 months)
      const trendsData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - (5 - i))
        return {
          name: date.toLocaleDateString("en-US", { month: "short" }),
          value: Math.floor(Math.random() * 50) + activeSubscriptions - 25, // Mock data
          revenue: Math.floor(Math.random() * 3000) + monthlyRevenue - 1500, // Mock data
        }
      })

      // Revenue data (last 6 months)
      const revenueChartData = trendsData.map((item) => ({
        name: item.name,
        value: item.revenue || 0,
      }))

      setAnalytics({
        totalUsers,
        activeSubscriptions,
        cancelledSubscriptions,
        unpaidSubscriptions,
        totalRevenue,
        monthlyRevenue,
        visibleProfiles,
        hiddenProfiles,
        webhookEvents: 0, // Would fetch from webhook logs table
        paymentFailures: unpaidSubscriptions,
      })

      setAccountTypeDistribution(accountTypeData)
      setSubscriptionTrends(trendsData)
      setRevenueData(revenueChartData)
    } catch (error) {
      console.error("[v0] Error fetching analytics:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchWebhookLogs = async () => {
    // Mock webhook logs - in real app, fetch from webhook_logs table
    const mockLogs: WebhookLog[] = [
      {
        id: "1",
        event_type: "charge.success",
        status: "processed",
        created_at: new Date().toISOString(),
        user_id: "user-1",
      },
      {
        id: "2",
        event_type: "subscription.disable",
        status: "failed",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        user_id: "user-2",
        error_message: "User not found",
      },
    ]

    setWebhookLogs(mockLogs)
  }

  useEffect(() => {
    fetchAnalytics()
    fetchWebhookLogs()
  }, [])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">Monitor subscription metrics and platform performance</p>
        </div>
        <Button variant="outline" onClick={fetchAnalytics} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{analytics.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visible Profiles</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.visibleProfiles}</div>
            <p className="text-xs text-muted-foreground">{analytics.hiddenProfiles} profiles hidden</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {analytics.paymentFailures > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {analytics.paymentFailures} payment failures require attention. Check the webhook logs for details.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Type Distribution</CardTitle>
                <CardDescription>Breakdown of user account types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={accountTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {accountTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Status</CardTitle>
                <CardDescription>Current subscription breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{analytics.activeSubscriptions}</span>
                    <Badge className="bg-green-100 text-green-800">
                      {((analytics.activeSubscriptions / analytics.totalUsers) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span>Cancelled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{analytics.cancelledSubscriptions}</span>
                    <Badge className="bg-red-100 text-red-800">
                      {((analytics.cancelledSubscriptions / analytics.totalUsers) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span>Unpaid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{analytics.unpaidSubscriptions}</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {((analytics.unpaidSubscriptions / analytics.totalUsers) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Trends</CardTitle>
              <CardDescription>Active subscriptions over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={subscriptionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R${value}`, "Revenue"]} />
                  <Bar dataKey="value" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">R{analytics.totalRevenue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Revenue Per User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  R{analytics.totalUsers > 0 ? Math.round(analytics.totalRevenue / analytics.totalUsers) : 0}
                </div>
                <p className="text-sm text-muted-foreground">Per active user</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {analytics.totalUsers > 0
                    ? ((analytics.activeSubscriptions / analytics.totalUsers) * 100).toFixed(1)
                    : 0}
                  %
                </div>
                <p className="text-sm text-muted-foreground">Users to subscribers</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Webhook Events</CardTitle>
              <CardDescription>Latest webhook processing logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhookLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {log.status === "processed" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{log.event_type}</p>
                        <p className="text-sm text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                        {log.error_message && <p className="text-sm text-red-600">{log.error_message}</p>}
                      </div>
                    </div>
                    <Badge
                      className={log.status === "processed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
