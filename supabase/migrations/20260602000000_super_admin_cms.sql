create extension if not exists pgcrypto;

alter table public.user_profiles
  add column if not exists role text not null default 'user',
  add column if not exists suspended boolean not null default false,
  add column if not exists suspended_at timestamptz,
  add column if not exists suspended_reason text;

do $$
begin
  alter table public.user_profiles
    add constraint user_profiles_role_check
    check (role in ('user', 'client', 'scout', 'creator', 'crew', 'studio', 'store', 'admin', 'super_admin'));
exception
  when duplicate_object then null;
end $$;

create unique index if not exists user_profiles_user_id_uidx on public.user_profiles(user_id);
create index if not exists user_profiles_role_idx on public.user_profiles(role);
create index if not exists user_profiles_suspended_idx on public.user_profiles(suspended);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where user_id = (select auth.uid())
      and role in ('admin', 'super_admin')
      and suspended = false
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where user_id = (select auth.uid())
      and role = 'super_admin'
      and suspended = false
  );
$$;

create table if not exists public.advertisements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  placement text not null default 'home',
  image_url text,
  target_url text,
  description text,
  active boolean not null default true,
  start_date timestamptz,
  end_date timestamptz,
  impressions integer not null default 0,
  clicks integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  cover_image_url text,
  category text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  seo_title text,
  seo_description text,
  published_at timestamptz,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  venue text,
  city text,
  starts_at timestamptz,
  ends_at timestamptz,
  image_url text,
  ticket_url text,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.featured_creators (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.user_profiles(user_id) on delete cascade,
  placement text not null default 'explore',
  label text,
  rank integer not null default 0,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (creator_id, placement)
);

create table if not exists public.featured_jobs (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs(id) on delete cascade,
  placement text not null default 'available_gigs',
  label text,
  rank integer not null default 0,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (gig_id, placement)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  reported_user_id uuid references public.user_profiles(user_id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  reason text not null,
  notes text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  assigned_to uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_daily (
  id uuid primary key default gen_random_uuid(),
  metric_date date not null,
  metric_key text not null,
  metric_value numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (metric_date, metric_key)
);

create table if not exists public.admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.instagram_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  instagram_user_id text,
  username text,
  access_token text,
  token_expires_at timestamptz,
  status text not null default 'connected' check (status in ('connected', 'expired', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.portfolio_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  title text,
  description text,
  media_type text not null default 'image' check (media_type in ('image', 'video', 'reel')),
  source text not null default 'upload' check (source in ('upload', 'instagram')),
  status text not null default 'visible' check (status in ('visible', 'hidden', 'moderated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.instagram_media_cache (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.instagram_connections(id) on delete cascade,
  instagram_media_id text not null,
  media_url text,
  permalink text,
  caption text,
  media_type text,
  taken_at timestamptz,
  cached_at timestamptz not null default now(),
  unique (connection_id, instagram_media_id)
);

create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_content (
  id uuid primary key default gen_random_uuid(),
  section text not null unique,
  title text,
  body text,
  image_url text,
  cta_label text,
  cta_url text,
  active boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.advertisements enable row level security;
alter table public.articles enable row level security;
alter table public.events enable row level security;
alter table public.featured_creators enable row level security;
alter table public.featured_jobs enable row level security;
alter table public.reports enable row level security;
alter table public.analytics_daily enable row level security;
alter table public.admin_activity_log enable row level security;
alter table public.instagram_connections enable row level security;
alter table public.portfolio_uploads enable row level security;
alter table public.instagram_media_cache enable row level security;
alter table public.feature_flags enable row level security;
alter table public.homepage_content enable row level security;

drop policy if exists "admins can read profiles" on public.user_profiles;
create policy "admins can read profiles"
  on public.user_profiles for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "super admins can update profiles" on public.user_profiles;
create policy "super admins can update profiles"
  on public.user_profiles for update to authenticated
  using ((select public.is_super_admin()))
  with check ((select public.is_super_admin()));

drop policy if exists "public active advertisements" on public.advertisements;
create policy "public active advertisements"
  on public.advertisements for select to anon, authenticated
  using (active = true and (start_date is null or start_date <= now()) and (end_date is null or end_date >= now()));

drop policy if exists "public published articles" on public.articles;
create policy "public published articles"
  on public.articles for select to anon, authenticated
  using (status = 'published');

drop policy if exists "public published events" on public.events;
create policy "public published events"
  on public.events for select to anon, authenticated
  using (status = 'published');

drop policy if exists "public active featured creators" on public.featured_creators;
create policy "public active featured creators"
  on public.featured_creators for select to anon, authenticated
  using (active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));

drop policy if exists "public active featured jobs" on public.featured_jobs;
create policy "public active featured jobs"
  on public.featured_jobs for select to anon, authenticated
  using (active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));

drop policy if exists "users can manage instagram connections" on public.instagram_connections;
create policy "users can manage instagram connections"
  on public.instagram_connections for all to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "users can manage portfolio uploads" on public.portfolio_uploads;
create policy "users can manage portfolio uploads"
  on public.portfolio_uploads for all to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "users can read instagram media cache" on public.instagram_media_cache;
create policy "users can read instagram media cache"
  on public.instagram_media_cache for select to authenticated
  using (
    exists (
      select 1 from public.instagram_connections c
      where c.id = instagram_media_cache.connection_id
        and (c.user_id = (select auth.uid()) or (select public.is_admin()))
    )
  );

drop policy if exists "admins can manage advertisements" on public.advertisements;
create policy "admins can manage advertisements" on public.advertisements for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins can manage articles" on public.articles;
create policy "admins can manage articles" on public.articles for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins can manage events" on public.events;
create policy "admins can manage events" on public.events for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins can manage featured creators" on public.featured_creators;
create policy "admins can manage featured creators" on public.featured_creators for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins can manage featured jobs" on public.featured_jobs;
create policy "admins can manage featured jobs" on public.featured_jobs for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins can manage reports" on public.reports;
create policy "admins can manage reports" on public.reports for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins can manage analytics daily" on public.analytics_daily;
create policy "admins can manage analytics daily" on public.analytics_daily for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins can manage activity log" on public.admin_activity_log;
create policy "admins can manage activity log" on public.admin_activity_log for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins can manage feature flags" on public.feature_flags;
create policy "admins can manage feature flags" on public.feature_flags for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins can manage homepage content" on public.homepage_content;
create policy "admins can manage homepage content" on public.homepage_content for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

insert into public.feature_flags (key, enabled, description)
values
  ('admin_console', true, 'Enable the hidden SnapScout admin console.'),
  ('instagram_portfolio_imports', false, 'Enable Instagram portfolio import workflows.'),
  ('public_cms_articles', true, 'Show published admin CMS articles publicly.')
on conflict (key) do nothing;
