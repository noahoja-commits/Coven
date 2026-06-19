import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { F } from '../../styles/fonts';
import { FASHION } from '../../data/fashion';

// Real storefront if we have one, otherwise a web search for the brand.
function shopUrl(item) {
  if (item.url) return item.url;
  return `https://duckduckgo.com/?q=${encodeURIComponent(item.brand + ' goth clothing')}`;
}

function FashionTile({ item }) {
  const palette = {
    red: 'linear-gradient(135deg, #3B0A12 0%, #1A0408 70%, #0A0204 100%)',
    black: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)',
    violet: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)',
  }[item.color];
  const open = () => window.open(shopUrl(item), '_blank', 'noopener,noreferrer');
  return (
    <button onClick={open}
      className="relative w-full text-left overflow-hidden border border-[#2A2A2A] hover:border-[#3F3F3F] active:scale-[0.98] transition-all group"
      style={{ height: item.h, background: palette }}>
      <svg viewBox="0 0 100 140" className="absolute inset-0 w-full h-full opacity-60" preserveAspectRatio="xMidYMid slice">
        <path d="M 30 20 L 40 10 L 60 10 L 70 20 L 85 35 L 80 50 L 75 50 L 75 130 L 25 130 L 25 50 L 20 50 L 15 35 Z"
          fill="rgba(0,0,0,0.5)" stroke="rgba(245,241,232,0.08)" strokeWidth="0.3" />
        <line x1="50" y1="20" x2="50" y2="130" stroke="rgba(245,241,232,0.06)" strokeWidth="0.3" />
      </svg>
      <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.9\'/></filter><rect width=\'80\' height=\'80\' filter=\'url(%23n)\' opacity=\'0.5\'/></svg>")' }} />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink size={13} className="text-[#F5F1E8]/70" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="text-[#F5F1E8] text-sm" style={F.display}>{item.brand.toUpperCase()}</div>
        <div className="text-[#A8A29E] text-[11px] mt-0.5" style={F.ui}>{item.kind}</div>
        <div className="flex items-center gap-1.5 mt-2">
          {item.tags.map(t => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 border border-[#3F3F3F] text-[#A8A29E] uppercase tracking-wider" style={F.ui}>{t}</span>
          ))}
          <span className="ml-auto text-[#A8A29E] text-xs" style={F.mono}>{item.price}</span>
        </div>
      </div>
    </button>
  );
}

const FILTERS = ['all', 'mens', 'womens', 'unisex', 'thrift', 'indie'];

export function FashionScreen() {
  const [filter, setFilter] = useState('all');

  const items = useMemo(() => {
    if (filter === 'all') return FASHION;
    if (filter === 'thrift' || filter === 'indie') {
      return FASHION.filter(i => i.kind.toLowerCase().includes(filter));
    }
    return FASHION.filter(i => i.tags.includes(filter));
  }, [filter]);

  const col1 = items.filter((_, i) => i % 2 === 0);
  const col2 = items.filter((_, i) => i % 2 === 1);

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-[#F5F1E8] text-2xl mb-1" style={F.display}>FITS</h2>
        <p className="text-[#A8A29E] text-sm" style={F.serif}>brands, drops, thrift spots — surfaced for the underrepresented.</p>
      </div>
      <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {FILTERS.map((t) => {
          const active = filter === t;
          return (
            <button key={t} onClick={() => setFilter(t)}
              className={`shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-wider border transition-colors
                ${active ? 'bg-[#F5F1E8] text-[#0A0A0A] border-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#3F3F3F]'}`}
              style={F.ui}>{t}</button>
          );
        })}
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-12 text-center text-[#6B6B6B] text-sm italic" style={F.serif}>· nothing here yet ·</p>
      ) : (
        <div className="px-3 grid grid-cols-2 gap-2">
          <div className="space-y-2">{col1.map(item => <FashionTile key={item.id} item={item} />)}</div>
          <div className="space-y-2">{col2.map(item => <FashionTile key={item.id} item={item} />)}</div>
        </div>
      )}
    </div>
  );
}
