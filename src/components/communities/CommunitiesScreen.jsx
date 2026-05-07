import { Search, ChevronLeft, Bell } from 'lucide-react';
import { F } from '../../styles/fonts';
import { COMMUNITIES } from '../../data/communities';
import { POSTS } from '../../data/posts';
import { PostImage } from '../shared/Visuals';
import { formatK } from '../../data/helpers';

export function CommunitiesScreen({ onOpenCommunity }) {
  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-[#F5F1E8] text-2xl mb-1" style={F.display}>SCENES</h2>
        <p className="text-[#A8A29E] text-sm" style={F.serif}>find your people. or hide from them.</p>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#141414] border border-[#1F1F1F]">
          <Search size={14} className="text-[#6B6B6B]" />
          <input placeholder="search scenes" className="bg-transparent text-[#F5F1E8] text-sm outline-none flex-1 placeholder:text-[#6B6B6B]" style={F.ui} />
        </div>
      </div>

      <div className="divide-y divide-[#1A1A1A] border-t border-[#1A1A1A]">
        {COMMUNITIES.map(c => (
          <button key={c.id} onClick={() => onOpenCommunity(c.id)} className="w-full px-4 py-4 flex items-start gap-3 hover:bg-[#0F0F0F] transition-colors text-left">
            <div className="w-12 h-12 bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#F5F1E8] text-xl shrink-0" style={F.display}>
              {c.glyph}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-0.5">
                <h3 className="text-[#F5F1E8] text-base" style={F.display}>{c.name.toUpperCase()}</h3>
                <span className="text-[10px] text-[#6B6B6B] shrink-0" style={F.mono}>active {c.active}</span>
              </div>
              <p className="text-[#A8A29E] text-sm leading-snug mb-1.5" style={F.serif}>{c.desc}</p>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-[#6B6B6B]" style={F.ui}>
                <span><span style={F.mono} className="text-xs text-[#A8A29E]">{formatK(c.members)}</span> souls</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CommunityDetail({ id, onBack }) {
  const c = COMMUNITIES.find(x => x.id === id);
  const posts = POSTS.filter(p => p.community === id || id === 'general');
  if (!c) return null;
  return (
    <div className="pb-24">
      <div className="relative px-4 pt-3 pb-5 border-b border-[#1A1A1A] overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(ellipse at 50% 0%, #3B0A12 0%, transparent 60%)'
        }} />
        <button onClick={onBack} className="relative flex items-center gap-1 text-[#A8A29E] mb-3 -ml-1 text-sm" style={F.ui}>
          <ChevronLeft size={16} /> scenes
        </button>
        <div className="relative flex items-center gap-3">
          <div className="w-14 h-14 bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#F5F1E8] text-2xl" style={F.display}>{c.glyph}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[#F5F1E8] text-xl" style={F.display}>{c.name.toUpperCase()}</h2>
            <p className="text-[#A8A29E] text-xs mt-0.5" style={F.serif}>{c.desc}</p>
          </div>
        </div>
        <div className="relative flex items-center gap-3 mt-4">
          <button className="flex-1 text-[#F5F1E8] text-xs py-2 border border-[#8B0000] bg-[#8B0000]/20 uppercase tracking-wider" style={F.ui}>joined</button>
          <button className="px-4 text-[#A8A29E] text-xs py-2 border border-[#2A2A2A] uppercase tracking-wider" style={F.ui}><Bell size={13} /></button>
        </div>
        <div className="relative flex items-center gap-4 mt-4 text-[10px] uppercase tracking-wider text-[#6B6B6B]" style={F.ui}>
          <span><span style={F.mono} className="text-xs text-[#A8A29E]">{formatK(c.members)}</span> souls</span>
          <span><span style={F.mono} className="text-xs text-[#A8A29E]">{Math.floor(c.members * 0.08)}</span> online</span>
          <span>active {c.active}</span>
        </div>
      </div>

      <div className="divide-y divide-[#1A1A1A]">
        {posts.length > 0 ? posts.map(post => (
          <article key={post.id} className="px-4 py-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">{post.avatar}</div>
              <div className="flex-1">
                <div className="text-[#F5F1E8] text-sm" style={F.ui}>{post.user}</div>
                <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>{post.time}</div>
              </div>
            </div>
            {post.body && <p className="text-[#F5F1E8] text-[15px] leading-relaxed" style={F.serif}>{post.body}</p>}
            {post.kind === 'photo' && <div className="mt-3"><PostImage kind={post.img} /></div>}
          </article>
        )) : (
          <div className="px-4 py-12 text-center">
            <div className="text-[#3F3F3F] text-4xl mb-3" style={F.display}>{c.glyph}</div>
            <div className="text-[#A8A29E] text-sm" style={F.serif}>quiet in here. be the first to break the silence.</div>
          </div>
        )}
      </div>
    </div>
  );
}
