import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { F } from '../../styles/fonts';
import { Avatar } from './Avatar';
import { searchProfiles } from '../../lib/db/profiles';

// Pick a soul (existing whisper or by search) to forward a post to.
// onPick receives { convId } for an existing thread, or { userId, handle, avatar } for a new one.
export function ShareToDMModal({ post, conversations = [], onPick, onClose, onAddToStory }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  useEffect(() => {
    const query = q.trim();
    if (!query) { setResults([]); return undefined; }
    let active = true;
    const t = setTimeout(() => {
      searchProfiles(query, { limit: 8 }).then(r => { if (active) setResults(r); }).catch(() => {});
    }, 250);
    return () => { active = false; clearTimeout(t); };
  }, [q]);

  const convs = conversations.filter(c => !c.group);

  return (
    <div className="fixed inset-0 z-[55] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 animate-slide-up safe-pb max-h-[85dvh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A] shrink-0">
          <h3 className="text-[#F5F1E8] text-base" style={F.display}>WHISPER THIS</h3>
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={20} /></button>
        </div>
        {post && (
          <div className="px-4 py-2 border-b border-[#1A1A1A] text-[11px] text-[#6B6B6B] truncate" style={F.serif}>
            {post.img ? '🖼 ' : ''}{post.body ? `“${post.body.slice(0, 64)}”` : 'a post'}
          </div>
        )}
        {onAddToStory && (
          <button onClick={onAddToStory}
            className="tap w-full px-4 py-2.5 flex items-center gap-2 border-b border-[#1A1A1A] text-left hover:bg-[#0F0F0F] transition-colors">
            <span className="text-base text-[#C9A961]">✦</span>
            <span className="text-sm text-[#C9A961]" style={F.ui}>add to your story</span>
          </button>
        )}
        <div className="px-4 py-2 shrink-0">
          <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#2A2A2A] px-2.5 py-1.5">
            <Search size={13} className="text-[#6B6B6B]" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="search souls…"
              className="flex-1 bg-transparent text-[#F5F1E8] text-sm outline-none placeholder:text-[#6B6B6B]" style={F.ui} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {q.trim() ? (
            results.length ? results.map(p => (
              <button key={p.id} onClick={() => onPick({ userId: p.id, handle: p.handle, avatar: p.avatar })}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#0F0F0F] text-left transition-colors">
                <Avatar url={p.avatar_url} glyph={p.avatar} size={32} />
                <span className="text-[#F5F1E8] text-sm" style={F.ui}>{p.handle}</span>
              </button>
            )) : <div className="px-4 py-6 text-center text-[#6B6B6B] text-xs" style={F.serif}>no souls found</div>
          ) : (
            convs.length ? convs.map(c => (
              <button key={c.id} onClick={() => onPick({ convId: c.id, handle: c.user, avatar: c.avatar })}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#0F0F0F] text-left transition-colors">
                <Avatar url={c.avatarUrl} glyph={c.avatar} size={32} />
                <span className="text-[#F5F1E8] text-sm" style={F.ui}>{c.user}</span>
              </button>
            )) : <div className="px-4 py-6 text-center text-[#6B6B6B] text-xs" style={F.serif}>search a soul to whisper to</div>
          )}
        </div>
      </div>
    </div>
  );
}
