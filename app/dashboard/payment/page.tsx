import { redirect } from "next/navigation"

// This page duplicated the dashboard's Subscription tab and had drifted out
// of sync with it (wrong hardcoded pricing). Send visitors to the one real,
// maintained subscription flow instead of keeping two in parallel.
export default function PaymentManagementPage() {
  redirect("/dashboard?section=subscription")
}
