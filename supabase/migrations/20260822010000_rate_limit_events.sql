-- Generic server-side rate-limit ledger. No Redis/Upstash is configured for
-- this project, and Vercel serverless functions can't reliably hold
-- in-memory counters across invocations (different instance per request,
-- resets on cold start) - Postgres is the store that's actually available
-- and persistent here.
--
-- One row per attempt at a limited action. A caller checks
-- "how many rows for this key in the last N minutes", and inserts a new row
-- for every attempt regardless of whether the attempt itself succeeds -
-- the limiter throttles calls to the endpoint, not just successful ones.

create table if not exists public.rate_limit_events (
  id bigint generated always as identity primary key,
  key text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_key_created_idx
  on public.rate_limit_events (key, created_at desc);

-- Locked down entirely - this table is bookkeeping for server-side checks
-- only, never read or written with the anon/authenticated key.
alter table public.rate_limit_events enable row level security;
revoke all on public.rate_limit_events from anon, authenticated;

notify pgrst, 'reload schema';
