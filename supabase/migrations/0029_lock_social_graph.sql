-- Coven migration 0029 — stop the anon key from reading the follow graph and raw
-- event RSVPs. Public follower/following counts move to a SECURITY DEFINER rpc so
-- numbers still show without exposing who-follows-whom.

-- 1) follows: drop ALL existing policies (some were permissive), then lock to own edges.
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'follows' loop
    execute format('drop policy %I on public.follows', p.policyname);
  end loop;
end $$;

alter table public.follows enable row level security;
create policy follows_read   on public.follows for select
  using (follower_id = auth.uid() or followee_id = auth.uid());
create policy follows_insert on public.follows for insert
  with check (follower_id = auth.uid());
create policy follows_delete on public.follows for delete
  using (follower_id = auth.uid());

-- 2) Public follower/following counts without exposing edges.
create or replace function public.profile_follow_counts(p_id uuid)
returns table(followers bigint, following bigint)
language sql stable security definer set search_path = public as $$
  select
    (select count(*) from public.follows where followee_id = p_id),
    (select count(*) from public.follows where follower_id = p_id);
$$;
grant execute on function public.profile_follow_counts(uuid) to anon, authenticated;

-- 3) event_rsvps: stop the world-readable raw policy. The going-count UI reads the
-- event_feed definer view (which aggregates), so scoping the raw table to the owner
-- is safe. Keep insert/delete (own rows) intact.
drop policy if exists rsvps_read on public.event_rsvps;
create policy rsvps_read on public.event_rsvps for select using (user_id = auth.uid());
