import { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { F } from '../../styles/fonts';
import { EmptyState } from '../shared/EmptyState';
import { SectionLabel } from '../shared/SectionLabel';
import { Button } from '../shared/Button';
import { ODDITY_CATEGORIES, ODDITY_PALETTES, CONDITION_LABELS } from '../../data/oddities';

function OddityImage({ shape, palette, imageUrl, small = false }) {
  const p = ODDITY_PALETTES[palette] || ODDITY_PALETTES.black;
  if (imageUrl) {
    return (
      <div className="relative w-full overflow-hidden bg-[#0A0608]" style={{ aspectRatio: '4/5' }}>
        <img src={imageUrl} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        {!small && <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm border border-[#5B0F1A]/40">
          <span className="text-[#C9A961] text-[9px] uppercase tracking-[0.2em]" style={F.scriptureSC}>· for sale ·</span>
        </div>}
      </div>
    );
  }
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
    <button onClick={() => onOpen(item.id)} className="tap group text-left">
      <div className="border border-[#2A2A2A] hover:border-[#C9A961]/40 transition-colors">
        <OddityImage shape={item.photo.shape} palette={item.photo.palette} imageUrl={item.imageUrl} />
        <div className="p-2.5 bg-[#0F0F0F]">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="text-[#F5F1E8] text-base" style={F.mono}>${item.price}</span>
            <span className="text-[9px] text-[#9E2A33] uppercase tracking-wider" style={F.ui}>{CONDITION_LABELS[item.condition]}</span>
          </div>
          <p className="text-[#A8A29E] text-xs leading-tight line-clamp-2" style={F.serif}>{item.title}</p>
        </div>
      </div>
    </button>
  );
}

function UserOddityCard({ item, onOpen }) {
  return (
    <button onClick={() => onOpen && onOpen(item.id)} className="tap text-left">
      <div className="border border-[#C9A961]/30 hover:border-[#C9A961]/60 transition-colors">
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#3B0A12] to-[#0A0204]" style={{ aspectRatio: '4/5' }}>
          <div className="absolute inset-0 flex items-center justify-center text-[#C9A961]/40 text-5xl">⚱</div>
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm border border-[#C9A961]/40">
            <span className="text-[#C9A961] text-[9px] uppercase tracking-[0.2em]" style={F.scriptureSC}>· yours ·</span>
          </div>
        </div>
        <div className="p-2.5 bg-[#0F0F0F]">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="text-[#F5F1E8] text-base" style={F.mono}>${item.price || '—'}</span>
            <span className="text-[9px] text-[#9E2A33] uppercase tracking-wider" style={F.ui}>{item.priceMode}</span>
          </div>
          <p className="text-[#A8A29E] text-xs leading-tight line-clamp-2" style={F.serif}>{item.title}</p>
        </div>
      </div>
    </button>
  );
}

function MarketplaceTab({ onOpenOddity, onCompose, listings = [] }) {
  const [category, setCategory] = useState('all');
  const filtered = category === 'all' ? listings : listings.filter(o => o.category === category);
  return (
    <>
      <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {ODDITY_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={`tap shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-wider border transition-colors
              ${category === c.id ? 'border-[#C9A961]/70 text-[#C9A961]' : 'border-[#2A2A2A] text-[#A8A29E] hover:text-[#C9A961]'}`}
            style={category === c.id ? { ...F.ui, boxShadow: '0 0 12px rgba(201,169,97,0.18)' } : F.ui}>{c.label}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState glyph="⚱"
          text={listings.length === 0 ? 'no wares yet.' : `nothing in ${category}.`}
          action="list the first" onAction={onCompose} />
      ) : (
        <div className="px-3 grid grid-cols-2 gap-2 pb-12">
          {filtered.map(item => <OddityCard key={item.id} item={item} onOpen={onOpenOddity} />)}
        </div>
      )}
      <button onClick={onCompose} className="tap fixed bottom-6 right-6 z-10 w-14 h-14 bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] flex items-center justify-center shadow-xl"
        style={{ boxShadow: '0 0 24px rgba(91, 15, 26, 0.6)' }}>
        <Plus size={22} />
      </button>
    </>
  );
}

function WantedTab({ items, onOpenOddity, onCompose }) {
  return (
    <div className="px-4 pb-12">
      <SectionLabel className="mb-3">what the coven is seeking</SectionLabel>
      {items.length === 0 ? (
        <div className="py-10 text-center text-[#6B6B6B] text-xs italic" style={F.serif}>no one is seeking anything yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {items.map(item => <OddityCard key={item.id} item={item} onOpen={onOpenOddity} />)}
        </div>
      )}
      <button onClick={onCompose} className="tap mt-2 w-full py-2.5 border border-dashed border-[#3F3F3F] text-[#A8A29E] text-xs uppercase tracking-wider hover:border-[#C9A961]/60 hover:text-[#C9A961] transition-colors" style={F.ui}>+ post a wanted</button>
    </div>
  );
}

function ParlourTab({ items, onOpenOddity, onCompose }) {
  return (
    <div className="px-4 pb-12">
      <SectionLabel className="mb-1">the parlour</SectionLabel>
      <p className="text-[10px] text-[#6B6B6B] italic mb-3" style={F.serif}>commissions from the coven's artists — tattooers, painters, seamstresses.</p>
      {items.length === 0 ? (
        <div className="py-10 text-center text-[#6B6B6B]" style={F.serif}>
          <div className="text-3xl mb-3">⚰</div>
          <p className="text-xs italic">no commissions offered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {items.map(item => <OddityCard key={item.id} item={item} onOpen={onOpenOddity} />)}
        </div>
      )}
      <button onClick={onCompose} className="tap mt-2 w-full py-2.5 border border-dashed border-[#3F3F3F] text-[#A8A29E] text-xs uppercase tracking-wider hover:border-[#C9A961]/60 hover:text-[#C9A961] transition-colors" style={F.ui}>+ offer a commission</button>
    </div>
  );
}

function ShopsTab({ shops = [], meId, onAddShop, onDeleteShop, onBoostShop }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', kind: '', neighborhood: '', url: '', blurb: '' });
  const submit = () => {
    if (!form.name.trim()) return;
    onAddShop && onAddShop(form);
    setForm({ name: '', kind: '', neighborhood: '', url: '', blurb: '' });
    setAdding(false);
  };
  return (
    <div className="px-4 pb-12">
      <SectionLabel className="mb-3">the merchants</SectionLabel>
      {shops.length === 0 ? (
        <div className="py-8 text-center text-[#6B6B6B] text-xs italic" style={F.serif}>no shops listed yet. add yours.</div>
      ) : (
        <div className="space-y-2 mb-3">
          {shops.map(s => (
            <div key={s.id} className={`border p-3 ${s.isBoosted ? 'border-[#C9A961]/60 bg-[#C9A961]/[0.04]' : 'border-[#2A2A2A] bg-[#0F0F0F]'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 border flex items-center justify-center ${s.isBoosted ? 'border-[#C9A961]/50 text-[#C9A961] bg-[#1A1A1A]' : 'border-[#2A2A2A] text-[#9E2A33] bg-[#1A1A1A]'}`} style={F.display}>☩</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    {s.url ? (
                      <a href={s.url.startsWith('http') ? s.url : `https://${s.url}`} target="_blank" rel="noreferrer" className="text-[#F5F1E8] text-sm hover:text-[#C9A961] truncate" style={F.display}>{s.name.toUpperCase()}</a>
                    ) : (
                      <h4 className="text-[#F5F1E8] text-sm truncate" style={F.display}>{s.name.toUpperCase()}</h4>
                    )}
                    <span className="flex items-center gap-1.5 shrink-0">
                      {s.isBoosted && <span className="text-[9px] text-[#C9A961] tracking-wider" style={F.ui}>★ boosted</span>}
                      {s.verified && <span className="text-[9px] text-[#9E2A33]" style={F.ui}>✓ verified</span>}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>{[s.kind, s.neighborhood].filter(Boolean).join(' · ')}</div>
                  {s.blurb && <div className="text-[11px] text-[#A8A29E] italic mt-0.5 truncate" style={F.serif}>{s.blurb}</div>}
                </div>
                {s.mine && (
                  <button onClick={() => onDeleteShop && onDeleteShop(s.id)} className="tap text-[#6B6B6B] hover:text-[#8B0000] p-1 self-start"><X size={12} /></button>
                )}
              </div>
              {/* Owner-only: boost (pin) your store, or a note that it's already boosted. */}
              {s.mine && onBoostShop && (
                <div className="mt-2.5 pt-2.5 border-t border-[#1F1F1F]">
                  {s.isBoosted ? (
                    <div className="text-[10px] text-[#C9A961]/80 tracking-wider" style={F.ui}>★ pinned to the top · boost active</div>
                  ) : (
                    <button onClick={() => onBoostShop(s.id)} className="tap w-full py-2 border border-[#C9A961]/50 text-[#C9A961] text-[10px] uppercase tracking-[0.18em] hover:bg-[#C9A961]/10 transition-colors" style={F.ui}>
                      ★ boost this store · $40/mo
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {adding ? (
        <div className="border border-[#2A2A2A] bg-[#0F0F0F] p-3 space-y-2">
          {[['name', 'shop name'], ['kind', 'kind (e.g. thrift · vintage)'], ['neighborhood', 'neighborhood / online'], ['url', 'link (optional)'], ['blurb', 'one line about it (optional)']].map(([k, ph]) => (
            <input key={k} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={ph}
              className="field" />
          ))}
          <div className="flex gap-2 justify-end">
            <Button variant="quiet" onClick={() => setAdding(false)}>cancel</Button>
            <Button variant="primary" onClick={submit} disabled={!form.name.trim()}>add shop</Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="tap w-full py-2.5 border border-dashed border-[#3F3F3F] text-[#A8A29E] text-xs uppercase tracking-wider hover:border-[#C9A961]/60 hover:text-[#C9A961] transition-colors" style={F.ui}>+ add your shop</button>
      )}
    </div>
  );
}

export function OdditiesOverlay({ onClose, onOpenOddity, onCompose, listings = [], shops = [], meId, onAddShop, onDeleteShop, onBoostShop, embedded = false }) {
  const [tab, setTab] = useState('market');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const byKind = (k) => listings.filter(l => (l.kind || 'sale') === k);
  const matchesQ = (l) => !q || (l.title || '').toLowerCase().includes(q);
  const wares = byKind('sale').filter(matchesQ);
  const wantedItems = byKind('wanted');
  const commissionItems = byKind('commission');
  // As a tab (embedded): fill the content area with an explicit height so the inner column can't
  // collapse (the screen-in wrapper has no in-flow height). As an overlay: cover everything at z-40.
  const shellCls = embedded ? 'absolute inset-x-0 top-0 bg-[#0A0608]' : 'absolute inset-0 z-40 bg-[#0A0608] animate-fade-in';
  const shellStyle = embedded ? { height: 'calc(100dvh - 128px)' } : undefined;
  return (
    <div className={shellCls} style={shellStyle}>
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 30%, #2A0710 0%, #0A0408 60%, #050204 100%)'
      }} />
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />
      <div className="relative h-full flex flex-col">
        <div className="bg-black/60 backdrop-blur-md border-b border-[#5B0F1A]/40 safe-pt">
          <div className="px-4 h-[60px] flex items-center justify-between">
            {embedded
              ? <span className="w-9" />
              : <button onClick={onClose} className="tap text-[#9E2A33] hover:text-[#C9A961] p-2 -m-1 transition-colors"><X size={20} /></button>}
            <div className="text-[#C9A961] text-base tracking-[0.3em]" style={F.scriptureSC}>ODDITIES</div>
            <button onClick={() => { setTab('market'); setSearchOpen(o => !o); if (searchOpen) setQuery(''); }}
              className={`tap p-2 -m-1 transition-colors ${searchOpen ? 'text-[#C9A961]' : 'text-[#9E2A33] hover:text-[#C9A961]'}`}><Search size={18} /></button>
          </div>
          {searchOpen && (
            <div className="px-4 pb-3">
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="search the wares…"
                className="w-full bg-[#0A0608] border border-[#5B0F1A]/40 focus:border-[#5B0F1A] outline-none px-3 py-2 text-[#F5F1E8] text-sm"
                style={F.serif} />
            </div>
          )}
        </div>
        <div className="bg-black/40 border-b border-[#2A2A2A] flex">
          {[
            { id: 'market', label: 'wares' },
            { id: 'wanted', label: 'wanted' },
            { id: 'parlour', label: 'parlour' },
            { id: 'shops', label: 'shops' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`tap flex-1 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${tab === t.id ? 'text-[#C9A961] border-b border-[#C9A961]/70' : 'text-[#6B6B6B] hover:text-[#A8A29E]'}`}
              style={F.ui}>{t.label}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto pt-3 safe-pb">
          {tab === 'market' && (<>
            <div className="px-4 pt-2 pb-3 text-center">
              <div className="text-[#9E2A33] text-[10px] uppercase tracking-[0.4em] mb-2" style={F.scriptureSC}>· of curiosities & wares ·</div>
              <h1 className="text-[#C9A961] text-2xl mb-1" style={F.scripture}>The Marketplace</h1>
              <p className="text-[#9E2A33]/80 text-[11px] italic" style={F.scripture}>"objects with stories, sold by those who held them."</p>
            </div>
            <MarketplaceTab onOpenOddity={onOpenOddity} onCompose={() => onCompose('sale')} listings={wares} />
          </>)}
          {tab === 'wanted' && <WantedTab items={wantedItems} onOpenOddity={onOpenOddity} onCompose={() => onCompose('wanted')} />}
          {tab === 'parlour' && <ParlourTab items={commissionItems} onOpenOddity={onOpenOddity} onCompose={() => onCompose('commission')} />}
          {tab === 'shops' && <ShopsTab shops={shops} meId={meId} onAddShop={onAddShop} onDeleteShop={onDeleteShop} onBoostShop={onBoostShop} />}
        </div>
      </div>
    </div>
  );
}

export { OddityImage };
