import { supabase } from '../supabase';

// Every profile column EXCEPT birthday (which is column-locked to the owner at the
// DB level — read via the my_birthday rpc). Use this instead of select('*').
const PROFILE_COLS = 'id, handle, avatar, avatar_url, bio, city, created_at, is_system, pronouns, scenes, tags';

// Handles are always stored lowercase (onboarding sanitizes + CHECK enforces),
// so an exact eq is a correct uniqueness check (no LIKE wildcard pitfalls).
export async function checkHandleAvailable(handle) {
  const h = (handle || '').toLowerCase();
  const { data, error } = await supabase
    .from('profiles').select('id').eq('handle', h).maybeSingle();
  if (error) throw error;
  return !data;
}

// Own profile (called only for the signed-in user). Merges the owner-only
// birthday from the SECURITY DEFINER rpc, since the column is DB-locked.
export async function getProfileById(id) {
  const { data, error } = await supabase
    .from('profiles').select(PROFILE_COLS).eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) return data;
  const { data: bday } = await supabase.rpc('my_birthday');
  return { ...data, birthday: bday || null };
}

// Another user's public profile — never includes birthday.
export async function getProfileByHandle(handle) {
  const { data, error } = await supabase
    .from('profiles').select(PROFILE_COLS).eq('handle', (handle || '').toLowerCase()).maybeSingle();
  if (error) throw error;
  return data;
}

// Insert the current user's profile row. Throws on conflict (handle taken → 23505).
export async function insertProfile(row) {
  const { data, error } = await supabase.from('profiles').insert(row).select('id, handle').single();
  if (error) throw error;
  return data;
}

export async function updateProfile(id, patch) {
  const { data, error } = await supabase
    .from('profiles').update(patch).eq('id', id).select('id, handle').single();
  if (error) throw error;
  return data;
}

export async function getSystemAccountIds() {
  const { data, error } = await supabase
    .from('profiles').select('id').eq('is_system', true);
  if (error) throw error;
  return (data || []).map(r => r.id);
}

// Real people directory — every non-system profile (newest first). Used by the
// Souls browser. Pass excludeId to drop the viewer.
export async function fetchProfiles({ excludeId, limit = 60 } = {}) {
  let q = supabase
    .from('profiles')
    .select('id, handle, avatar, avatar_url, bio, city, tags, pronouns')
    .eq('is_system', false)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (excludeId) q = q.neq('id', excludeId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

// Search real profiles by handle or bio. Sanitizes the query so it can't break
// the PostgREST or() filter.
export async function searchProfiles(query, { limit = 8 } = {}) {
  const q = (query || '').replace(/[,%()*]/g, '').trim();
  if (!q) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, handle, avatar, avatar_url, bio, city, tags')
    .eq('is_system', false)
    .ilike('handle', `${q}%`)
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// Follower / following / post counts for a profile (aggregate; fine at MVP scale).
export async function getProfileStats(id) {
  const [followers, following, posts] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('followee_id', id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', id),
    supabase.from('feed_posts').select('*', { count: 'exact', head: true }).eq('author_id_public', id),
  ]);
  return {
    followers: followers.count || 0,
    following: following.count || 0,
    posts: posts.count || 0,
  };
}
