import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { F } from '../../styles/fonts';
import { fetchVenueMap, pinMeta, PIN_KINDS } from '../../lib/db/festival';

function countdownLabel(startsAt) {
  if (!startsAt) return 'live now';
  const ms = new Date(startsAt).getTime() - Date.now();
  if (ms <= 0) return 'live now';
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `doors in ${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return `doors in ${h}h ${m}m`;
}

export function FestivalMap({ event, onExit }) {
  const [data, setData] = useState({ imageUrl: null, pins: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null); // pin kind filter
  const [active, setActive] = useState(null); // selected pin
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let on = true;
    fetchVenueMap(event.id).then(d => { if (on) { setData(d); setLoading(false); } }).catch(() => setLoading(false));
    return () => { on = false; };
  }, [event.id]);

  // re-render the countdown each minute
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 60000); return () => clearInterval(t); }, []);

  const kindsPresent = PIN_KINDS.filter(k => data.pins.some(p => p.kind === k.kind));
  const shown = filter ? data.pins.filter(p => p.kind === filter) : data.pins;

  return (
    <div className="absolute inset-0 z-30 bg-[#070707] flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-4 h-[60px] flex items-center gap-3 border-b border-[#1A1A1A] bg-[#0A0A0A]">
        <button onClick={onExit} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1"><ArrowLeft size={20} /></button>
        <div className="flex-1 min-w-0">
          <div className="text-[#F5F1E8] text-sm truncate tracking-wide" style={F.display}>{event.name}</div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#C9A961] flex items-center gap-1.5" style={F.mono}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse" /> festival mode · {countdownLabel(event.starts_at)}
          </div>
        </div>
      </div>

      {/* Map canvas */}
      <div className="relative flex-1 overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-[#6B6B6B] text-sm italic" style={F.serif}>unrolling the map…</div>
        ) : !data.imageUrl ? (
          <div className="absolute inset-0 flex items-center justify-center text-center px-10 text-[#6B6B6B] text-sm italic" style={F.serif}>
            the venue hasn't posted a map yet.<br />check back closer to doors.
          </div>
        ) : (
          <div className="absolute inset-0">
            <img src={data.imageUrl} alt="venue map" className="w-full h-full object-contain select-none" draggable={false} />
            {shown.map(p => {
              const m = pinMeta(p.kind);
              const isActive = active?.id === p.id;
              return (
                <button key={p.id}
                  onClick={() => setActive(isActive ? null : p)}
                  style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 shadow-lg transition-transform ${isActive ? 'scale-125 border-[#C9A961] bg-[#1A140A]' : 'border-[#8B0000] bg-[#0A0A0A]/90'}`}>
                    {m.glyph}
                  </span>
                  {isActive && (
                    <span className="mt-1 px-2 py-0.5 bg-[#C9A961] text-[#0A0A0A] text-[10px] uppercase tracking-wider whitespace-nowrap" style={F.ui}>
                      {p.label || m.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend / filter */}
      {kindsPresent.length > 0 && (
        <div className="shrink-0 border-t border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 flex gap-2 overflow-x-auto">
          <button onClick={() => setFilter(null)}
            className={`shrink-0 text-[10px] uppercase tracking-wider px-2.5 py-1 border ${!filter ? 'border-[#C9A961] text-[#C9A961]' : 'border-[#2A2A2A] text-[#6B6B6B]'}`} style={F.ui}>all</button>
          {kindsPresent.map(k => (
            <button key={k.kind} onClick={() => setFilter(filter === k.kind ? null : k.kind)}
              className={`shrink-0 text-[10px] uppercase tracking-wider px-2.5 py-1 border flex items-center gap-1 ${filter === k.kind ? 'border-[#C9A961] text-[#C9A961]' : 'border-[#2A2A2A] text-[#A8A29E]'}`} style={F.ui}>
              <span>{k.glyph}</span> {k.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
