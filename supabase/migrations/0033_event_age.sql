-- Coven migration 0033 — per-event door policy (age restriction).
-- An event host can set an event to 18+ or 21+; the client gates entry by DOB.
-- NULL / anything else = all ages. Additive column + appended to the event_feed view.

alter table public.events
  add column if not exists age_restriction text
  check (age_restriction in ('18', '21'));

-- Recreate event_feed with age_restriction appended at the end (mirrors 0011).
create or replace view public.event_feed as
 SELECT e.id,
    e.host_id,
    e.name,
    e.venue,
    e.neighborhood,
    e.city,
    e.event_date,
    e.event_time,
    e.cover,
    e.tags,
    e.description,
    e.created_at,
    pr.handle AS host_handle,
    pr.avatar AS host_avatar,
    COALESCE(r.cnt, 0::bigint) AS going,
    e.ticketed,
    e.price_cents,
    e.currency,
    e.capacity,
    COALESCE(t.sold, 0::bigint) AS sold,
    e.starts_at,
    e.ends_at,
    e.age_restriction
   FROM events e
     JOIN profiles pr ON pr.id = e.host_id
     LEFT JOIN ( SELECT event_rsvps.event_id,
            count(*) AS cnt
           FROM event_rsvps
          GROUP BY event_rsvps.event_id) r ON r.event_id = e.id
     LEFT JOIN ( SELECT tickets.event_id,
            count(*) AS sold
           FROM tickets
          WHERE tickets.status = 'paid'::text
          GROUP BY tickets.event_id) t ON t.event_id = e.id;

grant select on public.event_feed to anon, authenticated;
