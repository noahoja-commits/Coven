import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Search, Calendar } from 'lucide-react';
import { F } from '../../styles/fonts';
import { searchProfiles } from '../../lib/db/profiles';
import { searchPosts, searchEvents } from '../../lib/db/posts';
import { COMMUNITIES } from '../../data/communities';
import { CODEX } from '../../data/codex';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export function SearchOverlay({ onClose, onOpenUser, onOpenPost, onOpenCommunity, onOpenEvent, onOpenCodex }) {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [eventResults, setEventResults] = useState([]);
  const [userError, setUserError] = useState(false);
  const [recents, setRecents] = useLocalStorage('search-recents', []);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const query = debouncedQ.trim();
    if (!query) {
      setUserResults([]); setPostResults([]); setEventResults([]); setUserError(false);
      return;
    }
    let on = true;
    searchProfiles(query)
      .then(rows => { if (on) { setUserResults(rows); setUserError(false); } })
      .catch(() => { if (on) { setUserResults([]); setUserError(true); } });
    searchPosts(query).then(rows => { if (on) setPostResults(rows.slice(0, 8)); }).catch(() => {});
    searchEvents(query).then(rows => { if (on) setEventResults(rows.slice(0, 6)); }).catch(() => {});
    return () => { on = false; };
  }, [debouncedQ]);

  const localResults = useMemo(() => {
    const query = debouncedQ.trim().toLowerCase();
    if (!query) return null;
    const starts = (s) => (s || '').toLowerCase().startsWith(query);
    return {
      scenes: COMMUNITIES.filter(c => starts(c.name)).slice(0, 6),
      codex: (CODEX || []).filter(c => starts(c.term)).slice(0, 6),
    };
  }, [debouncedQ]);

  function openUser(u) {
    setRecents(prev => [u, ...prev.filter(r => r.id !== u.id)].slice(0, 8));
    onOpenUser && onOpenUser(u.handle);
    onClose();
  }

  function removeRecent(id, e) {
    e.stopPropagation();
    setRecents(prev => prev.filter(r => r.id !== id));
  }

  const hasResults = userResults.length > 0 || postResults.length > 0 || eventResults.length > 0
    || (localResults && (localResults.scenes.length > 0 || localResults.codex.length > 0));
  const showRecents = !q.trim() && recents.length > 0;
  const showEmpty = !q.trim() && recents.length === 0;
  const showNoResults = debouncedQ.trim() && !hasResults && !userError;

  return (
    <div className="absolute inset-0 z-40 bg-[#0A0A0A] animate-slide-in-right flex flex-col">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center gap-3">
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1"><X size={20} /></button>
          <div className="flex-1 flex items-center gap-2 bg-[#141414] border border-[#2A2A2A] px-3 py-2">
            <Search size={14} className="text-[#6B6B6B]" />
            <input
              ref={inputRef}
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="search souls"
              className="bg-transparent text-[#F5F1E8] text-sm outline-none flex-1 placeholder:text-[#6B6B6B]"
              style={F.ui}
            />
            {q && <button onClick={() => setQ('')} className="tap text-[#6B6B6B] hover:text-[#C9A961]"><X size={12} /></button>}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showEmpty && (
          <div className="px-6 pt-12 text-center">
            <div className="text-[#3F3F3F] text-5xl mb-3" style={F.display}>·</div>
            <p className="text-[#A8A29E] text-sm italic" style={F.serif}>find a soul, a scene, a rite.</p>
          </div>
        )}

        {showRecents && (
          <>
            <div className="px-4 py-2 flex items-center justify-between bg-[#0F0F0F] sticky top-0">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#A89968]" style={F.scriptureSC}>· recent ·</span>
              <button onClick={() => setRecents([])} className="text-[10px] text-[#6B6B6B] hover:text-[#A8A29E]" style={F.ui}>clear all</button>
            </div>
            <div className="divide-y divide-[#1A1A1A]">
              {recents.map(u => (
                <button key={u.id} onClick={() => openUser(u)}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#0F0F0F] text-left">
                  <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base shrink-0">
                    {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : u.avatar}
                  </div>
                  <div className="flex-1 text-[#F5F1E8] text-sm" style={F.ui}>{u.handle}</div>
                  <button onClick={(e) => removeRecent(u.id, e)} className="tap text-[#6B6B6B] hover:text-[#A8A29E] p-1 -m-1"><X size={12} /></button>
                </button>
              ))}
            </div>
          </>
        )}

        {showNoResults && (
          <div className="px-6 pt-12 text-center">
            <p className="text-[#6B6B6B] text-sm italic" style={F.serif}>· nothing in the dark matches "{debouncedQ}" ·</p>
          </div>
        )}

        {userError && debouncedQ.trim() && (
          <div className="px-4 py-2.5 text-[11px] text-[#C97a7a] italic" style={F.serif}>
            · couldn't reach the soul directory — check your connection ·
          </div>
        )}

        {userResults.length > 0 && (
          <Section title="souls">
            {userResults.map(u => (
              <button key={u.id} onClick={() => openUser(u)}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#0F0F0F] text-left">
                <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base shrink-0">
                  {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : u.avatar}
                </div>
                <div className="text-[#F5F1E8] text-sm" style={F.ui}>{u.handle}</div>
              </button>
            ))}
          </Section>
        )}

        {postResults.length > 0 && (
          <Section title="posts">
            {postResults.map(p => (
              <button key={p.id} onClick={() => { onOpenPost && onOpenPost(p.id); onClose(); }}
                className="w-full px-4 py-2.5 flex items-start gap-3 hover:bg-[#0F0F0F] text-left">
                <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base shrink-0">
                  {p.avatarUrl ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" /> : p.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#F5F1E8] text-sm" style={F.ui}>{p.user}</div>
                  {p.body && <div className="text-xs text-[#A8A29E] truncate" style={F.serif}>{p.body}</div>}
                </div>
              </button>
            ))}
          </Section>
        )}

        {localResults && localResults.scenes.length > 0 && (
          <Section title="scenes">
            {localResults.scenes.map(c => (
              <button key={c.id} onClick={() => { onOpenCommunity && onOpenCommunity(c.id); onClose(); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#0F0F0F] text-left">
                <div className="w-9 h-9 bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#F5F1E8] text-base shrink-0" style={F.display}>{c.glyph}</div>
                <div className="text-[#F5F1E8] text-sm" style={F.display}>{c.name.toUpperCase()}</div>
              </button>
            ))}
          </Section>
        )}

        {eventResults.length > 0 && (
          <Section title="rites">
            {eventResults.map(e => (
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

        {localResults && localResults.codex.length > 0 && (
          <Section title="codex">
            {localResults.codex.map(c => (
              <button key={c.term} onClick={() => { onOpenCodex && onOpenCodex(); onClose(); }}
                className="w-full px-4 py-2.5 hover:bg-[#0F0F0F] text-left">
                <div className="text-[#F5F1E8] text-sm" style={F.scripture}>{c.term}</div>
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
      <div className="px-4 py-2 bg-[#0F0F0F] text-[10px] uppercase tracking-[0.3em] text-[#9E2A33] sticky top-0" style={F.scriptureSC}>
        · {title} ·
      </div>
      <div className="divide-y divide-[#1A1A1A]">{children}</div>
    </div>
  );
}
