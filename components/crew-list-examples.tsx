"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"

// Sample data structure
const crew = [
  { id: 1, name: "John Doe", role: "Assistant Director" },
  { id: 2, name: "Jane Smith", role: "Script Supervisor" },
  { id: 3, name: "James Lee", role: "Assistant Director" },
  { id: 4, name: "Sarah Wilson", role: "Script Supervisor" },
  { id: 5, name: "Mike Johnson", role: "Camera Operator" },
]

// Alternative data without IDs
const crewWithoutIds = [
  { name: "John Doe", role: "Assistant Director" },
  { name: "Jane Smith", role: "Script Supervisor" },
  { name: "James Lee", role: "Assistant Director" },
  { name: "Sarah Wilson", role: "Script Supervisor" },
  { name: "Mike Johnson", role: "Camera Operator" },
]

export default function CrewListExamples() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold text-gray-900">Crew List Key Solutions</h1>

      {/* Solution 1: Use unique ID if available (BEST) */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Solution 1: Use Unique ID (Recommended)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crew.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <User className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
            {`// ✅ BEST: Use unique ID
{crew.map((member) => (
  <div key={member.id}>
    {member.name} - {member.role}
  </div>
))}`}
          </pre>
        </CardContent>
      </Card>

      {/* Solution 2: Combine name + role for composite key */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Solution 2: Composite Key (name + role)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crewWithoutIds.map((member) => (
              <div key={`${member.name}-${member.role}`} className="flex items-center space-x-3 p-3 border rounded-lg">
                <User className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
            {`// ✅ GOOD: Composite key (assuming names are unique)
{crew.map((member) => (
  <div key={\`\${member.name}-\${member.role}\`}>
    {member.name} - {member.role}
  </div>
))}`}
          </pre>
        </CardContent>
      </Card>

      {/* Solution 3: Use index as fallback */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Solution 3: Index Fallback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crewWithoutIds.map((member, index) => (
              <div key={`${member.role}-${index}`} className="flex items-center space-x-3 p-3 border rounded-lg">
                <User className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
            {`// ✅ ACCEPTABLE: Role + index fallback
{crew.map((member, index) => (
  <div key={\`\${member.role}-\${index}\`}>
    {member.name} - {member.role}
  </div>
))}`}
          </pre>
        </CardContent>
      </Card>

      {/* Solution 4: Generate UUID-like keys */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Solution 4: Generated Unique Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crewWithoutIds.map((member, index) => {
              // Generate a simple unique key
              const uniqueKey = `crew-${member.name.replace(/\s+/g, "-").toLowerCase()}-${index}`
              return (
                <div key={uniqueKey} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <User className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {member.role}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
          <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
            {`// ✅ GOOD: Generated unique keys
{crew.map((member, index) => {
  const uniqueKey = \`crew-\${member.name.replace(/\\s+/g, '-').toLowerCase()}-\${index}\`
  return (
    <div key={uniqueKey}>
      {member.name} - {member.role}
    </div>
  )
})}`}
          </pre>
        </CardContent>
      </Card>

      {/* What NOT to do */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">❌ What NOT to Do</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-700 mb-2">❌ Using role as key (causes duplicates)</h4>
              <pre className="p-4 bg-red-100 rounded text-sm text-red-800">
                {`// ❌ BAD: Will cause duplicate key warnings
{crew.map((member) => (
  <div key={member.role}>  {/* Multiple "Assistant Director" keys! */}
    {member.name} - {member.role}
  </div>
))}`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold text-red-700 mb-2">❌ Using only index (bad for performance)</h4>
              <pre className="p-4 bg-red-100 rounded text-sm text-red-800">
                {`// ❌ BAD: Index-only keys can cause rendering issues
{crew.map((member, index) => (
  <div key={index}>  {/* Can cause issues when list changes */}
    {member.name} - {member.role}
  </div>
))}`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold text-red-700 mb-2">❌ Using Math.random() (never stable)</h4>
              <pre className="p-4 bg-red-100 rounded text-sm text-red-800">
                {`// ❌ TERRIBLE: Random keys cause re-renders
{crew.map((member) => (
  <div key={Math.random()}>  {/* New key every render! */}
    {member.name} - {member.role}
  </div>
))}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">🎯 Best Practices Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-green-800">
            <div className="flex items-start space-x-2">
              <span className="font-bold">1.</span>
              <div>
                <strong>Use unique IDs when available</strong> - Database IDs, UUIDs, or other unique identifiers
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold">2.</span>
              <div>
                <strong>Create composite keys</strong> - Combine multiple fields that together are unique
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold">3.</span>
              <div>
                <strong>Use index as fallback</strong> - When no other unique identifier exists
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold">4.</span>
              <div>
                <strong>Keys should be stable</strong> - Same item should have same key across renders
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold">5.</span>
              <div>
                <strong>Keys should be predictable</strong> - Avoid random or changing values
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
