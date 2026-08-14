"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

export interface UserProfile {
  id: string
  user_id: string
  username: string | null
  full_name: string | null
  display_name: string | null
  avatar_url: string | null
  profile_picture: string | null
  profile_image_url?: string | null
  bio: string | null
  account_type: string | null
  user_type?: string | null
  email: string | null
  is_profile_visible: boolean
  is_public?: boolean
  location?: string | null
  city?: string | null
  subscription_status: string | null
  role?: string | null
  suspended?: boolean | null
  created_at: string
  updated_at: string
}

export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  isAuthorized: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, display_name: string, account_type: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const profileCache = new Map<string, { data: UserProfile | null; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute cache

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isLoadingProfile = useRef(false)
  const lastLoadedUserId = useRef<string | null>(null)
  const initialLoadDone = useRef(false)

  const loadProfile = useCallback(
    async (userId: string, force = false) => {
      if (isLoadingProfile.current && !force) {
        console.log("[v0] Profile load already in progress")
        return
      }

      if (!force && lastLoadedUserId.current === userId && profile) {
        console.log("[v0] Profile already loaded for user:", userId)
        return
      }

      const cached = profileCache.get(userId)
      if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log("[v0] Using cached profile")
        setProfile(cached.data)
        lastLoadedUserId.current = userId
        return
      }

      isLoadingProfile.current = true
      console.log("[v0] Loading profile from API for user:", userId)

      try {
        const response = await fetch("/api/profile/load")
        const result = await response.json()

        if (!response.ok) {
          console.error("[v0] Profile load API error:", result.error)
          isLoadingProfile.current = false
          return
        }

        console.log("[v0] Profile loaded successfully:", result.profile ? "found" : "null")

        if (result.profile) {
          profileCache.set(userId, { data: result.profile, timestamp: Date.now() })
          setProfile(result.profile)
          lastLoadedUserId.current = userId
        } else {
          // No profile found - this is expected for new users
          console.log("[v0] No profile found for user, will be created on first save")
          setProfile(null)
          lastLoadedUserId.current = userId
        }
      } catch (error: any) {
        console.error("[v0] Profile load error:", error?.message || error)
      } finally {
        isLoadingProfile.current = false
      }
    },
    [profile],
  )

  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    // Check active session once
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        // Small delay to avoid race condition with getSession
        setTimeout(() => loadProfile(session.user.id), 100)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        lastLoadedUserId.current = null
        profileCache.clear()
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user)
        // Don't reload profile on token refresh
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const signIn = async (email: string, password: string) => {
    console.log("[v0] Signing in user:", email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("[v0] Sign in error:", error.message)
      throw error
    }

    console.log("[v0] Sign in successful, user ID:", data.user?.id)

    if (data.user) {
      setUser(data.user)
      console.log("[v0] User state updated, isAuthenticated is now true")
      await loadProfile(data.user.id, true) // Force refresh on sign in
    }
  }

  const signUp = async (
    email: string,
    password: string,
    display_name: string,
    account_type: string,
  ): Promise<{ error: any }> => {
    try {
      // Use our custom signup API that bypasses the Supabase email hook
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          display_name,
          account_type,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        return { error: { message: result.error || "Signup failed" } }
      }

      // After successful signup, sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // User was created but couldn't auto-sign in - they can sign in manually
        console.warn("[v0] Auto sign-in failed after signup:", signInError.message)
        return { error: null } // Still return success since account was created
      }

      if (signInData.user) {
        setUser(signInData.user)
        await loadProfile(signInData.user.id, true)
      }

      return { error: null }
    } catch (err: any) {
      console.error("[v0] Signup error:", err)
      return { error: { message: err.message || "Signup failed" } }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
    lastLoadedUserId.current = null
    profileCache.clear()
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id, true) // Force refresh
    }
  }

  const isAuthenticated = !!user
  const normalizedType = (profile?.account_type || profile?.user_type || "").toLowerCase()
  const normalizedSubscription =
    profile?.subscription_status || (normalizedType === "scout" ? "active" : "inactive")
  const isAuthorized = isAuthenticated && (normalizedType === "scout" || normalizedSubscription === "active")

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated,
        isAuthorized,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
