import { useState, useMemo, useRef, useEffect } from 'react';
import { X, Search, Hash, Calendar, BookOpen } from 'lucide-react';
import { F } from '../../styles/fonts';
import { COMMUNITIES } from '../../data/communities';
import { EVENTS } from '../../data/events';
import { CODEX } from '../../data/codex';
import { TEXTS } from '../../data/library';
import { USERS } from '../../data/users';

export function SearchOverlay({ posts = [], onClose, onOpenPost, onOpenUser, onOpenCommunity, onOpenEvent, onOpenCodex, onOpenLibrary }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return null;

    const matches = (s) => (s || '').toLowerCase().includes(query);

    return {
      users: Object.values(USERS).filter(u => matches(u.handle) || matches(u.bio) || u.tags.some(t => matches(t))).slice(0, 6),
      posts: posts.filter(p => matches(p.body) || matches(p.user) || matches(p.community)).slice(0, 8),
      scenes: COMMUNITIES.filter(c => matches(c.name) || matches(c.desc)).slice(0, 6),
      events: EVENTS.filter(e => matches(e.name) || matches(e.venue) || matches(e.neighborhood) || e.tags.some(t => matches(t))).slice(0, 6),
      codex: (CODEX || []).filter(c => matches(c.term) || matches(c.def)).slice(0, 6),
      library: (TEXTS || []).filter(t => matches(t.title) || matches(t.author)).slice(0, 6),
    };
  }, [q, posts]);

  const totalCount = results ? Object.values(results).reduce((s, arr) => s + arr.length, 0) : 0;

  return (
    <div className="absolute inset-0 z-40 bg-[#0A0A0A] animate-slide-in-right flex flex-col">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A]">
        <div className="px-4 h-[60px] flex items-center gap-3">
          <button onClick={onClose} className="text-[#A8A29E]"><X size={20} /></button>
          <div className="flex-1 flex items-center gap-2 bg-[#141414] border border-[#1F1F1F] px-3 py-2">
            <Search size={14} className="text-[#6B6B6B]" />
            <input
              ref={inputRef}
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="search everything"
              className="bg-transparent text-[#F5F1E8] text-sm outline-none flex-1 placeholder:text-[#6B6B6B]"
              style={F.ui}
            />
            {q && <button onClick={() => setQ('')} className="text-[#6B6B6B] hover:text-[#A8A29E]"><X size={12} /></button>}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!results && (
          <div className="px-6 pt-12 text-center">
            <div className="text-[#3F3F3F] text-5xl mb-3" style={F.display}>·</div>
            <p className="text-[#A8A29E] text-sm italic" style={F.serif}>
              find a soul, a scene, a rite, a passage.
            </p>
          </div>
        )}

        {results && totalCount === 0 && (
          <div className="px-6 pt-12 text-center">
            <p className="text-[#6B6B6B] text-sm italic" style={F.serif}>· nothing in the dark matches "{q}" ·</p>
          </div>
        )}

        {results && results.users.length > 0 && (
          <Section title="souls">
            {results.users.map(u => (
              <button key={u.handle} onClick={() => { onOpenUser && onOpenUser(u.handle); onClose(); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#0F0F0F] text-left">
                <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base shrink-0">{u.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#F5F1E8] text-sm" style={F.ui}>{u.handle}</div>
                  <div className="text-[10px] text-[#A8A29E] truncate" style={F.serif}>{u.bio}</div>
                </div>
              </button>
            ))}
          </Section>
        )}

        {results && results.posts.length > 0 && (
          <Section title="posts">
            {results.posts.map(p => (
              <button key={p.id} onClick={() => { onOpenPost && onOpenPost(p.id); onClose(); }}
                className="w-full px-4 py-2.5 flex items-start gap-3 hover:bg-[#0F0F0F] text-left">
                <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base shrink-0">{p.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#F5F1E8] text-sm" style={F.ui}>{p.user}</span>
                    <span className="text-[10px] text-[#6B6B6B]" style={F.mono}>{p.time}</span>
                  </div>
                  {p.body && <div className="text-xs text-[#A8A29E] truncate" style={F.serif}>{p.body}</div>}
                </div>
              </button>
            ))}
          </Section>
        )}

        {results && results.scenes.length > 0 && (
          <Section title="scenes">
            {results.scenes.map(c => (
              <button key={c.id} onClick={() => { onOpenCommunity && onOpenCommunity(c.id); onClose(); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#0F0F0F] text-left">
                <div className="w-9 h-9 bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#F5F1E8] text-base shrink-0" style={F.display}>{c.glyph}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#F5F1E8] text-sm" style={F.display}>{c.name.toUpperCase()}</div>
                  <div className="text-[10px] text-[#A8A29E] truncate" style={F.serif}>{c.desc}</div>
                </div>
              </button>
            ))}
          </Section>
        )}

        {results && results.events.length > 0 && (
          <Section title="rites">
            {results.events.map(e => (
              <button key={e.id} onClick={() => { onOpenEvent && onOpenEvent(e.id); onClose(); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#0F0F0F] text-left">
                <Calendar size={14} className="text-[#C9A961] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[#F5F1E8] text-sm" style={F.display}>{e.name}</div>
                  <div className="text-[10px] text-[#A8A29E]" style={F.mono}>{e.venue} · {e.date}</div>
                </div>
              </button>
            ))}
          </Section>
        )}

        {results && results.codex.length > 0 && (
          <Section title="codex">
            {results.codex.map(c => (
              <button key={c.term} onClick={() => { onOpenCodex && onOpenCodex(); onClose(); }}
                className="w-full px-4 py-2.5 hover:bg-[#0F0F0F] text-left">
                <div className="text-[#F5F1E8] text-sm" style={F.scripture}>{c.term}</div>
                <div className="text-[11px] text-[#A8A29E] line-clamp-1" style={F.serif}>{c.def}</div>
              </button>
            ))}
          </Section>
        )}

        {results && results.library.length > 0 && (
          <Section title="library">
            {results.library.map(t => (
              <button key={t.id} onClick={() => { onOpenLibrary && onOpenLibrary(t.id); onClose(); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#0F0F0F] text-left">
                <BookOpen size={14} className="text-[#A89968] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[#F5F1E8] text-sm" style={F.scripture}>{t.title}</div>
                  <div className="text-[10px] text-[#A8A29E]" style={F.serif}>{t.author}</div>
                </div>
              </button>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="px-4 py-2 bg-[#0F0F0F] text-[10px] uppercase tracking-[0.3em] text-[#A89968] sticky top-0" style={F.scriptureSC}>
        · {title} ·
      </div>
      <div className="divide-y divide-[#1A1A1A]">{children}</div>
    </div>
  );
}
