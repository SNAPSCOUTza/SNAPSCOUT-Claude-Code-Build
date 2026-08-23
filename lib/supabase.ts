// Re-exports the same singleton as lib/supabase/client.ts rather than
// calling createBrowserClient() again here. Two separate calls each create
// their own GoTrueClient with its own private onAuthStateChange listener
// list - callers using this file's `supabase` (e.g. AuthContext) and
// callers using the other file's `createClient()`/`supabase` (e.g.
// lib/auth.ts) would sign in/out on different in-memory clients that never
// notify each other, even though they share the same underlying session
// cookie. That desync is exactly why signing out via the dashboard left
// the header still showing a logged-in state - AuthContext's listener was
// bound to this file's old, separate client and never heard the
// SIGNED_OUT event.
export { supabase, createClient, createBrowserClient, getSupabaseClient } from "./supabase/client"
