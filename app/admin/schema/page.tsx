import DatabaseSchemaManager from "@/components/admin/database-schema-manager"

export const dynamic = "force-dynamic"

export default async function SchemaManagementPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <DatabaseSchemaManager />
    </div>
  )
}
