import { supabase } from '../supabase';
import { relativeTime } from '../time';

// Whole inbox, mapped to the client conversation shape DMsOverlay/ChatThread use.
export async function fetchConversations() {
  const { data, error } = await supabase.rpc('my_conversations');
  if (error) throw error;
  return (data || []).map(c => ({
    id: c.id,
    user: c.is_group ? (c.title || 'whisper circle') : (c.other_handle || 'someone'),
    avatar: c.is_group ? (c.glyph || '✦') : (c.other_avatar || '✦'),
    last: c.last_body || '',
    time: c.last_at ? relativeTime(c.last_at) : '',
    unread: c.unread || 0,
    buried: !!c.buried,
    group: c.is_group,
  }));
}

export async function getOrCreateDM(otherId) {
  const { data, error } = await supabase.rpc('get_or_create_dm', { p_other: otherId });
  if (error) throw error;
  return data; // conversation id
}

export async function createGroup(title, memberIds) {
  const { data, error } = await supabase.rpc('create_group', { p_title: title || '', p_members: memberIds });
  if (error) throw error;
  return data;
}

export async function fetchMessages(convId, myId) {
  const { data, error } = await supabase
    .from('messages_dm')
    .select('id, body, created_at, sender_id, sender:profiles(handle)')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(m => ({
    id: m.id,
    from: m.sender_id === myId ? 'me' : (m.sender?.handle || 'someone'),
    body: m.body,
    time: relativeTime(m.created_at),
  }));
}

export async function sendDM(convId, senderId, body) {
  const { data, error } = await supabase
    .from('messages_dm')
    .insert({ conversation_id: convId, sender_id: senderId, body })
    .select('id, body, created_at').single();
  if (error) throw error;
  return { id: data.id, from: 'me', body: data.body, time: relativeTime(data.created_at) };
}

export async function markRead(convId, userId) {
  await supabase.from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', convId).eq('user_id', userId);
}

export async function setBuried(convId, userId, buried) {
  await supabase.from('conversation_members')
    .update({ buried })
    .eq('conversation_id', convId).eq('user_id', userId);
}

// Live message delivery. RLS scopes inserts to the user's own conversations,
// so the callback only fires for messages they're allowed to see.
export function subscribeDMs(onInsert) {
  const ch = supabase
    .channel('dm-messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages_dm' },
      payload => onInsert(payload.new))
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}
