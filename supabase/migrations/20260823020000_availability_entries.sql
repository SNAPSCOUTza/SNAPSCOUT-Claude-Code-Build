-- Real backing store for the personal Availability calendar
-- (components/availability/availability-manager.tsx), which previously ran
-- entirely on buildMockAvailability() - deterministic fake data, nothing
-- persisted. Lets accepted call sheets mark a real Booked date, and lets
-- users actually save their own available/blocked dates.
--
-- Scope note: this does NOT touch the public "Available this week" badges
-- shown on crew/studio listing cards (AvailabilityStatusBadge) - those still
-- use the same mock generator. Making every user's public availability
-- real is a separate, larger task.
--
-- Apply manually via the Supabase SQL editor, same as the other crew-pools
-- migrations in this project.

CREATE TABLE IF NOT EXISTS availability_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL DEFAULT 'crew',
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'booked', 'blocked')),
  note TEXT,
  call_sheet_id UUID REFERENCES call_sheets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, date)
);

ALTER TABLE availability_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner manages own availability" ON availability_entries;
CREATE POLICY "Owner manages own availability" ON availability_entries
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_availability_entries_owner ON availability_entries(owner_id);
CREATE INDEX IF NOT EXISTS idx_availability_entries_call_sheet ON availability_entries(call_sheet_id);

NOTIFY pgrst, 'reload schema';
