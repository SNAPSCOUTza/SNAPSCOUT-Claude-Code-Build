import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import SubscriptionSelectionInterface from "@/components/subscription/subscription-selection-interface"

export default async function SubscriptionPlansPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center">Subscription Plans</h1>
          <p className="text-gray-600 text-center mt-2">
            Choose the perfect plan to showcase your professional profile
          </p>
        </div>

        <SubscriptionSelectionInterface userAccountType="Creator" showComparison={true} />
      </div>
    </div>
  )
}
