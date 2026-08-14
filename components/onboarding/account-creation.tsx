"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, UserPlus, Eye, EyeOff } from "lucide-react"
import type { OnboardingData } from "@/app/onboarding/page"
import { signUp, signIn } from "@/lib/auth"

interface AccountCreationProps {
  onNext: () => void
  onPrev: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

export default function AccountCreation({ onNext, onPrev, data, updateData }: AccountCreationProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignUp = async () => {
    setError("")
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setIsLoading(true)
    const { error: signUpError } = await signUp(data.email, password)

    // We ignore "User already registered" error because we will sign them in next.
    if (signUpError && !signUpError.message.includes("User already registered")) {
      setIsLoading(false)
      setError(signUpError.message)
      return
    }

    // Whether sign up is new or user already existed, we sign in to create a session.
    const { error: signInError } = await signIn(data.email, password)
    setIsLoading(false)

    if (signInError) {
      setError(signInError.message)
    } else {
      updateData({ password })
      onNext()
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-white border-gray-200 shadow-lg">
        <CardHeader className="text-center">
          <UserPlus className="w-12 h-12 mx-auto text-primary" />
          <CardTitle className="text-3xl font-bold text-gray-900 mt-4">Create Your Account</CardTitle>
          <CardDescription className="text-lg text-gray-600">Set up your secure login credentials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold text-gray-800">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-semibold text-gray-800">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-base"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-base font-semibold text-gray-800">
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSignUp}
              disabled={isLoading}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Creating Account...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
