import { supabase } from '../supabase';

// Per-user profile depth blobs (graves / trackers / sigils / reflections).
// Each is stored whole under one key; the client owns the merge.

const KEYS = ['graves', 'trackers', 'sigils', 'reflections', 'clientSync', 'dreamJournal', 'intention'];

export async function fetchProfileState() {
  const { data, error } = await supabase
    .from('profile_state')
    .select('key, value')
    .in('key', KEYS);
  if (error) throw error;
  const out = {};
  for (const row of data || []) out[row.key] = row.value;
  return out; // missing keys simply absent → caller falls back to defaults
}

export async function saveProfileState(userId, key, value) {
  const { error } = await supabase
    .from('profile_state')
    .upsert({ user_id: userId, key, value, updated_at: new Date().toISOString() }, { onConflict: 'user_id,key' });
  if (error) throw error;
}

// ── The public shrine (migration 0061) ──────────────────────────────────────
// Another user's PUBLIC-flagged shrine slices only — private items are filtered
// server-side by the SECURITY DEFINER rpc and never reach the client.
// Returns { graves, trackers, anniversaries, nowPlaying, pinnedPostId, highlights }
// or null pre-migration (so profiles render fine before 0061 is applied).
export async function fetchPublicShrine(userId) {
  const { data, error } = await supabase.rpc('public_shrine', { p_user: userId });
  if (error) return null;
  return data || null;
}

// Which tributes *I* have already left on this shrine → { [graveId]: { candle, flower } }
export async function fetchMyTributes(myId, ownerId) {
  const { data, error } = await supabase
    .from('grave_tributes')
    .select('grave_id, kind')
    .eq('user_id', myId).eq('owner_id', ownerId);
  if (error) return {};
  const out = {};
  (data || []).forEach(t => { out[t.grave_id] = { ...(out[t.grave_id] || {}), [t.kind]: true }; });
  return out;
}

// Leave (or take back) a candle/flower on someone's public memorial.
export async function setGraveTribute(myId, ownerId, graveId, kind, on) {
  if (on) {
    const { error } = await supabase.from('grave_tributes')
      .insert({ user_id: myId, owner_id: ownerId, grave_id: graveId, kind });
    if (error && error.code !== '23505') throw error; // duplicate = already lit, fine
  } else {
    const { error } = await supabase.from('grave_tributes')
      .delete().match({ user_id: myId, owner_id: ownerId, grave_id: graveId, kind });
    if (error) throw error;
  }
}
