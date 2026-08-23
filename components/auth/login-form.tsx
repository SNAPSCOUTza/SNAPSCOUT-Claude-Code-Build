"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"

type LoginFormProps = {
  // Same device classification the rest of the app uses (see middleware.ts /
  // app/page.tsx): phones get "mobile", everything else - iPad included, by
  // deliberate product decision - gets "desktop". Determined server-side from
  // the request's User-Agent, so this isn't just a viewport-width guess that
  // a landscape-rotated phone could trip.
  isDesktop: boolean
}

const easeInOut = "easeInOut" as const

// Shared stagger container for the form fields - each field just declares
// `variants={fieldVariants}` and inherits timing from its parent instead of
// every field carrying its own hand-picked delay.
const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
}

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeInOut } },
}

export function LoginForm({ isDesktop }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  // Local to this submit, not AuthContext's isLoading - that flag tracks
  // whether the app's initial session check has finished, not whether a
  // login request is in flight, so it doesn't reliably show while this
  // request is actually running.
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    // Show the loading state the instant the user submits, not after the
    // network call resolves - if sign-in fails, this rolls back to the
    // interactive form with the error shown instead of leaving the user
    // watching a spinner with no explanation.
    setIsSubmitting(true)

    try {
      console.log("[v0] Attempting login for:", email)
      await signIn(email, password)

      console.log("[v0] Login successful, user authenticated")
      // Hard navigation, not router.push - a client-side route change
      // doesn't reliably remount AuthProvider to pick up the session that
      // was just established via a different code path (see the matching
      // comment on sign-out in app/dashboard/page.tsx's handleSignOut).
      window.location.href = "/explore"
    } catch (err: any) {
      console.error("[v0] Login error:", err)
      setError(err.message || "An unexpected error occurred")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: [1.06, 1.12, 1.06] }}
        transition={{
          opacity: { duration: 1.1, ease: easeInOut },
          scale: { duration: 22, ease: easeInOut, repeat: Number.POSITIVE_INFINITY },
        }}
      >
        <Image
          src={isDesktop ? "/images/login-bg-desktop.jpg" : "/images/login-bg-mobile.jpg"}
          alt=""
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      <div className="relative w-full max-w-md">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeInOut }}
        >
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Image
              src="/images/snapscout-new-logo.jpeg"
              alt="SnapScout Logo"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full"
            />
            <motion.span
              className="text-2xl font-bold text-foreground"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: easeInOut, delay: 0.15 }}
            >
              SnapScout
            </motion.span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: easeInOut, delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: easeInOut, delay: 0.3 }}
              >
                <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: easeInOut, delay: 0.45 }}
              >
                <CardDescription className="text-center">Sign in to your SnapScout account</CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: easeInOut }}
                    className="flex flex-col items-center justify-center gap-4 py-10"
                  >
                    <div className="relative h-14 w-14">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
                      <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
                      <div
                        className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-t-primary/40"
                        style={{ animationDirection: "reverse", animationDuration: "0.9s" }}
                      />
                    </div>
                    <p className="text-sm font-medium text-foreground">Signing you in...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: easeInOut }}
                  >
                    <motion.form
                      onSubmit={handleSubmit}
                      className="space-y-4"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {error && (
                        <motion.div variants={fieldVariants}>
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        </motion.div>
                      )}

                      <motion.div variants={fieldVariants} className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="pl-10"
                            required
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={fieldVariants} className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-foreground">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </motion.div>

                      <motion.div variants={fieldVariants} className="flex items-center justify-between">
                        <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-primary/80">
                          Forgot password?
                        </Link>
                      </motion.div>

                      <motion.div variants={fieldVariants}>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                          Sign In
                        </Button>
                      </motion.div>
                    </motion.form>

                    <motion.div
                      className="mt-6 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, ease: easeInOut, delay: 0.75 }}
                    >
                      <p className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link href="/onboarding" className="text-primary hover:text-primary/80 font-medium">
                          Sign up
                        </Link>
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: easeInOut, delay: 0.9 }}
        >
          {/* White text on a dark frosted pill, rather than plain
              muted-foreground text, since this sits directly on the busy
              multi-colour illustrated background, not the white card. */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
