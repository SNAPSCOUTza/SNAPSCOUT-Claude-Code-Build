-- Splits the undifferentiated "creator" account_type into two distinct
-- talent categories so the Creators and Find Crew pages can each show only
-- the profiles that belong there, instead of the exact same unfiltered pool.
-- Existing rows default to 'creator' (matches the current "Creator /
-- Freelancer" account_type label); users can switch to 'crew' from their
-- dashboard.

alter table public.user_profiles
  add column if not exists talent_type text not null default 'creator';

alter table public.user_profiles
  drop constraint if exists user_profiles_talent_type_check;

alter table public.user_profiles
  add constraint user_profiles_talent_type_check check (talent_type in ('creator', 'crew'));
