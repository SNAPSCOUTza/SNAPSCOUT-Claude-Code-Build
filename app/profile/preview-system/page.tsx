import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import ProfilePreviewSystem from "@/components/profile/profile-preview-system"

export default async function ProfilePreviewSystemPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <ProfilePreviewSystem userId={user.id} />
      </div>
    </div>
  )
}
