import { supabase } from '../supabase';

function fmtDate(d) {
  if (!d) return 'TBA';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .toUpperCase().replace(',', '');
}

// Map an event_feed row -> the shape EventsScreen/EventDetail/MapScreen render.
// `going` is the base count EXCLUDING the current user, because the UI adds the
// user's own rsvp on top (e.going + (rsvp[id] ? 1 : 0)).
function hydrateEvent(row, myRsvpSet, myId) {
  const isGoing = myRsvpSet.has(row.id);
  return {
    id: row.id,
    name: row.name,
    venue: row.venue,
    neighborhood: row.neighborhood,
    city: row.city,
    date: fmtDate(row.event_date),
    dateRaw: row.event_date,
    time: row.event_time,
    tags: row.tags || [],
    cover: row.cover || 'red',
    description: row.description || '',
    host: row.host_handle,
    hostAvatar: row.host_avatar,
    hostId: row.host_id,
    going: Math.max(0, (row.going || 0) - (isGoing ? 1 : 0)),
    mine: !!myId && row.host_id === myId,
    ticketed: !!row.ticketed,
    priceCents: row.price_cents || 0,
    currency: row.currency || 'usd',
    capacity: row.capacity ?? null,
    sold: row.sold || 0,
    starts_at: row.starts_at || null,
    ends_at: row.ends_at || null,
    // Door policy: '18' / '21' gate the event; anything else (incl. missing column
    // pre-migration) = all ages.
    ageRestriction: (row.age_restriction === '18' || row.age_restriction === '21') ? row.age_restriction : 'all',
  };
}

export async function fetchEvents(myId, { limit = 200 } = {}) {
  // Upcoming (and TBA / null-date) events only, capped. Past events accumulate forever,
  // and since the list is ordered soonest-first an unfiltered query both grows unbounded
  // AND leads the browse list with ancient events. Individual past events stay viewable
  // via EventDetail (reached from a ticket/link) — this only scopes the browse list.
  const today = new Date().toISOString().slice(0, 10);
  const { data: rows, error } = await supabase
    .from('event_feed').select('*')
    .or(`event_date.gte.${today},event_date.is.null`)
    .order('event_date', { ascending: true })
    .limit(limit);
  if (error) throw error;

  const set = new Set();
  if (myId) {
    const { data: rs, error: e2 } = await supabase
      .from('event_rsvps').select('event_id').eq('user_id', myId);
    if (e2) throw e2;
    (rs || []).forEach(r => set.add(r.event_id));
  }
  return {
    events: (rows || []).map(r => hydrateEvent(r, set, myId)),
    rsvp: Object.fromEntries([...set].map(id => [id, true])),
  };
}

export async function createEvent(data, host) {
  const insert = {
    host_id: host.id,
    name: data.name,
    venue: data.venue || '',
    neighborhood: data.neighborhood || '',
    city: data.city || '',
    event_date: data.date || null,
    event_time: data.time || '',
    cover: data.cover || 'red',
    tags: data.tags || [],
    description: data.description || '',
    ticketed: !!data.ticketed,
    price_cents: data.ticketed ? (data.priceCents || 0) : 0,
    currency: data.currency || 'usd',
    capacity: data.capacity ?? null,
    age_restriction: (data.ageRestriction === '18' || data.ageRestriction === '21') ? data.ageRestriction : null,
  };
  // Map pin (migration 0064). Only sent when the host actually pinned a location.
  if (typeof data.lat === 'number' && typeof data.lng === 'number') { insert.lat = data.lat; insert.lng = data.lng; }
  let { data: row, error } = await supabase.from('events').insert(insert).select().single();
  // Resilience if deployed before 0064 lands: if the lat/lng columns don't exist yet (42703),
  // retry without them so event creation never breaks on deploy ordering.
  if (error && error.code === '42703' && ('lat' in insert || 'lng' in insert)) {
    delete insert.lat; delete insert.lng;
    ({ data: row, error } = await supabase.from('events').insert(insert).select().single());
  }
  if (error) throw error;
  return hydrateEvent({ ...row, host_handle: host.handle, host_avatar: host.avatar, going: 0 }, new Set(), host.id);
}

// Events with map coordinates that pass the anti-spam gate (migration 0064's event_map view:
// upcoming/ongoing, host account >24h old, under the report threshold, capped per host).
// Returns lightweight map-marker shapes. Degrades to [] pre-migration (view absent) so the
// map still renders the soul pins.
export async function fetchEventMap() {
  const { data, error } = await supabase
    .from('event_map')
    .select('id, name, venue, neighborhood, lat, lng, event_date, event_time, ticketed, age_restriction, host_handle')
    .limit(200);
  if (error) return [];
  return (data || []).map(r => ({
    id: r.id,
    name: r.name,
    venue: r.venue || '',
    neighborhood: r.neighborhood || '',
    lat: r.lat,
    lng: r.lng,
    date: fmtDate(r.event_date),
    time: r.event_time || '',
    ticketed: !!r.ticketed,
    ageRestriction: (r.age_restriction === '18' || r.age_restriction === '21') ? r.age_restriction : 'all',
    host: r.host_handle,
  }));
}

export async function deleteEvent(eventId) {
  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) throw error;
}

export async function toggleEventRsvp(eventId, userId, wasGoing) {
  if (wasGoing) {
    const { error } = await supabase.from('event_rsvps')
      .delete().match({ event_id: eventId, user_id: userId });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('event_rsvps')
      .insert({ event_id: eventId, user_id: userId });
    if (error && error.code !== '23505') throw error;
  }
}

export async function fetchEventAttendees(eventId) {
  // Prefer the mutuals-aware RPC; fall back to the plain one pre-migration.
  let { data, error } = await supabase.rpc('event_attendees_with_mutuals', { p_event_id: eventId });
  if (error) {
    ({ data, error } = await supabase.rpc('event_attendees', { p_event_id: eventId }));
  }
  if (error) throw error;
  return data || [];
}

// ── Waitlist (sold-out rites) ────────────────────────────────────────────────
export async function joinWaitlist(eventId, userId) {
  const { error } = await supabase.from('event_waitlist').insert({ event_id: eventId, user_id: userId });
  if (error && error.code !== '23505') throw error; // ignore "already on it"
}

export async function leaveWaitlist(eventId, userId) {
  const { error } = await supabase.from('event_waitlist').delete().match({ event_id: eventId, user_id: userId });
  if (error) throw error;
}

// { count, mine } — count via a definer rpc (no list leak); mine via own-row read.
// Degrades to { count:0, mine:false } pre-migration (supabase-js returns errors, not throws).
export async function fetchWaitlist(eventId, userId) {
  const [{ data: cnt }, { data: mineRow }] = await Promise.all([
    supabase.rpc('event_waitlist_count', { p_event_id: eventId }),
    userId
      ? supabase.from('event_waitlist').select('event_id').eq('event_id', eventId).eq('user_id', userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  return { count: typeof cnt === 'number' ? cnt : 0, mine: !!mineRow };
}
