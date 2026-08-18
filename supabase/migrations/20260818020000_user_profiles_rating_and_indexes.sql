-- Real, stable rating columns for user_profiles, replacing the
-- Math.random()-generated rating/reviews that browse-page mappers were
-- fabricating on every request (same profile showed a different rating on
-- every reload). Mirrors shoot_locations' rating/review_count shape.
-- No review-submission system exists yet, so these just default to 0 and
-- the UI shows "New" until real reviews are built.

alter table public.user_profiles
  add column if not exists rating numeric(2,1) not null default 0,
  add column if not exists review_count integer not null default 0;

-- Composite partial indexes matching the exact WHERE + ORDER BY shape used
-- by the Creators, Find Crew, and Studios & Stores browse queries (all of
-- which filter on is_profile_visible = true first). A partial index scoped
-- to that condition is smaller and faster than indexing every row.
create index if not exists user_profiles_visible_talent_created_idx
  on public.user_profiles (is_profile_visible, talent_type, created_at desc)
  where is_profile_visible = true;

create index if not exists user_profiles_visible_account_created_idx
  on public.user_profiles (is_profile_visible, account_type, created_at desc)
  where is_profile_visible = true;
