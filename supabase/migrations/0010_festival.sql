-- Coven migration 0010 — festival mode.
-- A host uploads a venue map image and drops labeled amenity pins; 30 min before
-- the show, ticket holders' Map tab becomes the venue map.

-- Precise start time for the 30-minute trigger (event_time is free text, unusable).
alter table public.events add column if not exists starts_at timestamptz;
alter table public.events add column if not exists ends_at   timestamptz;

-- One venue map per event (image lives in the public 'venue-maps' storage bucket).
create table if not exists public.venue_maps (
  event_id   uuid primary key references public.events(id) on delete cascade,
  image_url  text not null,
  created_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

-- Amenity pins placed on the map. x/y are 0..1 relative to the image.
create table if not exists public.venue_pins (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  kind       text not null check (kind in ('stage','food','bathroom','medical','water','exit','entrance','merch','bar','info')),
  label      text default '',
  x          real not null,
  y          real not null,
  created_at timestamptz not null default now()
);
create index if not exists venue_pins_event_idx on public.venue_pins (event_id);

alter table public.venue_maps enable row level security;
alter table public.venue_pins enable row level security;

-- Map data is not sensitive; the ticket-holder gate is a client-side experience
-- gate. Read open; only the event's host can author.
drop policy if exists venue_maps_read   on public.venue_maps;
drop policy if exists venue_maps_write   on public.venue_maps;
drop policy if exists venue_maps_update  on public.venue_maps;
drop policy if exists venue_maps_delete  on public.venue_maps;
create policy venue_maps_read   on public.venue_maps for select using (true);
create policy venue_maps_write  on public.venue_maps for insert with check (exists (select 1 from public.events e where e.id = event_id and e.host_id = auth.uid()));
create policy venue_maps_update on public.venue_maps for update using (exists (select 1 from public.events e where e.id = event_id and e.host_id = auth.uid()));
create policy venue_maps_delete on public.venue_maps for delete using (exists (select 1 from public.events e where e.id = event_id and e.host_id = auth.uid()));

drop policy if exists venue_pins_read   on public.venue_pins;
drop policy if exists venue_pins_write   on public.venue_pins;
drop policy if exists venue_pins_update  on public.venue_pins;
drop policy if exists venue_pins_delete  on public.venue_pins;
create policy venue_pins_read   on public.venue_pins for select using (true);
create policy venue_pins_write  on public.venue_pins for insert with check (exists (select 1 from public.events e where e.id = event_id and e.host_id = auth.uid()));
create policy venue_pins_update on public.venue_pins for update using (exists (select 1 from public.events e where e.id = event_id and e.host_id = auth.uid()));
create policy venue_pins_delete on public.venue_pins for delete using (exists (select 1 from public.events e where e.id = event_id and e.host_id = auth.uid()));

grant select, insert, update, delete on public.venue_maps to authenticated;
grant select, insert, update, delete on public.venue_pins to authenticated;

-- Public storage bucket for venue map images.
insert into storage.buckets (id, name, public)
  values ('venue-maps', 'venue-maps', true)
  on conflict (id) do nothing;

drop policy if exists "venue maps public read" on storage.objects;
drop policy if exists "venue maps auth write"  on storage.objects;
create policy "venue maps public read" on storage.objects for select using (bucket_id = 'venue-maps');
create policy "venue maps auth write"  on storage.objects for insert to authenticated with check (bucket_id = 'venue-maps');

-- Which events the current user holds a paid ticket for (drives the festival trigger).
create or replace function public.my_ticket_event_ids()
returns table (event_id uuid)
language sql stable security definer set search_path = public as $$
  select distinct t.event_id from public.tickets t
  where t.buyer_id = auth.uid() and t.status = 'paid';
$$;
grant execute on function public.my_ticket_event_ids() to authenticated;
