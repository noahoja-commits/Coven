-- Real, unique view tracking for posts, stories, and marketplace listings.
-- One row per (viewer, item): a repeat visit from the same soul never re-counts.
-- Raw rows are private (no SELECT policy); counts are exposed only via SECURITY DEFINER
-- RPCs so we never leak *who* viewed something.

create table if not exists public.post_views (
  post_id    uuid not null references public.posts(id)    on delete cascade,
  viewer_id  uuid not null references auth.users(id)      on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, viewer_id)
);
create table if not exists public.story_views (
  story_id   uuid not null references public.stories(id)  on delete cascade,
  viewer_id  uuid not null references auth.users(id)      on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, viewer_id)
);
create table if not exists public.listing_views (
  listing_id uuid not null references public.listings(id) on delete cascade,
  viewer_id  uuid not null references auth.users(id)      on delete cascade,
  created_at timestamptz not null default now(),
  primary key (listing_id, viewer_id)
);

alter table public.post_views    enable row level security;
alter table public.story_views   enable row level security;
alter table public.listing_views enable row level security;

-- A soul may record only its OWN view. No SELECT/UPDATE/DELETE policies → rows are
-- write-only from the client; counts come from the RPCs below.
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='post_views' and policyname='insert own post view') then
    create policy "insert own post view" on public.post_views for insert to authenticated with check (viewer_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='story_views' and policyname='insert own story view') then
    create policy "insert own story view" on public.story_views for insert to authenticated with check (viewer_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='listing_views' and policyname='insert own listing view') then
    create policy "insert own listing view" on public.listing_views for insert to authenticated with check (viewer_id = auth.uid());
  end if;
end $$;

-- Record a view. Idempotent (on conflict do nothing) and binds the viewer to the
-- authenticated caller — never trusts a viewer id from the client.
create or replace function public.record_view(p_kind text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or p_id is null then return; end if;
  if p_kind = 'post' then
    insert into public.post_views(post_id, viewer_id) values (p_id, auth.uid()) on conflict do nothing;
  elsif p_kind = 'story' then
    insert into public.story_views(story_id, viewer_id) values (p_id, auth.uid()) on conflict do nothing;
  elsif p_kind = 'listing' then
    insert into public.listing_views(listing_id, viewer_id) values (p_id, auth.uid()) on conflict do nothing;
  end if;
end; $$;

-- Batched unique-view counts for a set of ids of one kind. Only the branch matching
-- p_kind returns rows, so this is a single round-trip per feed load.
create or replace function public.view_counts(p_kind text, p_ids uuid[])
returns table (id uuid, n bigint) language sql stable security definer set search_path = public as $$
  select post_id    as id, count(*)::bigint from public.post_views    where p_kind = 'post'    and post_id    = any(p_ids) group by post_id
  union all
  select story_id   as id, count(*)::bigint from public.story_views   where p_kind = 'story'   and story_id   = any(p_ids) group by story_id
  union all
  select listing_id as id, count(*)::bigint from public.listing_views where p_kind = 'listing' and listing_id = any(p_ids) group by listing_id
$$;

grant execute on function public.record_view(text, uuid)   to authenticated;
grant execute on function public.view_counts(text, uuid[]) to authenticated, anon;
