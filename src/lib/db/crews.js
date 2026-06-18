import { supabase } from '../supabase';

// Public crew directory + whether the current user is a member.
export async function listCrews() {
  const { data, error } = await supabase.rpc('list_crews');
  if (error) throw error;
  return (data || []).map(c => ({
    id: c.id,
    name: c.name,
    glyph: c.glyph || '✦',
    description: c.description || '',
    members: c.member_count || 0,
    isMember: !!c.is_member,
  }));
}

export async function createCrew(name, glyph, description) {
  const { data, error } = await supabase.rpc('create_crew', { p_name: name, p_glyph: glyph, p_description: description || '' });
  if (error) throw error;
  return data; // conversation id
}

export async function joinCrew(convId) {
  const { error } = await supabase.rpc('join_crew', { p_conv: convId });
  if (error) throw error;
}

export async function leaveCrew(convId) {
  const { error } = await supabase.rpc('leave_crew', { p_conv: convId });
  if (error) throw error;
}
