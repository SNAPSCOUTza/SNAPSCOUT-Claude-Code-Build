create table if not exists public.shoot_locations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  name text not null,
  address text,
  description text,
  location_type text not null default 'Studio',
  city text not null,
  province text not null,
  cover_image_url text,
  gallery_image_urls text[] not null default '{}',
  safety_rating text not null default 'Medium',
  security_level text not null default 'Standard',
  best_shooting_times text not null default 'Morning',
  parking_availability text not null default 'Limited',
  crowd_levels text not null default 'Moderate',
  indoor_outdoor text not null default 'Indoor',
  permit_required boolean not null default false,
  access_rules text,
  status text not null default 'published',
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  save_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  alter table public.shoot_locations
    add constraint shoot_locations_status_check
    check (status in ('draft', 'pending_review', 'published', 'archived'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.shoot_locations
    add constraint shoot_locations_safety_rating_check
    check (safety_rating in ('Low', 'Medium', 'High'));
exception
  when duplicate_object then null;
end $$;

create index if not exists shoot_locations_status_idx on public.shoot_locations(status);
create index if not exists shoot_locations_city_idx on public.shoot_locations(city);
create index if not exists shoot_locations_created_by_idx on public.shoot_locations(created_by);

create table if not exists public.shoot_location_photos (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.shoot_locations(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  caption text,
  shot_at text,
  camera text,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists shoot_location_photos_location_idx on public.shoot_location_photos(location_id);

create table if not exists public.shoot_location_reviews (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.shoot_locations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null,
  body text not null,
  created_at timestamptz not null default now(),
  unique (location_id, user_id)
);

do $$
begin
  alter table public.shoot_location_reviews
    add constraint shoot_location_reviews_rating_check
    check (rating between 1 and 5);
exception
  when duplicate_object then null;
end $$;

create index if not exists shoot_location_reviews_location_idx on public.shoot_location_reviews(location_id);

create table if not exists public.shoot_location_saves (
  location_id uuid not null references public.shoot_locations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (location_id, user_id)
);

-- Keep aggregate counters on shoot_locations in sync automatically.
create or replace function public.sync_shoot_location_review_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid := coalesce(new.location_id, old.location_id);
begin
  update public.shoot_locations sl
  set
    review_count = stats.review_count,
    rating = coalesce(stats.avg_rating, 0)
  from (
    select count(*) as review_count, avg(rating)::numeric(2,1) as avg_rating
    from public.shoot_location_reviews
    where location_id = target_id
  ) stats
  where sl.id = target_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists shoot_location_reviews_sync_stats on public.shoot_location_reviews;
create trigger shoot_location_reviews_sync_stats
  after insert or update or delete on public.shoot_location_reviews
  for each row execute function public.sync_shoot_location_review_stats();

create or replace function public.sync_shoot_location_save_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid := coalesce(new.location_id, old.location_id);
begin
  update public.shoot_locations sl
  set save_count = (select count(*) from public.shoot_location_saves where location_id = target_id)
  where sl.id = target_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists shoot_location_saves_sync_count on public.shoot_location_saves;
create trigger shoot_location_saves_sync_count
  after insert or delete on public.shoot_location_saves
  for each row execute function public.sync_shoot_location_save_count();

-- Row level security
alter table public.shoot_locations enable row level security;
alter table public.shoot_location_photos enable row level security;
alter table public.shoot_location_reviews enable row level security;
alter table public.shoot_location_saves enable row level security;

drop policy if exists "published locations are publicly readable" on public.shoot_locations;
create policy "published locations are publicly readable"
  on public.shoot_locations for select to anon, authenticated
  using (status = 'published' or created_by = auth.uid());

drop policy if exists "active subscribers can create locations" on public.shoot_locations;
create policy "active subscribers can create locations"
  on public.shoot_locations for insert to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.user_subscriptions us
      where us.user_id = auth.uid() and us.status = 'active'
    )
  );

drop policy if exists "owners can update their locations" on public.shoot_locations;
create policy "owners can update their locations"
  on public.shoot_locations for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "owners can delete their locations" on public.shoot_locations;
create policy "owners can delete their locations"
  on public.shoot_locations for delete to authenticated
  using (created_by = auth.uid());

drop policy if exists "photos on published locations are publicly readable" on public.shoot_location_photos;
create policy "photos on published locations are publicly readable"
  on public.shoot_location_photos for select to anon, authenticated
  using (
    exists (
      select 1 from public.shoot_locations sl
      where sl.id = shoot_location_photos.location_id
        and (sl.status = 'published' or sl.created_by = auth.uid())
    )
  );

drop policy if exists "authenticated users can share photos" on public.shoot_location_photos;
create policy "authenticated users can share photos"
  on public.shoot_location_photos for insert to authenticated
  with check (uploaded_by = auth.uid());

drop policy if exists "uploaders can delete their own photos" on public.shoot_location_photos;
create policy "uploaders can delete their own photos"
  on public.shoot_location_photos for delete to authenticated
  using (uploaded_by = auth.uid());

drop policy if exists "reviews on published locations are publicly readable" on public.shoot_location_reviews;
create policy "reviews on published locations are publicly readable"
  on public.shoot_location_reviews for select to anon, authenticated
  using (
    exists (
      select 1 from public.shoot_locations sl
      where sl.id = shoot_location_reviews.location_id
        and (sl.status = 'published' or sl.created_by = auth.uid())
    )
  );

drop policy if exists "authenticated users can write reviews" on public.shoot_location_reviews;
create policy "authenticated users can write reviews"
  on public.shoot_location_reviews for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "reviewers can update their own review" on public.shoot_location_reviews;
create policy "reviewers can update their own review"
  on public.shoot_location_reviews for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "reviewers can delete their own review" on public.shoot_location_reviews;
create policy "reviewers can delete their own review"
  on public.shoot_location_reviews for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can read their own saves" on public.shoot_location_saves;
create policy "users can read their own saves"
  on public.shoot_location_saves for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can save locations" on public.shoot_location_saves;
create policy "users can save locations"
  on public.shoot_location_saves for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can unsave locations" on public.shoot_location_saves;
create policy "users can unsave locations"
  on public.shoot_location_saves for delete to authenticated
  using (user_id = auth.uid());
