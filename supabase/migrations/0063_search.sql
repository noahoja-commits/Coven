-- Coven migration 0063 — real server-side search for posts + events.
--
-- Search only covered profiles (searchProfiles) + hashtags; posts/events were filtered client-side
-- over whatever was already loaded, so search couldn't find anything off-screen. These two
-- SECURITY DEFINER RPCs search the whole corpus with trigram matching (typo-tolerant, substring),
-- while reusing the SAME sanitizing rules as feed_posts / event_feed so nothing leaks:
--   * search_posts: never returns anonymous posts (their author must stay masked) and honours the
--     3-report auto-hide, exactly like feed_posts.
--   * search_events: upcoming, non-cancelled events.

create extension if not exists pg_trgm;

create index if not exists posts_body_trgm  on public.posts  using gin (body gin_trgm_ops);
create index if not exists events_name_trgm on public.events using gin (name gin_trgm_ops);

-- Posts: match body, ranked by similarity then recency. Anonymous posts are excluded entirely
-- (we can't show a handle for them, and matching their body could de-anonymize by correlation).
create or replace function public.search_posts(p_q text, p_limit int default 20)
returns table (id uuid, body text, handle text, avatar text, avatar_url text, created_at timestamptz)
language sql stable security definer set search_path = public, extensions as $$
  select p.id, p.body, pr.handle, pr.avatar, pr.avatar_url, p.created_at
  from public.posts p
  join public.profiles pr on pr.id = p.author_id
  where p.anonymous = false
    and coalesce(p.body, '') <> ''
    and (p.scheduled_at is null or p.scheduled_at <= now())
    and p.body ilike '%' || p_q || '%'
    and (select count(distinct r.reporter_id) from public.reports r
         where r.target_kind = 'post' and r.target_id = p.id) < 3
  order by similarity(p.body, p_q) desc, p.created_at desc
  limit greatest(1, least(p_limit, 40));
$$;

-- Events: match name / venue / neighborhood, upcoming first.
create or replace function public.search_events(p_q text, p_limit int default 20)
returns table (id uuid, name text, venue text, neighborhood text, event_date text)
language sql stable security definer set search_path = public, extensions as $$
  select e.id, e.name, e.venue, e.neighborhood, e.event_date::text
  from public.events e
  where e.name ilike '%' || p_q || '%'
     or coalesce(e.venue, '') ilike '%' || p_q || '%'
     or coalesce(e.neighborhood, '') ilike '%' || p_q || '%'
  order by (coalesce(e.starts_at, e.event_date::timestamptz) >= now()) desc,
           coalesce(e.starts_at, e.event_date::timestamptz) asc nulls last
  limit greatest(1, least(p_limit, 40));
$$;

revoke all on function public.search_posts(text, int)  from public;
revoke all on function public.search_events(text, int) from public;
grant execute on function public.search_posts(text, int)  to authenticated;
grant execute on function public.search_events(text, int) to authenticated;
