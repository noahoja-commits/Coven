import { relativeTime } from './time';

// Map a `feed_posts` view row -> the exact post shape the UI already renders
// (HomeScreen, CommentsOverlay, etc.). myReactionSet is a Set of `${postId}:${kind}`.
export function hydratePost(row, myReactionSet, myId) {
  return {
    id: row.id,
    kind: row.kind,
    user: row.handle,            // 'anonymous' for anon posts (view handles it)
    avatar: row.avatar,          // '✟' for anon
    avatarUrl: row.avatar_url || undefined, // uploaded profile photo (null for anon)
    time: relativeTime(row.created_at),
    createdAt: row.created_at,           // cursor for infinite scroll

    community: row.community,
    body: row.body,
    img: row.img || undefined,
    event: row.event || undefined,
    poll: row.poll || undefined,
    quoted: row.quoted || undefined,
    anonymous: row.anonymous,
    eventId: row.event_id || null,
    mine: !!myId && row.author_id_public === myId, // false for anon (acceptable)
    authorId: row.author_id_public || null,        // for block filtering
    reactions: { bat: row.bat, fire: row.fire, skull: row.skull, smoke: row.smoke },
    myReactions: {
      bat:   myReactionSet.has(`${row.id}:bat`),
      fire:  myReactionSet.has(`${row.id}:fire`),
      skull: myReactionSet.has(`${row.id}:skull`),
      smoke: myReactionSet.has(`${row.id}:smoke`),
    },
    comments: [],                       // lazy-loaded when CommentsOverlay opens
    baseCommentCount: row.comment_count,
  };
}

// Map a post_comments() RPC row -> the comment shape CommentsOverlay renders.
export function hydrateComment(row, myId) {
  return {
    id: row.id,
    user: row.handle,
    avatar: row.avatar,
    avatarUrl: row.avatar_url || undefined,
    body: row.body,
    time: relativeTime(row.created_at),
    mine: !!myId && row.author_id === myId,
    parentId: row.parent_id || null,
    reactions: { heart: 0, skull: 0 }, // comment reactions ephemeral in MVP
    myReactions: {},
  };
}
