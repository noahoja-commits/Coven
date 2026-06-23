import { useState, useMemo } from 'react';
import { ArrowLeft, Lock, RotateCcw } from 'lucide-react';
import { F } from '../../styles/fonts';
import { WaxSeal } from '../shared/Sigils';

// Chaos-magick sigil algorithm:
// 1. lowercase, strip non-letters
// 2. remove vowels
// 3. dedupe (first occurrence wins)
// 4. map letters to positions on a circle
// 5. draw polyline through them, starting circle, ending bar
function sigilFromIntention(intention) {
  const cleaned = intention.toLowerCase().replace(/[^a-z]/g, '');
  const noVowels = cleaned.replace(/[aeiou]/g, '');
  const seen = new Set();
  const letters = [];
  for (const ch of noVowels) {
    if (!seen.has(ch)) { seen.add(ch); letters.push(ch); }
  }
  return letters;
}

function letterPoint(letter, cx, cy, r) {
  // a=0, b=1, ... z=25 around the circle, starting at top
  const i = letter.charCodeAt(0) - 97;
  const angle = (i / 26) * Math.PI * 2 - Math.PI / 2;
  return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
}

function SigilSVG({ letters, sealed }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = 100;
  const pts = letters.map(l => letterPoint(l, cx, cy, r));
  const polyline = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto"
      style={{ filter: sealed ? 'drop-shadow(0 0 12px rgba(201, 169, 97, 0.5))' : 'drop-shadow(0 0 8px rgba(201, 169, 97, 0.25))' }}>
      {/* Outer circle */}
      <circle cx={cx} cy={cy} r={r + 18} fill="none" stroke="#A89968" strokeWidth="0.5" opacity="0.4" />
      <circle cx={cx} cy={cy} r={r + 14} fill="none" stroke="#A89968" strokeWidth="0.3" opacity="0.3" />

      {/* Letter ring (subtle) */}
      {Array.from({ length: 26 }).map((_, i) => {
        const angle = (i / 26) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * (r + 8);
        const y = cy + Math.sin(angle) * (r + 8);
        const letter = String.fromCharCode(97 + i);
        const active = letters.includes(letter);
        return (
          <text key={i} x={x} y={y} fontSize="8" textAnchor="middle" dominantBaseline="middle"
            fill={active ? '#C9A961' : '#A89968'}
            opacity={active ? 0.9 : 0.2}
            style={{ fontFamily: 'IM Fell English SC, serif' }}>
            {letter}
          </text>
        );
      })}

      {pts.length > 0 && (
        <>
          {/* Starting circle */}
          <circle cx={pts[0].x} cy={pts[0].y} r="5" fill="none" stroke="#C9A961" strokeWidth="1.2" />
          {/* Connecting line */}
          <polyline points={polyline} fill="none" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Ending bar */}
          {pts.length > 1 && (() => {
            const last = pts[pts.length - 1];
            const prev = pts[pts.length - 2];
            const dx = last.x - prev.x;
            const dy = last.y - prev.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const px = -dy / len * 7;
            const py = dx / len * 7;
            return <line x1={last.x - px} y1={last.y - py} x2={last.x + px} y2={last.y + py} stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" />;
          })()}
        </>
      )}

      {/* Center cross marker if sealed */}
      {sealed && (
        <g stroke="#5B0F1A" strokeWidth="1" opacity="0.7">
          <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} />
          <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} />
        </g>
      )}
    </svg>
  );
}

export function SigilOverlay({ onClose, onSave }) {
  const [intention, setIntention] = useState('');
  const [sealed, setSealed] = useState(false);

  const letters = useMemo(() => sigilFromIntention(intention), [intention]);
  const cleaned = intention.replace(/[^a-zA-Z]/g, '').toLowerCase();

  const reset = () => { setIntention(''); setSealed(false); };

  const seal = () => {
    if (letters.length < 2 || sealed) return;
    setSealed(true);
    onSave && onSave({ intention: intention.trim(), letters });
  };

  return (
    <div className="animate-portal-in absolute inset-0 z-30 overflow-y-auto safe-pb"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #14080C 0%, #050204 80%)' }}>
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />

      <div className="sticky top-0 z-10 bg-[#050204]/95 backdrop-blur-md border-b border-[#A89968]/15 safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#A89968] hover:text-[#C9A961] p-2 -m-1 transition-colors"><ArrowLeft size={20} /></button>
          <div className="text-[#C9A961] text-base tracking-[0.3em]" style={F.display}>SIGILS</div>
          <button onClick={reset} className="text-[#A89968] hover:text-[#C9A961] p-2 -m-1 transition-colors" title="reset"><RotateCcw size={16} /></button>
        </div>
      </div>

      <div className="relative px-6 pt-8 pb-12">
        <div className="text-center mb-6">
          <div className="text-[#A89968]/60 text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>· the working ·</div>
          <p className="text-[#A89968]/50 text-xs italic mt-1 max-w-xs mx-auto" style={F.scripture}>
            give your intention a body. write, then let go.
          </p>
        </div>

        <div className="mb-6">
          <SigilSVG letters={letters} sealed={sealed} />
        </div>

        <div className="max-w-sm mx-auto">
          <label className="block text-[10px] uppercase tracking-[0.3em] text-[#A89968]/70 mb-2" style={F.scriptureSC}>· statement of intent ·</label>
          <textarea
            value={intention}
            onChange={(e) => { setIntention(e.target.value); setSealed(false); }}
            placeholder="i will..."
            rows={2}
            disabled={sealed}
            className="w-full bg-[#0A0204] border border-[#A89968]/30 focus:border-[#C9A961] outline-none p-3 text-[#F5F1E8] text-base resize-none disabled:opacity-60"
            style={F.scripture}
          />

          {cleaned.length > 0 && (
            <div className="mt-3 text-center">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#A89968]/70 mb-1" style={F.scriptureSC}>· reduced to ·</div>
              <div className="text-[#C9A961] text-lg tracking-[0.4em]" style={F.scripture}>
                {letters.join(' ').toUpperCase() || '—'}
              </div>
              <div className="text-[10px] text-[#A89968]/40 mt-1" style={F.mono}>
                vowels removed · {letters.length} unique
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <button
              onClick={seal}
              disabled={letters.length < 2 || sealed}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#A89968]/40 text-[#A89968] hover:border-[#C9A961] hover:text-[#C9A961] disabled:opacity-40 disabled:hover:border-[#A89968]/40 disabled:hover:text-[#A89968] text-xs uppercase tracking-[0.25em] transition-colors"
              style={F.ui}>
              <Lock size={13} /> {sealed ? 'sealed' : 'seal the sigil'}
            </button>
          </div>

          {sealed && (
            <div className="mt-6 flex flex-col items-center gap-3 animate-fade-in">
              <WaxSeal size={52} glyph="⛧" />
              <p className="text-center text-[#A89968]/60 text-xs italic max-w-xs mx-auto" style={F.scripture}>
                "the sigil is sealed. forget the meaning. let it work in the dark."
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
