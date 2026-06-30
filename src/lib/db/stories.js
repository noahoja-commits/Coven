import { supabase } from '../supabase';

function hydrate(s, myId) {
  return {
    id: s.id,
    user: s.handle,
    avatar: s.avatar,
    avatarUrl: s.avatar_url || null,
    glyph: s.glyph,
    caption: s.caption,
    bg: s.bg,
    imageUrl: s.image_url || null,
    postId: s.post_id || null,        // optional attached post (share-to-story)
    attachedPost: null,               // preview, hydrated below
    createdAt: s.created_at,
    expiresAt: new Date(s.expires_at).getTime(),
    mine: !!myId && s.author_id === myId,
  };
}

// All currently-active stories (oldest first), hydrated to the client shape.
export async function fetchActiveStories(myId, { limit = 300 } = {}) {
  // The active_stories view already bounds rows to the unexpired window; the cap is a
  // runaway guard for a high-concurrency spike. Oldest-first preserves story-ring order.
  const { data, error } = await supabase
    .from('active_stories').select('*').order('created_at', { ascending: true }).limit(limit);
  if (error) throw error;
  const stories = (data || []).map(s => hydrate(s, myId));
  // Hydrate previews for share-to-story posts from the PUBLIC feed_posts view
  // (RLS-safe, masks anon authors). A deleted/hidden post just stays null.
  const postIds = [...new Set(stories.map(s => s.postId).filter(Boolean))];
  if (postIds.length) {
    const { data: fp } = await supabase
      .from('feed_posts').select('id, handle, avatar, avatar_url, body, img').in('id', postIds);
    const map = {};
    (fp || []).forEach(p => { map[p.id] = { id: p.id, user: p.handle || 'anonymous', avatar: p.avatar || '✦', avatarUrl: p.avatar_url || null, body: p.body || '', img: p.img || null }; });
    stories.forEach(s => { if (s.postId) s.attachedPost = map[s.postId] || null; });
  }
  return stories;
}

export async function postStory(data, me) {
  const { data: row, error } = await supabase.from('stories')
    .insert({ author_id: me.id, glyph: data.glyph || '✦', caption: data.caption || '', bg: data.bg || 'red', image_url: data.image_url || null, post_id: data.post_id || null })
    .select('*').single();
  if (error) throw error;
  return hydrate({ ...row, handle: me.handle, avatar: me.avatar, avatar_url: me.avatarUrl }, me.id);
}

export async function deleteStory(id) {
  const { error } = await supabase.from('stories').delete().eq('id', id);
  if (error) throw error;
}

// Send (or change) your reaction to a story.
export async function reactToStory(storyId, kind, userId) {
  const { error } = await supabase.from('story_reactions')
    .upsert({ story_id: storyId, user_id: userId, kind }, { onConflict: 'story_id,user_id' });
  if (error) throw error;
}

// Reactions on a story (for the author to see who reacted).
export async function fetchStoryReactors(storyId) {
  const { data, error } = await supabase.rpc('story_reactors', { p_story_id: storyId });
  if (error) throw error;
  return (data || []).map(r => ({ userId: r.user_id, kind: r.kind, user: r.handle, avatar: r.avatar, avatarUrl: r.avatar_url || null }));
}
