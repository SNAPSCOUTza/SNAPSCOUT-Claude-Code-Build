import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import PaymentFlowManager from "@/components/payment/payment-flow-manager"

export default async function PaymentManagementPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <PaymentFlowManager
          userId={user.id}
          onPaymentSuccess={() => {
            // Redirect to dashboard or show success message
            window.location.href = "/dashboard"
          }}
        />
      </div>
    </div>
  )
}
