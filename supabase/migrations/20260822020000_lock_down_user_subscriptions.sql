-- user_subscriptions had RLS enabled with row-scoping (auth.uid() = user_id)
-- but nothing stopped a user from INSERTing/UPDATEing their own row - live
-- testing confirmed RLS let a self-granted {"status":"active"} write past
-- the identity check, only blocked by an unrelated NOT-NULL constraint on
-- subscription_id. This table should never be client-writable at all: every
-- legitimate write already goes through the Paystack webhook's service-role
-- client (which bypasses RLS/grants entirely), so there is no real insert/
-- update path this would break.
--
-- REVOKE at the privilege level is authoritative regardless of what RLS
-- policies already exist on this table (unknown - it predates any migration
-- file in this repo) - Postgres checks table-level grants before evaluating
-- RLS, so no existing policy can grant the privilege back.

revoke insert, update, delete on public.user_subscriptions from authenticated, anon;

-- Keep read access working: a user can still see their own subscription
-- status in the UI. Idempotent since the existing policy's name is unknown.
drop policy if exists "users can view own subscription" on public.user_subscriptions;
create policy "users can view own subscription"
  on public.user_subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);

notify pgrst, 'reload schema';
