import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { F } from '../../styles/fonts';
import { moonPhase, sunTimes, sunSign, SYNODIC } from '../../data/helpers';
import { fetchSunTimes } from '../../lib/weather';

function MoonGlyph({ phase }) {
  // Draw a stylized moon disc whose illuminated fraction matches the phase
  const r = 60;
  const cx = 72;
  const cy = 72;
  const illum = phase.illum;
  const waxing = phase.name.includes('Waxing') || phase.name === 'First Quarter' || phase.name === 'Full Moon';
  return (
    <svg viewBox="0 0 144 144" className="w-32 h-32 mx-auto" style={{ filter: 'drop-shadow(0 0 12px rgba(201, 169, 97, 0.25))' }}>
      <defs>
        <radialGradient id="moonGrad" cx="0.4" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#F5F1E8" />
          <stop offset="100%" stopColor="#A89968" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="#14080C" stroke="#A89968" strokeWidth="0.5" opacity="0.4" />
      {illum > 0 && (
        <>
          <circle cx={cx} cy={cy} r={r} fill="url(#moonGrad)" />
          {illum < 1 && (
            <ellipse
              cx={cx + (waxing ? -r * (1 - 2 * illum) : r * (1 - 2 * illum))}
              cy={cy}
              rx={r * Math.abs(1 - 2 * illum)}
              ry={r}
              fill="#14080C"
            />
          )}
          {illum < 1 && (
            <rect
              x={waxing ? 0 : cx}
              y={cy - r}
              width={cx}
              height={r * 2}
              fill="#14080C"
              style={{ display: illum < 0.5 ? 'block' : 'none' }}
            />
          )}
        </>
      )}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#A89968" strokeWidth="0.5" opacity="0.6" />
    </svg>
  );
}

function Row({ label, value, sub }) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-4 py-3 border-b border-[#A89968]/15">
      <span className="text-[#A89968]/70 text-[10px] uppercase tracking-[0.3em]" style={F.scriptureSC}>{label}</span>
      <div className="text-right">
        <div className="text-[#F5F1E8] text-base" style={F.scripture}>{value}</div>
        {sub && <div className="text-[#A89968]/50 text-[10px]" style={F.mono}>{sub}</div>}
      </div>
    </div>
  );
}

export function EphemerisOverlay({ onClose, profile }) {
  const now = new Date();
  const phase = moonPhase(now);
  const sign = profile?.birthday ? sunSign(profile.birthday) : null;
  const dateStr = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  // Real sun times for the user's location; fall back to the local approximation
  // (labeled "approx") if geolocation is denied/unavailable.
  const [sun, setSun] = useState(null); // null = loading
  const [sunApprox, setSunApprox] = useState(false);
  useEffect(() => {
    let on = true;
    fetchSunTimes().then(s => {
      if (!on) return;
      if (s) { setSun(s); setSunApprox(false); }
      else { setSun(sunTimes(new Date())); setSunApprox(true); }
    }).catch(() => { if (on) { setSun(sunTimes(new Date())); setSunApprox(true); } });
    return () => { on = false; };
  }, []);

  // Days until next full / new moon — derived from the same accurate phase fraction
  // as the disc so the numbers always agree.
  const f = phase.phase;
  const daysToFull = ((0.5 - f + 1) % 1) * SYNODIC;
  const daysToNew = ((1 - f) % 1) * SYNODIC;

  return (
    <div className="animate-portal-in absolute inset-0 z-30 overflow-y-auto safe-pb"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #0E0E1A 0%, #050204 80%)' }}>
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />

      {/* Faint stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => {
          const x = (i * 73 + 17) % 100;
          const y = (i * 41 + 9) % 100;
          const size = (i % 3) + 1;
          return (
            <span
              key={i}
              className="absolute bg-[#F5F1E8] rounded-full"
              style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, opacity: 0.15 + ((i * 7) % 5) * 0.05 }}
            />
          );
        })}
      </div>

      <div className="sticky top-0 z-10 bg-[#050204]/95 backdrop-blur-md border-b border-[#A89968]/15 safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#A89968] hover:text-[#C9A961] p-2 -m-1 transition-colors"><ArrowLeft size={20} /></button>
          <div className="text-[#C9A961] text-base tracking-[0.3em]" style={F.display}>EPHEMERIS</div>
          <span className="w-5" />
        </div>
      </div>

      <div className="relative px-4 pt-6 pb-12">
        <div className="text-center mb-2">
          <div className="text-[#A89968]/60 text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>· tonight's sky ·</div>
          <div className="text-[#F5F1E8] text-sm mt-1 italic" style={F.scripture}>{dateStr}</div>
        </div>

        <div className="mt-6 mb-2">
          <MoonGlyph phase={phase} />
        </div>
        <div className="text-center mb-6">
          <h2 className="text-[#F5F1E8] text-2xl" style={F.brand}>{phase.name}</h2>
          <div className="text-[#A89968]/60 text-[10px] uppercase tracking-[0.3em] mt-1" style={F.scriptureSC}>
            · {Math.round(phase.illum * 100)}% illuminated ·
          </div>
        </div>

        <div className="border border-[#A89968]/20 max-w-sm mx-auto" style={{ background: 'rgba(20, 8, 12, 0.4)' }}>
          <Row label="Sunrise" value={sun ? sun.sunrise : '…'} sub={sun ? (sunApprox ? 'approx' : 'local') : 'locating'} />
          <Row label="Sunset" value={sun ? sun.sunset : '…'} sub={sun ? (sunApprox ? 'approx' : 'local') : 'locating'} />
          <Row label="Next Full" value={daysToFull < 1 ? 'tonight' : `${Math.round(daysToFull)} days`} />
          <Row label="Next Dark" value={daysToNew < 1 ? 'tonight' : `${Math.round(daysToNew)} days`} sub="new moon" />
          {sign && <Row label="Your Sun" value={`${sign.glyph} ${sign.name.toLowerCase()}`} />}
        </div>

        <p className="mt-10 text-center text-[#A89968]/40 text-[10px] italic max-w-xs mx-auto" style={F.scripture}>
          · as above, so below ·
        </p>
      </div>
    </div>
  );
}
