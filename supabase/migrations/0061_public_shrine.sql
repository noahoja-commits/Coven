-- Coven migration 0061 — make the shrine truly public.
--
-- profile_state (graves / trackers / clientSync) is owner-locked by RLS, so the "public"
-- flags users set on trackers, memorials, and anniversaries never actually showed to anyone.
-- This adds:
--   1. grave_tributes — cross-user candles + flowers on someone's public memorials.
--   2. public_shrine(p_user) — a SECURITY DEFINER RPC (same sanitizing pattern as feed_posts)
--      that returns ONLY the public-flagged slices of a user's shrine:
--        graves (not private) with tribute counts · trackers (public: true) ·
--        anniversaries (visible: true) · nowPlaying · pinnedPostId · kept-story highlights.
--      Private items never leave the database.

-- ── cross-user tributes ──────────────────────────────────────────────────────
create table if not exists public.grave_tributes (
  user_id    uuid not null references public.profiles(id) on delete cascade, -- who left it
  owner_id   uuid not null references public.profiles(id) on delete cascade, -- whose shrine
  grave_id   text not null,
  kind       text not null check (kind in ('candle', 'flower')),
  created_at timestamptz not null default now(),
  primary key (user_id, owner_id, grave_id, kind) -- one of each kind per person per grave
);

alter table public.grave_tributes enable row level security;

drop policy if exists tributes_read on public.grave_tributes;
create policy tributes_read on public.grave_tributes
  for select to authenticated using (true); -- tributes are a public gesture (like reactions)

drop policy if exists tributes_insert on public.grave_tributes;
create policy tributes_insert on public.grave_tributes
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists tributes_delete on public.grave_tributes;
create policy tributes_delete on public.grave_tributes
  for delete to authenticated using (user_id = (select auth.uid()));

grant select, insert, delete on public.grave_tributes to authenticated;
create index if not exists grave_tributes_owner_idx on public.grave_tributes(owner_id, grave_id);

-- ── the public shrine ────────────────────────────────────────────────────────
create or replace function public.public_shrine(p_user uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
select jsonb_build_object(
  'graves', coalesce((
    select jsonb_agg(
             (g - 'private') || jsonb_build_object(
               'candles', (select count(*) from public.grave_tributes t
                           where t.owner_id = p_user and t.grave_id = g->>'id' and t.kind = 'candle'),
               'tributeFlowers', (select count(*) from public.grave_tributes t
                                  where t.owner_id = p_user and t.grave_id = g->>'id' and t.kind = 'flower'))
           )
    from jsonb_array_elements(coalesce(
           (select value from public.profile_state where user_id = p_user and key = 'graves'),
           '[]'::jsonb)) g
    where coalesce((g->>'private')::boolean, false) = false
      and coalesce(g->>'visibility', 'friends') <> 'private'
  ), '[]'::jsonb),
  'trackers', coalesce((
    select jsonb_object_agg(e.k, e.v)
    from jsonb_each(coalesce(
           (select value from public.profile_state where user_id = p_user and key = 'trackers'),
           '{}'::jsonb)) as e(k, v)
    where coalesce((e.v->>'public')::boolean, false)
  ), '{}'::jsonb),
  'anniversaries', coalesce((
    select jsonb_agg(a)
    from jsonb_array_elements(coalesce(
           (select value->'anniversaries' from public.profile_state where user_id = p_user and key = 'clientSync'),
           '[]'::jsonb)) a
    where coalesce((a->>'visible')::boolean, false)
  ), '[]'::jsonb),
  'nowPlaying', (select value->'nowPlaying' from public.profile_state where user_id = p_user and key = 'clientSync'),
  'pinnedPostId', (select value->'pinnedPostId' from public.profile_state where user_id = p_user and key = 'clientSync'),
  'highlights', coalesce(
    (select value->'storyHighlights' from public.profile_state where user_id = p_user and key = 'clientSync'),
    '[]'::jsonb)
);
$$;

revoke all on function public.public_shrine(uuid) from public;
grant execute on function public.public_shrine(uuid) to authenticated;

-- Note: "mark sold" reuses the existing listings.status column (the listings_feed view already
-- filters status='active', so a sold item simply leaves the marketplace) — no schema change, and
-- the existing owner-scoped listings_update policy already authorizes it.
