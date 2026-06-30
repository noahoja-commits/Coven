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
    avatarUrl: c.is_group ? null : (c.other_avatar_url || null),
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
    // Name the FK explicitly: messages_dm has two relationships to profiles (sender_id +
    // the message_reactions m2m), so a bare profiles embed is ambiguous (PGRST201).
    .select('id, body, created_at, sender_id, forwarded_post_id, audio_url, sender:profiles!messages_dm_sender_id_fkey(handle)')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  const msgs = (data || []).map(m => ({
    id: m.id,
    from: m.sender_id === myId ? 'me' : (m.sender?.handle || 'someone'),
    body: m.body,
    time: relativeTime(m.created_at),
    forwardedPostId: m.forwarded_post_id || null,
    forwardedPost: null,
    audioUrl: m.audio_url || null,
    reactions: { bat: 0, fire: 0, skull: 0, smoke: 0 },
    myReactions: {},
  }));
  // Attach forwarded-post previews from the PUBLIC feed_posts view (masks anon authors,
  // and RLS-safe — the recipient can't read the raw posts table). Pre-migration the
  // forwarded_post_id column is absent → the select above errors and we never get here.
  const fwIds = [...new Set(msgs.map(m => m.forwardedPostId).filter(Boolean))];
  if (fwIds.length) {
    const { data: fp } = await supabase
      .from('feed_posts').select('id, handle, avatar, avatar_url, body, img').in('id', fwIds);
    const fwMap = {};
    (fp || []).forEach(p => { fwMap[p.id] = { id: p.id, handle: p.handle, avatar: p.avatar, avatarUrl: p.avatar_url || null, body: p.body || '', img: p.img || null }; });
    msgs.forEach(m => { if (m.forwardedPostId) m.forwardedPost = fwMap[m.forwardedPostId] || { id: m.forwardedPostId, removed: true }; });
  }
  // Aggregate per-message reactions. Pre-migration the table doesn't exist → the
  // query errors, we ignore it, and messages simply render with no chips.
  const ids = msgs.map(m => m.id);
  if (ids.length) {
    const { data: rx } = await supabase
      .from('message_reactions')
      .select('message_id, user_id, kind')
      .in('message_id', ids);
    if (rx) {
      const byId = {}; msgs.forEach(m => { byId[m.id] = m; });
      rx.forEach(r => {
        const m = byId[r.message_id]; if (!m) return;
        m.reactions[r.kind] = (m.reactions[r.kind] || 0) + 1;
        if (r.user_id === myId) m.myReactions[r.kind] = true;
      });
    }
  }
  return msgs;
}

// Toggle one reaction on a single whisper (one row per user/message/kind).
export async function toggleDMReaction(messageId, kind, userId, wasMine) {
  if (wasMine) {
    const { error } = await supabase.from('message_reactions')
      .delete().match({ message_id: messageId, user_id: userId, kind });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('message_reactions')
      .insert({ message_id: messageId, user_id: userId, kind });
    if (error) throw error;
  }
}

// Live reaction changes (RLS scopes reads to your own conversations, like messages).
export function subscribeDMReactions(onChange) {
  const ch = supabase
    .channel('dm-reactions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' },
      payload => onChange(payload))
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}

export async function sendDM(convId, senderId, body, audioUrl = null) {
  const payload = { conversation_id: convId, sender_id: senderId, body };
  if (audioUrl) payload.audio_url = audioUrl;
  const { data, error } = await supabase
    .from('messages_dm')
    .insert(payload)
    .select('id, body, created_at, audio_url').single();
  if (error) throw error;
  return { id: data.id, from: 'me', body: data.body, time: relativeTime(data.created_at), audioUrl: data.audio_url || null };
}

// Forward a feed post into a whisper (optionally with a note).
export async function sendPostToDM(convId, senderId, postId, body = '') {
  const { data, error } = await supabase
    .from('messages_dm')
    .insert({ conversation_id: convId, sender_id: senderId, body: body || '', forwarded_post_id: postId })
    .select('id, created_at').single();
  if (error) throw error;
  return { id: data.id, from: 'me', body: body || '', time: relativeTime(data.created_at) };
}

export async function markRead(convId, userId) {
  const { error } = await supabase.from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', convId).eq('user_id', userId);
  if (error) throw error;
}

export async function setBuried(convId, userId, buried) {
  const { error } = await supabase.from('conversation_members')
    .update({ buried })
    .eq('conversation_id', convId).eq('user_id', userId);
  if (error) throw error;
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

// ── Ephemeral typing presence ──────────────────────────────────────────────
// Pure Realtime broadcast (no DB table) — each conversation gets its own channel
// keyed by its unguessable UUID. Transient signalling, so the occasional dropped
// packet is harmless and nothing is ever persisted.
const typingChannels = {}; // convId -> channel (shared between subscribe + broadcast)

export function subscribeTyping(convId, onTyping, onTypingStop) {
  const ch = supabase.channel(`typing:${convId}`, { config: { broadcast: { self: false } } });
  ch.on('broadcast', { event: 'typing' }, ({ payload }) => onTyping(payload?.user))
    .on('broadcast', { event: 'typing_stop' }, ({ payload }) => onTypingStop(payload?.user))
    .subscribe();
  typingChannels[convId] = ch;
  return () => { supabase.removeChannel(ch); if (typingChannels[convId] === ch) delete typingChannels[convId]; };
}

export function broadcastTyping(convId, meHandle) {
  typingChannels[convId]?.send({ type: 'broadcast', event: 'typing', payload: { user: meHandle } });
}

export function broadcastTypingStop(convId, meHandle) {
  typingChannels[convId]?.send({ type: 'broadcast', event: 'typing_stop', payload: { user: meHandle } });
}
