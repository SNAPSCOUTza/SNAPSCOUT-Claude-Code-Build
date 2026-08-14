-- Adds availability_status to user_profiles and backfills existing rows.
-- Run in Supabase SQL editor.

begin;

alter table public.user_profiles
  add column if not exists availability_status text default 'available';

update public.user_profiles
set availability_status = coalesce(nullif(trim(availability_status), ''), availability, 'available')
where availability_status is null
   or trim(availability_status) = '';

commit;
