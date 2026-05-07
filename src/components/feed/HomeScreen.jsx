import { MessageCircle, MoreHorizontal } from 'lucide-react';
import { F } from '../../styles/fonts';
import { POSTS, STORIES } from '../../data/posts';
import { Reaction } from '../shared/Reaction';
import { PostImage } from '../shared/Visuals';

export function HomeScreen({ onOpenCommunity, tonightStatus }) {
  return (
    <div className="pb-24">
      {/* Stories rail */}
      <div className="px-4 pt-3 pb-4 border-b border-[#1A1A1A]">
        <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.2em] mb-3" style={F.ui}>· tonight ·</div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
          {STORIES.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={`relative w-14 h-14 rounded-full flex items-center justify-center text-xl
                ${s.live ? 'ring-2 ring-[#8B0000] ring-offset-2 ring-offset-[#0A0A0A] animate-pulse-slow' : ''}
                ${s.self ? 'bg-[#141414] border border-dashed border-[#3F3F3F] text-[#6B6B6B]' : 'bg-[#141414] border border-[#2A2A2A]'}`}>
                {s.avatar}
                {s.live && <span className="absolute -bottom-0.5 right-0 w-2.5 h-2.5 bg-[#8B0000] rounded-full ring-2 ring-[#0A0A0A]" />}
              </div>
              <span className="text-[10px] text-[#A8A29E] max-w-[60px] truncate" style={F.ui}>{s.user}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tonight status banner if set */}
      {tonightStatus && tonightStatus.text && (
        <div className="px-4 py-3 border-b border-[#1A1A1A] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8B0000]" style={F.ui}>your tonight</span>
          <span className="text-[#F5F1E8] text-sm flex-1 truncate ml-2" style={F.serif}>"{tonightStatus.text}"</span>
        </div>
      )}

      {/* Feed */}
      <div className="divide-y divide-[#1A1A1A]">
        {POSTS.map(post => (
          <article key={post.id} className="px-4 py-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base">{post.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[#F5F1E8] text-sm" style={F.ui}>{post.user}</div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#6B6B6B]" style={F.ui}>
                  <span style={F.mono} className="text-xs">{post.time}</span>
                  <span>·</span>
                  <button onClick={() => onOpenCommunity(post.community)} className="hover:text-[#A8A29E] uppercase tracking-wider">#{post.community}</button>
                </div>
              </div>
              <button className="text-[#6B6B6B]"><MoreHorizontal size={16} /></button>
            </div>

            {post.body && <p className="text-[#F5F1E8] text-[15px] leading-relaxed mb-3" style={F.serif}>{post.body}</p>}

            {post.kind === 'photo' && <div className="mb-3"><PostImage kind={post.img} /></div>}

            {post.kind === 'event' && (
              <div className="mb-3 border border-[#2A2A2A] bg-[#0F0F0F] overflow-hidden">
                <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #8B0000, #7B2CBF)' }} />
                <div className="p-4">
                  <div className="text-[10px] text-[#8B0000] uppercase tracking-[0.2em] mb-1" style={F.ui}>upcoming</div>
                  <div className="text-[#F5F1E8] text-xl mb-1" style={F.display}>{post.event.name}</div>
                  <div className="text-[#A8A29E] text-sm" style={F.serif}>{post.event.venue} · <span style={F.mono}>{post.event.date}</span></div>
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    {post.event.tags.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 border border-[#2A2A2A] text-[#A8A29E] uppercase tracking-wider" style={F.ui}>{t}</span>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#1A1A1A] flex items-center justify-between">
                    <span className="text-[#A8A29E] text-xs" style={F.ui}>{post.event.going} going</span>
                    <button className="text-[#F5F1E8] text-xs px-3 py-1 border border-[#3F3F3F] hover:border-[#8B0000] hover:text-[#8B0000] transition-colors uppercase tracking-wider" style={F.ui}>RSVP</button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between -ml-2">
              <div className="flex items-center">
                <Reaction icon="🦇" count={post.reactions.bat} />
                <Reaction icon="🔥" count={post.reactions.fire} />
                <Reaction icon="💀" count={post.reactions.skull} />
                <Reaction icon="💨" count={post.reactions.smoke} />
              </div>
              <button className="flex items-center gap-1.5 text-[#6B6B6B] hover:text-[#A8A29E] text-xs px-2 py-1" style={F.ui}>
                <MessageCircle size={13} /><span style={F.mono} className="text-xs">{post.comments}</span>
              </button>
            </div>
          </article>
        ))}
        <div className="py-12 text-center">
          <div className="text-[#3F3F3F] text-sm" style={F.serif}>· you've reached the bottom of tonight ·</div>
        </div>
      </div>
    </div>
  );
}
