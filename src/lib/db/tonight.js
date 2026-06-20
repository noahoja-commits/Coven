import { supabase } from '../supabase';

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
  await supabase.from('tonight_pins').upsert({
    user_id: uid,
    text: (text || '').slice(0, 80),
    neighborhood: (neighborhood || '').slice(0, 40) || null,
    expires_at: new Date(expiresAt).toISOString(),
  }, { onConflict: 'user_id' });
}

export async function clearTonightPin() {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return;
  await supabase.from('tonight_pins').delete().eq('user_id', uid);
}

export async function fetchTonightPins() {
  const { data, error } = await supabase
    .from('active_tonight')
    .select('user_id, text, neighborhood, expires_at, handle, avatar, avatar_url, city');
  if (error) throw error;
  return (data || []).map(hydrate);
}

// Realtime: any change to tonight pins → tell the caller to refetch.
export function subscribeTonightPins(onChange) {
  const ch = supabase
    .channel('tonight_pins')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tonight_pins' },
      () => onChange())
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}
