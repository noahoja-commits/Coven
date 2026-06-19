import { useState, useEffect } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { F } from '../../styles/fonts';
import { fetchProfiles } from '../../lib/db/profiles';

export function SoulsOverlay({ meId, following = {}, onClose, onOpenUser }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const q = query.trim().toLowerCase();

  useEffect(() => {
    let on = true;
    fetchProfiles({ excludeId: meId })
      .then(rows => { if (on) { setAllUsers(rows.map(r => ({ ...r, tags: r.tags || [] }))); setLoading(false); } })
      .catch(() => { if (on) setLoading(false); });
    return () => { on = false; };
  }, [meId]);

  const filtered = allUsers.filter(u => {
    if (filter === 'following' && !following[u.handle]) return false;
    if (!q) return true;
    return u.handle.toLowerCase().includes(q) || (u.bio || '').toLowerCase().includes(q) || u.tags.some(t => t.toLowerCase().includes(q));
  });

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #14080C 0%, #050204 80%)' }}>
      <div className="sticky top-0 z-10 bg-[#050204]/95 backdrop-blur-md border-b border-[#A89968]/15">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#A89968] hover:text-[#C9A961] p-2 -m-1 transition-colors"><ArrowLeft size={20} /></button>
          <div className="text-[#C9A961] text-base tracking-[0.3em]" style={F.display}>SOULS</div>
          <span className="w-5" />
        </div>
      </div>

      <div className="relative px-4 pt-4 pb-12">
        <div className="text-center mb-4">
          <div className="text-[#A89968]/60 text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>· {allUsers.length} known · counted in the coven ·</div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-[#0F0F0F] border border-[#A89968]/20">
          <Search size={14} className="text-[#A89968]/60" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="search souls"
            className="flex-1 bg-transparent text-[#F5F1E8] text-sm outline-none placeholder:text-[#A89968]/40"
            style={F.ui} />
          {query && <button onClick={() => setQuery('')} className="text-[#A89968]/60 hover:text-[#C9A961]"><X size={12} /></button>}
        </div>

        <div className="flex gap-1.5 mb-3">
          {['all', 'following'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 text-[10px] uppercase tracking-wider border ${filter === f ? 'bg-[#5B0F1A] text-[#F5F1E8] border-[#5B0F1A]' : 'border-[#2A2A2A] text-[#A8A29E]'}`}
              style={F.ui}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#A89968]/40 text-sm italic" style={F.scripture}>· gathering souls ·</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[#A89968]/40 text-sm italic" style={F.scripture}>
            {allUsers.length === 0 ? '· you are the first soul here ·' : '· no souls match ·'}
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map(u => (
              <button key={u.handle} onClick={() => onOpenUser && onOpenUser(u.handle)}
                className="w-full flex items-start gap-3 p-3 border border-[#A89968]/15 bg-[#0F0F0F]/60 hover:border-[#A89968]/40 hover:bg-[#0F0F0F] text-left transition-colors">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-lg shrink-0">{u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : u.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#F5F1E8] text-sm" style={F.ui}>{u.handle}</span>
                    {following[u.handle] && <span className="text-[9px] text-[#C9A961] uppercase tracking-wider" style={F.ui}>· following</span>}
                  </div>
                  {u.bio && <p className="text-[#A8A29E] text-xs italic leading-snug mt-0.5" style={F.serif}>{u.bio}</p>}
                  {u.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {u.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-[9px] px-1 py-0.5 border border-[#2A2A2A] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
