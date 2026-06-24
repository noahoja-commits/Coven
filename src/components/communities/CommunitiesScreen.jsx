import { useState, useEffect } from 'react';
import { Search, ChevronLeft, X } from 'lucide-react';
import { F } from '../../styles/fonts';
import { EmptyState } from '../shared/EmptyState';
import { COMMUNITIES } from '../../data/communities';
import { PostImage } from '../shared/Visuals';
import { fetchCommunityStats } from '../../lib/db/posts';
import { relativeTime } from '../../lib/time';

export function CommunitiesScreen({ onOpenCommunity, membership = {}, memberCounts = {}, onToggleMembership }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all | joined
  const [stats, setStats] = useState(null); // real per-scene activity, null = loading

  useEffect(() => {
    let active = true;
    fetchCommunityStats().then(s => { if (active) setStats(s); }).catch(() => { if (active) setStats({}); });
    return () => { active = false; };
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = COMMUNITIES.filter(c => {
    if (filter === 'joined' && !membership[c.id]) return false;
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || (c.desc || '').toLowerCase().includes(q);
  });

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-[#F5F1E8] text-2xl mb-1" style={F.display}>SCENES</h2>
        <p className="text-[#A8A29E] text-sm" style={F.serif}>find your people. or hide from them.</p>
      </div>

      <div className="px-4 pb-4">
        <div className="field flex items-center gap-2 !py-2.5">
          <Search size={14} className="text-[#6B6B6B] shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search scenes"
            className="bg-transparent text-[#F5F1E8] text-sm outline-none flex-1 placeholder:text-[#6B6B6B]"
            style={F.ui}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#6B6B6B] hover:text-[#A8A29E] shrink-0" aria-label="clear">
              <X size={12} />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 mt-3">
          {['all', 'joined'].map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`tap chip ${filter === f ? 'chip-gold' : 'hover:border-[#3F3F3F]'}`}
              style={F.ui}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-[#1C1A1A] border-t border-[#1C1A1A]">
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-[#6B6B6B] text-xs" style={F.mono}>
            no scenes found
          </div>
        )}
        {filtered.map(c => {
          const joined = !!membership[c.id];
          const st = stats?.[c.id];
          const postCount = st?.posts ?? 0;
          const activeLabel = !stats ? '·' : (st?.latest ? `active ${relativeTime(st.latest)}` : 'quiet');
          return (
            <button key={c.id} onClick={() => onOpenCommunity(c.id)} className="tap w-full px-4 py-4 flex items-start gap-3 hover:bg-[#0F0F0F] transition-colors text-left">
              <div className="w-12 h-12 bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#F5F1E8] text-xl shrink-0" style={F.display}>
                {c.glyph}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <h3 className="text-[#F5F1E8] text-base" style={F.display}>{c.name.toUpperCase()}</h3>
                  <span className="text-[10px] text-[#6B6B6B] shrink-0" style={F.mono}>{activeLabel}</span>
                </div>
                <p className="text-[#A8A29E] text-sm leading-snug mb-1.5" style={F.serif}>{c.desc}</p>
                <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-wider text-[#6B6B6B]" style={F.ui}>
                  <div className="flex items-center gap-3">
                    <span><span style={F.mono} className="text-xs text-[#A8A29E]">{!stats ? '·' : postCount}</span> {postCount === 1 ? 'post' : 'posts'}</span>
                    <span><span style={F.mono} className="text-xs text-[#A8A29E]">{memberCounts[c.id] || 0}</span> {(memberCounts[c.id] || 0) === 1 ? 'soul' : 'souls'}</span>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); onToggleMembership && onToggleMembership(c.id); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onToggleMembership && onToggleMembership(c.id); } }}
                    className={`tap chip cursor-pointer ${joined ? 'border-[#8B0000] text-[#F5F1E8] bg-[#8B0000]/15' : 'hover:border-[#5B0F1A]'}`}>
                    {joined ? 'joined' : 'join'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CommunityDetail({ id, onBack, posts: postsProp, loading = false, memberCount = 0, isMember, onToggleMembership, onPostToScene, onOpenUser }) {
  const c = COMMUNITIES.find(x => x.id === id);
  const source = postsProp || [];
  const posts = source.filter(p => p.community === id || id === 'general');
  if (!c) return null;
  return (
    <div className="pb-24">
      <div className="relative px-4 pt-3 pb-5 border-b border-[#1C1A1A] overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(ellipse at 50% 0%, #3B0A12 0%, transparent 60%)'
        }} />
        <button onClick={onBack} className="tap relative flex items-center gap-1 text-[#A8A29E] hover:text-[#F5F1E8] mb-3 p-2 -m-1 text-sm" style={F.ui}>
          <ChevronLeft size={20} /> scenes
        </button>
        <div className="relative flex items-center gap-3">
          <div className="w-14 h-14 bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#F5F1E8] text-2xl" style={F.display}>{c.glyph}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[#F5F1E8] text-xl" style={F.display}>{c.name.toUpperCase()}</h2>
            <p className="text-[#A8A29E] text-xs mt-0.5" style={F.serif}>{c.desc}</p>
          </div>
        </div>
        <div className="relative flex items-center gap-2 mt-4">
          <button onClick={onToggleMembership}
            className={`btn flex-1 ${isMember ? 'btn-primary' : 'btn-ghost'}`}>
            {isMember ? 'joined' : 'join'}
          </button>
          <button onClick={onPostToScene} className="btn btn-ghost flex-1">
            post to this scene
          </button>
        </div>
        <div className="relative flex items-center gap-4 mt-4 text-[10px] uppercase tracking-wider text-[#6B6B6B]" style={F.ui}>
          <span><span style={F.mono} className="text-xs text-[#A8A29E]">{memberCount}</span> {memberCount === 1 ? 'soul' : 'souls'}</span>
          <span><span style={F.mono} className="text-xs text-[#A8A29E]">{posts.length}</span> {posts.length === 1 ? 'post' : 'posts'}</span>
          <span>{posts[0]?.time ? `active ${posts[0].time}` : 'quiet'}</span>
        </div>
      </div>

      <div className="divide-y divide-[#1C1A1A]">
        {loading ? (
          <div className="px-4 py-12 text-center text-[#6B6B6B] text-sm italic" style={F.serif}>· gathering the scene ·</div>
        ) : posts.length > 0 ? posts.map(post => (
          <article key={post.id} className="px-4 py-4">
            <button onClick={() => !post.anonymous && onOpenUser && onOpenUser(post.user)} className="flex items-center gap-2.5 mb-3 text-left">
              <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">{post.avatar}</div>
              <div className="flex-1">
                <div className="text-[#F5F1E8] text-sm" style={F.ui}>{post.user}</div>
                <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>{post.time}</div>
              </div>
            </button>
            {post.body && <p className="text-[#F5F1E8] text-[15px] leading-relaxed" style={F.serif}>{post.body}</p>}
            {(post.kind === 'photo' || post.kind === 'video') && <div className="mt-3"><PostImage kind={post.img} /></div>}
          </article>
        )) : (
          <EmptyState glyph={c.glyph} text="quiet in here. be the first to break the silence." />
        )}
      </div>
    </div>
  );
}
