"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Eye, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { getStatusColor } from "@/utils/status-color"
import { applications, project } from "@/data"
import { sendHiredNotification } from "@/utils/notifications"
import { onUpdateApplicationStatus } from "@/utils/application-status"

const ClientDashboard = () => {
  return (
    <div>
      {applications.map((application) => (
        <div key={application.id} className="bg-white border rounded-lg p-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              {/* Added clickable profile picture and name */}
              <Link href={`/profile/${application.freelancer?.id}`} className="flex-shrink-0">
                <img
                  src={application.freelancer?.profile_picture || "/placeholder.svg"}
                  alt={application.freelancer?.display_name}
                  className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-red-500 transition-all cursor-pointer"
                />
              </Link>
              <div className="flex-1">
                <Link
                  href={`/profile/${application.freelancer?.id}`}
                  className="font-medium text-gray-900 hover:text-red-600 transition-colors cursor-pointer"
                >
                  {application.freelancer?.display_name}
                </Link>
                <p className="text-sm text-gray-600">{application.freelancer?.primary_role}</p>
                {application.freelancer?.city && <p className="text-xs text-gray-500">{application.freelancer.city}</p>}
              </div>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(application.status)}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </Badge>
              {application.proposed_rate && (
                <p className="text-sm text-green-600 mt-1">R{application.proposed_rate.toLocaleString()}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{application.cover_message}</p>

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Applied {formatDistanceToNow(new Date(application.created_at))} ago
            </span>
            <div className="flex gap-2">
              {/* Added View Profile button */}
              <Link href={`/profile/${application.freelancer?.id}`}>
                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Eye className="h-4 w-4 mr-1" />
                  View Profile
                </Button>
              </Link>
              {application.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateApplicationStatus(application.id, "shortlisted")}
                  >
                    Shortlist
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      onUpdateApplicationStatus(application.id, "hired")
                      // Send notification when hiring applicant
                      sendHiredNotification(application.freelancer?.id, project.title)
                    }}
                  >
                    Hire
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onUpdateApplicationStatus(application.id, "rejected")}
                  >
                    Reject
                  </Button>
                </>
              )}
              {application.status === "shortlisted" && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      onUpdateApplicationStatus(application.id, "hired")
                      // Send notification when hiring applicant
                      sendHiredNotification(application.freelancer?.id, project.title)
                    }}
                  >
                    Hire
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onUpdateApplicationStatus(application.id, "rejected")}
                  >
                    Reject
                  </Button>
                </>
              )}
              {application.status === "hired" && (
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Contact
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export { ClientDashboard }
export default ClientDashboard
