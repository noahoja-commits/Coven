import { supabase } from '../supabase';

// Server-backed scene membership (migration 0031). Rows are private (own-only RLS);
// public member counts come from the community_member_counts() definer rpc.

export async function joinCommunity(communityId) {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return;
  const { error } = await supabase.from('community_members')
    .insert({ user_id: uid, community_id: communityId });
  if (error && error.code !== '23505') throw error; // ignore duplicate
}

export async function leaveCommunity(communityId) {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return;
  const { error } = await supabase.from('community_members')
    .delete().match({ user_id: uid, community_id: communityId });
  if (error) throw error;
}

// { [communityId]: memberCount }. Empty object before migration 0031 / on error.
export async function fetchCommunityMemberCounts() {
  const { data, error } = await supabase.rpc('community_member_counts');
  if (error) throw error;
  const out = {};
  (data || []).forEach(r => { out[r.community_id] = Number(r.members) || 0; });
  return out;
}
