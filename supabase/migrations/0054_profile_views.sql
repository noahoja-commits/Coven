-- Coven migration 0054 — profile view tracking (feeds the analytics dashboard).
-- Same write-only, count-via-RPC model as 0049's post/story/listing views: one row
-- per (viewer, profile), raw rows private, counts only via the SECURITY DEFINER RPC.

create table if not exists public.profile_views (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  viewer_id  uuid not null references auth.users(id)      on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, viewer_id)
);
alter table public.profile_views enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profile_views' and policyname='insert own profile view') then
    create policy "insert own profile view" on public.profile_views for insert to authenticated with check (viewer_id = auth.uid());
  end if;
end $$;

-- Extend record_view + view_counts to also handle the 'profile' kind (replaces 0049).
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
  elsif p_kind = 'profile' then
    if p_id <> auth.uid() then  -- viewing your own profile never counts
      insert into public.profile_views(profile_id, viewer_id) values (p_id, auth.uid()) on conflict do nothing;
    end if;
  end if;
end; $$;

create or replace function public.view_counts(p_kind text, p_ids uuid[])
returns table (id uuid, n bigint) language sql stable security definer set search_path = public as $$
  select post_id    as id, count(*)::bigint from public.post_views    where p_kind = 'post'    and post_id    = any(p_ids) group by post_id
  union all
  select story_id   as id, count(*)::bigint from public.story_views   where p_kind = 'story'   and story_id   = any(p_ids) group by story_id
  union all
  select listing_id as id, count(*)::bigint from public.listing_views where p_kind = 'listing' and listing_id = any(p_ids) group by listing_id
  union all
  select profile_id as id, count(*)::bigint from public.profile_views where p_kind = 'profile' and profile_id = any(p_ids) group by profile_id
$$;

grant execute on function public.record_view(text, uuid)   to authenticated;
grant execute on function public.view_counts(text, uuid[]) to authenticated, anon;
