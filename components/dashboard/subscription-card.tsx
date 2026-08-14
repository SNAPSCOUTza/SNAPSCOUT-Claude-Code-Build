"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  AlertTriangle,
  Info,
  CreditCard,
  Calendar,
  Clock,
  X,
  Camera,
  Users,
  Building2,
  Store,
  Loader2,
} from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface Subscription {
  id: string
  user_id: string
  status: "active" | "cancelled" | "expired" | null
  plan_name: string | null
  amount: number | null
  currency: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancelled_at: string | null
  next_payment_date: string | null
}

interface SubscriptionCardProps {
  subscription: Subscription | null
  userEmail: string
  onSubscriptionChange?: () => void
}

const ROLE_PLANS = [
  {
    id: "creator",
    planId: "creator-membership",
    name: "Creator Membership",
    price: 129,
    priceInKobo: 12900,
    planCode: "PLN_gwa1ou57v0y52f9",
    paymentUrl: "https://paystack.shop/pay/pf9ytcte3l",
    icon: Camera,
    features: ["Professional profile page", "Portfolio showcase", "Direct messaging with clients"],
  },
  {
    id: "crew",
    planId: "crew-membership",
    name: "Crew Membership",
    price: 129,
    priceInKobo: 12900,
    planCode: "PLN_fqc6pjz44yoxxjt",
    paymentUrl: "https://paystack.shop/pay/x2cgr11mqs",
    icon: Users,
    features: ["Team collaboration tools", "Enhanced visibility", "Project management"],
  },
  {
    id: "studio",
    planId: "studio-membership",
    name: "Studio Membership",
    price: 489,
    priceInKobo: 48900,
    planCode: "PLN_mwe361yl6kncc9a",
    paymentUrl: "https://paystack.shop/pay/zqmjtj7zo6",
    icon: Building2,
    features: ["Advanced analytics", "Custom branding", "Priority listing"],
  },
  {
    id: "store",
    planId: "store-membership",
    name: "Store Membership",
    price: 489,
    priceInKobo: 48900,
    planCode: "PLN_l0ye33gc0dmtdpb",
    paymentUrl: "https://paystack.shop/pay/rnkw0lackt",
    icon: Store,
    features: ["E-commerce integration", "Inventory management", "Sales analytics"],
  },
]

export function SubscriptionCard({ subscription, userEmail, onSubscriptionChange }: SubscriptionCardProps) {
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
        console.log("[v0] User ID loaded:", session.user.id)
      } else {
        console.log("[v0] No session found")
      }
    }
    getUser()
  }, [supabase.auth])

  // Determine subscription state
  const getSubscriptionState = () => {
    if (!subscription || !subscription.status || subscription.status === "expired") {
      return "expired"
    }
    if (subscription.status === "cancelled") {
      return "cancelled"
    }
    if (subscription.status === "active") {
      return "active"
    }
    return "expired"
  }

  const state = getSubscriptionState()

  // Calculate days until expiry for cancelled subscriptions
  const getDaysUntilExpiry = () => {
    if (!subscription?.current_period_end) return 0
    const endDate = new Date(subscription.current_period_end)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    setIsCancelling(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", session.user.id)

      if (error) throw error

      setShowCancelModal(false)
      onSubscriptionChange?.()
    } catch (error) {
      console.error("Error cancelling subscription:", error)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleSelectRole = async () => {
    if (!selectedRole) {
      setError("Please select a plan")
      return
    }

    let currentUserId = userId
    if (!currentUserId) {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        currentUserId = session.user.id
        setUserId(currentUserId)
      }
    }

    if (!currentUserId) {
      setError("Please log in to continue")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const selectedPlan = ROLE_PLANS.find((p) => p.id === selectedRole)
      if (!selectedPlan) {
        setError("Invalid plan selected")
        setIsLoading(false)
        return
      }

      console.log("[v0] Initializing payment for plan:", {
        planId: selectedPlan.planId,
        planCode: selectedPlan.planCode,
        price: selectedPlan.price,
        userId: currentUserId,
        email: userEmail,
      })

      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          amount: selectedPlan.priceInKobo,
          plan: selectedPlan.planId,
          plan_code: selectedPlan.planCode,
          accountType: selectedPlan.id,
          userId: currentUserId,
          metadata: {
            user_id: currentUserId,
            plan_id: selectedPlan.planId,
            plan_name: selectedPlan.name,
          },
          callback_url: `${window.location.origin}/dashboard?payment=success&plan=${selectedPlan.id}`,
        }),
      })

      const data = await response.json()
      console.log("[v0] Paystack response:", data)

      if (data.success && data.authorization_url) {
        window.location.href = data.authorization_url
      } else if (data.isFree) {
        setShowRoleModal(false)
        onSubscriptionChange?.()
      } else {
        console.log("[v0] API failed, trying direct payment URL")
        if (selectedPlan.paymentUrl) {
          const paymentUrlWithParams = `${selectedPlan.paymentUrl}?email=${encodeURIComponent(userEmail)}&metadata[user_id]=${encodeURIComponent(currentUserId)}&metadata[plan_id]=${encodeURIComponent(selectedPlan.planId)}`
          window.location.href = paymentUrlWithParams
        } else {
          setError(data.message || data.error || "Failed to initialize payment")
        }
      }
    } catch (error) {
      console.error("[v0] Error initializing payment:", error)

      const selectedPlan = ROLE_PLANS.find((p) => p.id === selectedRole)
      if (selectedPlan?.paymentUrl) {
        console.log("[v0] Using fallback payment URL")
        window.location.href = selectedPlan.paymentUrl
      } else {
        setError("Failed to connect to payment service. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>Manage your membership plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active State */}
          {state === "active" && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{subscription?.plan_name || "Pro Plan"}</h3>
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Active
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  R{subscription?.amount || 129}/month
                </Badge>
              </div>

              <div className="mt-4 pt-4 border-t border-green-200 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Next billing date: {formatDate(subscription?.next_payment_date || subscription?.current_period_end)}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="mt-4 w-full border-primary/20 text-primary hover:bg-primary/10 bg-card"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Subscription
              </Button>
            </div>
          )}

          {/* Cancelled State */}
          {state === "cancelled" && (
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{subscription?.plan_name || "Pro Plan"}</h3>
                    <p className="text-sm text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Cancelled
                    </p>
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">Ending Soon</Badge>
              </div>

              <div className="mt-4 pt-4 border-t border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Access until: {formatDate(subscription?.current_period_end)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                  <Clock className="h-4 w-4" />
                  <span>{getDaysUntilExpiry()} days remaining</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                <p className="text-sm text-amber-800">
                  <Info className="h-4 w-4 inline mr-1" />
                  You can choose a new role after your current subscription expires.
                </p>
              </div>

              <Button variant="outline" className="mt-4 w-full bg-gray-100 text-gray-400 cursor-not-allowed" disabled>
                Change Role (Available after expiry)
              </Button>
            </div>
          )}

          {/* Expired/No Subscription State */}
          {state === "expired" && (
            <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Info className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Scout (Free)</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Info className="h-3 w-3" /> Free tier
                    </p>
                  </div>
                </div>
                <Badge className="bg-gray-100 text-gray-600 border-gray-200">Free</Badge>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Upgrade to unlock premium features and get discovered by more clients.
                </p>
              </div>

              <Button
                className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setShowRoleModal(true)}
              >
                Change Role & Subscribe
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Choose Your Role</h2>
                <p className="text-sm text-gray-500">Select a membership plan to continue</p>
              </div>
              <button
                onClick={() => {
                  setShowRoleModal(false)
                  setSelectedRole(null)
                  setError(null)
                }}
                className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ROLE_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedRole(plan.id)}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedRole === plan.id ? "border-primary bg-primary/10" : "border-border hover:border-border/80"
                    }`}
                  >
                    {selectedRole === plan.id && (
                      <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          selectedRole === plan.id ? "bg-primary/20" : "bg-muted"
                        }`}
                      >
                        <plan.icon
                          className={`h-5 w-5 ${selectedRole === plan.id ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{plan.name}</h3>
                        <p className="text-primary font-bold">R{plan.price}/month</p>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleModal(false)
                  setSelectedRole(null)
                  setError(null)
                }}
                className="bg-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSelectRole}
                disabled={!selectedRole || isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue to Payment"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Cancel Subscription?</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to cancel your subscription?</p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-6">
                <h4 className="font-medium text-amber-800 mb-2">What happens next:</h4>
                <ul className="space-y-2 text-sm text-amber-700">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    Your subscription stays active until the current billing period ends
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    After that, you'll be downgraded to Scout (Free)
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    You can choose a new role anytime after expiry
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-white" onClick={() => setShowCancelModal(false)}>
                  Go Back
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Yes, Cancel It"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
