import { supabase } from '../supabase';

// Every profile column EXCEPT birthday (which is column-locked to the owner at the
// DB level — read via the my_birthday rpc). Use this instead of select('*').
const PROFILE_COLS_FULL = 'id, handle, avatar, avatar_url, bio, city, created_at, is_system, pronouns, scenes, tags, decor, mood, archetype, tos_version, tos_accepted_at';
// Cascade fallbacks so reads don't break before a column's migration is applied:
// full → drop tos_* (pre-0065) → drop mood/archetype (keeps decor) → drop `decor` (pre-0028).
// Pre-migration, tos_version is absent (undefined) on the result — the TermsGate
// treats undefined as "column not deployed yet" and stays hidden (fail-open).
const PROFILE_COLS_NO_TOS = 'id, handle, avatar, avatar_url, bio, city, created_at, is_system, pronouns, scenes, tags, decor, mood, archetype';
const PROFILE_COLS = 'id, handle, avatar, avatar_url, bio, city, created_at, is_system, pronouns, scenes, tags, decor';
const PROFILE_COLS_BASE = 'id, handle, avatar, avatar_url, bio, city, created_at, is_system, pronouns, scenes, tags';

async function selectProfile(col, val) {
  let res = await supabase.from('profiles').select(PROFILE_COLS_FULL).eq(col, val).maybeSingle();
  if (res.error && /tos_/i.test(res.error.message || '')) {
    res = await supabase.from('profiles').select(PROFILE_COLS_NO_TOS).eq(col, val).maybeSingle();
  }
  if (res.error && /mood|archetype/i.test(res.error.message || '')) {
    res = await supabase.from('profiles').select(PROFILE_COLS).eq(col, val).maybeSingle();
  }
  if (res.error && /decor/i.test(res.error.message || '')) {
    res = await supabase.from('profiles').select(PROFILE_COLS_BASE).eq(col, val).maybeSingle();
  }
  return res;
}

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
  const { data, error } = await selectProfile('id', id);
  if (error) throw error;
  if (!data) return data;
  const { data: bday } = await supabase.rpc('my_birthday');
  return { ...data, birthday: bday || null };
}

// Another user's public profile — never includes birthday.
export async function getProfileByHandle(handle) {
  const { data, error } = await selectProfile('handle', (handle || '').toLowerCase());
  if (error) throw error;
  return data;
}

// Insert the current user's profile row. Throws on conflict (handle taken → 23505).
export async function insertProfile(row) {
  let res = await supabase.from('profiles').insert(row).select('id, handle').single();
  // Pre-0065: tos_* columns don't exist yet — retry without them so onboarding
  // never blocks on a lagging migration (acceptance is re-collected by TermsGate).
  if (res.error && /tos_/i.test(res.error.message || '') && (row.tos_version !== undefined || row.tos_accepted_at !== undefined)) {
    const { tos_version, tos_accepted_at, ...rest } = row;
    res = await supabase.from('profiles').insert(rest).select('id, handle').single();
  }
  if (res.error) throw res.error;
  return res.data;
}

export async function updateProfile(id, patch) {
  let res = await supabase.from('profiles').update(patch).eq('id', id).select('id, handle').single();
  // Pre-migration: drop the missing column and retry so the rest of the profile still saves.
  if (res.error && /tos_/i.test(res.error.message || '') && (patch.tos_version !== undefined || patch.tos_accepted_at !== undefined)) {
    const { tos_version, tos_accepted_at, ...rest } = patch;
    if (!Object.keys(rest).length) return { id }; // tos-only patch pre-0065 → no-op, fail open
    res = await supabase.from('profiles').update(rest).eq('id', id).select('id, handle').single();
  }
  if (res.error && /mood|archetype/i.test(res.error.message || '') && (patch.mood !== undefined || patch.archetype !== undefined)) {
    const { mood, archetype, ...rest } = patch;
    res = await supabase.from('profiles').update(rest).eq('id', id).select('id, handle').single();
  }
  if (res.error && /decor/i.test(res.error.message || '') && patch.decor !== undefined) {
    const { decor, ...rest } = patch;
    res = await supabase.from('profiles').update(rest).eq('id', id).select('id, handle').single();
  }
  if (res.error) throw res.error;
  return res.data;
}

/** Persist per-kind notification preferences to the DB (read server-side by api/push.js).
 *  Gracefully handles pre-migration (column doesn't exist) by silently skipping. */
export async function saveNotificationPrefs(id, prefs) {
  let res = await supabase.from('profiles').update({ notification_prefs: prefs }).eq('id', id);
  // Pre-migration: column doesn't exist yet — skip rather than throw
  if (res.error && /notification_prefs/i.test(res.error.message || '')) return;
  if (res.error) throw res.error;
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
  // Follower/following counts come from a SECURITY DEFINER rpc so the follow graph
  // itself stays private (raw `follows` is locked to own edges). Fall back to direct
  // counts for the window before migration 0029 adds the rpc.
  const [counts, posts] = await Promise.all([
    supabase.rpc('profile_follow_counts', { p_id: id }),
    supabase.from('feed_posts').select('*', { count: 'exact', head: true }).eq('author_id_public', id),
  ]);
  let followers = 0, following = 0;
  if (!counts.error && counts.data && counts.data[0]) {
    followers = Number(counts.data[0].followers) || 0;
    following = Number(counts.data[0].following) || 0;
  } else {
    const [f1, f2] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('followee_id', id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', id),
    ]);
    followers = f1.count || 0; following = f2.count || 0;
  }
  return { followers, following, posts: posts.count || 0 };
}
