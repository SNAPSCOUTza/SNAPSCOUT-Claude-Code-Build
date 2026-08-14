"use client"

import { MyApplications } from "@/components/marketplace/my-applications"

export default function MyApplicationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <MyApplications />
      </div>
    </div>
  )
}
