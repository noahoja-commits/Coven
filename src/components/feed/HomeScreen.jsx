import { useState, useMemo, useRef, useEffect } from 'react';
import { MessageCircle, MoreHorizontal, Eye, Bookmark, Trash2, Flame, EyeOff, Repeat, Pin, Loader2, Send } from 'lucide-react';
import { F } from '../../styles/fonts';
import { Reaction } from '../shared/Reaction';
import { PostImage } from '../shared/Visuals';
import { renderRichText } from '../shared/RichText';
import { EmptyState } from '../shared/EmptyState';
import { AllSeeingEye, TripleMoon, BarcodeDivider } from '../shared/Sigils';
import { buzz } from '../../lib/haptics';
import { getDailyCard } from '../../data/tarot';
import { darkDay, todaysVespers, todaysCodex } from '../../data/helpers';
import { DailyAltar } from './DailyAltar';
import { TEXTS } from '../../data/library';
import { CODEX } from '../../data/codex';
import { recordView, fetchViewCounts } from '../../lib/db/views';
import { Bat, Flame as FlameGlyph, Skull as SkullGlyph, Smoke } from '../shared/ReactionGlyphs';
import { FeatureBoundary } from '../FeatureBoundary';

export function HomeScreen({
  posts, onReact, onOpenComments, onOpenCommunity, onOpenUser, onDeletePost, onHidePost, onQuotePost, onWhisperPost, onTogglePin, pinnedPostId, feedSort = 'latest', onSetFeedSort,
  feedScope = 'everyone', onSetFeedScope, onLoadMore, feedHasMore = false, onReportPost,
  bookmarks = {}, onToggleBookmark, postCandles = {}, onToggleCandle, onOpenEvent, onVotePoll,
  onOpenStory, onCreateStory, stories = [], seenStories = {}, meHandle = 'you', meAvatar = '☾',
  tonightStatus, onOpenTonightStatus, onOpenTarot, onOpenEphemeris, onOpenCodex, onOpenHashtag, onOpenVespersArchive,
  ritual, ritualDoneToday, onPerformRitual, crystals = [], trackers = {}, onUpdateTracker, onOpenReflections,
  feedLoading = false, suggestedSouls = [], following = {}, onFollow, witching = false, vigil = false,
  settings = {},
}) {
  // Posts fade + desaturate with age (only when the living theme is on).
  const decayOn = settings.livingTheme !== false;
  const postAgeStyle = (createdAt) => {
    if (!decayOn || !createdAt) return undefined;
    const hrs = (Date.now() - new Date(createdAt).getTime()) / 3600000;
    const opacity = hrs < 4 ? 1 : hrs < 12 ? 0.94 : hrs < 24 ? 0.86 : hrs < 72 ? 0.76 : 0.62;
    return { opacity, filter: hrs > 168 ? 'grayscale(0.35)' : undefined, transition: 'opacity 0.6s' };
  };
  const tarotOn = settings.tarotEnabled !== false;
  const vespersOn = settings.vespersEnabled !== false;
  const ghostOn = !!settings.ghostMode;
  const hasMyStory = stories.some(s => s.mine);
  const storyGroups = useMemo(() => {
    const map = new Map();
    stories.forEach((s, i) => {
      if (s.mine) return;
      if (!map.has(s.user)) map.set(s.user, { user: s.user, avatar: s.avatar, firstIndex: i, ids: [] });
      map.get(s.user).ids.push(s.id);
    });
    // A group is "watched" once every story in it has been seen. Unwatched float to the front.
    const groups = [...map.values()].map(g => ({ ...g, seen: g.ids.length > 0 && g.ids.every(id => seenStories[id]) }));
    return groups.sort((a, b) => (a.seen === b.seen ? 0 : a.seen ? 1 : -1));
  }, [stories, seenStories]);
  const [openMenu, setOpenMenu] = useState(null);
  const [activeTag, setActiveTag] = useState(null);

  const renderBody = (body) => body
    ? renderRichText(body, {
        onOpenUser,
        onOpenHashtag: (tag) => { setActiveTag(tag); onOpenHashtag && onOpenHashtag(tag); },
      })
    : null;

  const tagFilteredPosts = activeTag
    ? posts.filter(p => p.body && p.body.toLowerCase().includes(`#${activeTag.toLowerCase()}`))
    : posts;

  // Heat score (reactions + weighted comments). Reused for trending sort + the "hot" marker.
  const postScore = (p) => Object.values(p.reactions || {}).reduce((s, v) => s + v, 0) + (Array.isArray(p.comments) ? p.comments.length * 2 : 0);
  const sortedPosts = feedSort === 'trending'
    ? [...tagFilteredPosts].sort((a, b) => postScore(b) - postScore(a))
    : tagFilteredPosts;

  // Real unique-view counts — one per soul; a repeat visit never re-counts. We fetch the
  // counts for the visible posts, and record a view the first time each post scrolls in.
  const [postViews, setPostViews] = useState({});
  const postIdsKey = sortedPosts.map(p => p.id).join(',');
  useEffect(() => {
    const ids = sortedPosts.map(p => p.id);
    if (!ids.length) { setPostViews({}); return; }
    fetchViewCounts('post', ids).then(setPostViews).catch(() => {});
  }, [postIdsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const els = document.querySelectorAll('article[data-post-id]');
    if (!els.length) return undefined;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { recordView('post', e.target.getAttribute('data-post-id')); io.unobserve(e.target); }
      }
    }, { threshold: 0.5 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [postIdsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Double-tap to like (IG-style): bat-react + a burst animation.
  const [burst, setBurst] = useState(null);
  const doubleTapLike = (post) => {
    buzz('like');
    if (!post.myReactions?.bat) onReact && onReact(post.id, 'bat');
    setBurst(post.id);
    setTimeout(() => setBurst(b => (b === post.id ? null : b)), 800);
  };

  // Infinite scroll: load more when the sentinel nears the viewport.
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!onLoadMore || !feedHasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) onLoadMore(); },
      { rootMargin: '500px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onLoadMore, feedHasMore, posts.length]);

  const daily = getDailyCard();
  const today = darkDay();
  const vespers = todaysVespers(TEXTS);
  const codexToday = todaysCodex(CODEX);

  // Trending hashtags from posts
  const tagCounts = {};
  for (const p of posts) {
    if (!p.body) continue;
    const matches = p.body.match(/#[a-zA-Z0-9_]+/g) || [];
    for (const t of matches) {
      const k = t.slice(1).toLowerCase();
      tagCounts[k] = (tagCounts[k] || 0) + 1;
    }
  }
  const trendingTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const toneColor = today
    ? today.tone === 'red' ? '#8B0000'
    : today.tone === 'silver' ? '#8A8A92'
    : '#C9A961'
    : null;

  const altarOn = settings.altarEnabled !== false;

  return (
    <div className="pb-24">
      {/* The witching hour (3–4am) — a fleeting threshold */}
      {witching && (
        <button onClick={onOpenReflections}
          className="w-full px-4 py-2.5 border-b border-[#5B0F1A]/40 flex items-center justify-center gap-2 animate-pulse-slow"
          style={{ background: 'linear-gradient(90deg, rgba(91,15,26,0.35), rgba(20,0,5,0.5), rgba(91,15,26,0.35))' }}>
          <span className="text-[#C9A961]">⛧</span>
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C9A961]" style={F.scriptureSC}>the witching hour · reflect</span>
          <span className="text-[#C9A961]">⛧</span>
        </button>
      )}
      {vigil && (
        <button onClick={onOpenReflections}
          className="w-full px-4 py-2.5 border-b border-[#5E3B73]/40 flex items-center justify-center gap-2 animate-pulse-slow"
          style={{ background: 'linear-gradient(90deg, rgba(45,15,63,0.45), rgba(10,4,16,0.6), rgba(45,15,63,0.45))' }}>
          <span className="text-[#C9A961]">☩</span>
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C9A961]" style={F.scriptureSC}>the vigil · souls keep watch</span>
          <span className="text-[#C9A961]">☩</span>
        </button>
      )}

      {/* Daily altar — personal practice anchor */}
      {altarOn && (
        <DailyAltar
          ritual={ritual}
          ritualDoneToday={ritualDoneToday}
          onPerformRitual={onPerformRitual}
          crystals={crystals}
          trackers={trackers}
          onUpdateTracker={onUpdateTracker}
          onOpenReflections={onOpenReflections}
          onOpenEphemeris={onOpenEphemeris}
        />
      )}

      {/* Dark calendar banner */}
      {today && (
        <button onClick={onOpenEphemeris}
          className="w-full flex items-center gap-2 px-4 py-2 border-b border-[#1A1A1A] hover:bg-[#0F0F0F] transition-colors"
          style={{ background: `linear-gradient(90deg, ${toneColor}15 0%, transparent 100%)` }}>
          <span className="text-xl" style={{ color: toneColor }}>{today.glyph}</span>
          <span className="text-[10px] uppercase tracking-[0.25em] flex-1 text-left" style={{ ...F.scriptureSC, color: toneColor }}>
            {today.label}
          </span>
        </button>
      )}

      {/* Daily card */}
      {tarotOn && (
      <button onClick={onOpenTarot} className="w-full text-left border-b border-[#1A1A1A] hover:bg-[#0F0F0F] transition-colors group">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-14 shrink-0 border border-[#A89968]/40 flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, #14080C 0%, #0A0204 100%)',
              transform: daily.reversed ? 'rotate(180deg)' : 'none',
            }}>
            <span className="text-[#C9A961] text-xl">{daily.card.symbol || '✦'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#9E2A33]/70" style={F.scriptureSC}>· today's pull ·</div>
            <div className="text-[#F5F1E8] text-sm mt-0.5 truncate" style={F.scripture}>
              {daily.card.name}{daily.reversed && ' · reversed'}
            </div>
            <div className="text-[10px] text-[#9E2A33]/50 italic truncate" style={F.scripture}>
              "{daily.reversed ? daily.card.reversed : daily.card.upright}"
            </div>
          </div>
        </div>
      </button>
      )}

      {/* Codex term of the day */}
      {codexToday && (
        <button onClick={onOpenCodex}
          className="w-full text-left border-b border-[#1A1A1A] hover:bg-[#0F0F0F] transition-colors group">
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#9E2A33]">⌬</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#9E2A33]" style={F.scriptureSC}>· word of the day ·</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[#F5F1E8] text-base" style={F.scripture}>{codexToday.term}</span>
              <span className="text-[10px] text-[#9E2A33]/60 uppercase tracking-wider" style={F.scriptureSC}>{codexToday.category}</span>
            </div>
            <p className="text-[#A8A29E] text-xs italic mt-0.5 line-clamp-2" style={F.serif}>{codexToday.def}</p>
          </div>
        </button>
      )}

      {/* Vespers */}
      {vespersOn && vespers && (
        <div className="border-b border-[#1A1A1A] flex">
          <div className="flex-1 text-left">
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#9E2A33]" style={F.scriptureSC}>✟</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#9E2A33]" style={F.scriptureSC}>· today's vespers ·</span>
              </div>
              <p className="text-[#F5F1E8] text-sm italic leading-snug line-clamp-2" style={F.scripture}>
                "{vespers.verse.text}"
              </p>
              <p className="text-[10px] text-[#9E2A33]/70 mt-1" style={F.scriptureSC}>
                · {vespers.chapterTitle} ·
              </p>
            </div>
          </div>
          <button onClick={onOpenVespersArchive} title="archive"
            className="px-3 border-l border-[#1A1A1A] text-[10px] uppercase tracking-wider text-[#9E2A33] hover:text-[#C9A961] hover:bg-[#0F0F0F]"
            style={F.scriptureSC}>
            past ·
          </button>
        </div>
      )}

      {/* Stories rail */}
      <div className="px-4 pt-3 pb-4 border-b border-[#1A1A1A]">
        <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.2em] mb-3" style={F.ui}>· tonight ·</div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
          <button onClick={() => (hasMyStory ? onOpenStory && onOpenStory(stories.findIndex(s => s.mine)) : onCreateStory && onCreateStory())}
            className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none">
            <div className={`relative w-14 h-14 rounded-full flex items-center justify-center text-xl bg-[#141414]
              ${hasMyStory ? 'ring-2 ring-[#8B0000] ring-offset-2 ring-offset-[#0A0A0A] animate-pulse-slow border border-[#2A2A2A]' : 'border border-dashed border-[#3F3F3F] text-[#6B6B6B]'}`}>
              {hasMyStory ? meAvatar : '+'}
            </div>
            <span className="text-[10px] text-[#A8A29E] max-w-[60px] truncate" style={F.ui}>you</span>
          </button>
          {storyGroups.map(g => (
            <button key={g.user} onClick={() => onOpenStory && onOpenStory(g.firstIndex)}
              className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none">
              <div className={`relative w-14 h-14 rounded-full flex items-center justify-center text-xl bg-[#141414] border border-[#2A2A2A] ring-2 ring-offset-2 ring-offset-[#0A0A0A] ${g.seen ? 'ring-[#3A3A3A] opacity-60' : 'ring-[#8B0000] animate-pulse-slow'}`}>
                {g.avatar}
              </div>
              <span className={`text-[10px] max-w-[60px] truncate ${g.seen ? 'text-[#6B6B6B]' : 'text-[#A8A29E]'}`} style={F.ui}>{g.user}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trending hashtags */}
      {trendingTags.length > 0 && (
        <div className="px-4 pt-3 pb-3 border-b border-[#1A1A1A]">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#9E2A33] mb-2" style={F.ui}>· trending ·</div>
          <div className="flex flex-wrap gap-1.5">
            {trendingTags.map(([tag, count]) => (
              <button key={tag} onClick={() => setActiveTag(tag)}
                className="flex items-center gap-1.5 px-2 py-1 border border-[#2A2A2A] text-[#A8A29E] hover:text-[#F5F1E8] hover:border-[#A89968]"
                style={F.ui}>
                <span className="text-[#9E2A33] text-xs">#{tag}</span>
                <span className="text-[9px] text-[#6B6B6B]" style={F.mono}>{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tonight status banner if set — clickable to edit */}
      {!ghostOn && tonightStatus && tonightStatus.text && (
        <button onClick={onOpenTonightStatus}
          className="w-full px-4 py-3 border-b border-[#1A1A1A] flex items-center gap-2 hover:bg-[#0F0F0F] transition-colors text-left">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8B0000]" style={F.ui}>your tonight</span>
          <span className="text-[#F5F1E8] text-sm flex-1 truncate ml-2" style={F.serif}>"{tonightStatus.text}"</span>
        </button>
      )}

      {/* Feed scope */}
      <div className="px-4 pt-2 flex items-center gap-5 border-b border-[#1A1A1A]">
        {['everyone', 'following'].map(sc => (
          <button key={sc} onClick={() => onSetFeedScope && onSetFeedScope(sc)}
            className={`text-xs uppercase tracking-[0.2em] pb-2 transition-colors ${feedScope === sc ? 'text-[#F5F1E8] border-b-2 border-[#8B0000]' : 'text-[#6B6B6B] hover:text-[#A8A29E]'}`}
            style={F.ui}>{sc === 'everyone' ? 'the coven' : 'following'}</button>
        ))}
      </div>

      {/* Sort tabs + lucky */}
      <div className="px-4 py-2 border-b border-[#1A1A1A] flex items-center gap-3">
        {['latest', 'trending'].map(s => (
          <button key={s} onClick={() => onSetFeedSort && onSetFeedSort(s)}
            className={`text-[10px] uppercase tracking-[0.25em] py-1 ${feedSort === s ? (s === 'trending' ? 'text-[#F5F1E8] border-b border-[#9E2A33]' : 'text-[#F5F1E8] border-b border-[#8B0000]') : 'text-[#6B6B6B]'}`}
            style={F.ui}>
            {s}
          </button>
        ))}
        <button onClick={() => {
          const pool = posts.filter(p => !p.mine);
          if (pool.length === 0) return;
          const random = pool[Math.floor(Math.random() * pool.length)];
          onOpenComments && onOpenComments(random.id);
        }}
          className="ml-auto text-[10px] uppercase tracking-wider text-[#9E2A33] hover:text-[#C9A961] px-2 py-1"
          style={F.ui}>
          ⚄ feeling lucky
        </button>
      </div>

      {/* Editorial barcode divider — a thin zine seam below the sort row */}
      <BarcodeDivider seed={feedSort} className="justify-center px-4 py-1.5 opacity-50" />

      {/* Active hashtag filter */}
      {activeTag && (
        <div className="px-4 py-2 border-b border-[#1A1A1A] bg-[#A89968]/5 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[#9E2A33]" style={F.ui}>filtering by</span>
          <span className="text-[#C9A961] text-sm" style={F.scripture}>#{activeTag}</span>
          <span className="text-[10px] text-[#6B6B6B] ml-1" style={F.mono}>{tagFilteredPosts.length}</span>
          <button onClick={() => setActiveTag(null)} className="ml-auto text-[#A8A29E] hover:text-[#F5F1E8] text-xs">×</button>
        </div>
      )}

      {/* Feed */}
      <div className="divide-y divide-[#1A1A1A]">
        {feedLoading && sortedPosts.length === 0 && (
          [0, 1, 2, 3].map(i => (
            <div key={`sk${i}`} className="px-4 py-4 animate-pulse skeleton-shimmer">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#141414]" />
                <div className="flex-1">
                  <div className="h-2.5 w-24 bg-[#141414] rounded mb-1.5" />
                  <div className="h-2 w-16 bg-[#0F0F0F] rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-[#141414] rounded mb-1.5" />
              <div className="h-3 w-3/4 bg-[#141414] rounded" />
            </div>
          ))
        )}
        {sortedPosts.map(post => {
          const mine = post.mine || post.user === meHandle;
          const bookmarked = !!bookmarks[post.id];
          const candled = !!postCandles[post.id];
          const pinned = pinnedPostId === post.id;
          // "Hot" heat marker — only in trending, only for genuinely high-score posts.
          const isHot = feedSort === 'trending' && postScore(post) >= 8;
          return (
            <FeatureBoundary key={post.id} variant="post" label="post">
            <article data-post-id={post.id} className="px-4 py-4 relative select-none border-b border-[#141318]" style={postAgeStyle(post.createdAt)} onDoubleClick={() => doubleTapLike(post)}>
              {burst === post.id && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <span className="absolute w-40 h-40 rounded-full animate-heat-flash"
                    style={{ background: 'radial-gradient(circle, rgba(158,42,51,0.55), transparent 70%)' }} />
                  <span className="animate-like-burst text-[#9E2A33] drop-shadow-[0_0_18px_rgba(158,42,51,0.85)]"><Bat width={64} height={64} /></span>
                </div>
              )}
              {isHot && (
                <span aria-hidden className="absolute left-0 top-2 bottom-2 w-[3px] pointer-events-none"
                  style={{ background: 'linear-gradient(180deg, transparent, #9E2A33 35%, #9E2A33 65%, transparent)',
                    boxShadow: '0 0 10px rgba(158,42,51,0.6)' }} />
              )}
              {(bookmarked || pinned) && (
                <span aria-hidden title={pinned ? 'pinned' : 'saved'}
                  className="absolute top-0 right-4 w-2.5 h-7 z-10 pointer-events-none"
                  style={{ background: pinned ? '#8B0000' : '#C9A961', opacity: 0.9,
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
                    WebkitClipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
              )}
              <div className="flex items-center gap-2.5 mb-3">
                <button
                  onClick={() => !mine && !post.anonymous && onOpenUser && onOpenUser(post.user, post.avatar)}
                  disabled={!!post.anonymous}
                  className={`w-9 h-9 rounded-full overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base shrink-0 ${post.anonymous ? 'cursor-default' : ''}`}>
                  {post.avatarUrl ? <img src={post.avatarUrl} alt="" className="w-full h-full object-cover" /> : post.avatar}
                </button>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => !mine && !post.anonymous && onOpenUser && onOpenUser(post.user, post.avatar)}
                    disabled={!!post.anonymous}
                    className={`text-[#F5F1E8] text-sm ${post.anonymous ? 'italic text-[#9E2A33]' : 'hover:underline'}`}
                    style={F.ui}>{post.user}</button>
                  {post.coauthorHandle && !post.anonymous && (
                    <button onClick={(e) => { e.stopPropagation(); onOpenUser && onOpenUser(post.coauthorHandle); }}
                      className="text-[10px] text-[#C9A961] hover:underline ml-1.5" style={F.ui}>with @{post.coauthorHandle}</button>
                  )}
                  <div className="flex items-center gap-1.5 text-[10px] text-[#6B6B6B]" style={F.ui}>
                    <span style={F.mono} className="text-xs">{post.time}</span>
                    <span>·</span>
                    <button onClick={() => onOpenCommunity(post.community)} className="hover:text-[#A8A29E] uppercase tracking-wider">#{post.community}</button>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setOpenMenu(openMenu === post.id ? null : post.id)} className="text-[#6B6B6B] hover:text-[#A8A29E] p-1"><MoreHorizontal size={16} /></button>
                  {openMenu === post.id && (
                    <>
                      <div onClick={() => setOpenMenu(null)} className="fixed inset-0 z-30" />
                      <div className="absolute top-full right-0 mt-1 z-40 min-w-[140px] bg-[#0F0F0F] border border-[#2A2A2A] py-1">
                        <button onClick={() => { onToggleBookmark && onToggleBookmark(post.id); setOpenMenu(null); }}
                          className="w-full px-3 py-2 text-left text-xs text-[#A8A29E] hover:bg-[#1A1A1A] flex items-center gap-2" style={F.ui}>
                          <Bookmark size={12} /> {bookmarked ? 'unsave' : 'save'}
                        </button>
                        <button onClick={() => { onQuotePost && onQuotePost(post.id); setOpenMenu(null); }}
                          className="w-full px-3 py-2 text-left text-xs text-[#A8A29E] hover:bg-[#1A1A1A] flex items-center gap-2" style={F.ui}>
                          <Repeat size={12} /> repost
                        </button>
                        <button onClick={() => { onWhisperPost && onWhisperPost(post.id); setOpenMenu(null); }}
                          className="w-full px-3 py-2 text-left text-xs text-[#A8A29E] hover:bg-[#1A1A1A] flex items-center gap-2" style={F.ui}>
                          <Send size={12} /> whisper this
                        </button>
                        {mine && (
                          <button onClick={() => { onTogglePin && onTogglePin(post.id); setOpenMenu(null); }}
                            className="w-full px-3 py-2 text-left text-xs text-[#A8A29E] hover:bg-[#1A1A1A] flex items-center gap-2" style={F.ui}>
                            <Pin size={12} /> {pinned ? 'unpin from shrine' : 'pin to shrine'}
                          </button>
                        )}
                        {!mine && (
                          <button onClick={() => { onHidePost && onHidePost(post.id); setOpenMenu(null); }}
                            className="w-full px-3 py-2 text-left text-xs text-[#A8A29E] hover:bg-[#1A1A1A] flex items-center gap-2" style={F.ui}>
                            <EyeOff size={12} /> hide
                          </button>
                        )}
                        {!mine && !post.anonymous && (
                          <button onClick={() => { onReportPost && onReportPost(post.id); setOpenMenu(null); }}
                            className="w-full px-3 py-2 text-left text-xs text-[#A8A29E] hover:bg-[#1A1A1A] flex items-center gap-2" style={F.ui}>
                            ⚑ report
                          </button>
                        )}
                        {mine && (
                          <button onClick={() => { onDeletePost && onDeletePost(post.id); setOpenMenu(null); }}
                            className="w-full px-3 py-2 text-left text-xs text-[#8B0000] hover:bg-[#1A1A1A] flex items-center gap-2" style={F.ui}>
                            <Trash2 size={12} /> delete
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {post.kind === 'repost' && (
                <div className="text-[10px] uppercase tracking-wider text-[#9E2A33] mb-2 flex items-center gap-1" style={F.ui}>
                  <Repeat size={11} /> reposted from {post.quoted?.user}
                </div>
              )}
              {post.body && <p className="text-[#F5F1E8] text-[15px] leading-relaxed mb-3" style={F.serif}>{renderBody(post.body)}</p>}
              {post.quoted && (
                <button onClick={() => onOpenComments && onOpenComments(post.quoted.id)}
                  className="block w-full text-left mb-3 border border-[#2A2A2A] bg-[#0F0F0F] p-3 hover:border-[#3F3F3F] transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-xs">{post.quoted.avatar}</div>
                    <span className="text-[#A8A29E] text-xs" style={F.ui}>{post.quoted.user}</span>
                    <span className="text-[9px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>#{post.quoted.community}</span>
                  </div>
                  {post.quoted.body && <p className="text-[#A8A29E] text-sm line-clamp-3" style={F.serif}>{post.quoted.body}</p>}
                </button>
              )}

              {post.kind === 'poll' && post.poll && (() => {
                const totalVotes = post.poll.options.reduce((s, o) => s + o.votes, 0);
                const myVote = post.poll.myVote;
                return (
                  <div className="mb-3 border border-[#5E3B73]/30 bg-[#5E3B73]/5 p-3 space-y-2">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-[#5E3B73] mb-1" style={F.scriptureSC}>· poll · {totalVotes} {totalVotes === 1 ? 'voice' : 'voices'} ·</div>
                    {post.poll.options.map(opt => {
                      const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      const mine = myVote === opt.id;
                      return (
                        <button key={opt.id}
                          onClick={() => onVotePoll && onVotePoll(post.id, opt.id)}
                          className={`relative block w-full text-left border px-3 py-2 transition-colors ${mine ? 'border-[#5E3B73] bg-[#5E3B73]/10' : 'border-[#2A2A2A] hover:border-[#5E3B73]/60'}`}>
                          <div className="absolute inset-y-0 left-0 bg-[#5E3B73]/15 transition-all" style={{ width: `${pct}%` }} />
                          <div className="relative flex items-center justify-between gap-2">
                            <span className="text-[#F5F1E8] text-sm flex items-center gap-2" style={F.serif}>
                              {mine && <span className="text-[#5E3B73]">✓</span>}
                              {opt.label}
                            </span>
                            <span className="text-[#A8A29E] text-xs" style={F.mono}>{pct}%</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {(post.kind === 'photo' || post.kind === 'video') && <div className="mb-3"><PostImage kind={post.img} /></div>}

              {post.kind === 'event' && (
                <button onClick={() => onOpenEvent && onOpenEvent({ id: post.event.id, name: post.event.name })}
                  className="block w-full text-left mb-3 border border-[#2A2A2A] bg-[#0F0F0F] overflow-hidden hover:border-[#3F3F3F] transition-colors">
                  <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #8B0000, #5E3B73)' }} />
                  <div className="p-4">
                    <div className="text-[10px] text-[#8B0000] uppercase tracking-[0.2em] mb-1" style={F.ui}>upcoming · tap for detail</div>
                    <div className="text-[#F5F1E8] text-xl mb-1" style={F.display}>{post.event.name}</div>
                    <div className="text-[#A8A29E] text-sm" style={F.serif}>{post.event.venue} · <span style={F.mono}>{post.event.date}</span></div>
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      {post.event.tags.map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 border border-[#2A2A2A] text-[#A8A29E] uppercase tracking-wider" style={F.ui}>{t}</span>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#1A1A1A] flex items-center justify-between">
                      <span className="text-[#A8A29E] text-xs" style={F.ui}>{post.event.going} going</span>
                      <span className="text-[10px] uppercase tracking-wider text-[#9E2A33]" style={F.ui}>open →</span>
                    </div>
                  </div>
                </button>
              )}

              <div className="rule opacity-40 mb-2.5 mt-1" />
              <div className="flex items-center justify-between -ml-2">
                <div className="flex items-center">
                  <Reaction glyph={Bat} count={post.reactions.bat} active={post.myReactions?.bat} onClick={() => onReact && onReact(post.id, 'bat')} />
                  <Reaction glyph={FlameGlyph} count={post.reactions.fire} active={post.myReactions?.fire} onClick={() => onReact && onReact(post.id, 'fire')} />
                  <Reaction glyph={SkullGlyph} count={post.reactions.skull} active={post.myReactions?.skull} onClick={() => onReact && onReact(post.id, 'skull')} />
                  <Reaction glyph={Smoke} count={post.reactions.smoke} active={post.myReactions?.smoke} onClick={() => onReact && onReact(post.id, 'smoke')} />
                </div>
                <div className="flex items-center gap-1">
                  {postViews[post.id] > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-[#6B6B6B] px-1" style={F.mono} title="unique views">
                      <Eye size={12} /> {postViews[post.id]}
                    </span>
                  )}
                  <button onClick={() => onToggleCandle && onToggleCandle(post.id)}
                    className={`p-2 tap transition-colors ${candled ? 'text-[#C9A961]' : 'text-[#6B6B6B] hover:text-[#9E2A33]'}`}
                    title={candled ? 'candle lit' : 'light a candle'}>
                    <Flame size={14} fill={candled ? '#C9A961' : 'none'} />
                  </button>
                  <button onClick={() => onToggleBookmark && onToggleBookmark(post.id)}
                    className={`p-2 tap transition-colors ${bookmarked ? 'text-[#C9A961]' : 'text-[#6B6B6B] hover:text-[#A8A29E]'}`}
                    title={bookmarked ? 'saved' : 'save'}>
                    <Bookmark size={14} fill={bookmarked ? '#C9A961' : 'none'} />
                  </button>
                  <button onClick={() => onOpenComments && onOpenComments(post.id)}
                    className="flex items-center gap-1.5 text-[#6B6B6B] hover:text-[#C9A961] text-xs px-2 py-1 tap" style={F.ui}>
                    <MessageCircle size={13} />
                    <span style={F.mono} className="text-xs">
                      {(post.baseCommentCount || 0) + (Array.isArray(post.comments) ? post.comments.length : 0)}
                    </span>
                  </button>
                </div>
              </div>
            </article>
            </FeatureBoundary>
          );
        })}
        {!feedLoading && sortedPosts.length === 0 && (
          feedScope === 'following' ? (
            <EmptyState glyph={TripleMoon} text="you follow no one yet."
              sub="gather some souls below — or switch to the coven." />
          ) : (
            <EmptyState glyph={AllSeeingEye} text="the coven is quiet tonight."
              sub="be the first flame — speak, or drop a tonight status."
              action="drop a tonight status" onAction={onOpenTonightStatus} />
          )
        )}
        {/* Discover real souls — surfaced when your feed is sparse */}
        {!feedLoading && suggestedSouls.length > 0 && (sortedPosts.length === 0 || feedScope === 'following') && (
          <div className="px-4 py-4 bg-[#0A0204]/40">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#9E2A33] mb-3" style={F.ui}>· souls who've gathered ·</div>
            <div className="space-y-2">
              {suggestedSouls.slice(0, 6).map(s => {
                const followed = !!following[s.handle];
                return (
                  <div key={s.id || s.handle} className="flex items-center gap-3">
                    <button onClick={() => onOpenUser && onOpenUser(s.handle)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base shrink-0">
                        {s.avatarUrl ? <img src={s.avatarUrl} alt="" className="w-full h-full object-cover" /> : s.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#F5F1E8] text-sm truncate" style={F.ui}>{s.handle}</div>
                        {s.bio && <div className="text-[11px] text-[#6B6B6B] truncate" style={F.serif}>{s.bio}</div>}
                      </div>
                    </button>
                    <button onClick={() => onFollow && onFollow(s.handle)} disabled={followed}
                      className={`shrink-0 text-[10px] uppercase tracking-wider px-3 py-1.5 border transition-colors ${followed ? 'border-[#2A2A2A] text-[#6B6B6B]' : 'border-[#5B0F1A] text-[#F5F1E8] hover:bg-[#8B0000]/20'}`}
                      style={F.ui}>{followed ? 'following' : 'follow'}</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {feedHasMore ? (
          <div ref={sentinelRef} className="py-10 flex justify-center">
            <Loader2 size={16} className="animate-spin text-[#6B6B6B]" />
          </div>
        ) : sortedPosts.length > 0 && (
          <div className="py-12 text-center">
            <div className="text-[#3F3F3F] text-sm" style={F.serif}>· you've reached the bottom of tonight ·</div>
          </div>
        )}
      </div>
    </div>
  );
}
