-- Gigs stay publicly browsable (including signed-out visitors); posting a gig
-- only requires being signed in (scout accounts are free and are meant to
-- post gigs). Applying to a gig requires an active paid subscription and a
-- non-scout account - enforced here at the database level so the UI-side
-- gate on the apply page can't be bypassed via devtools.

alter table public.gigs enable row level security;
alter table public.gig_applications enable row level security;

drop policy if exists "gigs are publicly readable" on public.gigs;
create policy "gigs are publicly readable"
  on public.gigs for select to anon, authenticated
  using (true);

drop policy if exists "authenticated users can post gigs" on public.gigs;
create policy "authenticated users can post gigs"
  on public.gigs for insert to authenticated
  with check (client_id = auth.uid());

drop policy if exists "gig owners can update their gigs" on public.gigs;
create policy "gig owners can update their gigs"
  on public.gigs for update to authenticated
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

drop policy if exists "gig owners can delete their gigs" on public.gigs;
create policy "gig owners can delete their gigs"
  on public.gigs for delete to authenticated
  using (client_id = auth.uid());

drop policy if exists "applicants and gig owners can read applications" on public.gig_applications;
create policy "applicants and gig owners can read applications"
  on public.gig_applications for select to authenticated
  using (
    freelancer_id = auth.uid()
    or exists (
      select 1 from public.gigs g
      where g.id = gig_applications.gig_id and g.client_id = auth.uid()
    )
  );

drop policy if exists "subscribed non-scout users can apply to gigs" on public.gig_applications;
create policy "subscribed non-scout users can apply to gigs"
  on public.gig_applications for insert to authenticated
  with check (
    freelancer_id = auth.uid()
    and exists (
      select 1 from public.user_subscriptions us
      where us.user_id = auth.uid() and us.status = 'active'
    )
    and not exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid()
        and lower(coalesce(up.account_type, up.user_type, '')) = 'scout'
    )
  );

drop policy if exists "applicants can withdraw their own application" on public.gig_applications;
create policy "applicants can withdraw their own application"
  on public.gig_applications for delete to authenticated
  using (freelancer_id = auth.uid());
