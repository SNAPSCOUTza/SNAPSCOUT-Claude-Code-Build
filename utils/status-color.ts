export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "shortlisted":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "hired":
      return "bg-green-100 text-green-800 border-green-200"
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200"
    case "active":
      return "bg-green-100 text-green-800 border-green-200"
    case "completed":
      return "bg-gray-100 text-gray-800 border-gray-200"
    case "in-progress":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}
