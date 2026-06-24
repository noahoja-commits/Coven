-- Coven migration 0048 — Store Boost: a $40/mo Stripe subscription that pins a shop
-- to the top of the Merchants directory. `boosted_until` is set ONLY by the Stripe
-- webhook (service role); the column has no client write path.

alter table public.shops add column if not exists boosted_until timestamptz;
create index if not exists shops_boost_idx on public.shops (boosted_until desc nulls last, created_at desc);

-- Recreate the public feed view to expose boosted_until. NOTE: CREATE OR REPLACE VIEW can only
-- APPEND columns at the end (it can't reorder/insert), so boosted_until goes last.
create or replace view public.shops_feed as
 SELECT s.id, s.owner_id, s.name, s.kind, s.neighborhood, s.url, s.blurb,
        s.verified, s.created_at,
        p.handle AS owner_handle, p.avatar AS owner_avatar,
        s.boosted_until
   FROM shops s
     JOIN profiles p ON p.id = s.owner_id;
grant select on public.shops_feed to anon, authenticated;

-- Subscription bookkeeping. The webhook (service role) writes; owners may read their own.
create table if not exists public.store_subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  owner_id               uuid not null references public.profiles(id) on delete cascade,
  shop_id                uuid references public.shops(id) on delete set null,
  stripe_customer_id     text,
  stripe_subscription_id text unique,
  status                 text not null default 'active',  -- active | past_due | canceled
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists store_subs_owner_idx on public.store_subscriptions (owner_id);
create index if not exists store_subs_shop_idx  on public.store_subscriptions (shop_id);

alter table public.store_subscriptions enable row level security;
drop policy if exists store_subs_read on public.store_subscriptions;
-- Read your own subscriptions only. No insert/update/delete policies → writes are
-- service-role only (the Stripe webhook), never from the client.
create policy store_subs_read on public.store_subscriptions
  for select using (owner_id = (select auth.uid()));
