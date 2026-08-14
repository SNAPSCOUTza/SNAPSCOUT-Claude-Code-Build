-- SnapScout backend audit repair script
-- Run in Supabase SQL Editor. Safe to run more than once.
-- Scope: user_profiles alignment, auth triggers, account_type cleanup, and non-recursive availability RLS.

begin;

create schema if not exists private;

alter table public.user_profiles
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now(),
  add column if not exists email text,
  add column if not exists username text,
  add column if not exists full_name text,
  add column if not exists display_name text,
  add column if not exists account_type text,
  add column if not exists user_type text,
  add column if not exists subscription_status text default 'inactive',
  add column if not exists bio text,
  add column if not exists profession text,
  add column if not exists location text,
  add column if not exists city text,
  add column if not exists profile_picture text,
  add column if not exists profile_image_url text,
  add column if not exists avatar_url text,
  add column if not exists availability text default 'available',
  add column if not exists availability_status text default 'available',
  add column if not exists is_profile_visible boolean default false,
  add column if not exists is_public boolean,
  add column if not exists skills text[] default '{}'::text[],
  add column if not exists portfolio_images text[] default '{}'::text[],
  add column if not exists social_links jsonb default '{}'::jsonb,
  add column if not exists instagram text,
  add column if not exists facebook text,
  add column if not exists youtube text,
  add column if not exists vimeo text,
  add column if not exists imdb_profile text,
  add column if not exists linkedin text,
  add column if not exists instagram_url text,
  add column if not exists youtube_url text,
  add column if not exists vimeo_url text,
  add column if not exists imdb_url text,
  add column if not exists linkedin_url text,
  add column if not exists hourly_rate numeric,
  add column if not exists daily_rate numeric,
  add column if not exists project_rate numeric,
  add column if not exists pricing text,
  add column if not exists onboarding_completed boolean default false;

update public.user_profiles
set
  account_type = case
    when account_type = 'creator' then 'content_creator'
    when account_type is null or btrim(account_type) = '' then 'content_creator'
    when account_type not in ('film_crew', 'content_creator', 'scout', 'studio', 'store') then 'content_creator'
    else account_type
  end,
  user_type = case
    when user_type = 'creator' then 'content_creator'
    when user_type is null or btrim(user_type) = '' then case
      when account_type = 'creator' then 'content_creator'
      when account_type is null or btrim(account_type) = '' then 'content_creator'
      when account_type not in ('film_crew', 'content_creator', 'scout', 'studio', 'store') then 'content_creator'
      else account_type
    end
    else user_type
  end,
  display_name = coalesce(nullif(display_name, ''), nullif(full_name, ''), nullif(username, ''), split_part(email, '@', 1)),
  full_name = coalesce(nullif(full_name, ''), nullif(display_name, ''), nullif(username, ''), split_part(email, '@', 1)),
  username = coalesce(nullif(username, ''), split_part(email, '@', 1)),
  profile_image_url = coalesce(nullif(profile_image_url, ''), nullif(profile_picture, ''), nullif(avatar_url, '')),
  profile_picture = coalesce(nullif(profile_picture, ''), nullif(profile_image_url, ''), nullif(avatar_url, '')),
  avatar_url = coalesce(nullif(avatar_url, ''), nullif(profile_image_url, ''), nullif(profile_picture, '')),
  availability_status = coalesce(nullif(availability_status, ''), nullif(availability, ''), 'available'),
  availability = coalesce(nullif(availability, ''), nullif(availability_status, ''), 'available'),
  is_profile_visible = coalesce(is_profile_visible, is_public, false),
  is_public = coalesce(is_public, is_profile_visible, false),
  skills = coalesce(skills, '{}'::text[]),
  portfolio_images = coalesce(portfolio_images, '{}'::text[]),
  social_links = coalesce(social_links, '{}'::jsonb),
  subscription_status = coalesce(nullif(subscription_status, ''), 'inactive');

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.user_profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%account_type%'
  loop
    execute format('alter table public.user_profiles drop constraint if exists %I', constraint_record.conname);
  end loop;
end $$;

alter table public.user_profiles
  alter column account_type set default 'content_creator';

alter table public.user_profiles
  add constraint user_profiles_account_type_check
  check (account_type in ('film_crew', 'content_creator', 'scout', 'studio', 'store'));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_profiles'::regclass
      and conname = 'user_profiles_user_id_key'
  ) then
    if not exists (
      select 1
      from public.user_profiles
      where user_id is not null
      group by user_id
      having count(*) > 1
    ) then
      alter table public.user_profiles
        add constraint user_profiles_user_id_key unique (user_id);
    else
      raise notice 'Skipped user_profiles_user_id_key because duplicate user_id rows exist.';
    end if;
  end if;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_account_type text;
  normalized_name text;
begin
  normalized_account_type := coalesce(
    nullif(new.raw_user_meta_data ->> 'account_type', ''),
    nullif(new.raw_user_meta_data ->> 'user_type', ''),
    'content_creator'
  );

  if normalized_account_type = 'creator' then
    normalized_account_type := 'content_creator';
  end if;

  if normalized_account_type not in ('film_crew', 'content_creator', 'scout', 'studio', 'store') then
    normalized_account_type := 'content_creator';
  end if;

  normalized_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    split_part(new.email, '@', 1)
  );

  insert into public.user_profiles (
    user_id,
    email,
    username,
    full_name,
    display_name,
    account_type,
    user_type,
    bio,
    profession,
    location,
    city,
    profile_picture,
    profile_image_url,
    avatar_url,
    availability,
    availability_status,
    is_profile_visible,
    is_public,
    skills,
    portfolio_images,
    social_links,
    subscription_status
  )
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    normalized_name,
    normalized_name,
    normalized_account_type,
    normalized_account_type,
    '',
    case
      when normalized_account_type = 'film_crew' then 'Film Crew'
      when normalized_account_type = 'scout' then 'Client'
      when normalized_account_type = 'studio' then 'Studio'
      when normalized_account_type = 'store' then 'Store'
      else 'Creative Professional'
    end,
    '',
    '',
    coalesce(nullif(new.raw_user_meta_data ->> 'avatar_url', ''), ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'avatar_url', ''), ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'avatar_url', ''), ''),
    'available',
    'available',
    false,
    false,
    '{}'::text[],
    '{}'::text[],
    '{}'::jsonb,
    case when normalized_account_type = 'scout' then 'active' else 'inactive' end
  )
  on conflict (user_id) do update
  set
    email = excluded.email,
    username = coalesce(nullif(public.user_profiles.username, ''), excluded.username),
    full_name = coalesce(nullif(public.user_profiles.full_name, ''), excluded.full_name),
    display_name = coalesce(nullif(public.user_profiles.display_name, ''), excluded.display_name),
    account_type = coalesce(public.user_profiles.account_type, excluded.account_type),
    user_type = coalesce(public.user_profiles.user_type, excluded.user_type),
    profession = coalesce(nullif(public.user_profiles.profession, ''), excluded.profession),
    updated_at = now();

  return new;
end;
$$;

create or replace function public.sync_user_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_profiles
  set
    email = new.email,
    updated_at = now()
  where user_id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists sync_user_email_trigger on auth.users;
create trigger sync_user_email_trigger
  after insert or update of email on auth.users
  for each row execute function public.sync_user_email();

alter table public.availability_requests enable row level security;
alter table public.availability_responses enable row level security;

create or replace function private.availability_request_is_mine(request_id_to_check uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.availability_requests ar
    where ar.id = request_id_to_check
      and ar.requester_id = auth.uid()
  );
$$;

create or replace function private.availability_request_sent_to_me(request_id_to_check uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.availability_responses response
    where response.request_id = request_id_to_check
      and response.crew_member_id = auth.uid()
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.availability_request_is_mine(uuid) to authenticated;
grant execute on function private.availability_request_sent_to_me(uuid) to authenticated;

drop policy if exists "Crew can read assigned availability requests" on public.availability_requests;
drop policy if exists "Crew can read their requests" on public.availability_requests;
drop policy if exists "Requester owns availability requests" on public.availability_requests;
drop policy if exists "Requester owns request" on public.availability_requests;
drop policy if exists "availability_requests_owner_manage" on public.availability_requests;
drop policy if exists "availability_requests_crew_read" on public.availability_requests;

drop policy if exists "Crew manages own response" on public.availability_responses;
drop policy if exists "Crew updates own availability response" on public.availability_responses;
drop policy if exists "Requester and crew read availability responses" on public.availability_responses;
drop policy if exists "Requester creates availability responses" on public.availability_responses;
drop policy if exists "Requester reads all responses" on public.availability_responses;
drop policy if exists "Requester creates response rows" on public.availability_responses;
drop policy if exists "Crew reads own response" on public.availability_responses;
drop policy if exists "Crew updates own response" on public.availability_responses;
drop policy if exists "availability_responses_requester_read" on public.availability_responses;
drop policy if exists "availability_responses_crew_read" on public.availability_responses;
drop policy if exists "availability_responses_requester_insert" on public.availability_responses;
drop policy if exists "availability_responses_crew_update" on public.availability_responses;

create policy "availability_requests_owner_manage"
on public.availability_requests
for all
to authenticated
using (auth.uid() = requester_id)
with check (auth.uid() = requester_id);

create policy "availability_requests_crew_read"
on public.availability_requests
for select
to authenticated
using (private.availability_request_sent_to_me(id));

create policy "availability_responses_requester_read"
on public.availability_responses
for select
to authenticated
using (private.availability_request_is_mine(request_id));

create policy "availability_responses_crew_read"
on public.availability_responses
for select
to authenticated
using (auth.uid() = crew_member_id);

create policy "availability_responses_requester_insert"
on public.availability_responses
for insert
to authenticated
with check (private.availability_request_is_mine(request_id));

create policy "availability_responses_crew_update"
on public.availability_responses
for update
to authenticated
using (auth.uid() = crew_member_id)
with check (auth.uid() = crew_member_id);

notify pgrst, 'reload schema';

commit;

-- Optional verification queries:
-- select column_name from information_schema.columns where table_schema = 'public' and table_name = 'user_profiles' order by ordinal_position;
-- select policyname, cmd, qual, with_check from pg_policies where schemaname = 'public' and tablename in ('availability_requests', 'availability_responses') order by tablename, policyname;
-- select tgname, proname from pg_trigger join pg_proc on pg_proc.oid = pg_trigger.tgfoid where tgrelid = 'auth.users'::regclass and not tgisinternal;
