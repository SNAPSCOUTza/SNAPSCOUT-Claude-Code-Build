-- Real review-submission system for user_profiles, replacing the static
-- rating/review_count columns added in 20260818020000_user_profiles_rating_and_indexes.sql
-- (which default to 0 with no way to earn a real rating).
--
-- Eligibility: a reviewer must have a confirmed availability_response tying
-- them to the profile they're reviewing - this is currently the only live,
-- wired-up "these two people actually worked together" signal in the schema
-- (gig_applications and the hire-requests/booking UI are unused/mock-data
-- right now, so nothing eligible to review off of them exists yet). Either
-- side of a confirmed booking can review the other: the requester reviews
-- the crew member's work, and the crew member reviews the requester.
--
-- One review per (profile, reviewer) pair, editable in place - same shape
-- as shoot_location_reviews.

create table if not exists public.profile_reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.user_profiles(user_id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, reviewer_id),
  check (profile_id != reviewer_id)
);

create index if not exists profile_reviews_profile_idx on public.profile_reviews(profile_id);
create index if not exists profile_reviews_reviewer_idx on public.profile_reviews(reviewer_id);

alter table public.profile_reviews enable row level security;

-- SECURITY DEFINER so the eligibility check can read availability_requests/
-- availability_responses regardless of the caller's own RLS visibility into
-- those tables, without opening a recursive policy dependency.
create or replace function private.has_confirmed_booking_with(other_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.availability_responses r
    join public.availability_requests req on req.id = r.request_id
    where r.status = 'confirmed'
      and (
        (req.requester_id = auth.uid() and r.crew_member_id = other_user_id)
        or (r.crew_member_id = auth.uid() and req.requester_id = other_user_id)
      )
  );
$$;

revoke all on function private.has_confirmed_booking_with(uuid) from public;
grant execute on function private.has_confirmed_booking_with(uuid) to authenticated;

drop policy if exists "reviews are publicly readable" on public.profile_reviews;
create policy "reviews are publicly readable"
  on public.profile_reviews for select to anon, authenticated
  using (true);

drop policy if exists "confirmed bookings can leave a review" on public.profile_reviews;
create policy "confirmed bookings can leave a review"
  on public.profile_reviews for insert to authenticated
  with check (
    reviewer_id = (select auth.uid())
    and (select private.has_confirmed_booking_with(profile_id))
  );

drop policy if exists "reviewers can edit their own review" on public.profile_reviews;
create policy "reviewers can edit their own review"
  on public.profile_reviews for update to authenticated
  using (reviewer_id = (select auth.uid()))
  with check (reviewer_id = (select auth.uid()));

drop policy if exists "reviewers can delete their own review" on public.profile_reviews;
create policy "reviewers can delete their own review"
  on public.profile_reviews for delete to authenticated
  using (reviewer_id = (select auth.uid()));

-- Column-level grants: only the fields a reviewer should ever touch.
-- rating/review_count on user_profiles stay off every grant - the trigger
-- below is the only writer, running as table owner.
revoke insert, update on public.profile_reviews from authenticated;
grant insert (profile_id, reviewer_id, rating, body) on public.profile_reviews to authenticated;
grant update (rating, body) on public.profile_reviews to authenticated;
grant select, delete on public.profile_reviews to authenticated;
grant select on public.profile_reviews to anon;

create or replace function public.sync_profile_review_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid := coalesce(new.profile_id, old.profile_id);
begin
  update public.user_profiles up
  set
    review_count = stats.review_count,
    rating = coalesce(stats.avg_rating, 0)
  from (
    select count(*) as review_count, avg(rating)::numeric(2,1) as avg_rating
    from public.profile_reviews
    where profile_id = target_id
  ) stats
  where up.user_id = target_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists profile_reviews_sync_stats on public.profile_reviews;
create trigger profile_reviews_sync_stats
  after insert or update of rating or delete on public.profile_reviews
  for each row execute function public.sync_profile_review_stats();

notify pgrst, 'reload schema';
