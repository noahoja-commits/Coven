import { ArrowLeft, MessageCircle, UserPlus, UserCheck, VolumeX, Volume2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { getUser, getUserTrackers } from '../../data/users';
import { Reaction } from '../shared/Reaction';
import { PostImage } from '../shared/Visuals';

export function UserProfileOverlay({ handle, posts = [], isFollowing, isMuted, onToggleFollow, onToggleMute, onWhisper, onClose, onOpenComments, onReact }) {
  const user = getUser(handle);
  const theirPosts = posts.filter(p => p.user === handle);
  const trackers = getUserTrackers(handle);

  const formatTracker = (t) => {
    if (t.streak) {
      const days = Math.floor(t.hoursAgo / 24);
      return `${days}d streak`;
    }
    if (t.hoursAgo < 1) return 'just now';
    if (t.hoursAgo < 24) return `${t.hoursAgo}h ago`;
    return `${Math.floor(t.hoursAgo / 24)}d ago`;
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#0A0A0A] animate-slide-in-right overflow-y-auto pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A]">
        <div className="px-4 h-[60px] flex items-center gap-3">
          <button onClick={onClose} className="text-[#A8A29E] -ml-1"><ArrowLeft size={20} /></button>
          <div className="flex-1 min-w-0">
            <div className="text-[#F5F1E8] text-sm truncate" style={F.ui}>{user.handle}</div>
            <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>{theirPosts.length} posts</div>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="relative px-4 pt-5 pb-5 border-b border-[#1A1A1A] overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ background: 'radial-gradient(ellipse at 50% 0%, #5B0F1A 0%, transparent 60%)' }} />
        <div className="relative flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3B0A12] to-[#0A0A0A] border border-[#3F3F3F] flex items-center justify-center text-3xl shrink-0">
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[#F5F1E8] text-xl truncate" style={F.brand}>{user.handle}</h2>
            {user.pronouns && <div className="text-[#6B6B6B] text-[10px] uppercase tracking-wider" style={F.ui}>{user.pronouns}</div>}
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
          <div><span className="text-[#F5F1E8] text-base block leading-none" style={F.mono}>{theirPosts.length}</span><span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>posts</span></div>
          <div><span className="text-[#F5F1E8] text-base block leading-none" style={F.mono}>{user.followers}</span><span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>followers</span></div>
          <div><span className="text-[#F5F1E8] text-base block leading-none" style={F.mono}>{user.following}</span><span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>following</span></div>
        </div>

        <div className="relative grid grid-cols-3 gap-2 mt-4">
          <button onClick={onToggleFollow}
            className={`py-2 text-[10px] uppercase tracking-wider border flex items-center justify-center gap-1.5 ${isFollowing ? 'border-[#8B0000] bg-[#8B0000]/15 text-[#F5F1E8]' : 'border-[#3F3F3F] text-[#A8A29E] hover:border-[#5B0F1A] hover:text-[#F5F1E8]'}`}
            style={F.ui}>
            {isFollowing ? <><UserCheck size={12} /> following</> : <><UserPlus size={12} /> follow</>}
          </button>
          <button onClick={onWhisper}
            className="py-2 text-[10px] uppercase tracking-wider border border-[#3F3F3F] text-[#A8A29E] hover:border-[#5B0F1A] hover:text-[#F5F1E8] flex items-center justify-center gap-1.5"
            style={F.ui}>
            <MessageCircle size={12} /> whisper
          </button>
          <button onClick={onToggleMute}
            className={`py-2 text-[10px] uppercase tracking-wider border flex items-center justify-center gap-1.5 ${isMuted ? 'border-[#A89968] bg-[#A89968]/15 text-[#F5F1E8]' : 'border-[#3F3F3F] text-[#A8A29E] hover:border-[#A89968]'}`}
            style={F.ui}>
            {isMuted ? <><VolumeX size={12} /> muted</> : <><Volume2 size={12} /> mute</>}
          </button>
        </div>
      </div>

      {/* Public log */}
      {trackers.length > 0 && (
        <div className="px-4 py-3 border-b border-[#1A1A1A]">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-2" style={F.scriptureSC}>· the log ·</div>
          <div className="flex flex-wrap gap-1.5">
            {trackers.map(t => (
              <div key={t.id} className="flex items-center gap-1.5 px-2 py-1 border border-[#2A2A2A] bg-[#0F0F0F]">
                <span className="text-[#A89968]">{t.glyph}</span>
                <span className="text-[#F5F1E8] text-[11px]" style={F.ui}>{t.label}</span>
                <span className="text-[#6B6B6B] text-[10px]" style={F.mono}>· {formatTracker(t)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="divide-y divide-[#1A1A1A]">
        {theirPosts.length === 0 ? (
          <div className="px-4 py-16 text-center text-[#6B6B6B] text-sm italic" style={F.serif}>· silent so far ·</div>
        ) : theirPosts.map(post => (
          <article key={post.id} className="px-4 py-4">
            <div className="flex items-baseline gap-2 text-[10px] text-[#6B6B6B] mb-2" style={F.ui}>
              <span style={F.mono} className="text-xs">{post.time}</span>
              <span>·</span>
              <span className="uppercase tracking-wider">#{post.community}</span>
            </div>
            {post.body && <p className="text-[#F5F1E8] text-[15px] leading-relaxed mb-3" style={F.serif}>{post.body}</p>}
            {post.kind === 'photo' && <div className="mb-3"><PostImage kind={post.img} /></div>}
            <div className="flex items-center justify-between -ml-2">
              <div className="flex items-center">
                <Reaction icon="🦇" count={post.reactions.bat} active={post.myReactions?.bat} onClick={() => onReact && onReact(post.id, 'bat')} />
                <Reaction icon="🔥" count={post.reactions.fire} active={post.myReactions?.fire} onClick={() => onReact && onReact(post.id, 'fire')} />
                <Reaction icon="💀" count={post.reactions.skull} active={post.myReactions?.skull} onClick={() => onReact && onReact(post.id, 'skull')} />
                <Reaction icon="💨" count={post.reactions.smoke} active={post.myReactions?.smoke} onClick={() => onReact && onReact(post.id, 'smoke')} />
              </div>
              <button onClick={() => onOpenComments && onOpenComments(post.id)}
                className="text-[10px] text-[#6B6B6B] hover:text-[#A8A29E] uppercase tracking-wider px-2 py-1" style={F.ui}>
                comments
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
