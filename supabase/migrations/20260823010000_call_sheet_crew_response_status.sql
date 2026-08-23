-- Lets a crew member accept/decline the specific call sheet they were sent,
-- separate from (and later than) their earlier availability_responses
-- confirmation. Apply manually via the Supabase SQL editor - see
-- scripts/create-crew-pool-tables.sql, which this table set was originally
-- set up the same way.

ALTER TABLE call_sheet_crew
  ADD COLUMN IF NOT EXISTS response_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (response_status IN ('pending', 'accepted', 'declined')),
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

NOTIFY pgrst, 'reload schema';
