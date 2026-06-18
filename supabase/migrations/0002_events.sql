-- Coven migration 0002 — real multi-user events + RSVPs.
-- (0001 = the initial schema.sql.) Safe to re-run.

create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  host_id      uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  venue        text default '',
  neighborhood text default '',
  city         text default '',
  event_date   date,
  event_time   text default '',
  cover        text not null default 'red',   -- red|violet|black gradient key
  tags         text[] not null default '{}',
  description  text default '',
  created_at   timestamptz not null default now()
);
create index if not exists events_date_idx    on public.events (event_date);
create index if not exists events_created_idx  on public.events (created_at desc);

create table if not exists public.event_rsvps (
  event_id    uuid not null references public.events(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (event_id, user_id)
);
create index if not exists event_rsvps_user_idx on public.event_rsvps (user_id);

-- Events joined to host handle + going count (the read path the client uses).
create or replace view public.event_feed as
select
  e.id, e.host_id, e.name, e.venue, e.neighborhood, e.city,
  e.event_date, e.event_time, e.cover, e.tags, e.description, e.created_at,
  pr.handle as host_handle,
  pr.avatar as host_avatar,
  coalesce(r.cnt, 0) as going
from public.events e
join public.profiles pr on pr.id = e.host_id
left join (
  select event_id, count(*) as cnt from public.event_rsvps group by event_id
) r on r.event_id = e.id;

grant select on public.event_feed to anon, authenticated;

-- RSVP'd attendees joined to handle/avatar (for an event's "who's going").
create or replace function public.event_attendees(p_event_id uuid)
returns table (user_id uuid, handle text, avatar text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select rs.user_id, pr.handle, pr.avatar, rs.created_at
  from public.event_rsvps rs
  join public.profiles pr on pr.id = rs.user_id
  where rs.event_id = p_event_id
  order by rs.created_at desc
$$;
grant execute on function public.event_attendees(uuid) to anon, authenticated;

alter table public.events      enable row level security;
alter table public.event_rsvps enable row level security;

drop policy if exists events_read   on public.events;
drop policy if exists events_insert on public.events;
drop policy if exists events_update on public.events;
drop policy if exists events_delete on public.events;
create policy events_read   on public.events for select using (true);
create policy events_insert on public.events for insert with check (host_id = auth.uid());
create policy events_update on public.events for update using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy events_delete on public.events for delete using (host_id = auth.uid());

drop policy if exists rsvps_read   on public.event_rsvps;
drop policy if exists rsvps_insert on public.event_rsvps;
drop policy if exists rsvps_delete on public.event_rsvps;
create policy rsvps_read   on public.event_rsvps for select using (true);
create policy rsvps_insert on public.event_rsvps for insert with check (user_id = auth.uid());
create policy rsvps_delete on public.event_rsvps for delete using (user_id = auth.uid());
