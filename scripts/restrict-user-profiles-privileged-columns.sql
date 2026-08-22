-- Restrict UPDATE on user_profiles to a safe column allowlist, built from
-- whatever columns actually exist on the live table right now - avoids
-- hardcoding a column list that can drift from the real schema.
--
-- Why: the "Users can update own profile" RLS policy (see
-- user-profiles-dashboard-rls.sql) scopes which ROW a user can update
-- (auth.uid() = user_id) but RLS alone doesn't restrict which COLUMNS they
-- touch. Without this, any signed-in user can PATCH their own row directly
-- via the Supabase REST API and set role='super_admin', suspended=false,
-- or subscription_status='active' for free.
--
-- Columns excluded on purpose (only reachable via the super-admin policy in
-- supabase/migrations/20260602000000_super_admin_cms.sql, or the
-- service-role Paystack webhook, never by the row's own owner):
--   role, suspended, suspended_at, suspended_reason, subscription_status,
--   user_id, email, created_at, updated_at, id

begin;

revoke update on public.user_profiles from authenticated;

do $$
declare
  protected_columns text[] := array[
    'id', 'user_id', 'email', 'role', 'suspended', 'suspended_at',
    'suspended_reason', 'subscription_status', 'created_at', 'updated_at'
  ];
  allowed_columns text;
begin
  select string_agg(quote_ident(column_name), ', ')
  into allowed_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'user_profiles'
    and column_name != all(protected_columns);

  execute format(
    'grant update (%s) on public.user_profiles to authenticated',
    allowed_columns
  );

  raise notice 'Granted UPDATE on: %', allowed_columns;
end $$;

commit;

notify pgrst, 'reload schema';

-- Verify afterwards:
-- select grantee, column_name, privilege_type
-- from information_schema.column_privileges
-- where table_schema = 'public' and table_name = 'user_profiles'
--   and grantee = 'authenticated' and privilege_type = 'UPDATE'
-- order by column_name;
