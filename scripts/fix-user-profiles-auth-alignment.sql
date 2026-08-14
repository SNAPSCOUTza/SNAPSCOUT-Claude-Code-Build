-- Align user_profiles with live signup payloads and auth context expectations.
-- Run this in Supabase SQL editor.

begin;

alter table public.user_profiles
  drop constraint if exists user_profiles_account_type_check;

alter table public.user_profiles
  add constraint user_profiles_account_type_check
  check (account_type in ('film_crew', 'content_creator', 'scout', 'studio', 'store'));

alter table public.user_profiles
  add column if not exists subscription_status text default 'inactive',
  add column if not exists account_type text,
  add column if not exists email text,
  add column if not exists display_name text,
  add column if not exists profile_image_url text,
  add column if not exists availability_status text default 'available',
  add column if not exists username text;

update public.user_profiles
set profile_image_url = coalesce(profile_image_url, profile_picture)
where profile_image_url is null;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    user_id,
    email,
    display_name,
    full_name,
    account_type,
    user_type,
    subscription_status,
    availability,
    availability_status,
    is_profile_visible
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'display_name'),
    new.raw_user_meta_data ->> 'account_type',
    new.raw_user_meta_data ->> 'account_type',
    case
      when lower(coalesce(new.raw_user_meta_data ->> 'account_type', '')) = 'scout' then 'active'
      else 'inactive'
    end,
    'available',
    'available',
    false
  )
  on conflict (user_id) do update
    set email = excluded.email,
        display_name = coalesce(public.user_profiles.display_name, excluded.display_name),
        full_name = coalesce(public.user_profiles.full_name, excluded.full_name),
        account_type = coalesce(public.user_profiles.account_type, excluded.account_type),
        user_type = coalesce(public.user_profiles.user_type, excluded.user_type);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

commit;
