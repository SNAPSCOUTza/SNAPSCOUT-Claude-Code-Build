import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"

// TypeScript interface for crew member data
interface CrewMember {
  id?: string | number
  name: string
  job: string
}

interface CrewListingProps {
  crew: CrewMember[]
  className?: string
}

// Helper function to generate unique keys
const generateUniqueKey = (person: CrewMember, index: number): string => {
  // Use ID if available, otherwise combine job, name, and index for uniqueness
  if (person.id) {
    return `crew-${person.id}`
  }
  return `crew-${person.job}-${person.name}-${index}`
}

// Helper function to group crew members by job title
const groupCrewByJob = (crew: CrewMember[]): Record<string, CrewMember[]> => {
  return crew.reduce(
    (groups, member) => {
      const job = member.job
      if (!groups[job]) {
        groups[job] = []
      }
      groups[job].push(member)
      return groups
    },
    {} as Record<string, CrewMember[]>,
  )
}

export default function CrewListing({ crew, className = "" }: CrewListingProps) {
  // Group crew members by job title
  const groupedCrew = groupCrewByJob(crew)
  const jobTitles = Object.keys(groupedCrew).sort()

  if (crew.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <User className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-center">No crew members listed</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Cast & Crew
          <Badge variant="secondary" className="ml-2">
            {crew.length} {crew.length === 1 ? "member" : "members"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {jobTitles.map((jobTitle) => {
          const jobMembers = groupedCrew[jobTitle]

          return (
            <div key={`job-${jobTitle}`} className="space-y-3">
              {/* Job Title Header */}
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-1">{jobTitle}</h3>
                {jobMembers.length > 1 && (
                  <Badge variant="outline" className="text-xs">
                    {jobMembers.length}
                  </Badge>
                )}
              </div>

              {/* Crew Members for this Job */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 ml-4">
                {jobMembers.map((person, memberIndex) => {
                  // Generate unique key using helper function
                  const uniqueKey = generateUniqueKey(person, crew.indexOf(person))

                  return (
                    <div
                      key={uniqueKey}
                      className="flex items-center gap-2 p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 truncate">{person.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// Example usage component for demonstration
export function CrewListingExample() {
  const sampleCrew: CrewMember[] = [
    { id: 1, name: "John Smith", job: "Assistant Director" },
    { id: 2, name: "Jane Doe", job: "Assistant Director" },
    { id: 3, name: "Mike Johnson", job: "Script Supervisor" },
    { id: 4, name: "Sarah Wilson", job: "Script Supervisor" },
    { id: 5, name: "David Chen", job: "Director of Photography" },
    { id: 6, name: "Emma Rodriguez", job: "Sound Engineer" },
    { id: 7, name: "Alex Thompson", job: "Gaffer" },
    { id: 8, name: "Lisa Park", job: "Script Supervisor" },
    // Example without ID to test fallback key generation
    { name: "Tom Anderson", job: "Assistant Director" },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Crew Listing Demo</h1>
      <CrewListing crew={sampleCrew} />
    </div>
  )
}
