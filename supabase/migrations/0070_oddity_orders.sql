-- Coven migration 0070 — oddity purchases (Stripe Connect marketplace).
--
-- Lets a buyer pay for a listing in-app; the seller receives the money via their Connect
-- payout account (destination charge + platform fee), exactly like event tickets. Orders are
-- minted ONLY by the Stripe webhook (service role, bypasses RLS) — mirroring the tickets model.
--
-- Inventory: oddities are one-of-a-kind. The webhook is the authoritative guard — the FIRST
-- paid order for a listing wins and marks it sold; any concurrent/stale second payment is
-- refunded (reverse_transfer for Connect charges), same shape as tickets' enforceCapacity.

create table if not exists public.oddity_orders (
  id                    uuid primary key default gen_random_uuid(),
  listing_id            uuid not null references public.listings(id) on delete cascade,
  buyer_id              uuid references public.profiles(id) on delete set null,
  seller_id             uuid references public.profiles(id) on delete set null,
  buyer_email           text,
  amount_cents          integer not null default 0,
  currency              text not null default 'usd',
  status                text not null default 'paid',   -- paid | refunded
  stripe_session_id     text unique,
  stripe_payment_intent text,
  created_at            timestamptz not null default now()
);
create index if not exists oddity_orders_listing_idx on public.oddity_orders (listing_id);
create index if not exists oddity_orders_buyer_idx   on public.oddity_orders (buyer_id);
create index if not exists oddity_orders_seller_idx  on public.oddity_orders (seller_id);

alter table public.oddity_orders enable row level security;

-- Both sides of the sale read their own orders; nobody else can.
drop policy if exists oddity_orders_read on public.oddity_orders;
create policy oddity_orders_read on public.oddity_orders for select using (
  buyer_id = (select auth.uid()) or seller_id = (select auth.uid())
);
-- No insert/update/delete policy on purpose: orders are created only by the Stripe webhook
-- (service_role bypasses RLS). Clients cannot mint or alter orders.

grant select on public.oddity_orders to authenticated;
