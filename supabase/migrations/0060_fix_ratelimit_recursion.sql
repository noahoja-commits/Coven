-- Coven migration 0060 — fix the remaining infinite-recursion rate-limit policies.
--
-- BUG: `posts_ratelimit` (on public.posts) and `follows_ratelimit` (on public.follows) have the
-- IDENTICAL self-referential shape that broke DM sends in 0059: a RESTRICTIVE insert policy whose
-- WITH CHECK does `select count(*) from <the same table>`. Evaluating that subquery re-enters the
-- table's own row-security while the insert is being checked, which Postgres can abort with
-- SQLSTATE 42P17 "infinite recursion detected in policy for relation ...". This silently breaks the
-- very action the rule guards (posting / following) with the error hidden behind the client's catch.
--
-- FIX: same proven pattern as 0059 (dm_sends_last_minute) and the existing SECURITY DEFINER helpers
-- (is_conv_member 0004, post_author 0030). Move each per-minute count into a SECURITY DEFINER helper
-- that runs as the table owner (BYPASSRLS), so the inner read does NOT re-enter the table's policies.
-- Behaviour is identical: posts stay capped at 10/min, follows at 30/min. Core insert/read policies
-- and the *_noblock restrictive policies are untouched.

-- posts: max 10 inserts per author per minute
create or replace function public.posts_created_last_minute(p_author uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.posts
  where author_id = p_author
    and created_at > now() - interval '1 minute';
$$;

revoke all on function public.posts_created_last_minute(uuid) from public;
grant execute on function public.posts_created_last_minute(uuid) to authenticated;

drop policy if exists posts_ratelimit on public.posts;
create policy posts_ratelimit on public.posts
  as restrictive for insert to authenticated
  with check ( public.posts_created_last_minute((select auth.uid())) < 10 );

-- follows: max 30 inserts per follower per minute
create or replace function public.follows_created_last_minute(p_follower uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.follows
  where follower_id = p_follower
    and created_at > now() - interval '1 minute';
$$;

revoke all on function public.follows_created_last_minute(uuid) from public;
grant execute on function public.follows_created_last_minute(uuid) to authenticated;

drop policy if exists follows_ratelimit on public.follows;
create policy follows_ratelimit on public.follows
  as restrictive for insert to authenticated
  with check ( public.follows_created_last_minute((select auth.uid())) < 30 );
