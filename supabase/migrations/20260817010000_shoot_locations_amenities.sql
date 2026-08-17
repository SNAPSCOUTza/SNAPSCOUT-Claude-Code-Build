alter table public.shoot_locations
  add column if not exists power_access text not null default 'Unknown',
  add column if not exists bathroom_access text not null default 'Unknown',
  add column if not exists food_nearby text not null default 'Unknown';
