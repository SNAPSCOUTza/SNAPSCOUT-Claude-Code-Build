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

create table if not exists public.instagram_media_selections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null references public.instagram_connections(id) on delete cascade,
  media_cache_id uuid not null references public.instagram_media_cache(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, media_cache_id)
);

create index if not exists instagram_media_selections_user_sort_idx
  on public.instagram_media_selections(user_id, sort_order);

create index if not exists instagram_media_selections_connection_sort_idx
  on public.instagram_media_selections(connection_id, sort_order);

alter table public.instagram_media_selections enable row level security;

drop policy if exists "public can read selected instagram portfolio posts" on public.instagram_media_selections;
create policy "public can read selected instagram portfolio posts"
  on public.instagram_media_selections for select to anon, authenticated
  using (
    user_id is not null
    and exists (
      select 1
      from public.user_profiles p
      where p.user_id = instagram_media_selections.user_id
        and p.portfolio_source = 'instagram'
        and coalesce(p.is_public, true) = true
    )
  );

drop policy if exists "users can manage own selected instagram portfolio posts" on public.instagram_media_selections;
create policy "users can manage own selected instagram portfolio posts"
  on public.instagram_media_selections for all to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));

grant select on public.instagram_media_selections to anon, authenticated;
grant insert, update, delete on public.instagram_media_selections to authenticated;
