-- Adds a cover-image concept so a creator can choose which portfolio image
-- represents them in browse grids (previously only the account avatar was
-- shown there, with no way to feature a specific piece of work instead).

alter table public.portfolio_uploads
  add column if not exists is_cover boolean not null default false;

create unique index if not exists portfolio_uploads_one_cover_per_user
  on public.portfolio_uploads(user_id) where is_cover = true;

alter table public.user_profiles
  add column if not exists cover_image_url text;

create or replace function public.sync_creator_cover_image()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
  cover_url text;
begin
  target_user_id := coalesce(new.user_id, old.user_id);

  select image_url into cover_url
  from public.portfolio_uploads
  where user_id = target_user_id and is_cover = true
  limit 1;

  update public.user_profiles
  set cover_image_url = cover_url
  where user_id = target_user_id;

  return null;
end;
$$;

drop trigger if exists portfolio_uploads_sync_cover on public.portfolio_uploads;
create trigger portfolio_uploads_sync_cover
  after insert or update of is_cover or delete on public.portfolio_uploads
  for each row execute function public.sync_creator_cover_image();
