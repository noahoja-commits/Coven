-- Expose the profile's city on the active_tonight view so the map can place pins
-- approximately by area (neighborhood || city) instead of a random per-user spot.
drop view if exists public.active_tonight;
create view public.active_tonight
with (security_invoker = true) as
  select t.user_id, t.text, t.neighborhood, t.created_at, t.expires_at,
         p.handle, p.avatar, p.avatar_url, p.city
  from public.tonight_pins t
  join public.profiles p on p.id = t.user_id
  where t.expires_at > now();
grant select on public.active_tonight to authenticated;
