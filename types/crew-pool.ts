export type CrewPool = {
  id: string
  owner_id: string
  name: string
  color: string
  created_at: string
  updated_at: string
  member_count?: number
}

export type CrewPoolMember = {
  id: string
  pool_id: string
  profile_id: string
  saved_at: string
  profile?: CrewProfile
}

export type CrewProfile = {
  id: string
  full_name: string
  role: string
  location: string
  avatar_url?: string | null
  day_rate?: number | null
  skills?: string[]
  rating?: number
  job_count?: number
  is_verified?: boolean
}

export type AvailabilityRequest = {
  id: string
  requester_id: string
  shoot_date: string
  shoot_location?: string
  project_name?: string
  note?: string
  created_at: string
  responses?: AvailabilityResponse[]
}

export type AvailabilityResponse = {
  id: string
  request_id: string
  crew_member_id: string
  status: "pending" | "confirmed" | "declined"
  responded_at?: string
  profile?: CrewProfile
}

export type CallSheet = {
  id: string
  request_id: string
  owner_id: string
  project_name?: string
  shoot_date: string
  shoot_location?: string
  general_call_time: string
  status: "draft" | "sent"
  created_at: string
  crew?: CallSheetCrewEntry[]
  // Present once fetched from the API - true when the current viewer is the
  // producer who created it, false when they're one of the crew it was sent
  // to. Drives whether the page renders edit controls or a read-only view.
  is_owner?: boolean
  owner?: CrewProfile
  // Present only when the viewer is a crew member on this sheet - their own
  // accept/decline status, mirrored from their call_sheet_crew row.
  my_response_status?: "pending" | "accepted" | "declined"
}

export type CallSheetCrewEntry = {
  id: string
  call_sheet_id: string
  crew_member_id: string
  call_time: string
  department?: string
  role?: string
  response_status?: "pending" | "accepted" | "declined"
  responded_at?: string | null
  profile?: CrewProfile
}
