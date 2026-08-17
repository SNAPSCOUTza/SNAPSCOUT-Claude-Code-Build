-- app/api/profile/save/route.ts writes profileData.onboarding_data (which
-- carries the studio/store dashboard's package_items, showroom photo, etc.)
-- but this column has never existed on user_profiles, so every save has been
-- silently dropping it via the route's missing-column retry loop.

alter table public.user_profiles
  add column if not exists onboarding_data jsonb not null default '{}'::jsonb;
