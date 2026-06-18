import { supabase } from '../supabase';

// Handles are always stored lowercase (onboarding sanitizes + CHECK enforces),
// so an exact eq is a correct uniqueness check (no LIKE wildcard pitfalls).
export async function checkHandleAvailable(handle) {
  const h = (handle || '').toLowerCase();
  const { data, error } = await supabase
    .from('profiles').select('id').eq('handle', h).maybeSingle();
  if (error) throw error;
  return !data;
}

export async function getProfileById(id) {
  const { data, error } = await supabase
    .from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProfileByHandle(handle) {
  const { data, error } = await supabase
    .from('profiles').select('*').eq('handle', (handle || '').toLowerCase()).maybeSingle();
  if (error) throw error;
  return data;
}

// Insert the current user's profile row. Throws on conflict (handle taken → 23505).
export async function insertProfile(row) {
  const { data, error } = await supabase.from('profiles').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function updateProfile(id, patch) {
  const { data, error } = await supabase
    .from('profiles').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function getSystemAccountIds() {
  const { data, error } = await supabase
    .from('profiles').select('id').eq('is_system', true);
  if (error) throw error;
  return (data || []).map(r => r.id);
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
