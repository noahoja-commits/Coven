import { supabase } from '../supabase';

// All user ids blocked by me or who blocked me (for two-way hiding).
export async function fetchBlockedIds() {
  const { data, error } = await supabase.rpc('my_blocked_ids');
  if (error) throw error;
  return (data || []).map(r => r.id);
}

export async function blockUser(blockedId) {
  const { error } = await supabase.from('blocks').insert({ blocker_id: (await supabase.auth.getUser()).data.user?.id, blocked_id: blockedId });
  if (error) throw error;
}

export async function unblockUser(blockedId) {
  const me = (await supabase.auth.getUser()).data.user?.id;
  const { error } = await supabase.from('blocks').delete().match({ blocker_id: me, blocked_id: blockedId });
  if (error) throw error;
}

// Profiles the current user has blocked (for the manage-blocked screen).
export async function fetchBlockedProfiles() {
  const me = (await supabase.auth.getUser()).data.user?.id;
  if (!me) return [];
  const { data: rows, error } = await supabase
    .from('blocks').select('blocked_id, created_at')
    .eq('blocker_id', me).order('created_at', { ascending: false });
  if (error) throw error;
  const ids = (rows || []).map(r => r.blocked_id);
  if (!ids.length) return [];
  // explicit columns — profiles.birthday is column-locked
  const { data: profs } = await supabase
    .from('profiles').select('id, handle, avatar, avatar_url').in('id', ids);
  const byId = Object.fromEntries((profs || []).map(p => [p.id, p]));
  return ids.map(id => ({
    id,
    handle: byId[id]?.handle || 'someone',
    avatar: byId[id]?.avatar || '✦',
    avatarUrl: byId[id]?.avatar_url || null,
  }));
}

export async function reportContent(kind, targetId, reason = '') {
  const me = (await supabase.auth.getUser()).data.user?.id;
  const { error } = await supabase.from('reports').insert({ reporter_id: me, target_kind: kind, target_id: targetId, reason });
  if (error) throw error;
}
