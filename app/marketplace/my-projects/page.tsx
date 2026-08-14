"use client"

import { ClientDashboard } from "@/components/marketplace/client-dashboard"

export default function MyProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ClientDashboard />
      </div>
    </div>
  )
}
