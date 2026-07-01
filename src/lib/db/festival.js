import { supabase } from '../supabase';

export const PIN_KINDS = [
  { kind: 'stage',    glyph: '◈', label: 'Stage' },
  { kind: 'food',     glyph: '🍔', label: 'Food' },
  { kind: 'bar',      glyph: '🍷', label: 'Bar' },
  { kind: 'bathroom', glyph: '🚻', label: 'Restroom' },
  { kind: 'medical',  glyph: '＋', label: 'Medical' },
  { kind: 'water',    glyph: '💧', label: 'Water' },
  { kind: 'merch',    glyph: '■', label: 'Merch' },
  { kind: 'entrance', glyph: '⇥', label: 'Entrance' },
  { kind: 'exit',     glyph: '⎋', label: 'Exit' },
  { kind: 'info',     glyph: 'ℹ', label: 'Info' },
];

export function pinMeta(kind) {
  return PIN_KINDS.find(p => p.kind === kind) || { kind, glyph: '•', label: kind };
}

// Upload a venue map image to the public bucket; returns its public URL.
export async function uploadVenueImage(eventId, file) {
  const ext = (file.name?.split('.').pop() || 'png').toLowerCase();
  const path = `${eventId}/map_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('venue-maps').upload(path, file, {
    upsert: true, contentType: file.type || 'image/png',
  });
  if (error) throw error;
  const { data } = supabase.storage.from('venue-maps').getPublicUrl(path);
  return data.publicUrl;
}

export async function saveVenueMap(eventId, imageUrl, createdBy) {
  const { error } = await supabase.from('venue_maps')
    .upsert({ event_id: eventId, image_url: imageUrl, created_by: createdBy, updated_at: new Date().toISOString() }, { onConflict: 'event_id' });
  if (error) throw error;
}

export async function fetchVenueMap(eventId) {
  const [{ data: map }, { data: pins }] = await Promise.all([
    supabase.from('venue_maps').select('image_url').eq('event_id', eventId).maybeSingle(),
    supabase.from('venue_pins').select('id, kind, label, x, y').eq('event_id', eventId),
  ]);
  return { imageUrl: map?.image_url || null, pins: pins || [] };
}

// Replace the full pin set for an event (simplest authoring model).
export async function replaceVenuePins(eventId, pins) {
  const { error: delErr } = await supabase.from('venue_pins').delete().eq('event_id', eventId);
  if (delErr) throw delErr; // a failed delete would duplicate pins or leave stale ones behind
  if (!pins.length) return [];
  const rows = pins.map(p => ({ event_id: eventId, kind: p.kind, label: p.label || '', x: p.x, y: p.y }));
  const { data, error } = await supabase.from('venue_pins').insert(rows).select('id, kind, label, x, y');
  if (error) throw error;
  return data || [];
}

export async function setEventSchedule(eventId, startsAt, endsAt) {
  const { error } = await supabase.from('events')
    .update({ starts_at: startsAt, ends_at: endsAt }).eq('id', eventId);
  if (error) throw error;
}

export async function fetchMyTicketEventIds() {
  const { data, error } = await supabase.rpc('my_ticket_event_ids');
  if (error) throw error;
  return (data || []).map(r => r.event_id);
}
