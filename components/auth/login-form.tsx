"use client"

import type React from "react"

import { useState } from "react"
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
      <Image
        src={isDesktop ? "/images/login-bg-desktop.jpg" : "/images/login-bg-mobile.jpg"}
        alt=""
        fill
        priority
        className="object-cover"
      />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Image
              src="/images/snapscout-new-logo.jpeg"
              alt="SnapScout Logo"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full"
            />
            <span className="text-2xl font-bold text-foreground">SnapScout</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">Sign in to your SnapScout account</CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center gap-4 py-10">
                <div className="relative h-14 w-14">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
                  <div
                    className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-t-primary/40"
                    style={{ animationDirection: "reverse", animationDuration: "0.9s" }}
                  />
                </div>
                <p className="text-sm font-medium text-foreground">Signing you in...</p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
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
                  </div>

                  <div className="space-y-2">
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
                  </div>

                  <div className="flex items-center justify-between">
                    <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-primary/80">
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    Sign In
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/onboarding" className="text-primary hover:text-primary/80 font-medium">
                      Sign up
                    </Link>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
