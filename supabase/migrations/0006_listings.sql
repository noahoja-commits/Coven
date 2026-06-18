-- Coven migration 0006 — marketplace listings (oddities).

create table if not exists public.listings (
  id            uuid primary key default gen_random_uuid(),
  seller_id     uuid not null references public.profiles(id) on delete cascade,
  title         text not null,
  price_cents   integer not null default 0,
  price_mode    text not null default 'firm',     -- firm|obo|trade
  condition     text not null default 'used',
  category      text not null default 'curio',
  description   text not null default '',
  story_behind  text not null default '',
  status        text not null default 'active',    -- active|sold
  created_at    timestamptz not null default now()
);
create index if not exists listings_active_idx on public.listings (status, created_at desc);
create index if not exists listings_seller_idx on public.listings (seller_id);

create or replace view public.listings_feed as
select l.id, l.seller_id, l.title, l.price_cents, l.price_mode, l.condition,
       l.category, l.description, l.story_behind, l.status, l.created_at,
       p.handle as seller_handle, p.avatar as seller_avatar
from public.listings l
join public.profiles p on p.id = l.seller_id
where l.status = 'active';
grant select on public.listings_feed to anon, authenticated;

alter table public.listings enable row level security;
drop policy if exists listings_read   on public.listings;
drop policy if exists listings_insert on public.listings;
drop policy if exists listings_update on public.listings;
drop policy if exists listings_delete on public.listings;
create policy listings_read   on public.listings for select using (true);
create policy listings_insert on public.listings for insert with check (seller_id = auth.uid());
create policy listings_update on public.listings for update using (seller_id = auth.uid()) with check (seller_id = auth.uid());
create policy listings_delete on public.listings for delete using (seller_id = auth.uid());
