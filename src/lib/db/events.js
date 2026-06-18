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
  };
}

export async function fetchEvents(myId) {
  const { data: rows, error } = await supabase
    .from('event_feed').select('*').order('event_date', { ascending: true });
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
  };
  const { data: row, error } = await supabase.from('events').insert(insert).select().single();
  if (error) throw error;
  return hydrateEvent({ ...row, host_handle: host.handle, host_avatar: host.avatar, going: 0 }, new Set(), host.id);
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
  const { data, error } = await supabase.rpc('event_attendees', { p_event_id: eventId });
  if (error) throw error;
  return data || [];
}
