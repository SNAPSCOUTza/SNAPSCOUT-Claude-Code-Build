-- Stage 1 hotfix: remove recursive RLS policies between availability_requests
-- and availability_responses.
--
-- Run this in the Supabase SQL editor if you see:
-- "infinite recursion detected in policy for relation availability_responses"

create schema if not exists private;

grant usage on schema private to authenticated;

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

revoke all on function private.availability_request_is_mine(uuid) from public;
revoke all on function private.availability_request_sent_to_me(uuid) from public;
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

-- Verification:
-- select policyname, cmd, qual, with_check
-- from pg_policies
-- where schemaname = 'public'
--   and tablename in ('availability_requests', 'availability_responses')
-- order by tablename, policyname;
