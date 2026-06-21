-- Coven migration 0028 — Oddities kinds (wanted/commission), a real shops
-- directory, and profile decorations (border/banner).

-- 1) Listing kind: sale | wanted | commission (Parlour). Default keeps old rows as sales.
alter table public.listings add column if not exists kind text not null default 'sale';

-- Recreate the public feed view to expose kind (keep every existing column).
create or replace view public.listings_feed as
 SELECT l.id, l.seller_id, l.title, l.price_cents, l.price_mode, l.condition,
    l.category, l.description, l.story_behind, l.status, l.created_at,
    p.handle AS seller_handle, p.avatar AS seller_avatar,
    l.image_url, l.kind
   FROM listings l
     JOIN profiles p ON p.id = l.seller_id
  WHERE l.status = 'active'::text;
grant select on public.listings_feed to anon, authenticated;

-- 2) Shops — a real directory members can add to.
create table if not exists public.shops (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  kind         text not null default '',     -- e.g. "thrift · vintage"
  neighborhood text not null default '',
  url          text not null default '',
  blurb        text not null default '',
  verified     boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists shops_created_idx on public.shops (created_at desc);

create or replace view public.shops_feed as
 SELECT s.id, s.owner_id, s.name, s.kind, s.neighborhood, s.url, s.blurb,
        s.verified, s.created_at,
        p.handle AS owner_handle, p.avatar AS owner_avatar
   FROM shops s
     JOIN profiles p ON p.id = s.owner_id;
grant select on public.shops_feed to anon, authenticated;

alter table public.shops enable row level security;
drop policy if exists shops_read   on public.shops;
drop policy if exists shops_insert on public.shops;
drop policy if exists shops_update on public.shops;
drop policy if exists shops_delete on public.shops;
create policy shops_read   on public.shops for select using (true);
create policy shops_insert on public.shops for insert with check (owner_id = auth.uid());
create policy shops_update on public.shops for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy shops_delete on public.shops for delete using (owner_id = auth.uid());

-- 3) Profile decorations (border + banner). profiles SELECT is column-granted
-- (migration 0026 revoked table-level select), so explicitly grant the new column.
alter table public.profiles add column if not exists decor jsonb not null default '{}'::jsonb;
grant select (decor) on public.profiles to anon, authenticated;
