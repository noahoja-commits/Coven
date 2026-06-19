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

export async function reportContent(kind, targetId, reason = '') {
  const me = (await supabase.auth.getUser()).data.user?.id;
  const { error } = await supabase.from('reports').insert({ reporter_id: me, target_kind: kind, target_id: targetId, reason });
  if (error) throw error;
}
