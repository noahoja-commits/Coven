-- Coven migration 0011 — expose starts_at/ends_at through event_feed so the
-- client can compute the festival-mode trigger. (Columns appended at the end.)
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
    e.ends_at
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
