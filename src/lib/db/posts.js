import { supabase } from '../supabase';
import { hydratePost, hydrateComment } from '../hydrate';

// Recent feed + the current user's own reactions.
// scope 'everyone' = global; 'following' = posts by people you follow (+ your own).
// before = ISO timestamp cursor for infinite scroll.
export async function fetchFeed(myId, { scope = 'everyone', before = null, limit = 20 } = {}) {
  let q = supabase
    .from('feed_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (before) q = q.lt('created_at', before);
  if (scope === 'following' && myId) {
    const { data: f } = await supabase.from('follows').select('followee_id').eq('follower_id', myId);
    const ids = (f || []).map(r => r.followee_id);
    ids.push(myId); // include your own posts
    q = q.in('author_id_public', ids);
  }
  const { data: rows, error } = await q;
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

  const posts = (rows || []).map(r => hydratePost(r, myReactionSet, myId));

  // Merge live poll tallies + the user's own vote into poll posts.
  const pollIds = posts.filter(p => p.poll).map(p => p.id);
  if (pollIds.length) {
    const [{ data: tallies }, { data: myVotes }] = await Promise.all([
      supabase.from('poll_tallies').select('post_id, option_id, votes').in('post_id', pollIds),
      myId ? supabase.from('poll_votes').select('post_id, option_id').eq('user_id', myId).in('post_id', pollIds) : Promise.resolve({ data: [] }),
    ]);
    const tally = {}; (tallies || []).forEach(t => { (tally[t.post_id] ||= {})[t.option_id] = t.votes; });
    const mine = {}; (myVotes || []).forEach(v => { mine[v.post_id] = v.option_id; });
    posts.forEach(p => {
      if (!p.poll) return;
      p.poll = {
        ...p.poll,
        myVote: mine[p.id] || null,
        options: p.poll.options.map(o => ({ ...o, votes: tally[p.id]?.[o.id] || 0 })),
      };
    });
  }
  return posts;
}

// Per-scene activity: real post counts + most-recent post time, grouped by
// community. Powers the Scenes screen so its numbers reflect actual activity
// instead of hardcoded fixtures. Returns { [communityId]: { posts, latest } }.
export async function fetchCommunityStats() {
  const { data, error } = await supabase
    .from('feed_posts')
    .select('community, created_at')
    .order('created_at', { ascending: false })
    .limit(2000);
  if (error) throw error;
  const stats = {};
  (data || []).forEach(r => {
    const key = r.community || 'general';
    if (!stats[key]) stats[key] = { posts: 0, latest: null };
    stats[key].posts += 1;
    if (!stats[key].latest || r.created_at > stats[key].latest) stats[key].latest = r.created_at;
  });
  return stats;
}

// A user's own posts (newest first) for their profile grid — lightweight shape.
export async function fetchUserPosts(authorId, { limit = 60 } = {}) {
  const { data, error } = await supabase
    .from('feed_posts')
    .select('id, kind, img, body, community, created_at')
    .eq('author_id_public', authorId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(r => ({ id: r.id, kind: r.kind, img: r.img || null, body: r.body || '', community: r.community }));
}

// Cast or change a poll vote (one row per user per poll).
export async function castPollVote(postId, optionId, userId) {
  const { error } = await supabase.from('poll_votes')
    .upsert({ post_id: postId, user_id: userId, option_id: optionId }, { onConflict: 'post_id,user_id' });
  if (error) throw error;
}

export async function clearPollVote(postId, userId) {
  const { error } = await supabase.from('poll_votes').delete().match({ post_id: postId, user_id: userId });
  if (error) throw error;
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
    createdAt: data.created_at,
    authorId: anonymous ? null : me.id,
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
    id: data.id, user: me.handle, avatar: me.avatar, avatarUrl: me.avatarUrl || undefined, body: data.body,
    time: 'just now', mine: true, parentId: data.parent_id || null,
    reactions: { heart: 0, skull: 0 }, myReactions: {},
  };
}
