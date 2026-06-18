import { useState, useMemo } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { F } from '../../styles/fonts';
import { CODEX, CODEX_CATEGORIES } from '../../data/codex';

export function CodexOverlay({ onClose }) {
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CODEX.filter(e => {
      if (cat !== 'all' && e.cat !== cat) return false;
      if (!q) return true;
      return e.term.toLowerCase().includes(q) || e.def.toLowerCase().includes(q);
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [cat, query]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #14080C 0%, #050204 60%)' }}>
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />

      <div className="relative bg-[#050204]/95 backdrop-blur-md border-b border-[#A89968]/15">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#A89968] hover:text-[#C9A961] p-2 -m-1 transition-colors"><ArrowLeft size={20} /></button>
          <div className="text-[#C9A961] text-base tracking-[0.3em]" style={F.display}>THE CODEX</div>
          <span className="text-[#A89968]/60 text-[10px] uppercase tracking-wider" style={F.ui}>{filtered.length}</span>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0A0204] border border-[#A89968]/20">
            <Search size={14} className="text-[#A89968]/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="seek a term..."
              className="bg-transparent text-[#F5F1E8] text-sm outline-none flex-1 placeholder:text-[#A89968]/40"
              style={F.scripture}
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[#A89968]/60" aria-label="clear">
                <X size={12} />
              </button>
            )}
          </div>
        </div>
        <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto no-scrollbar">
          {CODEX_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`shrink-0 px-3 py-1 text-[10px] uppercase tracking-wider border transition-colors ${
                cat === c.id
                  ? 'bg-[#A89968] text-[#0A0204] border-[#A89968]'
                  : 'border-[#A89968]/30 text-[#A89968]/70 hover:border-[#A89968]'
              }`}
              style={F.ui}>{c.label}</button>
          ))}
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto px-4 py-3 pb-12">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#A89968]/50 text-xs italic" style={F.scripture}>
            · no entries found ·
          </div>
        )}
        <div className="space-y-3 max-w-md mx-auto">
          {filtered.map(e => (
            <article key={e.term} className="border-b border-[#A89968]/15 pb-3">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h3 className="text-[#F5F1E8] text-base" style={F.scripture}>{e.term}</h3>
                <span className="text-[9px] text-[#A89968]/50 uppercase tracking-wider shrink-0" style={F.ui}>{e.cat}</span>
              </div>
              <p className="text-[#A8A29E] text-sm leading-relaxed" style={F.scripture}>{e.def}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
