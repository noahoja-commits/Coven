import { useState } from 'react';
import { Plus, Map as MapIcon, List } from 'lucide-react';
import { F } from '../../styles/fonts';
import { Avatar } from '../shared/Avatar';

function hashStr(s) {
  let h = 0;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

const areaKey = (pin) => (pin.neighborhood || pin.city || '').trim().toLowerCase();
const areaLabel = (pin) => (pin.neighborhood || pin.city || 'somewhere unspoken');

// Cluster center for an area (no real geolocation) — people in the same place
// sit together.
function areaCenter(area) {
  const hc = hashStr('a:' + area);
  return { cx: 18 + (hc % 64), cy: 28 + (Math.floor(hc / 64) % 50) };
}

// Approximate-by-area placement: cluster center from the area + a small per-user
// jitter so overlapping pins don't stack. No area → a stable per-user spot.
function pinPos(pin) {
  const area = areaKey(pin);
  if (!area) {
    const h = hashStr('u:' + pin.userId);
    return { left: `${10 + (h % 80)}%`, top: `${24 + (Math.floor(h / 80) % 58)}%` };
  }
  const { cx, cy } = areaCenter(area);
  const hu = hashStr('u:' + pin.userId);
  const jx = (hu % 13) - 6;                         // jitter -6..+6
  const jy = (Math.floor(hu / 13) % 13) - 6;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  return { left: `${clamp(cx + jx, 6, 94)}%`, top: `${clamp(cy + jy, 22, 84)}%` };
}

export function MapScreen({ tonightStatus, ghost = false, pins = [], onOpenUser, onOpenTonightStatus, festivalEvent = null, onEnterFestival }) {
  const [view, setView] = useState('map'); // 'map' | 'list'

  // Group souls by area (for the cluster headings + the by-area list).
  const groups = {};
  pins.forEach(p => {
    const key = areaKey(p) || '__none__';
    if (!groups[key]) groups[key] = { label: areaLabel(p), key, pins: [] };
    groups[key].pins.push(p);
  });
  const grouped = Object.values(groups).sort((a, b) => b.pins.length - a.pins.length);

  return (
    <div className="absolute inset-0">
      {festivalEvent && (
        <button onClick={onEnterFestival}
          className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-[#8B0000]/90 border border-[#C9A961] text-[#F5F1E8] text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl animate-pulse-slow" style={F.ui}>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C9A961]" /> {festivalEvent.name} · enter venue map
        </button>
      )}

      {/* map / by-area toggle */}
      <div className="absolute top-2 left-2 z-30 flex border border-[#2A2A2A] bg-black/70 backdrop-blur-sm">
        {[['map', MapIcon], ['list', List]].map(([v, Icon]) => (
          <button key={v} onClick={() => setView(v)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.18em] transition-colors ${view === v ? 'bg-[#8B0000] text-[#F5F1E8]' : 'text-[#A8A29E] hover:text-[#F5F1E8]'}`}
            style={F.ui}>
            <Icon size={11} /> {v === 'map' ? 'map' : 'by area'}
          </button>
        ))}
      </div>

      {view === 'map' ? (
        <>
          <div className="absolute inset-0 overflow-hidden bg-[#070708]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
                  <path d="M 6 0 L 0 0 0 6" fill="none" stroke="#161618" strokeWidth="0.15" />
                </pattern>
                <radialGradient id="mapBg" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#0F0F12" />
                  <stop offset="100%" stopColor="#050506" />
                </radialGradient>
              </defs>
              <rect width="100" height="100" fill="url(#mapBg)" />
              <rect width="100" height="100" fill="url(#grid)" />
              <path d="M -5 35 Q 20 40, 35 50 T 70 65 T 110 75" stroke="#0A0E14" strokeWidth="6" fill="none" opacity="0.9" />
              <path d="M -5 35 Q 20 40, 35 50 T 70 65 T 110 75" stroke="#1A1F2E" strokeWidth="0.3" fill="none" opacity="0.5" />
              <rect x="55" y="20" width="14" height="10" fill="#0E1410" opacity="0.8" />
              <rect x="20" y="65" width="10" height="12" fill="#0E1410" opacity="0.8" />
              <rect x="75" y="40" width="8" height="6" fill="#0E1410" opacity="0.8" />
              <line x1="0" y1="50" x2="100" y2="55" stroke="#15151A" strokeWidth="0.4" />
              <line x1="50" y1="0" x2="48" y2="100" stroke="#15151A" strokeWidth="0.4" />
              <line x1="0" y1="80" x2="100" y2="78" stroke="#15151A" strokeWidth="0.3" />
            </svg>

            <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'120\' height=\'120\' filter=\'url(%23n)\' opacity=\'0.3\'/></svg>")' }} />
          </div>

          {/* Empty state — only when no other souls are out */}
          {pins.length === 0 && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 text-center pointer-events-none px-8">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#A89968]/70 bg-black/50 backdrop-blur-sm px-3 py-1.5 border border-[#2A2A2A]" style={F.ui}>
                · no souls out near you ·
              </div>
            </div>
          )}

          {/* Faint area headings over each known cluster */}
          {grouped.filter(g => g.key !== '__none__').map(g => {
            const { cx, cy } = areaCenter(g.key);
            return (
              <div key={`lbl-${g.key}`} className="absolute pointer-events-none -translate-x-1/2"
                style={{ left: `${cx}%`, top: `${Math.max(14, cy - 11)}%` }}>
                <div className="text-[8px] uppercase tracking-[0.25em] text-[#C9A961]/60 whitespace-nowrap" style={F.ui}>
                  {g.label} · {g.pins.length}
                </div>
              </div>
            );
          })}

          {/* Other souls out tonight */}
          {pins.map(p => {
            const pos = pinPos(p);
            return (
              <button key={p.userId} onClick={() => onOpenUser && onOpenUser(p.handle)}
                className="absolute group" style={pos}>
                <div className="relative -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="absolute inset-0 -m-2 rounded-full bg-[#8B0000] opacity-25 animate-ping-slow" />
                  <Avatar url={p.avatarUrl} glyph={p.avatar} size={28} className="relative ring-2 ring-[#8B0000]/70" />
                  <div className="mt-1 whitespace-nowrap px-1.5 py-0.5 bg-black/80 backdrop-blur-sm border border-[#8B0000]/40 text-[9px] text-[#F5F1E8] max-w-[160px] truncate" style={F.ui}>
                    {p.handle} · {p.text ? p.text.slice(0, 28) : areaLabel(p)}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Your own pin tonight — hidden while ghosted (you're invisible) */}
          {ghost ? (
            <div className="absolute left-1/2 bottom-20 -translate-x-1/2 text-center pointer-events-none px-8">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#7B2CBF] bg-black/60 backdrop-blur-sm px-3 py-1.5 border border-[#7B2CBF]/40" style={F.ui}>
                · ghosted · you're off the map ·
              </div>
            </div>
          ) : (
            <button onClick={onOpenTonightStatus} className="absolute" style={{ left: '48%', top: '52%' }}>
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <span className="absolute inset-0 -m-3 rounded-full bg-[#7B2CBF] opacity-30 animate-ping-slow" />
                <span className="relative block w-3 h-3 rounded-full bg-[#7B2CBF] ring-2 ring-[#0A0A0A]" />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-[#7B2CBF]/40 text-[10px] text-[#F5F1E8]" style={F.ui}>
                  you{tonightStatus?.text ? ` · ${tonightStatus.text.slice(0, 24)}` : ' · drop a status'}
                </div>
              </div>
            </button>
          )}
        </>
      ) : (
        /* By-area list */
        <div className="absolute inset-0 top-12 bottom-0 overflow-y-auto bg-[#070708] safe-pb">
          {pins.length === 0 ? (
            <div className="text-center py-20 text-[#6B6B6B]" style={F.serif}>
              <div className="text-3xl mb-3">🜨</div>
              <p className="text-sm italic px-8">no souls out near you. drop your own pin and someone may find you.</p>
            </div>
          ) : (
            grouped.map(g => (
              <div key={g.key}>
                <div className="px-4 pt-4 pb-1.5 text-[10px] uppercase tracking-[0.25em] text-[#C9A961]/80 flex items-center justify-between" style={F.ui}>
                  <span>{g.label}</span>
                  <span className="text-[#6B6B6B]">{g.pins.length} {g.pins.length === 1 ? 'soul' : 'souls'}</span>
                </div>
                <div className="divide-y divide-[#141414] border-y border-[#141414]">
                  {g.pins.map(p => (
                    <button key={p.userId} onClick={() => onOpenUser && onOpenUser(p.handle)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#0F0F0F] transition-colors text-left">
                      <Avatar url={p.avatarUrl} glyph={p.avatar} size={36} className="ring-1 ring-[#8B0000]/60 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[#F5F1E8] text-sm truncate" style={F.ui}>{p.handle}</div>
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
