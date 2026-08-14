insert into storage.buckets (id, name, public)
values ('admin-assets', 'admin-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "admin assets are publicly readable" on storage.objects;
create policy "admin assets are publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'admin-assets');

drop policy if exists "admins can upload admin assets" on storage.objects;
create policy "admins can upload admin assets"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'admin-assets' and (select public.is_admin()));

drop policy if exists "admins can update admin assets" on storage.objects;
create policy "admins can update admin assets"
  on storage.objects for update to authenticated
  using (bucket_id = 'admin-assets' and (select public.is_admin()))
  with check (bucket_id = 'admin-assets' and (select public.is_admin()));

drop policy if exists "admins can delete admin assets" on storage.objects;
create policy "admins can delete admin assets"
  on storage.objects for delete to authenticated
  using (bucket_id = 'admin-assets' and (select public.is_admin()));

grant select, insert on public.reports to authenticated;

drop policy if exists "users can create moderation reports" on public.reports;
create policy "users can create moderation reports"
  on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()) and status = 'open');

drop policy if exists "users can read own moderation reports" on public.reports;
create policy "users can read own moderation reports"
  on public.reports for select to authenticated
  using (reporter_id = (select auth.uid()) or (select public.is_admin()));
