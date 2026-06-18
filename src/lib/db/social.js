import { supabase } from '../supabase';

// Returns the current user's follow graph in the client's `{handle: timestamp}`
// shape (so SoulsOverlay/UserProfileOverlay/NewGroupDMModal stay unchanged),
// plus an idByHandle map used to resolve unfollows.
export async function fetchFollowing(myId) {
  const { data: rows, error } = await supabase
    .from('follows').select('followee_id, created_at').eq('follower_id', myId);
  if (error) throw error;
  const ids = (rows || []).map(r => r.followee_id);
  if (!ids.length) return { map: {}, idByHandle: {} };

  const { data: profs, error: pErr } = await supabase
    .from('profiles').select('id, handle').in('id', ids);
  if (pErr) throw pErr;
  const handleById = Object.fromEntries((profs || []).map(p => [p.id, p.handle]));

  const map = {}, idByHandle = {};
  (rows || []).forEach(r => {
    const h = handleById[r.followee_id];
    if (h) { map[h] = new Date(r.created_at).getTime(); idByHandle[h] = r.followee_id; }
  });
  return { map, idByHandle };
}

export async function followUser(myId, followeeId) {
  const { error } = await supabase.from('follows')
    .insert({ follower_id: myId, followee_id: followeeId });
  if (error && error.code !== '23505') throw error; // ignore duplicate
}

export async function unfollowUser(myId, followeeId) {
  const { error } = await supabase.from('follows')
    .delete().match({ follower_id: myId, followee_id: followeeId });
  if (error) throw error;
}

// Auto-follow the house/system accounts for a brand-new user so the
// "following" view has content from day one.
export async function followSystemAccounts(myId, systemIds) {
  const rows = systemIds.filter(id => id !== myId).map(id => ({ follower_id: myId, followee_id: id }));
  if (!rows.length) return;
  const { error } = await supabase.from('follows').insert(rows);
  if (error && error.code !== '23505') throw error;
}
