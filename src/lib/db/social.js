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
    .from('profiles').select('id, handle, avatar, avatar_url, bio').in('id', ids);
  if (pErr) throw pErr;
  const byId = Object.fromEntries((profs || []).map(p => [p.id, p]));

  const map = {}, idByHandle = {}, people = [];
  (rows || []).forEach(r => {
    const p = byId[r.followee_id];
    if (p) {
      map[p.handle] = new Date(r.created_at).getTime();
      idByHandle[p.handle] = r.followee_id;
      people.push({ id: p.id, handle: p.handle, avatar: p.avatar, avatarUrl: p.avatar_url, bio: p.bio });
    }
  });
  return { map, idByHandle, people };
}

// Who follows ME — your own followers list. RLS (migration 0029) lets you read your own
// edges (followee_id = you), so this works for the signed-in user only, not for others.
export async function fetchFollowers(myId) {
  const { data: rows, error } = await supabase
    .from('follows').select('follower_id, created_at').eq('followee_id', myId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const ids = (rows || []).map(r => r.follower_id);
  if (!ids.length) return [];

  const { data: profs, error: pErr } = await supabase
    .from('profiles').select('id, handle, avatar, avatar_url, bio').in('id', ids);
  if (pErr) throw pErr;
  const byId = Object.fromEntries((profs || []).map(p => [p.id, p]));
  return (rows || [])
    .map(r => byId[r.follower_id])
    .filter(Boolean)
    .map(p => ({ id: p.id, handle: p.handle, avatar: p.avatar, avatarUrl: p.avatar_url, bio: p.bio }));
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
