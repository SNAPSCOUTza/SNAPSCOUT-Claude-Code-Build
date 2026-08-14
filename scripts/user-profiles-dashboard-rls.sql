-- SnapScout user_profiles dashboard write repair
-- Run this in Supabase SQL Editor after deploying the dashboard field changes.
-- It keeps user_profiles as the single source of truth and fixes owner policies
-- so authenticated users can read and update only their own dashboard row.

begin;

alter table public.user_profiles enable row level security;

alter table public.user_profiles add column if not exists is_public boolean default true;
alter table public.user_profiles add column if not exists is_profile_visible boolean default true;
alter table public.user_profiles add column if not exists skills text[] default '{}'::text[];
alter table public.user_profiles add column if not exists specializations text[] default '{}'::text[];
alter table public.user_profiles add column if not exists roles text[] default '{}'::text[];
alter table public.user_profiles add column if not exists departments text[] default '{}'::text[];
alter table public.user_profiles add column if not exists software_skills text[] default '{}'::text[];
alter table public.user_profiles add column if not exists technical_skills text[] default '{}'::text[];
alter table public.user_profiles add column if not exists photography_skills text[] default '{}'::text[];
alter table public.user_profiles add column if not exists videography_skills text[] default '{}'::text[];
alter table public.user_profiles add column if not exists willing_to_travel boolean default false;
alter table public.user_profiles add column if not exists hourly_rate numeric;
alter table public.user_profiles add column if not exists daily_rate numeric;
alter table public.user_profiles add column if not exists project_rate numeric;
alter table public.user_profiles add column if not exists rate_card_visible boolean default true;
alter table public.user_profiles add column if not exists experience_level text;

drop policy if exists "Public profiles are viewable" on public.user_profiles;
drop policy if exists "Users can insert own profile" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;
drop policy if exists "Users can upsert own profile" on public.user_profiles;
drop policy if exists "Users can view all profiles" on public.user_profiles;
drop policy if exists "Visible profiles are public" on public.user_profiles;
drop policy if exists "Users can read own profile" on public.user_profiles;

create policy "Visible profiles are public"
on public.user_profiles
for select
to anon, authenticated
using (coalesce(is_profile_visible, is_public, false) = true);

create policy "Users can read own profile"
on public.user_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own profile"
on public.user_profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own profile"
on public.user_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select on public.user_profiles to anon, authenticated;
grant insert, update on public.user_profiles to authenticated;

create index if not exists idx_user_profiles_user_id on public.user_profiles(user_id);

commit;

notify pgrst, 'reload schema';
