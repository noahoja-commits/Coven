import { lazy, Suspense, useState } from 'react';
import { Plus, Map as MapIcon, List } from 'lucide-react';
import { F } from '../../styles/fonts';
import { Avatar } from '../shared/Avatar';
import { ErrorBoundary } from '../ErrorBoundary';

// The real dark map (MapLibre + free OpenFreeMap tiles) is heavy — load it only when opened.
const RealMap = lazy(() => import('./RealMap'));

function hashStr(s) {
  let h = 0;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

const areaKey = (pin) => (pin.neighborhood || pin.city || '').trim().toLowerCase();
const areaLabel = (pin) => (pin.neighborhood || pin.city || 'somewhere unspoken');

export function MapScreen({ tonightStatus, ghost = false, pins = [], nearby = [], onOpenUser, onOpenTonightStatus, festivalEvent = null, onEnterFestival }) {
  const [view, setView] = useState('real'); // 'real' (the living map) | 'list' (by area)
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('active'); // 'active' | 'az'

  // Filter the souls by the search box (used by the by-area list).
  const q = query.trim().toLowerCase();
  const filtered = pins.filter(p => {
    if (!q) return true;
    return (p.handle || '').toLowerCase().includes(q) || (p.text || '').toLowerCase().includes(q);
  });

  // Group the (filtered) souls by area — for the by-area list.
  const groups = {};
  filtered.forEach(p => {
    const key = areaKey(p) || '__none__';
    if (!groups[key]) groups[key] = { label: areaLabel(p), key, pins: [] };
    groups[key].pins.push(p);
  });
  const grouped = Object.values(groups).sort((a, b) => sort === 'az' ? a.label.localeCompare(b.label) : b.pins.length - a.pins.length);
  // Privacy-fuzzed proximity: real "X mi away" from the tonight_nearby RPC.
  const distById = {};
  nearby.forEach(n => { if (n && n.userId != null) distById[n.userId] = n.distanceMi; });
  const hasDist = Object.keys(distById).length > 0;
  const fmtDist = (id) => { const d = distById[id]; if (d == null) return null; return d <= 0 ? '< 0.5 mi' : `~${d} mi`; };
  const byDist = (arr) => hasDist ? [...arr].sort((a, b) => (distById[a.userId] ?? 1e9) - (distById[b.userId] ?? 1e9)) : arr;

  return (
    <div className="absolute inset-0">
      {festivalEvent && (
        <button onClick={onEnterFestival}
          className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-[#8B0000]/90 border border-[#C9A961] text-[#F5F1E8] text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl animate-pulse-slow" style={F.ui}>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C9A961]" /> {festivalEvent.name} · enter venue map
        </button>
      )}

      {/* map / by-area toggle + sort */}
      <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5">
        <div className="flex border border-[#2A2A2A] bg-black/70 backdrop-blur-sm">
          {[['real', MapIcon, 'map'], ['list', List, 'by area']].map(([v, Icon, lbl]) => (
            <button key={v} onClick={() => setView(v)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.18em] transition-colors ${view === v ? 'bg-[#8B0000] text-[#F5F1E8]' : 'text-[#A8A29E] hover:text-[#F5F1E8]'}`}
              style={F.ui}>
              <Icon size={11} /> {lbl}
            </button>
          ))}
        </div>
        {view === 'list' && (
          <button onClick={() => setSort(s => s === 'active' ? 'az' : 'active')}
            className="px-2.5 py-1.5 border border-[#2A2A2A] bg-black/70 backdrop-blur-sm text-[9px] uppercase tracking-[0.18em] text-[#A8A29E] hover:text-[#F5F1E8] transition-colors" style={F.ui}
            title="sort">{sort === 'active' ? 'active' : 'a–z'}</button>
        )}
      </div>

      {/* search (by-area list only) */}
      {view === 'list' && (
        <div className="absolute top-11 left-2 right-2 z-30">
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="search souls or status…"
            className="w-full bg-black/70 backdrop-blur-sm border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none px-2.5 py-1.5 text-[11px] text-[#F5F1E8] placeholder:text-[#6B6B6B]" style={F.ui} />
        </div>
      )}

      {view === 'real' ? (
        <ErrorBoundary>
          <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-[#6B6B6B] text-xs bg-[#070708]" style={F.ui}>summoning the map…</div>}>
            <RealMap nearby={nearby} tonightStatus={tonightStatus} ghost={ghost} onOpenUser={onOpenUser} onOpenTonightStatus={onOpenTonightStatus} />
          </Suspense>
        </ErrorBoundary>
      ) : (
        /* By-area list */
        <div className="absolute inset-0 top-[88px] bottom-0 overflow-y-auto bg-[#070708] safe-pb">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[#6B6B6B]" style={F.serif}>
              <div className="text-3xl mb-3">🜨</div>
              <p className="text-sm italic px-8">{pins.length === 0 ? 'no souls out near you. drop your own pin and someone may find you.' : 'no souls match your search.'}</p>
            </div>
          ) : (
            grouped.map(g => (
              <div key={g.key}>
                <div className="px-4 pt-4 pb-1.5 text-[10px] uppercase tracking-[0.25em] text-[#C9A961]/80 flex items-center justify-between" style={F.ui}>
                  <span>{g.label}</span>
                  <span className="text-[#6B6B6B]">{g.pins.length} {g.pins.length === 1 ? 'soul' : 'souls'}</span>
                </div>
                <div className="divide-y divide-[#141414] border-y border-[#141414]">
                  {byDist(g.pins).map(p => (
                    <button key={p.userId} onClick={() => onOpenUser && onOpenUser(p.handle)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#0F0F0F] transition-colors text-left">
                      <Avatar url={p.avatarUrl} glyph={p.avatar} size={36} className="ring-1 ring-[#8B0000]/60 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[#F5F1E8] text-sm truncate flex items-center gap-1.5" style={F.ui}>
                          <span className="truncate">{p.handle}</span>
                          {fmtDist(p.userId) && <span className="text-[#C9A961] text-[10px] shrink-0" style={F.mono}>{fmtDist(p.userId)}</span>}
                        </div>
                        {p.text && <div className="text-[11px] text-[#A8A29E] truncate" style={F.serif}>{p.text}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <button onClick={onOpenTonightStatus}
        className="absolute bottom-4 right-4 w-12 h-12 bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] flex items-center justify-center shadow-xl z-30"
        style={{ boxShadow: '0 0 20px rgba(139,0,0,0.5)' }}
        title="drop your tonight pin">
        <Plus size={20} />
      </button>
    </div>
  );
}
