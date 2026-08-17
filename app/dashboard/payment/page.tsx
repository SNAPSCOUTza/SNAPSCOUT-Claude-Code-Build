import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import PaymentFlowManager from "@/components/payment/payment-flow-manager"

export default async function PaymentManagementPage() {
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
        {/* onPaymentSuccess isn't passed here - Server Components can't pass
            function props to Client Components. PaymentFlowManager already
            shows its own success state and refreshes its data internally. */}
        <PaymentFlowManager userId={user.id} />
      </div>
    </div>
  )
}
