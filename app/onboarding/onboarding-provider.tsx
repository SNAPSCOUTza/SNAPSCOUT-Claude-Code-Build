"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { OnboardingData } from "./page"

interface OnboardingContextType {
  currentStep: number
  onboardingData: OnboardingData
  updateOnboardingData: (updates: Partial<OnboardingData>) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  saveProfile: () => Promise<void>
  isSaving: boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const TOTAL_STEPS = 8

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    userType: null,
    accountType: "",
    email: "",
    password: "",
    displayName: "",
    fullName: "",
    bio: "",
    profilePicture: "",
    city: "",
    provinceCountry: "",
    departments: [],
    roles: [],
    experienceLevel: "",
    yearsExperience: "",
    availability: "Available",
    dailyRate: "",
    hourlyRate: "",
    projectRate: "",
    languagesSpoken: [],
    servicesOffered: [],
    gearOwned: [],
    specialSkills: [],
    specializations: [],
    locationPreferences: [],
    willingToTravel: false,
    socialLinks: { instagram: "", youtube: "", tiktok: "", website: "" },
    imdbProfile: "",
    linkedin: "",
    youtube_vimeo: "",
    selectedRoles: [],
    projectRateMin: "",
    projectRateMax: "",
    equipmentOwned: [],
    certifications: [],
    portfolioUrl: "",
    sampleWorkUrls: [],
    rateStructure: "",
    businessName: "",
    vatRegistered: false,
    contactPreferences: [],
    remoteCapable: false,
    travelWillingness: "local",
  })

  useEffect(() => {
    try {
      const savedState = localStorage.getItem("snapscout-onboarding")
      if (savedState) {
        const { step, data } = JSON.parse(savedState)
        setCurrentStep(step)
        setOnboardingData(data)
      }
    } catch (error) {
      console.error("Failed to parse onboarding state from localStorage", error)
      localStorage.removeItem("snapscout-onboarding")
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const stateToSave = JSON.stringify({ step: currentStep, data: onboardingData })
      localStorage.setItem("snapscout-onboarding", stateToSave)
    }, 500) // Wait 500ms before saving to localStorage

    return () => clearTimeout(timeoutId)
  }, [currentStep, onboardingData])

  const updateOnboardingData = useCallback((updates: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...updates }))
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setCurrentStep(step)
    }
  }, [])

  const saveProfile = async () => {
    setIsSaving(true)
    try {
      console.log("[v0] Onboarding: Starting profile save...")
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated. Please sign in first.")
      }

      console.log("[v0] Onboarding: User authenticated:", user.id)

      const profileToSave = {
        user_id: user.id,
        full_name: onboardingData.fullName || "",
        display_name: onboardingData.displayName || "",
        bio: onboardingData.bio || "",
        profile_picture: onboardingData.profilePicture || "",
        email: user.email || "",

        // Location
        city: onboardingData.city || "",
        province: onboardingData.provinceCountry || "",
        location:
          onboardingData.city && onboardingData.provinceCountry
            ? `${onboardingData.city}, ${onboardingData.provinceCountry}`
            : "",

        // Account type and roles
        account_type: onboardingData.accountType || "",
        user_type: onboardingData.userType || "",
        roles: onboardingData.selectedRoles || [],
        specializations: onboardingData.specializations || [],

        // Experience and availability
        experience_level: onboardingData.experienceLevel || "",
        years_experience: onboardingData.yearsExperience?.toString() || "",
        availability: onboardingData.availability || "Available",
        availability_status: onboardingData.availability?.toLowerCase() || "available",

        // Rates
        daily_rate: onboardingData.dailyRate?.toString() || "",
        hourly_rate: onboardingData.hourlyRate?.toString() || "",
        project_rate: onboardingData.projectRate?.toString() || "",
        project_rate_min: onboardingData.projectRateMin?.toString() || "",
        project_rate_max: onboardingData.projectRateMax?.toString() || "",
        rate_structure: onboardingData.rateStructure || "",

        // Equipment and skills
        equipment_owned: onboardingData.equipmentOwned || [],
        gear_owned: onboardingData.gearOwned || [],
        certifications: onboardingData.certifications || [],
        special_skills: onboardingData.specialSkills || [],
        languages_spoken: onboardingData.languagesSpoken || [],

        // Services (for studios/stores and crew)
        services_offered: onboardingData.servicesOffered || [],
        services_needed: onboardingData.servicesOffered || [], // Same data, different perspective

        // Portfolio
        portfolio_url: onboardingData.portfolioUrl || "",
        sample_work_urls: onboardingData.sampleWorkUrls || [],
        portfolio_images: onboardingData.sampleWorkUrls || [],

        // Business info (for studios/stores)
        business_name: onboardingData.businessName || "",
        vat_registered: onboardingData.vatRegistered || false,
        company_name: onboardingData.businessName || "",

        // Travel and remote work
        contact_preferences: onboardingData.contactPreferences || [],
        remote_capable: onboardingData.remoteCapable || false,
        willing_to_travel: onboardingData.willingToTravel || false,
        travel_willingness: onboardingData.travelWillingness || "local",

        // Social links
        instagram: onboardingData.socialLinks?.instagram || "",
        linkedin: onboardingData.linkedin || "",
        youtube: onboardingData.socialLinks?.youtube || "",
        youtube_vimeo: onboardingData.youtube_vimeo || "",
        website: onboardingData.socialLinks?.website || "",
        website_url: onboardingData.socialLinks?.website || "",
        imdb_profile: onboardingData.imdbProfile || "",

        // Profile status
        onboarding_completed: true,
        is_profile_visible: false, // Default to false until subscription is active
        profile_completion_percentage: 100,
        updated_at: new Date().toISOString(),
      }

      console.log("[v0] Onboarding: Saving profile to database:", profileToSave)

      const { data, error } = await supabase
        .from("user_profiles")
        .upsert(profileToSave, {
          onConflict: "user_id",
          ignoreDuplicates: false,
        })
        .select()

      if (error) {
        console.error("[v0] Onboarding: Database error:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("[v0] Onboarding: Profile saved successfully:", data)

      // Clear localStorage after successful save
      localStorage.removeItem("snapscout-onboarding")

      console.log("[v0] Onboarding: Complete! Redirecting to dashboard...")
    } catch (error) {
      console.error("[v0] Onboarding: Error saving profile:", error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const value = {
    currentStep,
    onboardingData,
    updateOnboardingData,
    nextStep,
    prevStep,
    goToStep,
    saveProfile,
    isSaving,
  }

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}
