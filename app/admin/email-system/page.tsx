import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EmailTemplateDesigner from "@/components/email/email-template-designer"
import EmailTriggerSystem from "@/components/email/email-trigger-system"

export default async function EmailSystemPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // In a real app, you'd check if user has admin permissions
  // For now, we'll allow access to demonstrate the system

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Email System Management</h1>
          <p className="text-gray-600 mt-2">Design email templates and manage automated email triggers for SnapScout</p>
        </div>

        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
            <TabsTrigger value="triggers">Trigger System</TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <EmailTemplateDesigner />
          </TabsContent>

          <TabsContent value="triggers">
            <EmailTriggerSystem />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
