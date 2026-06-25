import { useState, useEffect } from 'react';
import { ArrowLeft, Flame } from 'lucide-react';
import { F } from '../../styles/fonts';

const GLYPHS = ['🕯', '⛧', '🌙', '✦', '🩸', '🔥', '⚰', '☾', '🌹', '⚱'];
const DURATIONS = [
  { label: '30 min', ms: 30 * 60 * 1000 },
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '2 hours', ms: 2 * 60 * 60 * 1000 },
  { label: '3 hours', ms: 3 * 60 * 60 * 1000 },
];

const fmt = (ms) => {
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

// A burning-candle countdown for an intention ("a working"). One active at a time,
// persisted in profile_state by the parent so it survives reloads.
export function IntentionTimerOverlay({ intention, onStart, onClear, onClose }) {
  const [name, setName] = useState('');
  const [glyph, setGlyph] = useState('🕯');
  const [durMs, setDurMs] = useState(DURATIONS[1].ms);
  const [now, setNow] = useState(Date.now());

  // Smooth 1s tick while an intention is live (the parent handles completion/clearing).
  useEffect(() => {
    if (!intention) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [intention]);

  const begin = () => {
    const n = name.trim();
    if (!n) return;
    const startedAt = Date.now();
    onStart && onStart({ id: `in${startedAt}`, name: n, glyph, startedAt, durationMs: durMs, endsAt: startedAt + durMs });
  };

  const remaining = intention ? intention.endsAt - now : 0;
  const elapsed = intention ? now - intention.startedAt : 0;
  const burned = intention ? Math.min(1, Math.max(0, elapsed / intention.durationMs)) : 0;

  return (
    <div className="animate-portal-in absolute inset-0 z-30 overflow-y-auto safe-pb"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #14080C 0%, #050204 80%)' }}>
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />

      <div className="sticky top-0 z-10 bg-[#050204]/95 backdrop-blur-md border-b border-[#A89968]/15 safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#9E2A33] hover:text-[#C9A961] p-2 -m-1 transition-colors"><ArrowLeft size={20} /></button>
          <div className="text-[#C9A961] text-base tracking-[0.3em]" style={F.display}>THE WORKING</div>
          <span className="w-8" />
        </div>
      </div>

      <div className="relative px-6 pt-8 pb-12 max-w-sm mx-auto">
        {intention ? (
          // ── Active: the candle burns ──
          <div className="text-center animate-fade-in">
            <div className="text-[#9E2A33]/60 text-[10px] uppercase tracking-[0.4em] mb-6" style={F.scriptureSC}>· the working is lit ·</div>

            {/* Candle: a wax column that shortens as the intention burns down */}
            <div className="relative w-24 mx-auto mb-6 flex flex-col items-center justify-end" style={{ height: 240 }}>
              <div className="text-3xl animate-flicker leading-none mb-0.5" style={{ filter: 'drop-shadow(0 0 10px rgba(201,169,97,0.7))' }}>{intention.glyph || '🔥'}</div>
              <div className="relative w-12 rounded-t-sm overflow-hidden border-x border-t border-[#2A2A2A]"
                style={{ height: Math.max(8, (1 - burned) * 190), background: 'linear-gradient(180deg, #E8DCc0 0%, #C9A961 30%, #8A7A50 100%)', transition: 'height 1s linear' }}>
                <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
              </div>
              <div className="w-14 h-3 bg-[#3A3226] rounded-sm" />
            </div>

            <div className="text-[#F5F1E8] text-2xl mb-1" style={F.scripture}>{intention.name}</div>
            <div className="text-[#C9A961] text-4xl tabular-nums mb-2" style={F.mono}>{fmt(remaining)}</div>
            <div className="text-[#9E2A33]/50 text-[11px] italic mb-8" style={F.scripture}>
              {remaining > 0 ? 'hold the intention until the candle is spent.' : 'the working is complete.'}
            </div>

            <button onClick={() => onClear && onClear()}
              className="px-5 py-2.5 border border-[#5B0F1A] text-[#9E2A33] hover:bg-[#5B0F1A]/20 text-[10px] uppercase tracking-[0.25em] transition-colors" style={F.ui}>
              extinguish
            </button>
          </div>
        ) : (
          // ── Setup: name the working, pick a sigil + duration ──
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-[#9E2A33]/60 text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>· set an intention ·</div>
              <p className="text-[#9E2A33]/50 text-xs italic mt-1" style={F.scripture}>
                name a working, light it, and let it burn.
              </p>
            </div>

            <label className="text-[10px] uppercase tracking-[0.2em] text-[#9E2A33] mb-1.5 block" style={F.scriptureSC}>· the working ·</label>
            <input value={name} onChange={e => setName(e.target.value.slice(0, 60))}
              placeholder="clarity · protection · release…"
              className="w-full bg-[#0F0F0F] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-3 text-[#F5F1E8] mb-5" style={F.serif} />

            <label className="text-[10px] uppercase tracking-[0.2em] text-[#9E2A33] mb-2 block" style={F.scriptureSC}>· its sigil ·</label>
            <div className="grid grid-cols-5 gap-2 mb-5">
              {GLYPHS.map(g => (
                <button key={g} onClick={() => setGlyph(g)}
                  className={`aspect-square text-2xl border transition-all ${glyph === g ? 'border-[#8B0000] bg-[#5B0F1A]/20' : 'border-[#2A2A2A]'}`}>{g}</button>
              ))}
            </div>

            <label className="text-[10px] uppercase tracking-[0.2em] text-[#9E2A33] mb-2 block" style={F.scriptureSC}>· how long it burns ·</label>
            <div className="grid grid-cols-2 gap-2 mb-8">
              {DURATIONS.map(d => (
                <button key={d.ms} onClick={() => setDurMs(d.ms)}
                  className={`p-3 border text-sm transition-all ${durMs === d.ms ? 'border-[#8B0000] bg-[#5B0F1A]/20 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E]'}`}
                  style={F.serif}>{d.label}</button>
              ))}
            </div>

            <button onClick={begin} disabled={!name.trim()}
              className="w-full py-3 bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] text-xs uppercase tracking-[0.3em] disabled:opacity-40 flex items-center justify-center gap-2 transition-colors" style={F.ui}>
              <Flame size={14} /> light the working
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
