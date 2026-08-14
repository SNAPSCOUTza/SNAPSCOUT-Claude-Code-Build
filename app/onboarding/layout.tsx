import type React from "react"
import { OnboardingProvider } from "./onboarding-provider"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <OnboardingProvider>{children}</OnboardingProvider>
}
