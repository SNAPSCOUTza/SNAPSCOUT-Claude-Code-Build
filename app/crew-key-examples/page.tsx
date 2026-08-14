"use client"

import CrewListExamples from "@/components/crew-list-examples"
import CrewRoleFilter from "@/components/crew-role-filter"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CrewKeyExamplesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center text-red-700 hover:text-red-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <CrewListExamples />
          <CrewRoleFilter />
        </div>
      </div>
    </div>
  )
}
