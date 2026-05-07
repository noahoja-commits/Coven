import { useState } from 'react';
import { X, Search, Plus, Bell, Star, MapPin } from 'lucide-react';
import { F } from '../../styles/fonts';
import { ODDITIES, ODDITY_CATEGORIES, ODDITY_PALETTES, CONDITION_LABELS, WANTED_POSTS, TATTOO_ARTISTS, SHOPS } from '../../data/oddities';

function OddityImage({ shape, palette, small = false }) {
  const p = ODDITY_PALETTES[palette] || ODDITY_PALETTES.black;
  const drawings = {
    duster: <path d="M 30 15 L 40 8 L 60 8 L 70 15 L 78 30 L 75 32 L 75 130 L 25 130 L 25 32 L 22 30 Z M 50 8 L 50 130 M 25 50 L 75 50" stroke={p.stroke} strokeWidth="0.4" fill={p.fill} fillOpacity="0.6" />,
    jewelry: <><circle cx="50" cy="60" r="22" stroke={p.stroke} strokeWidth="0.5" fill={p.fill} fillOpacity="0.4" /><circle cx="50" cy="60" r="14" stroke={p.stroke} strokeWidth="0.3" fill="none" /><circle cx="50" cy="48" r="3" fill={p.stroke} opacity="0.7" /></>,
    pentacle: <><circle cx="50" cy="60" r="20" stroke={p.stroke} strokeWidth="0.6" fill="none" /><polygon points="50,42 56,58 70,58 58,68 62,82 50,74 38,82 42,68 30,58 44,58" stroke={p.stroke} strokeWidth="0.5" fill={p.fill} fillOpacity="0.5" /></>,
    record: <><circle cx="50" cy="60" r="32" stroke={p.stroke} strokeWidth="0.4" fill={p.fill} fillOpacity="0.95" /><circle cx="50" cy="60" r="10" stroke={p.stroke} strokeWidth="0.3" fill={p.fill} /><circle cx="50" cy="60" r="2" fill={p.stroke} /></>,
    book: <><rect x="25" y="20" width="50" height="80" stroke={p.stroke} strokeWidth="0.5" fill={p.fill} fillOpacity="0.6" /><line x1="50" y1="20" x2="50" y2="100" stroke={p.stroke} strokeWidth="0.3" /><line x1="35" y1="40" x2="48" y2="40" stroke={p.stroke} strokeWidth="0.2" /></>,
    skull: <><ellipse cx="50" cy="55" rx="18" ry="22" stroke={p.stroke} strokeWidth="0.5" fill={p.fill} fillOpacity="0.7" /><ellipse cx="44" cy="55" rx="3" ry="4" fill={p.stroke} opacity="0.8" /><ellipse cx="56" cy="55" rx="3" ry="4" fill={p.stroke} opacity="0.8" /><path d="M 45 70 Q 50 73, 55 70" stroke={p.stroke} strokeWidth="0.3" fill="none" /></>,
    harness: <><path d="M 30 20 L 70 20 M 35 20 L 30 60 M 65 20 L 70 60 M 30 60 L 70 60 M 50 20 L 50 60 M 30 40 L 70 40" stroke={p.stroke} strokeWidth="0.6" fill="none" /><circle cx="50" cy="40" r="3" stroke={p.stroke} strokeWidth="0.4" fill={p.fill} /></>,
    dress: <path d="M 35 15 L 45 10 L 55 10 L 65 15 L 60 30 L 70 130 L 30 130 L 40 30 Z M 50 10 L 50 130" stroke={p.stroke} strokeWidth="0.4" fill={p.fill} fillOpacity="0.6" />,
    art: <><rect x="20" y="15" width="60" height="80" stroke={p.stroke} strokeWidth="0.5" fill={p.fill} /><circle cx="50" cy="55" r="18" stroke={p.stroke} strokeWidth="0.4" fill="none" /><polygon points="50,40 56,55 50,70 44,55" stroke={p.stroke} strokeWidth="0.3" fill={p.stroke} fillOpacity="0.4" /></>,
    boot: <path d="M 30 20 L 45 20 L 45 80 L 65 80 L 65 95 L 30 95 Z M 30 20 L 30 95" stroke={p.stroke} strokeWidth="0.5" fill={p.fill} fillOpacity="0.7" />,
    orb: <><circle cx="50" cy="55" r="22" stroke={p.stroke} strokeWidth="0.6" fill={p.fill} fillOpacity="0.8" /><circle cx="44" cy="48" r="4" fill={p.stroke} opacity="0.4" /><rect x="38" y="78" width="24" height="6" stroke={p.stroke} strokeWidth="0.4" fill={p.fill} /></>,
  };
  return (
    <div className="relative w-full overflow-hidden" style={{ background: p.bg, aspectRatio: '4/5' }}>
      <svg viewBox="0 0 100 125" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        {drawings[shape] || drawings.book}
      </svg>
      <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.9\'/></filter><rect width=\'80\' height=\'80\' filter=\'url(%23n)\'/></svg>")' }} />
      {!small && <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm border border-[#5B0F1A]/40">
        <span className="text-[#C9A961] text-[9px] uppercase tracking-[0.2em]" style={F.scriptureSC}>· for sale ·</span>
      </div>}
    </div>
  );
}

function OddityCard({ item, onOpen }) {
  return (
    <button onClick={() => onOpen(item.id)} className="group text-left">
      <div className="border border-[#1F1F1F] hover:border-[#5B0F1A]/50 transition-colors">
        <OddityImage shape={item.photo.shape} palette={item.photo.palette} />
        <div className="p-2.5 bg-[#0F0F0F]">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="text-[#F5F1E8] text-base" style={F.mono}>${item.price}</span>
            <span className="text-[9px] text-[#A89968] uppercase tracking-wider" style={F.ui}>{CONDITION_LABELS[item.condition]}</span>
          </div>
          <p className="text-[#A8A29E] text-xs leading-tight line-clamp-2" style={F.serif}>{item.title}</p>
        </div>
      </div>
    </button>
  );
}

function MarketplaceTab({ onOpenOddity, onCompose }) {
  const [category, setCategory] = useState('all');
  const filtered = category === 'all' ? ODDITIES : ODDITIES.filter(o => o.category === category);
  return (
    <>
      <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {ODDITY_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={`shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-wider border transition-colors
              ${category === c.id ? 'bg-[#5B0F1A] text-[#F5F1E8] border-[#5B0F1A]' : 'border-[#2A2A2A] text-[#A8A29E]'}`}
            style={F.ui}>{c.label}</button>
        ))}
      </div>
      <div className="px-3 grid grid-cols-2 gap-2 pb-12">
        {filtered.map(item => <OddityCard key={item.id} item={item} onOpen={onOpenOddity} />)}
      </div>
      <button onClick={onCompose} className="fixed bottom-6 right-6 z-10 w-14 h-14 bg-[#5B0F1A] text-[#F5F1E8] flex items-center justify-center shadow-xl"
        style={{ boxShadow: '0 0 24px rgba(91, 15, 26, 0.6)' }}>
        <Plus size={22} />
      </button>
    </>
  );
}

function WantedTab() {
  return (
    <div className="px-4 pb-12">
      <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-3" style={F.scriptureSC}>· what the coven is seeking ·</div>
      <div className="space-y-2">
        {WANTED_POSTS.map(w => (
          <div key={w.id} className="border border-[#2A2A2A] bg-[#0F0F0F] p-3">
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <h4 className="text-[#F5F1E8] text-sm" style={F.serif}>{w.title}</h4>
              <span className="text-[10px] text-[#6B6B6B]" style={F.mono}>{w.posted}</span>
            </div>
            <p className="text-[#A8A29E] text-xs leading-snug mb-2" style={F.serif}>{w.description}</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-xs">{w.avatar}</div>
              <span className="text-[10px] text-[#A8A29E]" style={F.ui}>{w.user}</span>
              {w.budget && <span className="ml-auto text-[10px] text-[#A89968]" style={F.mono}>up to ${w.budget}</span>}
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full py-2.5 border border-dashed border-[#3F3F3F] text-[#A8A29E] text-xs uppercase tracking-wider hover:border-[#5B0F1A] hover:text-[#F5F1E8]" style={F.ui}>+ post a wanted</button>
    </div>
  );
}

function ParlourTab() {
  return (
    <div className="px-4 pb-12">
      <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-3" style={F.scriptureSC}>· the parlour ·</div>
      <div className="space-y-2">
        {TATTOO_ARTISTS.map(a => (
          <div key={a.id} className="border border-[#2A2A2A] bg-[#0F0F0F] p-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-lg shrink-0">{a.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <h4 className="text-[#F5F1E8] text-base" style={F.display}>{a.name}</h4>
                  {a.badge && <span className="text-[9px] uppercase tracking-wider text-[#A89968] flex items-center gap-0.5" style={F.ui}>✓ {a.badge}</span>}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#A89968] mb-1">
                  <Star size={10} className="fill-[#A89968]" /><span style={F.mono}>{a.rating}</span><span>·</span><span style={F.ui}>{a.reviews} reviews</span>
                </div>
                <div className="text-[10px] text-[#6B6B6B] uppercase tracking-wider mb-1" style={F.ui}>{a.location}</div>
                <p className="text-[#A8A29E] text-xs leading-snug mb-2" style={F.serif}>{a.bio}</p>
                <div className="flex flex-wrap gap-1">
                  {a.style.map(s => (
                    <span key={s} className="text-[9px] px-1.5 py-0.5 border border-[#2A2A2A] text-[#A8A29E] uppercase tracking-wider" style={F.ui}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <button className="mt-3 w-full py-2 bg-[#5B0F1A] text-[#F5F1E8] text-[10px] uppercase tracking-wider" style={F.ui}>view portfolio · book</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShopsTab() {
  return (
    <div className="px-4 pb-12">
      <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-3" style={F.scriptureSC}>· the merchants ·</div>
      <div className="space-y-2">
        {SHOPS.map(s => (
          <div key={s.id} className="border border-[#2A2A2A] bg-[#0F0F0F] p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#A89968]" style={F.display}>☩</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="text-[#F5F1E8] text-sm" style={F.display}>{s.name.toUpperCase()}</h4>
                {s.verified && <span className="text-[9px] text-[#A89968]" style={F.ui}>✓ verified</span>}
              </div>
              <div className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>{s.kind} · <MapPin size={8} className="inline -mt-0.5" /> {s.neighborhood}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OdditiesOverlay({ onClose, onOpenOddity, onCompose }) {
  const [tab, setTab] = useState('market');
  return (
    <div className="absolute inset-0 z-40 bg-[#0A0608] animate-fade-in">
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 30%, #2A0710 0%, #0A0408 60%, #050204 100%)'
      }} />
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />
      <div className="relative h-full flex flex-col">
        <div className="bg-black/60 backdrop-blur-md border-b border-[#5B0F1A]/40">
          <div className="px-4 h-[60px] flex items-center justify-between">
            <button onClick={onClose} className="text-[#A89968] hover:text-[#C9A961]"><X size={20} /></button>
            <div className="text-[#C9A961] text-base tracking-[0.3em]" style={F.scriptureSC}>ODDITIES</div>
            <button className="text-[#A89968]"><Search size={18} /></button>
          </div>
        </div>
        <div className="bg-black/40 border-b border-[#2A2A2A] flex">
          {[
            { id: 'market', label: 'wares' },
            { id: 'wanted', label: 'wanted' },
            { id: 'parlour', label: 'parlour' },
            { id: 'shops', label: 'shops' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-[10px] uppercase tracking-[0.2em] ${tab === t.id ? 'text-[#C9A961] border-b border-[#5B0F1A]' : 'text-[#6B6B6B]'}`}
              style={F.ui}>{t.label}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto pt-3">
          {tab === 'market' && (<>
            <div className="px-4 pt-2 pb-3 text-center">
              <div className="text-[#A89968] text-[10px] uppercase tracking-[0.4em] mb-2" style={F.scriptureSC}>· of curiosities & wares ·</div>
              <h1 className="text-[#C9A961] text-2xl mb-1" style={F.scripture}>The Marketplace</h1>
              <p className="text-[#A89968]/80 text-[11px] italic" style={F.scripture}>"objects with stories, sold by those who held them."</p>
            </div>
            <MarketplaceTab onOpenOddity={onOpenOddity} onCompose={onCompose} />
          </>)}
          {tab === 'wanted' && <WantedTab />}
          {tab === 'parlour' && <ParlourTab />}
          {tab === 'shops' && <ShopsTab />}
        </div>
      </div>
    </div>
  );
}

export { OddityImage };
