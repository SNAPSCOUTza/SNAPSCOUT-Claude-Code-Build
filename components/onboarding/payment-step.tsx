"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CreditCard, CheckCircle, XCircle, Loader2 } from "lucide-react"
import type { OnboardingData } from "@/types/account-types"
import { supabase } from "@/lib/auth"
import { SUBSCRIPTION_PLANS, getPlanById } from "@/lib/paystack"

interface PaymentStepProps {
  onNext: () => void
  onPrev: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const ACCOUNT_TYPE_TO_PLAN_ID: Record<string, string> = {
  scout: "scout",
  content_creator: "creator-membership",
  creator: "creator-membership",
  film_crew: "crew-membership",
  crew: "crew-membership",
  studio: "studio-membership",
  store: "store-membership",
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string
        email: string
        amount: number
        currency: string
        ref: string
        callback: (response: any) => void
        onClose: () => void
      }) => {
        openIframe: () => void
      }
    }
  }
}

export default function PaymentStep({ onNext, onPrev, data, updateData }: PaymentStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle")

  const accountType = data.accountType || "scout"
  const planId = ACCOUNT_TYPE_TO_PLAN_ID[accountType] || "scout"
  const plan = getPlanById(planId)

  const currentPlan = plan || SUBSCRIPTION_PLANS[0]
  const isFreeAccount = currentPlan.price === 0

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const handleFreeAccountContinue = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase
          .from("user_profiles")
          .update({
            is_verified: true,
            is_profile_visible: true,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)

        if (error) {
          console.error("[v0] Profile update error:", error)
          setError("Failed to activate account")
          return
        }
      }

      setPaymentStatus("success")
      setTimeout(() => onNext(), 1500)
    } catch (err) {
      console.error("[v0] Free account activation error:", err)
      setError("Failed to activate free account")
    } finally {
      setIsLoading(false)
    }
  }

  const initializePayment = async () => {
    setIsLoading(true)
    setError("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.email) {
        setError("Please log in to continue")
        return
      }

      const response = await fetch("/api/paystack/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: currentPlan.id,
          email: user.email,
          userId: user.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to initialize payment")
      }

      if (result.authorization_url) {
        window.location.href = result.authorization_url
      } else {
        throw new Error("No authorization URL received")
      }
    } catch (err) {
      console.error("[v0] Payment initialization error:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize payment")
      setPaymentStatus("idle")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFreeAccount) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-accent mb-4" />
            <CardTitle className="text-3xl font-bold text-foreground">Free Account Activation</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Your Scout account is free! Click below to activate your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
              <h3 className="font-semibold text-accent-foreground mb-2">What you get with Scout (Free):</h3>
              <ul className="space-y-2 text-muted-foreground">
                {currentPlan.features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={onPrev} disabled={isLoading}>
                Back
              </Button>
              <Button
                onClick={handleFreeAccountContinue}
                disabled={isLoading}
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Activating...
                  </>
                ) : (
                  "Activate Free Account"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="text-center">
          <CreditCard className="w-16 h-16 mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-foreground">Complete Your Subscription</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Subscribe to {currentPlan.name} to make your profile live and start getting hired
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {paymentStatus === "success" && (
            <Alert className="border-accent bg-accent/10">
              <CheckCircle className="h-4 w-4 text-accent" />
              <AlertDescription className="text-accent-foreground">
                Payment successful! Your profile is now live. Redirecting...
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">{currentPlan.name}</h3>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                R{currentPlan.price}/{currentPlan.interval}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{currentPlan.description}</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              {currentPlan.features.map((feature, index) => (
                <p key={index}>✓ {feature}</p>
              ))}
            </div>
          </div>

          {paymentStatus === "idle" && (
            <div className="text-center">
              <Button
                onClick={initializePayment}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up payment...
                  </>
                ) : (
                  `Subscribe for R${currentPlan.price}/${currentPlan.interval}`
                )}
              </Button>
            </div>
          )}

          {paymentStatus === "processing" && (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Processing payment...</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={onPrev} disabled={isLoading || paymentStatus === "processing"}>
              Back
            </Button>
            <div className="text-xs text-muted-foreground">Secure payment powered by Paystack</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
