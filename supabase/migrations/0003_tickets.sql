-- Coven migration 0003 — paid event tickets (Stripe).
-- Money collects to one Stripe account (owner); venues settled off-platform for now.

alter table public.events add column if not exists ticketed   boolean not null default false;
alter table public.events add column if not exists price_cents integer not null default 0;
alter table public.events add column if not exists currency    text not null default 'usd';
alter table public.events add column if not exists capacity    integer;  -- null = unlimited

create table if not exists public.tickets (
  id                    uuid primary key default gen_random_uuid(),
  event_id              uuid not null references public.events(id) on delete cascade,
  buyer_id              uuid references public.profiles(id) on delete set null,
  buyer_email           text,
  amount_cents          integer not null default 0,
  currency              text not null default 'usd',
  status                text not null default 'paid',   -- paid|refunded
  stripe_session_id     text unique,
  stripe_payment_intent text,
  checked_in_at         timestamptz,
  created_at            timestamptz not null default now()
);
create index if not exists tickets_event_idx on public.tickets (event_id);
create index if not exists tickets_buyer_idx on public.tickets (buyer_id);

-- event_feed: keep existing columns/order, append ticketing fields + sold count.
create or replace view public.event_feed as
select
  e.id, e.host_id, e.name, e.venue, e.neighborhood, e.city,
  e.event_date, e.event_time, e.cover, e.tags, e.description, e.created_at,
  pr.handle as host_handle,
  pr.avatar as host_avatar,
  coalesce(r.cnt, 0) as going,
  e.ticketed, e.price_cents, e.currency, e.capacity,
  coalesce(t.sold, 0) as sold
from public.events e
join public.profiles pr on pr.id = e.host_id
left join (
  select event_id, count(*) as cnt from public.event_rsvps group by event_id
) r on r.event_id = e.id
left join (
  select event_id, count(*) as sold from public.tickets where status = 'paid' group by event_id
) t on t.event_id = e.id;
grant select on public.event_feed to anon, authenticated;

alter table public.tickets enable row level security;

-- Buyers read their own tickets; event hosts read tickets for their events.
drop policy if exists tickets_read   on public.tickets;
drop policy if exists tickets_update on public.tickets;
create policy tickets_read on public.tickets for select using (
  buyer_id = auth.uid()
  or exists (select 1 from public.events e where e.id = tickets.event_id and e.host_id = auth.uid())
);
-- Hosts can check in (update) tickets for their own events.
create policy tickets_update on public.tickets for update using (
  exists (select 1 from public.events e where e.id = tickets.event_id and e.host_id = auth.uid())
) with check (
  exists (select 1 from public.events e where e.id = tickets.event_id and e.host_id = auth.uid())
);
-- No insert/delete policy on purpose: tickets are created only by the Stripe
-- webhook using the service_role key (which bypasses RLS). Clients cannot mint tickets.
