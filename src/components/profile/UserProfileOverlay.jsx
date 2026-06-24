import { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, UserPlus, UserCheck, VolumeX, Volume2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { getProfileByHandle, getProfileStats } from '../../lib/db/profiles';
import { fetchUserPosts } from '../../lib/db/posts';
import { borderStyle, bannerStyle } from '../../data/decor';
import { moodActive } from '../../data/moods';
import { archetypeById } from '../../data/archetypes';
import { PostGrid } from './PostGrid';
import { TarotFrame, arcanaFor, Grain } from '../shared/Sigils';

export function UserProfileOverlay({ handle, posts = [], mutedKeywords = [], isFollowing, isMuted, onToggleFollow, onToggleMute, onWhisper, onClose, onOpenComments, onReact, onBlock, onReport }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
  const [loading, setLoading] = useState(true);
  const [gridPosts, setGridPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const theirPosts = posts.filter(p => p.user === handle);

  useEffect(() => {
    let on = true;
    setLoading(true); setPostsLoading(true);
    getProfileByHandle(handle).then(p => {
      if (!on) return;
      setProfile(p);
      setLoading(false);
      if (p?.id) {
        getProfileStats(p.id).then(s => { if (on) setStats(s); }).catch(() => {});
        fetchUserPosts(p.id).then(gp => { if (on) { setGridPosts(gp); setPostsLoading(false); } }).catch(() => { if (on) setPostsLoading(false); });
      } else { setPostsLoading(false); }
    }).catch(() => { if (on) { setLoading(false); setPostsLoading(false); } });
    return () => { on = false; };
  }, [handle]);

  // Real profile, or a minimal stand-in so the overlay still renders by handle.
  const user = profile || { handle, avatar: '✦', bio: '', tags: [], pronouns: '' };
  const mood = moodActive(user.mood) ? user.mood : null;
  const arche = archetypeById(user.archetype);

  if (!loading && !profile) {
    return (
      <div className="absolute inset-0 z-40 bg-[#0A0A0A] animate-slide-in-right flex flex-col">
        <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt px-4 h-[60px] flex items-center">
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1"><ArrowLeft size={20} /></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-10 gap-2">
          <div className="text-4xl text-[#3F3F3F]">⚰</div>
          <p className="text-[#A8A29E] text-sm italic" style={F.serif}>this soul has vanished from the coven.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-40 bg-[#0A0A0A] animate-slide-in-right overflow-y-auto pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center gap-3">
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1"><ArrowLeft size={20} /></button>
          <div className="flex-1 min-w-0">
            <div className="text-[#F5F1E8] text-sm truncate" style={F.ui}>{user.handle}</div>
            <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>{theirPosts.length} posts</div>
          </div>
        </div>
      </div>

      {/* Card — framed as a tarot arcana */}
      <div className="relative px-4 pt-5 pb-5 border-b border-[#1A1A1A] overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ background: 'radial-gradient(ellipse at 50% 0%, #5B0F1A 0%, transparent 60%)' }} />
        {user.decor?.banner && user.decor.banner !== 'none' && (
          <div className={`absolute top-0 inset-x-0 h-24 pointer-events-none ${user.decor?.animated ? 'banner-animated' : ''}`} style={bannerStyle(user.decor.banner) || undefined} />
        )}
        <Grain opacity={0.06} />
        <TarotFrame />
        {(() => { const a = arcanaFor(user.handle); return (
          <div className="relative mb-3 text-[10px] uppercase tracking-[0.25em] text-[#C8102E]" style={F.display}>{a.numeral} · {a.name}</div>
        ); })()}
        <div className="relative flex items-start gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#3B0A12] to-[#0A0A0A] border border-[#3F3F3F] flex items-center justify-center text-3xl shrink-0"
            style={mood ? { boxShadow: `0 0 22px ${mood.color}88` } : borderStyle(user.decor?.border)}>
            {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h2 className="text-[#F5F1E8] text-xl truncate" style={F.brand}>{user.handle}</h2>
              {arche && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border text-[9px] uppercase tracking-wider shrink-0"
                  style={{ borderColor: `${arche.accent}66`, color: arche.accent, ...F.ui }}>
                  <span>{arche.glyph}</span>{arche.label}
                </span>
              )}
            </div>
            {user.pronouns && <div className="text-[#6B6B6B] text-[10px] uppercase tracking-wider" style={F.ui}>{user.pronouns}</div>}
            {mood && (
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 border text-[10px] uppercase tracking-wider"
                style={{ borderColor: `${mood.color}66`, color: mood.color, textShadow: `0 0 6px ${mood.color}66`, ...F.ui }}>
                <span>{mood.glyph}</span><span>{mood.label}</span>
              </div>
            )}
            {user.bio && <p className="text-[#A8A29E] text-sm leading-snug mt-1" style={F.serif}>{user.bio}</p>}
            {user.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {user.tags.map(t => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 border border-[#2A2A2A] text-[#A8A29E] uppercase tracking-wider" style={F.ui}>{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative flex items-center gap-5 mt-4 pt-4 border-t border-[#1A1A1A]">
          <div><span className="text-[#F5F1E8] text-base block leading-none" style={F.mono}>{stats.posts}</span><span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>posts</span></div>
          <div><span className="text-[#F5F1E8] text-base block leading-none" style={F.mono}>{stats.followers}</span><span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>followers</span></div>
          <div><span className="text-[#F5F1E8] text-base block leading-none" style={F.mono}>{stats.following}</span><span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>following</span></div>
        </div>

        <div className="relative grid grid-cols-3 gap-2 mt-4">
          <button onClick={onToggleFollow}
            className={`tap py-2 text-[10px] uppercase tracking-wider border flex items-center justify-center gap-1.5 ${isFollowing ? 'border-[#C9A961]/70 text-[#F5F1E8]' : 'border-[#3F3F3F] text-[#A8A29E] hover:border-[#5B0F1A] hover:text-[#F5F1E8]'}`}
            style={{ ...F.ui, boxShadow: isFollowing ? '0 0 12px rgba(201,169,97,0.18)' : 'none' }}>
            {isFollowing ? <><UserCheck size={12} /> following</> : <><UserPlus size={12} /> follow</>}
          </button>
          <button onClick={onWhisper}
            className="tap py-2 text-[10px] uppercase tracking-wider border border-[#3F3F3F] text-[#A8A29E] hover:border-[#5B0F1A] hover:text-[#F5F1E8] flex items-center justify-center gap-1.5"
            style={F.ui}>
            <MessageCircle size={12} /> whisper
          </button>
          <button onClick={onToggleMute}
            className={`tap py-2 text-[10px] uppercase tracking-wider border flex items-center justify-center gap-1.5 ${isMuted ? 'border-[#A89968] bg-[#A89968]/15 text-[#F5F1E8]' : 'border-[#3F3F3F] text-[#A8A29E] hover:border-[#A89968]'}`}
            style={F.ui}>
            {isMuted ? <><VolumeX size={12} /> muted</> : <><Volume2 size={12} /> mute</>}
          </button>
        </div>

        <div className="relative flex items-center gap-4 mt-3">
          <button onClick={() => { if (profile?.id && confirm(`Block @${user.handle}? You won't see each other.`)) onBlock && onBlock(profile.id); }}
            className="tap text-[10px] uppercase tracking-wider text-[#6B6B6B] hover:text-[#8B0000]" style={F.ui}>⛒ block</button>
          <button onClick={() => { if (profile?.id) onReport && onReport(profile.id); }}
            className="tap text-[10px] uppercase tracking-wider text-[#6B6B6B] hover:text-[#C8102E]" style={F.ui}>⚑ report</button>
        </div>
      </div>

      {/* Posts grid (respect muted keywords) */}
      <PostGrid
        posts={gridPosts.filter(p => !mutedKeywords.some(k => k && (p.body || '').toLowerCase().includes(k.toLowerCase())))}
        loading={postsLoading} emptyText="· silent so far ·" onOpen={(id) => onOpenComments && onOpenComments(id)} />
    </div>
  );
}
