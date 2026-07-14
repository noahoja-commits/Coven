import { supabase } from '../supabase';
import { resilientChannel } from './realtime';

// DB-backed "out tonight" presence (cross-user, realtime) for the map.
// The current user's own status is still mirrored in localStorage for instant
// display; these functions sync the public, shareable pin.

function hydrate(r) {
  return {
    userId: r.user_id,
    handle: r.handle,
    avatar: r.avatar || '✦',
    avatarUrl: r.avatar_url || null,
    text: r.text || '',
    neighborhood: r.neighborhood || '',
    city: r.city || '',
    expiresAt: r.expires_at,
  };
}

export async function setTonightPin({ text, neighborhood, expiresAt }) {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return;
  const { error } = await supabase.from('tonight_pins').upsert({
    user_id: uid,
    text: (text || '').slice(0, 80),
    neighborhood: (neighborhood || '').slice(0, 40) || null,
    expires_at: new Date(expiresAt).toISOString(),
  }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function clearTonightPin() {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return;
  // Throw on failure — a swallowed delete leaves your pin live on the shared map after you
  // believe you went invisible (privacy). The caller decides how to surface it.
  const { error } = await supabase.from('tonight_pins').delete().eq('user_id', uid);
  if (error) throw error;
}

export async function fetchTonightPins() {
  const { data, error } = await supabase
    .from('active_tonight')
    .select('user_id, text, neighborhood, expires_at, handle, avatar, avatar_url, city');
  if (error) throw error;
  return (data || []).map(hydrate);
}

// ── Real GPS proximity (privacy-fuzzed) ─────────────────────────────────────
// Precise coords live in tonight_geo, owner-locked + NOT in realtime. They never
// reach another client. Others read only fuzzed coords + distance via the RPC.

export async function setTonightGeo({ lat, lng, fuzzM }) {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid || typeof lat !== 'number' || typeof lng !== 'number') return;
  // No .select() — we never read raw coords back to the client.
  const { error } = await supabase.from('tonight_geo').upsert({
    user_id: uid,
    latitude: lat,
    longitude: lng,
    fuzz_m: Math.max(250, Math.round(fuzzM || 1609)),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function clearTonightGeo() {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return;
  // Throw on failure — a swallowed delete leaves your precise (owner-locked) coords broadcasting
  // after you opted out of sharing (privacy). The caller decides how to surface it.
  const { error } = await supabase.from('tonight_geo').delete().eq('user_id', uid);
  if (error) throw error;
}

// Fuzzed nearby souls + bucketed distance. Returns NULL on error (so callers can keep
// their last-known list instead of wiping pins on a transient failure) — a genuinely
// empty map is [], which stays distinguishable.
export async function fetchNearby(myLat, myLng) {
  const { data, error } = await supabase.rpc('tonight_nearby', { my_lat: myLat, my_lng: myLng });
  if (error) return null;
  return (data || []).map(r => ({
    userId: r.user_id,
    handle: r.handle,
    avatar: r.avatar || '✦',
    avatarUrl: r.avatar_url || null,
    text: r.status || '',
    neighborhood: r.neighborhood || '',
    city: r.city || '',
    fuzzLat: r.fuzz_lat,
    fuzzLng: r.fuzz_lng,
    distanceMi: r.distance_mi,
  }));
}

// Realtime: any change to tonight pins → tell the caller to refetch.
export function subscribeTonightPins(onChange) {
  return resilientChannel(() => supabase
    .channel('tonight_pins')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tonight_pins' },
      () => onChange()));
}
