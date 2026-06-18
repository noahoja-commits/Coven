import { useState, useMemo } from 'react';
import { MessageCircle, MoreHorizontal, Eye, Bookmark, Trash2, Flame, EyeOff, Repeat, Pin } from 'lucide-react';
import { F } from '../../styles/fonts';
import { Reaction } from '../shared/Reaction';
import { PostImage } from '../shared/Visuals';
import { getDailyCard } from '../../data/tarot';
import { darkDay, todaysVespers, todaysCodex } from '../../data/helpers';
import { TEXTS } from '../../data/library';
import { CODEX } from '../../data/codex';

export function HomeScreen({
  posts, onReact, onOpenComments, onOpenCommunity, onOpenUser, onDeletePost, onHidePost, onQuotePost, onTogglePin, pinnedPostId, feedSort = 'latest', onSetFeedSort,
  bookmarks = {}, onToggleBookmark, postCandles = {}, onToggleCandle, onOpenEvent, onVotePoll,
  onOpenStory, onCreateStory, stories = [], meHandle = 'you', meAvatar = '🦇',
  tonightStatus, onOpenTonightStatus, onOpenTarot, onOpenEphemeris, onOpenLibrary, onOpenCodex, onOpenHashtag, onOpenVespersArchive,
  settings = {},
}) {
  const tarotOn = settings.tarotEnabled !== false;
  const vespersOn = settings.vespersEnabled !== false;
  const ghostOn = !!settings.ghostMode;
  const hasMyStory = stories.some(s => s.mine);
  const storyGroups = useMemo(() => {
    const seen = new Map();
    stories.forEach((s, i) => {
      if (s.mine || seen.has(s.user)) return;
      seen.set(s.user, { user: s.user, avatar: s.avatar, firstIndex: i });
    });
    return [...seen.values()];
  }, [stories]);
  const [openMenu, setOpenMenu] = useState(null);
  const [activeTag, setActiveTag] = useState(null);

  const renderBody = (body) => {
    if (!body) return null;
    const parts = body.split(/(#[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (/^#[a-zA-Z0-9_]+$/.test(part)) {
        const tag = part.slice(1);
        return (
          <button key={i} onClick={(e) => { e.stopPropagation(); setActiveTag(tag); onOpenHashtag && onOpenHashtag(tag); }}
            className="text-[#A89968] hover:text-[#C9A961] hover:underline">
            {part}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const tagFilteredPosts = activeTag
    ? posts.filter(p => p.body && p.body.toLowerCase().includes(`#${activeTag.toLowerCase()}`))
    : posts;

  const sortedPosts = feedSort === 'trending'
    ? [...tagFilteredPosts].sort((a, b) => {
        const score = (p) => Object.values(p.reactions || {}).reduce((s, v) => s + v, 0) + (Array.isArray(p.comments) ? p.comments.length * 2 : 0);
        return score(b) - score(a);
      })
    : tagFilteredPosts;
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
  const witnesses = tonightStatus?.setAt
    ? Math.min(24, Math.max(0, Math.floor((Date.now() - tonightStatus.setAt) / (1000 * 60 * 3))))
    : 0;
  const toneColor = today
    ? today.tone === 'red' ? '#8B0000'
    : today.tone === 'silver' ? '#8A8A92'
    : '#C9A961'
    : null;

  return (
    <div className="pb-24">
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
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#A89968]/70" style={F.scriptureSC}>· today's pull ·</div>
            <div className="text-[#F5F1E8] text-sm mt-0.5 truncate" style={F.scripture}>
              {daily.card.name}{daily.reversed && ' · reversed'}
            </div>
            <div className="text-[10px] text-[#A89968]/50 italic truncate" style={F.scripture}>
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
              <span className="text-[#A89968]">⌬</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#A89968]" style={F.scriptureSC}>· word of the day ·</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[#F5F1E8] text-base" style={F.scripture}>{codexToday.term}</span>
              <span className="text-[10px] text-[#A89968]/60 uppercase tracking-wider" style={F.scriptureSC}>{codexToday.category}</span>
            </div>
            <p className="text-[#A8A29E] text-xs italic mt-0.5 line-clamp-2" style={F.serif}>{codexToday.def}</p>
          </div>
        </button>
      )}

      {/* Vespers */}
      {vespersOn && vespers && (
        <div className="border-b border-[#1A1A1A] flex">
          <button onClick={() => onOpenLibrary && onOpenLibrary(vespers.textId)}
            className="flex-1 text-left hover:bg-[#0F0F0F] transition-colors">
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#A89968]" style={F.scriptureSC}>✟</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#A89968]" style={F.scriptureSC}>· today's vespers ·</span>
              </div>
              <p className="text-[#F5F1E8] text-sm italic leading-snug line-clamp-2" style={F.scripture}>
                "{vespers.verse.text}"
              </p>
              <p className="text-[10px] text-[#A89968]/70 mt-1" style={F.scriptureSC}>
                · {vespers.chapterTitle} ·
              </p>
            </div>
          </button>
          <button onClick={onOpenVespersArchive} title="archive"
            className="px-3 border-l border-[#1A1A1A] text-[10px] uppercase tracking-wider text-[#A89968] hover:text-[#C9A961] hover:bg-[#0F0F0F]"
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
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center text-xl bg-[#141414] border border-[#2A2A2A] ring-2 ring-[#8B0000] ring-offset-2 ring-offset-[#0A0A0A] animate-pulse-slow">
                {g.avatar}
              </div>
              <span className="text-[10px] text-[#A8A29E] max-w-[60px] truncate" style={F.ui}>{g.user}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trending hashtags */}
      {trendingTags.length > 0 && (
        <div className="px-4 pt-3 pb-3 border-b border-[#1A1A1A]">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-2" style={F.ui}>· trending ·</div>
          <div className="flex flex-wrap gap-1.5">
            {trendingTags.map(([tag, count]) => (
              <button key={tag} onClick={() => setActiveTag(tag)}
                className="flex items-center gap-1.5 px-2 py-1 border border-[#2A2A2A] text-[#A8A29E] hover:text-[#F5F1E8] hover:border-[#A89968]"
                style={F.ui}>
                <span className="text-[#A89968] text-xs">#{tag}</span>
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
          {witnesses > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-[#A89968]" style={F.mono} title="witnesses">
              <Eye size={11} /> {witnesses}
            </span>
          )}
        </button>
      )}

      {/* Sort tabs + lucky */}
      <div className="px-4 py-2 border-b border-[#1A1A1A] flex items-center gap-3">
        {['latest', 'trending'].map(s => (
          <button key={s} onClick={() => onSetFeedSort && onSetFeedSort(s)}
            className={`text-[10px] uppercase tracking-[0.25em] py-1 ${feedSort === s ? 'text-[#F5F1E8] border-b border-[#8B0000]' : 'text-[#6B6B6B]'}`}
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
          className="ml-auto text-[10px] uppercase tracking-wider text-[#A89968] hover:text-[#C9A961] px-2 py-1"
          style={F.ui}>
          ⚄ feeling lucky
        </button>
      </div>

      {/* Active hashtag filter */}
      {activeTag && (
        <div className="px-4 py-2 border-b border-[#1A1A1A] bg-[#A89968]/5 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[#A89968]" style={F.ui}>filtering by</span>
          <span className="text-[#C9A961] text-sm" style={F.scripture}>#{activeTag}</span>
          <span className="text-[10px] text-[#6B6B6B] ml-1" style={F.mono}>{tagFilteredPosts.length}</span>
          <button onClick={() => setActiveTag(null)} className="ml-auto text-[#A8A29E] hover:text-[#F5F1E8] text-xs">×</button>
        </div>
      )}

      {/* Feed */}
      <div className="divide-y divide-[#1A1A1A]">
        {sortedPosts.map(post => {
          const mine = post.mine || post.user === meHandle;
          const bookmarked = !!bookmarks[post.id];
          const candled = !!postCandles[post.id];
          const pinned = pinnedPostId === post.id;
          return (
            <article key={post.id} className="px-4 py-4">
              <div className="flex items-center gap-2.5 mb-3">
                <button
                  onClick={() => !mine && !post.anonymous && onOpenUser && onOpenUser(post.user, post.avatar)}
                  disabled={!!post.anonymous}
                  className={`w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base shrink-0 ${post.anonymous ? 'cursor-default' : ''}`}>
                  {post.avatar}
                </button>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => !mine && !post.anonymous && onOpenUser && onOpenUser(post.user, post.avatar)}
                    disabled={!!post.anonymous}
                    className={`text-[#F5F1E8] text-sm ${post.anonymous ? 'italic text-[#A89968]' : 'hover:underline'}`}
                    style={F.ui}>{post.user}</button>
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
                <div className="text-[10px] uppercase tracking-wider text-[#A89968] mb-2 flex items-center gap-1" style={F.ui}>
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
                  <div className="mb-3 border border-[#7B2CBF]/30 bg-[#7B2CBF]/5 p-3 space-y-2">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-[#7B2CBF] mb-1" style={F.scriptureSC}>· poll · {totalVotes} {totalVotes === 1 ? 'voice' : 'voices'} ·</div>
                    {post.poll.options.map(opt => {
                      const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      const mine = myVote === opt.id;
                      return (
                        <button key={opt.id}
                          onClick={() => onVotePoll && onVotePoll(post.id, opt.id)}
                          className={`relative block w-full text-left border px-3 py-2 transition-colors ${mine ? 'border-[#7B2CBF] bg-[#7B2CBF]/10' : 'border-[#2A2A2A] hover:border-[#7B2CBF]/60'}`}>
                          <div className="absolute inset-y-0 left-0 bg-[#7B2CBF]/15 transition-all" style={{ width: `${pct}%` }} />
                          <div className="relative flex items-center justify-between gap-2">
                            <span className="text-[#F5F1E8] text-sm flex items-center gap-2" style={F.serif}>
                              {mine && <span className="text-[#7B2CBF]">✓</span>}
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

              {post.kind === 'photo' && <div className="mb-3"><PostImage kind={post.img} /></div>}

              {post.kind === 'event' && (
                <button onClick={() => onOpenEvent && onOpenEvent({ id: post.event.id, name: post.event.name })}
                  className="block w-full text-left mb-3 border border-[#2A2A2A] bg-[#0F0F0F] overflow-hidden hover:border-[#3F3F3F] transition-colors">
                  <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #8B0000, #7B2CBF)' }} />
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
                      <span className="text-[10px] uppercase tracking-wider text-[#A89968]" style={F.ui}>open →</span>
                    </div>
                  </div>
                </button>
              )}

              <div className="flex items-center justify-between -ml-2">
                <div className="flex items-center">
                  <Reaction icon="🦇" count={post.reactions.bat} active={post.myReactions?.bat} onClick={() => onReact && onReact(post.id, 'bat')} />
                  <Reaction icon="🔥" count={post.reactions.fire} active={post.myReactions?.fire} onClick={() => onReact && onReact(post.id, 'fire')} />
                  <Reaction icon="💀" count={post.reactions.skull} active={post.myReactions?.skull} onClick={() => onReact && onReact(post.id, 'skull')} />
                  <Reaction icon="💨" count={post.reactions.smoke} active={post.myReactions?.smoke} onClick={() => onReact && onReact(post.id, 'smoke')} />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => onToggleCandle && onToggleCandle(post.id)}
                    className={`p-2 transition-colors ${candled ? 'text-[#C9A961]' : 'text-[#6B6B6B] hover:text-[#A89968]'}`}
                    title={candled ? 'candle lit' : 'light a candle'}>
                    <Flame size={14} fill={candled ? '#C9A961' : 'none'} />
                  </button>
                  <button onClick={() => onToggleBookmark && onToggleBookmark(post.id)}
                    className={`p-2 transition-colors ${bookmarked ? 'text-[#C9A961]' : 'text-[#6B6B6B] hover:text-[#A8A29E]'}`}
                    title={bookmarked ? 'saved' : 'save'}>
                    <Bookmark size={14} fill={bookmarked ? '#C9A961' : 'none'} />
                  </button>
                  <button onClick={() => onOpenComments && onOpenComments(post.id)}
                    className="flex items-center gap-1.5 text-[#6B6B6B] hover:text-[#A8A29E] text-xs px-2 py-1" style={F.ui}>
                    <MessageCircle size={13} />
                    <span style={F.mono} className="text-xs">
                      {(post.baseCommentCount || 0) + (Array.isArray(post.comments) ? post.comments.length : 0)}
                    </span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        <div className="py-12 text-center">
          <div className="text-[#3F3F3F] text-sm" style={F.serif}>· you've reached the bottom of tonight ·</div>
        </div>
      </div>
    </div>
  );
}
