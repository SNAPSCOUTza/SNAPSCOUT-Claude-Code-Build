"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

// Example of handling duplicate roles in filters
const availableRoles = [
  "Assistant Director",
  "Script Supervisor",
  "Assistant Director", // Duplicate!
  "Camera Operator",
  "Script Supervisor", // Another duplicate!
  "Sound Engineer",
  "Assistant Director", // Yet another!
]

export default function CrewRoleFilter() {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  // Remove duplicates and create unique options
  const uniqueRoles = Array.from(new Set(availableRoles))

  // Count occurrences of each role
  const roleCounts = availableRoles.reduce(
    (acc, role) => {
      acc[role] = (acc[role] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  const clearAll = () => {
    setSelectedRoles([])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Filter Example</CardTitle>
        <p className="text-sm text-gray-600">Handling duplicate roles in filter lists</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Roles */}
        <div>
          <h4 className="font-semibold mb-2">Available Roles:</h4>
          <div className="flex flex-wrap gap-2">
            {uniqueRoles.map((role, index) => (
              <Button
                key={`role-${role}-${index}`} // Safe key even with duplicates
                variant={selectedRoles.includes(role) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleRole(role)}
                className="text-xs"
              >
                {role}
                {roleCounts[role] > 1 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {roleCounts[role]}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Selected Roles */}
        {selectedRoles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Selected Roles:</h4>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedRoles.map((role, index) => (
                <Badge
                  key={`selected-${role}-${index}`} // Unique key with index
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => toggleRole(role)}
                >
                  {role}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Code Example */}
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Code Solution:</h4>
          <pre className="p-4 bg-gray-100 rounded text-sm overflow-x-auto">
            {`// ✅ Remove duplicates first
const uniqueRoles = Array.from(new Set(availableRoles))

// ✅ Then map with safe keys
{uniqueRoles.map((role, index) => (
  <Button key={\`role-\${role}-\${index}\`}>
    {role}
  </Button>
))}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
