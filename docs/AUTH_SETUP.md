# SnapScout Authentication System - Setup Guide

## Overview

This authentication system provides:
- **Single session management** - Auth checked once on load, cached in memory
- **Minimal database calls** - Profile fetched once and cached
- **Context-based state** - No prop drilling, accessible anywhere
- **Automatic profile creation** - Database trigger handles profile creation
- **Scout auto-authorization** - Free accounts automatically authorized

## Architecture

### 1. AuthContext Provider (`/contexts/auth-context.tsx`)
Global authentication state management that:
- Checks auth state ONCE on app load
- Fetches user profile ONCE and caches it
- Listens to auth state changes (login/logout)
- Provides auth methods and state via React Context

### 2. Protected Route Wrapper (`/components/auth/protected-route.tsx`)
HOC to protect pages that require authentication:
\`\`\`tsx
<ProtectedRoute>
  <YourProtectedContent />
</ProtectedRoute>
\`\`\`

### 3. Auth Forms (`/components/auth/`)
- `LoginForm` - Email/password login
- `SignupForm` - Account creation with account type selection

### 4. Server Helpers (`/lib/auth-helpers.ts`)
For Server Components and API routes:
- `checkUserAuthorization()` - Full auth check with profile
- `isUserAuthorized()` - Boolean authorization check

## Database Setup

### Automatic Profile Creation Trigger

Run this SQL in your Supabase SQL Editor:

\`\`\`sql
-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    email,
    display_name,
    account_type,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'scout'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
\`\`\`

### RLS Policies (Already Exist)

Your existing policies are good:
- `public_profiles_select` - All authenticated users can view profiles
- `own_profile_update` - Users can update their own profile
- `own_profile_insert` - Users can create their own profile
- `own_profile_delete` - Users can delete their own profile

## Usage

### In Client Components

\`\`\`tsx
"use client"

import { useAuth } from "@/contexts/auth-context"

export function MyComponent() {
  const { user, profile, isLoading, isAuthenticated, isAuthorized } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <LoginPrompt />
  }

  return (
    <div>
      <h1>Welcome, {profile?.display_name}!</h1>
      <p>Account Type: {profile?.account_type}</p>
      <p>Authorized: {isAuthorized ? 'Yes' : 'No'}</p>
    </div>
  )
}
\`\`\`

### In Server Components

\`\`\`tsx
import { checkUserAuthorization } from "@/lib/auth-helpers"
import { redirect } from 'next/navigation'

export default async function ServerPage() {
  const { authorized, profile } = await checkUserAuthorization()

  if (!authorized) {
    redirect("/auth/login")
  }

  return (
    <div>
      <h1>Welcome, {profile.display_name}!</h1>
    </div>
  )
}
\`\`\`

### Protecting Pages

\`\`\`tsx
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  )
}
\`\`\`

## Performance Optimizations

### Before (Multiple Calls per Page Load)
1. Middleware: `getUser()` 
2. Header: `getCurrentUser()`
3. Dashboard: `getUser()` + `user_profiles` query + `user_subscriptions` query
4. **Total: 5+ database queries per page load**

### After (Single Call on App Load)
1. AuthContext: `getUser()` + `user_profiles` query (once on mount)
2. All components: Read from cached context
3. **Total: 2 database queries on app load, 0 on navigation**

## Authorization Logic

\`\`\`typescript
// Scout accounts: Always authorized (free)
const isScout = profile.account_type === "scout"

// Other accounts: Require active subscription
const hasActiveSubscription = profile.subscription_status === "active"

// Final authorization
const isAuthorized = isScout || hasActiveSubscription
\`\`\`

## Migration from Old System

### Replace Direct Auth Calls
\`\`\`tsx
// OLD
const user = await getCurrentUser()
const { data: profile } = await supabase.from("user_profiles").select("*")

// NEW
const { user, profile } = useAuth()
\`\`\`

### Remove localStorage Dependencies
\`\`\`tsx
// OLD
const demoProfile = localStorage.getItem("snapscout-demo-profile")

// NEW
const { profile } = useAuth() // Always fresh from context
\`\`\`

### Remove Multiple Auth Listeners
\`\`\`tsx
// OLD
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(...)
  return () => subscription.unsubscribe()
}, [])

// NEW
// Nothing needed - AuthProvider handles this globally
\`\`\`

## Troubleshooting

### "User is null" in components
- Make sure `<AuthProvider>` wraps your app in `app/layout.tsx`
- Check that you're using `useAuth()` inside the provider tree

### Profile not loading
- Verify the database trigger is installed
- Check Supabase logs for profile creation errors
- Ensure RLS policies allow profile reads

### Infinite redirects
- Check middleware public routes configuration
- Verify protected route logic doesn't conflict with middleware

## Best Practices

1. **Always use AuthContext in Client Components**
   - Don't call Supabase auth directly
   - Don't fetch user/profile separately

2. **Use Server Helpers for Server Components**
   - Import from `lib/auth-helpers.ts`
   - These make fresh database calls (not cached)

3. **Minimize Auth Checks**
   - Let middleware handle route protection
   - Use context state instead of re-checking auth

4. **Cache Profile Updates**
   - Call `refreshProfile()` after profile edits
   - Context will update automatically

## Environment Variables

Required in `.env.local` or Vercel:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

## Summary

This optimized auth system:
- ✅ Authenticates user ONCE on login
- ✅ Stores session globally in React Context
- ✅ NO repeated user_id checks on every table access
- ✅ Uses Supabase RLS policies for access control
- ✅ Minimizes database calls (2 on load vs 5+ per page)
- ✅ No timeouts from excessive authentication checks
- ✅ Automatic profile creation via database trigger
- ✅ Scout accounts automatically authorized
