-- Coven migration 0064 — events on the living map, with anti-spam gating.
--
-- Puts freshly-created events on the map immediately, but behind an abuse gate so the map can't
-- be spammed or weaponised:
--   * lat/lng on events (nullable — no pin ⇒ event is list-only, never on the map);
--   * a per-host insert rate limit (mirrors posts/follows in 0060, via a SECURITY DEFINER helper
--     so the RESTRICTIVE policy doesn't self-recurse — the 42P17 bug 0059/0060 fixed);
--   * events become reportable (target_kind gains 'event');
--   * a public `event_map` view that only surfaces a pin when the event has coords, is upcoming/
--     ongoing, the host account is >24h old (blocks throwaway-account spam), it's under the same
--     3-distinct-reporter threshold the feed uses, AND it's one of the host's 3 soonest events
--     (so a single host can't carpet-bomb the map).
-- Idempotent / additive — safe to re-run; no existing data is modified.

-- 1) Coordinates -------------------------------------------------------------------------------
alter table public.events add column if not exists lat double precision;
alter table public.events add column if not exists lng double precision;

-- 2) Rate limit: max 3 events per host per hour. SECURITY DEFINER helper (BYPASSRLS) so the
--    subquery does NOT re-enter events' own row security (see 0059/0060).
create or replace function public.events_created_last_hour(p_host uuid)
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from public.events
   where host_id = p_host and created_at > now() - interval '1 hour';
$$;
revoke all on function public.events_created_last_hour(uuid) from public;
grant execute on function public.events_created_last_hour(uuid) to authenticated;

drop policy if exists events_ratelimit on public.events;
create policy events_ratelimit on public.events
  as restrictive for insert to authenticated
  with check ( public.events_created_last_hour((select auth.uid())) < 3 );

-- 3) Let events be reported (moderation feeds the map gate below). Widening the check can't
--    violate existing 'post'/'user' rows.
alter table public.reports drop constraint if exists reports_target_kind_check;
alter table public.reports add constraint reports_target_kind_check
  check (target_kind in ('post','user','event'));

-- 4) Public map view — the anti-spam gate. A plain (SECURITY DEFINER-semantics) view like
--    feed_posts, so the report-count subquery can read ALL reports (reports is own-read-only).
create or replace view public.event_map as
  select e.id, e.name, e.venue, e.neighborhood, e.city, e.lat, e.lng, e.cover,
         e.event_date, e.event_time, e.starts_at, e.ends_at,
         e.ticketed, e.price_cents, e.age_restriction,
         e.host_id, pr.handle as host_handle, pr.avatar as host_avatar
  from public.events e
  join public.profiles pr on pr.id = e.host_id
  where e.lat is not null and e.lng is not null
    -- upcoming (date today-or-later, or TBA) or still ongoing
    and (
      (e.event_date is not null and e.event_date >= current_date)
      or (e.event_date is null and (e.ends_at is null or e.ends_at >= now()))
      or (e.ends_at is not null and e.ends_at >= now())
    )
    -- host account older than 24h — blocks throwaway-account map spam
    and pr.created_at <= now() - interval '24 hours'
    -- under the report threshold (same rule as the feed's 3 distinct reporters)
    and (select count(distinct r.reporter_id) from public.reports r
         where r.target_kind = 'event' and r.target_id = e.id) < 3
    -- cap per host: only their 3 soonest map-eligible events show
    and e.id in (
      select id from (
        select e2.id,
               row_number() over (partition by e2.host_id
                 order by coalesce(e2.event_date, '9999-12-31'::date) asc, e2.created_at asc) as rn
        from public.events e2
        where e2.host_id = e.host_id and e2.lat is not null
      ) ranked where rn <= 3
    );

grant select on public.event_map to anon, authenticated;
