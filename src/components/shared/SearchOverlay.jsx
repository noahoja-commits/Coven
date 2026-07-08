import { useState, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { F } from '../../styles/fonts';
import { searchProfiles } from '../../lib/db/profiles';

export function SearchOverlay({ onClose, onOpenUser }) {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [userResults, setUserResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const query = debouncedQ.trim();
    if (!query) { setUserResults([]); return; }
    let on = true;
    searchProfiles(query).then(rows => { if (on) setUserResults(rows); }).catch(() => { if (on) setUserResults([]); });
    return () => { on = false; };
  }, [debouncedQ]);

  return (
    <div className="absolute inset-0 z-40 bg-[#0A0A0A] animate-slide-in-right flex flex-col">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A]">
        <div className="px-4 h-[60px] flex items-center gap-3">
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={20} /></button>
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
            {q && <button onClick={() => setQ('')} className="text-[#6B6B6B] hover:text-[#A8A29E]"><X size={12} /></button>}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!debouncedQ.trim() && (
          <div className="px-6 pt-12 text-center">
            <div className="text-[#3F3F3F] text-5xl mb-3" style={F.display}>·</div>
            <p className="text-[#A8A29E] text-sm italic" style={F.serif}>find a soul.</p>
          </div>
        )}

        {debouncedQ.trim() && userResults.length === 0 && (
          <div className="px-6 pt-12 text-center">
            <p className="text-[#6B6B6B] text-sm italic" style={F.serif}>· no souls match "{debouncedQ}" ·</p>
          </div>
        )}

        {userResults.length > 0 && (
          <div className="divide-y divide-[#1A1A1A]">
            {userResults.map(u => (
              <button key={u.id} onClick={() => { onOpenUser && onOpenUser(u.handle); onClose(); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#0F0F0F] text-left">
                <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base shrink-0">
                  {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : u.avatar}
                </div>
                <div className="text-[#F5F1E8] text-sm" style={F.ui}>{u.handle}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
