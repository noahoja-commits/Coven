import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Hash, ArrowLeft, TrendingUp } from 'lucide-react';
import { F } from '../../styles/fonts';
import { supabase } from '../../lib/supabase';
import { Reaction } from '../shared/Reaction';
import { PostImage } from '../shared/Visuals';
import { renderRichText } from '../shared/RichText';
import { Bat, Flame as FlameGlyph, Skull as SkullGlyph, Smoke } from '../shared/ReactionGlyphs';

const PAGE_SIZE = 20;

/**
 * Dedicated hashtag feed page — shows all posts containing a given hashtag,
 * with server-side pagination and trending related tags.
 */
export function HashtagFeed({ tag, onClose, onOpenPost, onOpenUser, onReact, onOpenHashtag, meId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [relatedTags, setRelatedTags] = useState([]);
  const [error, setError] = useState(null);
  const loaderRef = useRef(null);
  const beforeRef = useRef(null);

  // Fetch posts for this hashtag
  const fetchPosts = useCallback(async (before) => {
    try {
      const q = `%#${tag.toLowerCase()}%`;
      let query = supabase
        .from('feed_posts')
        .select('*')
        .ilike('body', q)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (before) query = query.lt('created_at', before);

      const { data, error: err } = await query;
      if (err) throw err;

      // Hydrate which reactions are mine (table is `reactions`, keyed by user_id).
      let myReactionSet = new Set();
      if (meId && data?.length) {
        const ids = data.map(p => p.id);
        const { data: rx } = await supabase
          .from('reactions')
          .select('post_id, kind')
          .in('post_id', ids)
          .eq('user_id', meId);
        if (rx) rx.forEach(r => myReactionSet.add(`${r.post_id}:${r.kind}`));
      }

      const hydrated = (data || []).map(row => ({
        id: row.id,
        kind: row.kind,
        user: row.handle,
        avatar: row.avatar,
        avatarUrl: row.avatar_url || undefined,
        time: row.created_at,
        community: row.community,
        body: row.body,
        img: row.img || undefined,
        anonymous: row.anonymous,
        mine: row.author_id_public === meId,
        authorId: row.author_id_public || null,
        reactions: { bat: row.bat, fire: row.fire, skull: row.skull, smoke: row.smoke },
        myReactions: {
          bat: myReactionSet.has(`${row.id}:bat`),
          fire: myReactionSet.has(`${row.id}:fire`),
          skull: myReactionSet.has(`${row.id}:skull`),
          smoke: myReactionSet.has(`${row.id}:smoke`),
        },
        commentCount: row.comment_count,
      }));

      if (before) {
        setPosts(prev => [...prev, ...hydrated]);
      } else {
        setPosts(hydrated);
      }
      setHasMore(data?.length === PAGE_SIZE);
      if (data?.length) beforeRef.current = data[data.length - 1].created_at;
    } catch (e) {
      setError(e?.message || 'Failed to load posts');
    }
    setLoading(false);
  }, [tag, meId]);

  // Optimistic local react so the count moves immediately; reactToPost persists it.
  const handleReact = (postId, kind) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const mine = !!p.myReactions?.[kind];
      return {
        ...p,
        myReactions: { ...p.myReactions, [kind]: !mine },
        reactions: { ...p.reactions, [kind]: Math.max(0, (p.reactions?.[kind] || 0) + (mine ? -1 : 1)) },
      };
    }));
    onReact?.(postId, kind);
  };

  // Initial load
  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setHasMore(true);
    setError(null);
    fetchPosts(null);
  }, [fetchPosts]);

  // Fetch related tags from this hashtag's posts
  useEffect(() => {
    if (!posts.length) return;
    const counts = {};
    for (const p of posts) {
      if (!p.body) continue;
      const matches = p.body.match(/#[a-zA-Z0-9_]+/g) || [];
      for (const t of matches) {
        const k = t.slice(1).toLowerCase();
        if (k === tag.toLowerCase()) continue;
        counts[k] = (counts[k] || 0) + 1;
      }
    }
    setRelatedTags(
      Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
    );
  }, [posts, tag]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) fetchPosts(beforeRef.current);
    }, { rootMargin: '200px' });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchPosts]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center gap-3">
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <Hash size={18} className="text-[#9E2A33]" />
          <div className="flex-1 min-w-0">
            <div className="text-[#F5F1E8] text-sm font-semibold" style={F.ui}>{tag}</div>
            <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </div>
          </div>
        </div>
      </div>

      {/* Related tags */}
      {relatedTags.length > 0 && (
        <div className="px-4 py-2 border-b border-[#1A1A1A] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 text-[10px] text-[#A8A29E] mb-1.5" style={F.ui}>
            <TrendingUp size={10} /> related
          </div>
          <div className="flex gap-1.5">
            {relatedTags.map(([t, c]) => (
              <button key={t} onClick={() => onOpenHashtag?.(t)}
                className="tap px-2.5 py-1 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#9E2A33] hover:border-[#9E2A33]/50 text-[11px] transition-colors whitespace-nowrap"
                style={F.ui}>
                #{t} <span className="text-[#6B6B6B] ml-0.5">{c}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-[#6B6B6B] text-sm mb-2" style={F.ui}>couldn't load posts</div>
          <button onClick={() => { setError(null); fetchPosts(null); }}
            className="btn btn-ghost text-xs">try again</button>
        </div>
      )}

      {/* Loading state */}
      {loading && !posts.length && (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-[#6B6B6B] text-xs" style={F.ui}>gathering the coven…</div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && posts.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Hash size={32} className="text-[#2A2A2A] mb-3" />
          <div className="text-[#6B6B6B] text-sm mb-1" style={F.ui}>no posts with #{tag}</div>
          <div className="text-[#6B6B6B] text-[11px]" style={F.ui}>be the first to use this tag</div>
        </div>
      )}

      {/* Posts */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {posts.map(post => (
          <article key={post.id} className="card p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center text-xs overflow-hidden shrink-0">
                {post.avatarUrl ? <img src={post.avatarUrl} className="w-full h-full object-cover" alt="" /> : <span>{post.avatar}</span>}
              </div>
              <button onClick={() => onOpenUser?.(post.user)}
                className="text-xs text-[#F5F1E8] hover:text-[#C9A961] transition-colors" style={F.ui}>
                {post.anonymous ? <span className="italic text-[#6B6B6B]">anonymous</span> : post.user}
              </button>
              <span className="text-[9px] text-[#6B6B6B] ml-auto" style={F.mono}>{post.time}</span>
            </div>

            {/* Body with hashtags rendered */}
            {post.body && (
              <div className="text-[#F5F1E8] text-[15px] leading-relaxed mb-3" style={F.serif}
                onClick={() => onOpenPost?.(post.id)}>
                {renderRichText(post.body, { onOpenHashtag: (t) => onOpenHashtag?.(t) })}
              </div>
            )}

            {/* Media */}
            {(post.kind === 'photo' || post.kind === 'video') && (
              <div className="mb-3"><PostImage kind={post.img} /></div>
            )}

            {/* Reactions */}
            <div className="rule opacity-40 mb-2.5 mt-1" />
            <div className="flex items-center -ml-2">
              <Reaction glyph={Bat} count={post.reactions.bat} active={post.myReactions?.bat} onClick={() => handleReact(post.id, 'bat')} />
              <Reaction glyph={FlameGlyph} count={post.reactions.fire} active={post.myReactions?.fire} onClick={() => handleReact(post.id, 'fire')} />
              <Reaction glyph={SkullGlyph} count={post.reactions.skull} active={post.myReactions?.skull} onClick={() => handleReact(post.id, 'skull')} />
              <Reaction glyph={Smoke} count={post.reactions.smoke} active={post.myReactions?.smoke} onClick={() => handleReact(post.id, 'smoke')} />
            </div>
          </article>
        ))}

        {/* Infinite scroll trigger */}
        {hasMore && (
          <div ref={loaderRef} className="py-4 text-center">
            <div className="animate-pulse text-[#6B6B6B] text-[10px]" style={F.ui}>more…</div>
          </div>
        )}
      </div>
    </div>
  );
}
