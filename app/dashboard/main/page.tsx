import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import MainDashboard from "@/components/dashboard/main-dashboard"

export default async function MainDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your SnapScout profile and subscription</p>
        </div>

        <MainDashboard userId={user.id} />
      </div>
    </div>
  )
}
