-- Coven migration 0031 — real community (scene) membership.
-- communityMembership was a client-only flag; this gives a server-backed row per
-- (user, scene) so we can show real member counts. Rows are private (own-only RLS);
-- public counts come from a SECURITY DEFINER rpc (same pattern as profile_follow_counts).

create table if not exists public.community_members (
  user_id      uuid not null references auth.users(id) on delete cascade,
  community_id text not null,                -- matches the static COMMUNITIES ids ('goth', etc.)
  joined_at    timestamptz not null default now(),
  primary key (user_id, community_id)
);
create index if not exists community_members_cid_idx on public.community_members (community_id);

alter table public.community_members enable row level security;
drop policy if exists cmem_read   on public.community_members;
drop policy if exists cmem_insert on public.community_members;
drop policy if exists cmem_delete on public.community_members;
-- Own rows only — don't expose who is in which scene.
create policy cmem_read   on public.community_members for select using (user_id = auth.uid());
create policy cmem_insert on public.community_members for insert with check (user_id = auth.uid());
create policy cmem_delete on public.community_members for delete using (user_id = auth.uid());
grant select, insert, delete on public.community_members to authenticated;

-- Public per-scene member counts without exposing the membership rows.
create or replace function public.community_member_counts()
returns table(community_id text, members bigint)
language sql stable security definer set search_path = public as $$
  select community_id, count(*) as members
  from public.community_members
  group by community_id;
$$;
grant execute on function public.community_member_counts() to anon, authenticated;
