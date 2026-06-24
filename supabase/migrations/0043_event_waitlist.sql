-- Event waitlist: when a ticketed rite sells out, let souls join a waitlist.
-- (Uses the (select auth.uid()) initplan form from the start — see 0042.)

create table if not exists public.event_waitlist (
  event_id   uuid not null references public.events(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);
create index if not exists event_waitlist_user_idx on public.event_waitlist(user_id);

alter table public.event_waitlist enable row level security;

drop policy if exists ewl_insert on public.event_waitlist;
drop policy if exists ewl_delete on public.event_waitlist;
drop policy if exists ewl_read   on public.event_waitlist;

create policy ewl_insert on public.event_waitlist for insert
  with check (user_id = (select auth.uid()));
create policy ewl_delete on public.event_waitlist for delete
  using (user_id = (select auth.uid()));
-- Read your own row, or all rows if you host the event.
create policy ewl_read on public.event_waitlist for select
  using (user_id = (select auth.uid())
      or exists (select 1 from public.events e where e.id = event_id and e.host_id = (select auth.uid())));

-- Public "N waiting" count without exposing who's on the list.
create or replace function public.event_waitlist_count(p_event_id uuid)
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from public.event_waitlist where event_id = p_event_id;
$$;
grant execute on function public.event_waitlist_count(uuid) to authenticated;
