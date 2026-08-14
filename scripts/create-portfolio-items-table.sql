-- SnapScout portfolio gallery source of truth and dashboard social fields.
-- Run this in the Supabase SQL editor.

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_platform text not null default 'local'
    check (source_platform in ('local', 'instagram', 'facebook', 'youtube', 'vimeo', 'imdb', 'external')),
  media_type text not null default 'image'
    check (media_type in ('image', 'video', 'embed', 'external')),
  source_url text,
  thumbnail_url text,
  full_media_url text,
  embed_url text,
  title text,
  caption text,
  sort_order integer default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_items enable row level security;

drop policy if exists "Visible portfolio items are public" on public.portfolio_items;
create policy "Visible portfolio items are public"
on public.portfolio_items
for select
using (is_visible = true or auth.uid() = user_id);

drop policy if exists "Owners manage portfolio items" on public.portfolio_items;
create policy "Owners manage portfolio items"
on public.portfolio_items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists idx_portfolio_items_user_visible
on public.portfolio_items(user_id, is_visible, sort_order);

create index if not exists idx_portfolio_items_platform
on public.portfolio_items(source_platform);

alter table public.user_profiles
  add column if not exists instagram text,
  add column if not exists facebook text,
  add column if not exists youtube text,
  add column if not exists vimeo text,
  add column if not exists imdb_profile text,
  add column if not exists linkedin text,
  add column if not exists website text,
  add column if not exists portfolio_images text[] default '{}',
  add column if not exists availability_status text default 'available';
