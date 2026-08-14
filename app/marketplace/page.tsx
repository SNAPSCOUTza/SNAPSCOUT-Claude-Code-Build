"use client"

import { ProjectListings } from "@/components/marketplace/project-listings"
import { Button } from "@/components/ui/button"
import { Plus, Briefcase } from "lucide-react"
import Link from "next/link"

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Freelance Marketplace</h1>
              <p className="text-gray-600 max-w-2xl">
                Find the perfect film and photography projects or discover talented freelancers for your next creative
                endeavor.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/marketplace/post-project">
                <Button className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Post Project
                </Button>
              </Link>
              <Link href="/marketplace/my-projects">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Briefcase className="h-4 w-4" />
                  My Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <ProjectListings />
      </div>
    </div>
  )
}
