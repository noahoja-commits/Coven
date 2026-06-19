import { supabase } from '../supabase';
import { hydratePost, hydrateComment } from '../hydrate';

// Global recent feed (MVP: not follow-scoped) + the current user's own reactions.
export async function fetchFeed(myId, { limit = 50 } = {}) {
  const { data: rows, error } = await supabase
    .from('feed_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;

  const myReactionSet = new Set();
  if (myId) {
    const { data: rx, error: rxErr } = await supabase
      .from('reactions')
      .select('post_id, kind')
      .eq('user_id', myId);
    if (rxErr) throw rxErr;
    (rx || []).forEach(r => myReactionSet.add(`${r.post_id}:${r.kind}`));
  }
  return (rows || []).map(r => hydratePost(r, myReactionSet, myId));
}

// Create a post and return it already hydrated to the client shape.
// `me` = { id, handle, avatar }.
export async function createPost({ body, community, anonymous, poll, kind, img, event, quoted }, me) {
  const insert = {
    author_id: me.id,
    body: body || '',
    community: community || 'general',
    anonymous: !!anonymous,
    kind: kind || (poll ? 'poll' : (quoted ? 'repost' : 'text')),
  };
  if (poll) insert.poll = { options: poll.map((label, i) => ({ id: `po${i}`, label, votes: 0 })), myVote: null };
  if (img) insert.img = img;
  if (event) insert.event = event;
  if (quoted) insert.quoted = quoted;

  const { data, error } = await supabase.from('posts').insert(insert).select().single();
  if (error) throw error;

  return {
    id: data.id,
    kind: data.kind,
    user: anonymous ? 'anonymous' : me.handle,
    avatar: anonymous ? '✟' : me.avatar,
    avatarUrl: anonymous ? undefined : (me.avatarUrl || undefined),
    time: 'just now',
    community: data.community,
    body: data.body,
    img: data.img || undefined,
    event: data.event || undefined,
    poll: data.poll || undefined,
    quoted: data.quoted || undefined,
    anonymous: data.anonymous,
    mine: !anonymous,
    reactions: { bat: 0, fire: 0, skull: 0, smoke: 0 },
    myReactions: {},
    comments: [],
    baseCommentCount: 0,
  };
}

export async function deletePost(postId) {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
}

// Toggle a reaction. `wasMine` = whether the user already had this reaction.
export async function togglePostReaction(postId, kind, userId, wasMine) {
  if (wasMine) {
    const { error } = await supabase.from('reactions')
      .delete().match({ post_id: postId, user_id: userId, kind });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('reactions')
      .insert({ post_id: postId, user_id: userId, kind });
    if (error && error.code !== '23505') throw error; // ignore duplicate
  }
}

export async function fetchComments(postId, myId) {
  const { data, error } = await supabase.rpc('post_comments', { p_post_id: postId });
  if (error) throw error;
  return (data || []).map(r => hydrateComment(r, myId));
}

export async function createComment({ postId, body, parentId }, me) {
  const { data, error } = await supabase.from('comments')
    .insert({ post_id: postId, author_id: me.id, parent_id: parentId || null, body })
    .select().single();
  if (error) throw error;
  return {
    id: data.id, user: me.handle, avatar: me.avatar, body: data.body,
    time: 'just now', mine: true, parentId: data.parent_id || null,
    reactions: { heart: 0, skull: 0 }, myReactions: {},
  };
}
