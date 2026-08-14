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
}

export type CallSheetCrewEntry = {
  id: string
  call_sheet_id: string
  crew_member_id: string
  call_time: string
  department?: string
  role?: string
  profile?: CrewProfile
}
