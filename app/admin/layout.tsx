import AdminShell from "@/components/admin/admin-shell"
import { getAdminContext } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getAdminContext()
  return <AdminShell profile={profile}>{children}</AdminShell>
}
