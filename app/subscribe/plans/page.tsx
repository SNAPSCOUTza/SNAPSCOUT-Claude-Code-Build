import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import SubscriptionSelectionInterface from "@/components/subscription/subscription-selection-interface"

export default async function SubscriptionPlansPage() {
  // getCurrentUser() (lib/auth.ts) uses the browser Supabase client, which
  // has no access to cookies during server-side rendering and always
  // returns null here - use the server client directly instead.
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-red-600 mb-3">Subscription Plans</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight text-balance">
            Choose the plan that powers your <span className="text-red-600">growth.</span>
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Join SnapScout and get discovered by the right people, win more work, and grow your business.
          </p>
        </div>

        <SubscriptionSelectionInterface userAccountType="Creator" showComparison={true} />
      </div>
    </div>
  )
}
