import { supabase } from '../supabase';

function hydrate(s, myId) {
  return {
    id: s.id,
    user: s.handle,
    avatar: s.avatar,
    glyph: s.glyph,
    caption: s.caption,
    bg: s.bg,
    imageUrl: s.image_url || null,
    createdAt: s.created_at,
    expiresAt: new Date(s.expires_at).getTime(),
    mine: !!myId && s.author_id === myId,
  };
}

// All currently-active stories (oldest first), hydrated to the client shape.
export async function fetchActiveStories(myId) {
  const { data, error } = await supabase
    .from('active_stories').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(s => hydrate(s, myId));
}

export async function postStory(data, me) {
  const { data: row, error } = await supabase.from('stories')
    .insert({ author_id: me.id, glyph: data.glyph || '✦', caption: data.caption || '', bg: data.bg || 'red', image_url: data.image_url || null })
    .select('*').single();
  if (error) throw error;
  return hydrate({ ...row, handle: me.handle, avatar: me.avatar }, me.id);
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
