-- Real map proximity, privacy-fuzzed. Precise coords are owner-locked here and NEVER
-- exposed to anyone else: this table has no public read and is NOT in the realtime
-- publication. Other users get location ONLY through tonight_nearby() below, which
-- returns coords snapped to each pin's own broadcast radius + a coarse bucketed distance.

create table if not exists public.tonight_geo (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  latitude   double precision not null,
  longitude  double precision not null,
  fuzz_m     integer not null default 1609,  -- broadcast radius in meters (~1 mi default)
  updated_at timestamptz not null default now()
);

alter table public.tonight_geo enable row level security;

drop policy if exists tg_select on public.tonight_geo;
drop policy if exists tg_insert on public.tonight_geo;
drop policy if exists tg_update on public.tonight_geo;
drop policy if exists tg_delete on public.tonight_geo;

-- Owner-only, every operation. No public read. (Do NOT add this table to supabase_realtime.)
create policy tg_select on public.tonight_geo for select using (user_id = auth.uid());
create policy tg_insert on public.tonight_geo for insert with check (user_id = auth.uid());
create policy tg_update on public.tonight_geo for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tg_delete on public.tonight_geo for delete using (user_id = auth.uid());

-- The ONLY way other users see location: snapped-to-radius coords + a 0.5mi-bucketed
-- distance. Raw latitude/longitude never appear in the result. SECURITY DEFINER so it
-- can read the owner-locked table, but it only emits fuzzed values.
create or replace function public.tonight_nearby(my_lat double precision, my_lng double precision)
returns table(user_id uuid, handle text, avatar text, avatar_url text, status text,
              neighborhood text, city text, fuzz_lat double precision, fuzz_lng double precision,
              distance_mi double precision)
language sql stable security definer set search_path = public as $$
  with cell as (select greatest(g.fuzz_m, 250) as m, g.* from public.tonight_geo g)
  select c.user_id, p.handle, p.avatar, p.avatar_url, t.text, t.neighborhood, p.city,
         -- snap to a deterministic grid the size of THIS pin's chosen radius
         -- (no per-call jitter, so repeated calls can't be averaged out). cell_deg = m/111320.
         round(c.latitude  / (c.m / 111320.0)) * (c.m / 111320.0) as fuzz_lat,
         round(c.longitude / (c.m / 111320.0)) * (c.m / 111320.0) as fuzz_lng,
         -- coarse 0.5mi bucket so exact distance can't triangulate the fuzzed point
         round((3959 * acos(least(1, greatest(-1,
           cos(radians(my_lat)) * cos(radians(c.latitude)) * cos(radians(c.longitude) - radians(my_lng))
           + sin(radians(my_lat)) * sin(radians(c.latitude)))))) * 2) / 2.0 as distance_mi
  from cell c
  join public.tonight_pins t on t.user_id = c.user_id and t.expires_at > now()
  join public.profiles p on p.id = c.user_id
  where c.user_id <> auth.uid()
  order by distance_mi asc
$$;

grant execute on function public.tonight_nearby(double precision, double precision) to authenticated;
