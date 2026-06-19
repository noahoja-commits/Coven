-- Coven migration 0024 — tonight presence: real, cross-user "who's out tonight"
-- pins for the map. Replaces the localStorage-only status with DB-backed state.

create table if not exists public.tonight_pins (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  text         text,
  neighborhood text,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null
);
alter table public.tonight_pins enable row level security;

drop policy if exists tonight_read   on public.tonight_pins;
drop policy if exists tonight_insert on public.tonight_pins;
drop policy if exists tonight_update on public.tonight_pins;
drop policy if exists tonight_delete on public.tonight_pins;
-- everyone signed in can see who's out; the active view filters by expiry.
create policy tonight_read   on public.tonight_pins for select using (true);
create policy tonight_insert on public.tonight_pins for insert with check (user_id = auth.uid());
create policy tonight_update on public.tonight_pins for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tonight_delete on public.tonight_pins for delete using (user_id = auth.uid());
grant select, insert, update, delete on public.tonight_pins to authenticated;

-- Active (non-expired) pins joined to profile identity for the map.
drop view if exists public.active_tonight;
create view public.active_tonight
with (security_invoker = true) as
  select t.user_id, t.text, t.neighborhood, t.created_at, t.expires_at,
         p.handle, p.avatar, p.avatar_url
  from public.tonight_pins t
  join public.profiles p on p.id = t.user_id
  where t.expires_at > now();
grant select on public.active_tonight to authenticated;
