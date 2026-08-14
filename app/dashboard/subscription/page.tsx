import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SubscriptionDashboard from "@/components/subscription/subscription-dashboard"

export const dynamic = "force-dynamic"

export default async function SubscriptionPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <SubscriptionDashboard userId={user.id} />
    </div>
  )
}
