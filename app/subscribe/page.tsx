"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Crown, ArrowRight, Search } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { SUBSCRIPTION_PLANS, type PlanId } from "@/lib/paystack"
import { motion } from "framer-motion"

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/auth/login")
      } else {
        setUser(currentUser)
      }
    }
    checkUser()
  }, [router])

  const handleSubscribe = async (planId: PlanId) => {
    console.log("[v0] Subscribe button clicked:", { planId, userEmail: user?.email })

    if (!user) {
      console.log("[v0] No user found, redirecting to login")
      router.push("/auth/login")
      return
    }

    if (planId === "scout") {
      console.log("[v0] Scout plan selected, redirecting to dashboard")
      router.push("/dashboard")
      return
    }

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
    console.log("[v0] Plan found:", { planId, planName: plan?.name, hasPaymentUrl: !!plan?.paystackPaymentUrl })

    if (!plan || !plan.paystackPaymentUrl) {
      console.log("[v0] Error: Payment URL not available for plan:", planId)
      setError("Payment page not available for this plan")
      return
    }

    setLoading(planId)
    setError(null)

    console.log("[v0] Redirecting to Paystack payment page:", plan.paystackPaymentUrl)
    window.location.href = plan.paystackPaymentUrl
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-4">Choose Your Membership Plan</h1>
            <p className="text-lg text-muted-foreground">
              Get discovered by clients with your professional profile showcasing your work and expertise
            </p>
          </motion.div>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-4 mb-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-destructive bg-destructive/10">
              <CardHeader>
                <CardTitle className="text-destructive">Subscription Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <section className="pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto items-stretch"
          >
            {SUBSCRIPTION_PLANS.map((plan, index) => {
              const isPopular = plan.id === "creator-membership"
              const isPremium = plan.price >= 400
              const isFree = plan.price === 0

              return (
                <motion.div
                  key={plan.id}
                  variants={cardVariants}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300, damping: 20 },
                  }}
                  className="h-full"
                >
                  <Card
                    className={`relative flex flex-col h-full transition-shadow duration-300 ${
                      isPopular
                        ? "border-2 border-primary shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20"
                        : isFree
                          ? "border-2 border-border shadow-md hover:shadow-lg hover:border-muted-foreground"
                          : "border-2 border-border shadow-md hover:shadow-lg hover:border-primary/30"
                    }`}
                  >
                    {isFree && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                          <Search className="h-3 w-3" />
                          Free Forever
                        </Badge>
                      </div>
                    )}
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="px-3 py-1">Most Popular</Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pt-8">
                      <CardTitle className="text-lg text-foreground">{plan.name}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">{plan.description}</CardDescription>
                      <div className="mt-4">
                        {isFree ? (
                          <span className="text-2xl font-bold text-foreground">Free</span>
                        ) : (
                          <>
                            <span className="text-2xl font-bold text-primary">R{plan.price}</span>
                            <span className="text-muted-foreground text-xs">/{plan.interval}</span>
                          </>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-grow h-full">
                      <div className="space-y-2 flex-grow mb-4">
                        {plan.features.slice(0, 6).map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start space-x-2">
                            <CheckCircle className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 mt-auto">
                        <Button
                          onClick={() => handleSubscribe(plan.id)}
                          className={`w-full font-semibold transition-all duration-200 ${
                            isFree
                              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg"
                          }`}
                          disabled={loading === plan.id}
                        >
                          {loading === plan.id ? "Processing..." : isFree ? "Get Started Free" : "Subscribe Now"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                        {!isFree && <p className="text-xs text-muted-foreground text-center">Cancel anytime</p>}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">What You Get With Every Plan</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Professional Profile</h3>
                <p className="text-muted-foreground text-sm">
                  Your own profile page to showcase your work and get discovered
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Client Discovery</h3>
                <p className="text-muted-foreground text-sm">Get found by clients searching for talent in your area</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Direct Messaging</h3>
                <p className="text-muted-foreground text-sm">
                  Connect directly with potential clients and collaborators
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ or Trust Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Secure payment powered by Paystack • Cancel anytime from your dashboard • No hidden fees
          </p>
        </div>
      </section>
    </div>
  )
}
