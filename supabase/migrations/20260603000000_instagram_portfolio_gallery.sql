create extension if not exists pgcrypto;

alter table public.user_profiles
  add column if not exists portfolio_source text not null default 'upload';

do $$
begin
  alter table public.user_profiles
    add constraint user_profiles_portfolio_source_check
    check (portfolio_source in ('upload', 'instagram'));
exception
  when duplicate_object then null;
end $$;

create table if not exists public.portfolio_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text,
  image_url text,
  thumbnail_url text,
  title text,
  description text,
  media_type text not null default 'image' check (media_type in ('image', 'video', 'reel')),
  source text not null default 'upload' check (source in ('upload', 'instagram')),
  status text not null default 'visible' check (status in ('visible', 'hidden', 'moderated')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_uploads
  add column if not exists image_url text,
  add column if not exists thumbnail_url text,
  add column if not exists sort_order integer not null default 0;

create table if not exists public.instagram_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  instagram_user_id text,
  instagram_username text,
  username text,
  access_token text,
  access_token_encrypted text,
  token_iv text,
  token_tag text,
  expires_at timestamptz,
  token_expires_at timestamptz,
  status text not null default 'connected' check (status in ('connected', 'expired', 'revoked', 'error')),
  connected_at timestamptz not null default now(),
  last_sync timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.instagram_connections
  add column if not exists instagram_username text,
  add column if not exists access_token_encrypted text,
  add column if not exists token_iv text,
  add column if not exists token_tag text,
  add column if not exists expires_at timestamptz,
  add column if not exists connected_at timestamptz not null default now(),
  add column if not exists last_sync timestamptz,
  add column if not exists last_error text;

do $$
begin
  alter table public.instagram_connections drop constraint if exists instagram_connections_status_check;
  alter table public.instagram_connections
    add constraint instagram_connections_status_check
    check (status in ('connected', 'expired', 'revoked', 'error'));
end $$;

create table if not exists public.instagram_media_cache (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid references public.instagram_connections(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  instagram_media_id text,
  media_id text,
  media_url text,
  thumbnail_url text,
  permalink text,
  caption text,
  media_type text,
  taken_at timestamptz,
  timestamp timestamptz,
  cached_at timestamptz not null default now(),
  last_synced timestamptz not null default now(),
  unique (connection_id, instagram_media_id)
);

alter table public.instagram_media_cache
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists media_id text,
  add column if not exists thumbnail_url text,
  add column if not exists timestamp timestamptz,
  add column if not exists last_synced timestamptz not null default now();

update public.instagram_media_cache
set media_id = coalesce(media_id, instagram_media_id),
    timestamp = coalesce(timestamp, taken_at),
    user_id = coalesce(instagram_media_cache.user_id, c.user_id)
from public.instagram_connections c
where instagram_media_cache.connection_id = c.id;

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_platform text not null default 'local',
  media_type text not null default 'image',
  source_url text,
  thumbnail_url text,
  full_media_url text,
  embed_url text,
  title text,
  caption text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_uploads_user_sort_idx on public.portfolio_uploads(user_id, sort_order, created_at);
create index if not exists instagram_connections_user_status_idx on public.instagram_connections(user_id, status);
create index if not exists instagram_media_cache_user_synced_idx on public.instagram_media_cache(user_id, last_synced desc);
create index if not exists portfolio_items_user_sort_idx on public.portfolio_items(user_id, sort_order, created_at);
create unique index if not exists instagram_media_cache_user_media_uidx
  on public.instagram_media_cache(user_id, coalesce(media_id, instagram_media_id));

alter table public.portfolio_uploads enable row level security;
alter table public.instagram_connections enable row level security;
alter table public.instagram_media_cache enable row level security;
alter table public.portfolio_items enable row level security;

drop policy if exists "public can read visible portfolio uploads" on public.portfolio_uploads;
create policy "public can read visible portfolio uploads"
  on public.portfolio_uploads for select to anon, authenticated
  using (status = 'visible');

drop policy if exists "users can manage own portfolio uploads" on public.portfolio_uploads;
create policy "users can manage own portfolio uploads"
  on public.portfolio_uploads for all to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "users can manage instagram connections" on public.instagram_connections;
create policy "users can manage instagram connections"
  on public.instagram_connections for all to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "public can read active instagram media cache" on public.instagram_media_cache;
create policy "public can read active instagram media cache"
  on public.instagram_media_cache for select to anon, authenticated
  using (
    user_id is not null
    and exists (
      select 1
      from public.user_profiles p
      where p.user_id = instagram_media_cache.user_id
        and p.portfolio_source = 'instagram'
        and coalesce(p.is_public, true) = true
    )
  );

drop policy if exists "users can manage own instagram media cache" on public.instagram_media_cache;
create policy "users can manage own instagram media cache"
  on public.instagram_media_cache for all to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "public can read visible portfolio items" on public.portfolio_items;
create policy "public can read visible portfolio items"
  on public.portfolio_items for select to anon, authenticated
  using (is_visible = true);

drop policy if exists "users can manage own portfolio items" on public.portfolio_items;
create policy "users can manage own portfolio items"
  on public.portfolio_items for all to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));

insert into storage.buckets (id, name, public)
values ('portfolio-uploads', 'portfolio-uploads', true)
on conflict (id) do update set public = true;

drop policy if exists "portfolio uploads are publicly readable" on storage.objects;
create policy "portfolio uploads are publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'portfolio-uploads');

drop policy if exists "users can upload own portfolio objects" on storage.objects;
create policy "users can upload own portfolio objects"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'portfolio-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "users can update own portfolio objects" on storage.objects;
create policy "users can update own portfolio objects"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'portfolio-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'portfolio-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "users can delete own portfolio objects" on storage.objects;
create policy "users can delete own portfolio objects"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'portfolio-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

grant select on public.portfolio_uploads to anon, authenticated;
grant select on public.instagram_media_cache to anon, authenticated;
grant select on public.portfolio_items to anon, authenticated;
grant insert, update, delete on public.portfolio_uploads to authenticated;
grant insert, update, delete on public.instagram_connections to authenticated;
grant insert, update, delete on public.instagram_media_cache to authenticated;
grant insert, update, delete on public.portfolio_items to authenticated;
