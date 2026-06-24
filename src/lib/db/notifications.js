import { supabase } from '../supabase';
import { relativeTime } from '../time';

const REACT_EMOJI = { bat: '🦇', fire: '🔥', skull: '💀', smoke: '💨' };

function text(n) {
  switch (n.kind) {
    case 'follow':  return 'followed you';
    case 'react':   return `reacted ${REACT_EMOJI[n.reaction] || ''} to your post`;
    case 'comment': return n.body ? `commented: "${n.body}"` : 'commented on your post';
    case 'dm':      return n.body ? `whispered: "${n.body}"` : 'sent you a whisper';
    case 'story_react': return `reacted ${n.reaction || ''} to your story`;
    case 'rsvp':      return n.body ? `is coming to ${n.body}` : 'is coming to your event';
    case 'crew_join': return n.body ? `joined ${n.body}` : 'joined your crew';
    case 'mention':   return 'mentioned you';
    case 'coauthor':  return n.body ? `co-signed a post with you: "${n.body}"` : 'co-signed a post with you';
    default:        return 'did something';
  }
}

function hydrate(n) {
  return {
    id: n.id,
    kind: n.kind,
    user: n.actor_handle || 'someone',
    avatar: n.actor_avatar || '✦',
    avatarUrl: n.actor_avatar_url || null,
    text: text(n),
    read: !!n.read,
    time: relativeTime(n.created_at),
    postId: n.post_id || null,
    conversationId: n.conversation_id || null,
  };
}

export async function fetchNotifications() {
  const { data, error } = await supabase.rpc('my_notifications');
  if (error) throw error;
  return (data || []).map(hydrate);
}

export async function markNotificationRead(id) {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false);
  if (error) throw error;
}

export async function clearNotifications(myId) {
  // delete the caller's notifications — explicit user_id scope (defense-in-depth over RLS)
  // and surface failures instead of swallowing them.
  let q = supabase.from('notifications').delete();
  q = myId ? q.eq('user_id', myId) : q.gte('created_at', '1970-01-01');
  const { error } = await q;
  if (error) throw error;
}

// Realtime: new notifications for the current user (RLS scopes the stream).
export function subscribeNotifications(onInsert) {
  const ch = supabase
    .channel('notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' },
      payload => onInsert(payload.new))
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}

// A single fresh row (from realtime) hydrated; we refetch handle/avatar lazily,
// so realtime inserts show with a generic actor until the next full fetch.
export function hydrateRealtime(row) {
  return hydrate({
    kind: row.kind, actor_handle: null, actor_avatar: '✦', actor_avatar_url: null,
    reaction: row.reaction, body: row.body, read: row.read, created_at: row.created_at,
    post_id: row.post_id, conversation_id: row.conversation_id, id: row.id,
  });
}
