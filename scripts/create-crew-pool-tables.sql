-- Crew Pool feature tables, RLS policies, and indexes.
-- Run this in the Supabase SQL editor before using the Crew Pools UI.

CREATE TABLE IF NOT EXISTS crew_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#FF5C00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crew_pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES crew_pools(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pool_id, profile_id)
);

CREATE TABLE IF NOT EXISTS availability_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shoot_date DATE NOT NULL,
  shoot_location TEXT,
  project_name TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS availability_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES availability_requests(id) ON DELETE CASCADE,
  crew_member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, crew_member_id)
);

CREATE TABLE IF NOT EXISTS call_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES availability_requests(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT,
  shoot_date DATE NOT NULL,
  shoot_location TEXT,
  general_call_time TEXT DEFAULT '06:00',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_sheet_crew (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sheet_id UUID NOT NULL REFERENCES call_sheets(id) ON DELETE CASCADE,
  crew_member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  call_time TEXT DEFAULT '06:00',
  department TEXT,
  role TEXT,
  UNIQUE(call_sheet_id, crew_member_id)
);

ALTER TABLE crew_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sheet_crew ENABLE ROW LEVEL SECURITY;

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.availability_request_is_mine(request_id_to_check UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.availability_requests
    WHERE id = request_id_to_check
      AND requester_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION private.availability_request_sent_to_me(request_id_to_check UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.availability_responses
    WHERE request_id = request_id_to_check
      AND crew_member_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION private.availability_request_is_mine(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.availability_request_sent_to_me(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.availability_request_is_mine(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.availability_request_sent_to_me(UUID) TO authenticated;

DROP POLICY IF EXISTS "Owner manages pools" ON crew_pools;
CREATE POLICY "Owner manages pools" ON crew_pools
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner manages pool members" ON crew_pool_members;
CREATE POLICY "Owner manages pool members" ON crew_pool_members
  FOR ALL USING (
    pool_id IN (SELECT id FROM crew_pools WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    pool_id IN (SELECT id FROM crew_pools WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Requester owns request" ON availability_requests;
CREATE POLICY "Requester owns request" ON availability_requests
  FOR ALL USING (auth.uid() = requester_id)
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Crew can read their requests" ON availability_requests;
CREATE POLICY "Crew can read their requests" ON availability_requests
  FOR SELECT
  TO authenticated
  USING ((SELECT private.availability_request_sent_to_me(id)));

DROP POLICY IF EXISTS "Requester reads all responses" ON availability_responses;
CREATE POLICY "Requester reads all responses" ON availability_responses
  FOR SELECT
  TO authenticated
  USING ((SELECT private.availability_request_is_mine(request_id)));

DROP POLICY IF EXISTS "Crew manages own response" ON availability_responses;
DROP POLICY IF EXISTS "Crew reads own response" ON availability_responses;
CREATE POLICY "Crew reads own response" ON availability_responses
  FOR SELECT
  TO authenticated
  USING (crew_member_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Crew updates own response" ON availability_responses;
CREATE POLICY "Crew updates own response" ON availability_responses
  FOR UPDATE
  TO authenticated
  USING (crew_member_id = (SELECT auth.uid()))
  WITH CHECK (crew_member_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Requester creates response rows" ON availability_responses;
CREATE POLICY "Requester creates response rows" ON availability_responses
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT private.availability_request_is_mine(request_id)));

DROP POLICY IF EXISTS "Owner manages call sheet" ON call_sheets;
CREATE POLICY "Owner manages call sheet" ON call_sheets
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner manages call sheet crew" ON call_sheet_crew;
CREATE POLICY "Owner manages call sheet crew" ON call_sheet_crew
  FOR ALL USING (
    call_sheet_id IN (SELECT id FROM call_sheets WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    call_sheet_id IN (SELECT id FROM call_sheets WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Crew reads own call sheet entry" ON call_sheet_crew;
CREATE POLICY "Crew reads own call sheet entry" ON call_sheet_crew
  FOR SELECT USING (auth.uid() = crew_member_id);

CREATE INDEX IF NOT EXISTS idx_crew_pools_owner ON crew_pools(owner_id);
CREATE INDEX IF NOT EXISTS idx_crew_pool_members_pool ON crew_pool_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_crew_pool_members_profile ON crew_pool_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_avail_requests_requester ON availability_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_avail_responses_request ON availability_responses(request_id);
CREATE INDEX IF NOT EXISTS idx_avail_responses_crew ON availability_responses(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_call_sheet_owner ON call_sheets(owner_id);
CREATE INDEX IF NOT EXISTS idx_call_sheet_crew_sheet ON call_sheet_crew(call_sheet_id);

NOTIFY pgrst, 'reload schema';
