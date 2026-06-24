import { useMemo, useState } from 'react';
import { ExternalLink, X, Plus } from 'lucide-react';
import { F } from '../../styles/fonts';
import { EmptyState } from '../shared/EmptyState';
import { SectionLabel } from '../shared/SectionLabel';
import { FASHION } from '../../data/fashion';

const PALETTE = {
  red: 'linear-gradient(135deg, #3B0A12 0%, #1A0408 70%, #0A0204 100%)',
  black: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)',
  violet: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)',
};
const TILE_COLORS = ['red', 'black', 'violet'];

// Real storefront if we have one, otherwise a web search for the brand.
function shopUrl(item) {
  if (item.url) return item.url;
  return `https://duckduckgo.com/?q=${encodeURIComponent(item.brand + ' goth clothing')}`;
}

// Normalize a user-entered link the same way the Oddities ShopsTab does.
function storeHref(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `https://${url}`;
}

// Cheap, stable color pick so user-added stores vary without storing a color.
function colorFor(id) {
  let h = 0;
  for (let i = 0; i < String(id).length; i++) h = (h * 31 + String(id).charCodeAt(i)) | 0;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

// A community-added store, rendered to match FashionTile but fed from the `shops` shape.
function StoreTile({ store, onDelete }) {
  const href = storeHref(store.url);
  const open = () => href && window.open(href, '_blank', 'noopener,noreferrer');
  const kindLine = [store.kind, store.neighborhood].filter(Boolean).join(' · ');
  return (
    <div className="relative w-full overflow-hidden border border-[#3F2A14] hover:border-[#C9A961]/50 transition-all group"
      style={{ height: 200, background: PALETTE[colorFor(store.id)] }}>
      <button onClick={open} disabled={!href} className="absolute inset-0 w-full h-full text-left disabled:cursor-default">
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/5 pointer-events-none" />
        <div className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.2em] text-[#C9A961]/80 border border-[#C9A961]/30 px-1.5 py-0.5" style={F.ui}>store</div>
        {href && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink size={13} className="text-[#C9A961]" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-[2px] bg-[#8B0000] group-hover:bg-[#C9A961] transition-colors shrink-0" />
            <div className="text-[#F5F1E8] text-sm tracking-wide group-hover:text-[#C9A961] transition-colors truncate" style={F.display}>{store.name.toUpperCase()}</div>
          </div>
          {kindLine && <div className="text-[#A8A29E] text-[11px] mt-0.5 pl-2.5 truncate" style={F.ui}>{kindLine}</div>}
          {store.blurb && <div className="text-[#A8A29E] text-[11px] mt-1 pl-2.5 italic line-clamp-2" style={F.serif}>{store.blurb}</div>}
          {store.owner?.user && <div className="text-[#6B6B6B] text-[10px] mt-1.5 pl-2.5" style={F.ui}>added by @{store.owner.user}</div>}
        </div>
      </button>
      {store.mine && (
        <button onClick={() => onDelete && onDelete(store.id)} title="remove your store"
          className="absolute bottom-2 right-2 text-[#6B6B6B] hover:text-[#8B0000] p-1 z-10"><X size={13} /></button>
      )}
    </div>
  );
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
      className="relative w-full text-left overflow-hidden border border-[#2A2A2A] hover:border-[#C9A961]/40 active:scale-[0.98] transition-all group"
      style={{ height: item.h, background: palette }}>
      <svg viewBox="0 0 100 140" className="absolute inset-0 w-full h-full opacity-60 transition-transform duration-500 group-hover:scale-110" preserveAspectRatio="xMidYMid slice">
        <path d="M 30 20 L 40 10 L 60 10 L 70 20 L 85 35 L 80 50 L 75 50 L 75 130 L 25 130 L 25 50 L 20 50 L 15 35 Z"
          fill="rgba(0,0,0,0.5)" stroke="rgba(245,241,232,0.08)" strokeWidth="0.3" />
        <line x1="50" y1="20" x2="50" y2="130" stroke="rgba(245,241,232,0.06)" strokeWidth="0.3" />
      </svg>
      <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.9\'/></filter><rect width=\'80\' height=\'80\' filter=\'url(%23n)\' opacity=\'0.5\'/></svg>")' }} />
      {/* bottom scrim keeps the brand/price legible over any silhouette */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/5 pointer-events-none" />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink size={13} className="text-[#C9A961]" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-[2px] bg-[#8B0000] group-hover:bg-[#C9A961] transition-colors shrink-0" />
          <div className="text-[#F5F1E8] text-sm tracking-wide group-hover:text-[#C9A961] transition-colors" style={F.display}>{item.brand.toUpperCase()}</div>
        </div>
        <div className="text-[#A8A29E] text-[11px] mt-0.5 pl-2.5" style={F.ui}>{item.kind}</div>
        <div className="flex items-center gap-1.5 mt-2 pl-2.5">
          {item.tags.map(t => (
            <span key={t} className="chip" style={F.ui}>{t}</span>
          ))}
          <span className="ml-auto text-[#C9A961]/90 text-xs" style={F.mono}>{item.price}</span>
        </div>
      </div>
    </button>
  );
}

const FILTERS = ['all', 'stores', 'mens', 'womens', 'unisex', 'thrift', 'indie'];
const EMPTY_STORE = { name: '', kind: '', url: '', blurb: '' };

export function FashionScreen({ shops = [], meId, onAddStore, onDeleteStore }) {
  const [filter, setFilter] = useState('all');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_STORE);

  const items = useMemo(() => {
    if (filter === 'all' || filter === 'stores') return FASHION;
    if (filter === 'thrift' || filter === 'indie') {
      return FASHION.filter(i => i.kind.toLowerCase().includes(filter));
    }
    return FASHION.filter(i => i.tags.includes(filter));
  }, [filter]);

  const col1 = items.filter((_, i) => i % 2 === 0);
  const col2 = items.filter((_, i) => i % 2 === 1);

  // Stores show in the 'all' and 'stores' views (above the curated brands).
  const showStores = filter === 'all' || filter === 'stores';
  const showBrands = filter !== 'stores';

  const submitStore = () => {
    if (!form.name.trim()) return;
    onAddStore && onAddStore(form);
    setForm(EMPTY_STORE);
    setAdding(false);
  };

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
              className={`tap shrink-0 chip ${active ? 'chip-gold' : 'hover:border-[#5B0F1A]/60'}`}
              style={F.ui}>{t}</button>
          );
        })}
      </div>

      {/* Community stores — a directory of shops / clothing sites souls have found. */}
      {showStores && (
        <div className="px-3 mb-3">
          <SectionLabel className="px-1 mb-2" action={meId && !adding && (
            <button onClick={() => setAdding(true)} className="btn btn-quiet">
              <Plus size={12} /> add a store
            </button>
          )}>stores the coven found</SectionLabel>

          {adding && (
            <div className="card p-3 space-y-2 mb-2">
              {[['name', 'store name'], ['kind', 'kind (e.g. indie · online)'], ['url', 'link (e.g. killstar.com)'], ['blurb', 'one line about it (optional)']].map(([k, ph]) => (
                <input key={k} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={ph}
                  className="field !py-1.5" />
              ))}
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setAdding(false); setForm(EMPTY_STORE); }} className="btn btn-quiet">cancel</button>
                <button onClick={submitStore} disabled={!form.name.trim()} className="btn btn-primary">add store</button>
              </div>
            </div>
          )}

          {shops.length === 0 ? (
            !adding && <p className="py-6 text-center text-[#6B6B6B] text-xs italic" style={F.serif}>no stores added yet — be the first to share one.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {shops.map(s => <StoreTile key={s.id} store={s} onDelete={onDeleteStore} />)}
            </div>
          )}
        </div>
      )}

      {showBrands && (
        items.length === 0 ? (
          <EmptyState glyph="✦" text="· nothing here yet ·" />
        ) : (
          <div className="px-3 grid grid-cols-2 gap-2">
            <div className="space-y-2">{col1.map(item => <FashionTile key={item.id} item={item} />)}</div>
            <div className="space-y-2">{col2.map(item => <FashionTile key={item.id} item={item} />)}</div>
          </div>
        )
      )}
    </div>
  );
}
