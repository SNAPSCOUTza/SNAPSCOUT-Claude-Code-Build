import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

let supabaseInstance: ReturnType<typeof createSupabaseBrowserClient> | null = null

export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Supabase configuration missing in client; requests may fail until env vars are set")
  }

  if (!supabaseInstance) {
    supabaseInstance = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}

export const createBrowserClient = createClient
export const getSupabaseClient = createClient

export const supabase = createClient()
