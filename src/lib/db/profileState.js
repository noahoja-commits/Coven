import { supabase } from '../supabase';

// Per-user profile depth blobs (graves / trackers / sigils / reflections).
// Each is stored whole under one key; the client owns the merge.

const KEYS = ['graves', 'trackers', 'sigils', 'reflections', 'clientSync'];

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
