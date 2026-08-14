-- SnapScout feature tables: availability calendar + community feed.
-- Run in the Supabase SQL editor after reviewing your live table names.

begin;

create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  owner_type text not null check (owner_type in ('photographer','videographer','crew','studio','store','gear')),
  date date not null,
  status text not null check (status in ('available','booked','blocked')) default 'available',
  booking_id uuid null,
  note text null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(owner_id, date)
);

create index if not exists availability_owner_date_idx
  on public.availability(owner_id, owner_type, date);

alter table public.availability enable row level security;

drop policy if exists "availability public status read" on public.availability;
create policy "availability public status read"
  on public.availability
  for select
  using (true);

create or replace view public.availability_public as
  select owner_id, owner_type, date, status
  from public.availability;

grant select on public.availability_public to anon, authenticated;

drop policy if exists "availability owner write" on public.availability;
create policy "availability owner write"
  on public.availability
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  headline text not null,
  body text not null,
  category text not null check (category in ('News','Resources','Tutorials','Spotlights','Announcements')),
  cover_image_url text,
  access_level text not null check (access_level in ('preview','subscribers')) default 'preview',
  status text not null check (status in ('draft','published')) default 'draft',
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists community_posts_feed_idx
  on public.community_posts(status, published_at desc);

alter table public.community_posts enable row level security;

drop policy if exists "published community posts are visible" on public.community_posts;
create policy "published community posts are visible"
  on public.community_posts
  for select
  using (status = 'published');

-- Admin writes should go through trusted server-side code with the Supabase service role.
-- Keep direct browser writes disabled so NEXT_PUBLIC_ADMIN_USER_ID is not treated as security.

create or replace function public.mark_availability_from_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  booking_date date;
begin
  -- Adjust these column names to match your bookings table if needed.
  if new.status = 'confirmed' then
    booking_date := coalesce(new.booking_date, new.start_date)::date;

    if booking_date is not null then
      insert into public.availability (owner_id, owner_type, date, status, booking_id)
      values (new.owner_id, coalesce(new.owner_type, 'crew'), booking_date, 'booked', new.id)
      on conflict (owner_id, date) do update
        set status = 'booked',
            booking_id = excluded.booking_id,
            updated_at = now();
    end if;
  end if;

  return new;
end;
$$;

-- Enable only after confirming public.bookings has: id, status, owner_id, owner_type, booking_date/start_date.
-- drop trigger if exists on_confirmed_booking_marks_availability on public.bookings;
-- create trigger on_confirmed_booking_marks_availability
-- after insert or update on public.bookings
-- for each row execute procedure public.mark_availability_from_booking();

commit;
