import { createClient } from "@/lib/supabase/client"

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return "http://localhost:3000"
}

export const supabase = createClient()

export type User = {
  id: string
  email: string
  created_at: string
  email_verified: boolean
}

export const signUp = async (email: string, password: string, displayName: string, accountType: string) => {
  try {
    // Use our custom signup API that bypasses the Supabase email hook
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        display_name: displayName,
        account_type: accountType,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: { message: result.error || "Signup failed" } }
    }

    // After successful signup, sign in the user
    const supabase = createClient()
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      // User was created but couldn't auto-sign in
      console.warn("[v0] Auto sign-in failed:", signInError.message)
      return { data: { user: { id: result.user.id, email: result.user.email } }, error: null }
    }

    return { data: signInData, error: null }
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : "An unexpected error occurred" },
    }
  }
}

export const signIn = async (email: string, password: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export const signOut = async () => {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      if (error.message === "Auth session missing!" || error.message.includes("session")) {
        return { error: null }
      }
      return { error }
    }
    return { error: null }
  } catch (error: any) {
    if (error?.message === "Auth session missing!" || error?.message?.includes("session")) {
      return { error: null }
    }
    return { error }
  }
}

export const getCurrentUser = async () => {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (error: any) {
    return null
  }
}

export const resetPassword = async (email: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getBaseUrl()}/auth/reset-password`,
  })

  return { data, error }
}

export const updatePassword = async (password: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.updateUser({
    password,
  })

  return { data, error }
}
