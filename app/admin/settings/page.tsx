import AdminResourceManager from "@/components/admin/admin-resource-manager"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-5">
      <AdminResourceManager resource="feature_flags" />
      <AdminResourceManager resource="homepage_content" />
    </div>
  )
}
