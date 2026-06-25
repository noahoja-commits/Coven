import { useState, useEffect } from 'react';
import { buzz } from '../../lib/haptics';
import { HorrorImage } from './HorrorImage';
import { HORROR_SRC } from '../../lib/horrorAssets';
import { primeHorror, scream, whisper, startDread, stopDread } from '../../lib/horror';

// THE FORBIDDEN REVEAL — the intro that plays when a hidden horror mode is summoned. The dread
// lives in the build, not the payoff: black-out, a warning trembles in, it corrupts & whispers,
// a face CREEPS toward you, then the heartbeat stops — dead silence — and the slam (face + scream).
// ~7s, then onComplete(target) hands you to the mode. Worse than the thing it warns of.
const CONTENT = {
  paralysis: {
    line: "you aren't supposed to be here",
    whispers: ['you saw it', 'you let it in', "it's awake now", "you can't unsee this", 'it followed you home', 'do not look up'],
  },
  egodeath: {
    line: 'you went looking too deep',
    whispers: ['there is no you', 'who is reading this', 'you opened it', "it won't close", 'this is what you are', 'come apart'],
  },
};

export function ForbiddenReveal({ target = 'paralysis', name = 'you', onComplete }) {
  const [phase, setPhase] = useState(0); // 0 cut · 1 warn · 2 corrupt · 3 creep · 4 silence · 5 slam
  const base = CONTENT[target] || CONTENT.paralysis;
  const who = String(name || 'you').toLowerCase();
  // it knows who's reading
  const c = { line: base.line, whispers: [...base.whispers, `i know you, ${who}`, `${who}, you can't wake up`] };

  useEffect(() => {
    primeHorror();
    buzz('secret');
    startDread(1050); // a faster, building heartbeat under the whole intro
    const t = [
      setTimeout(() => { setPhase(1); buzz('react'); }, 700),
      setTimeout(() => { setPhase(2); buzz('react'); whisper(); }, 2700),
      setTimeout(() => whisper(), 3500),
      setTimeout(() => { setPhase(3); buzz('secret'); whisper(); }, 4400),
      setTimeout(() => whisper(), 5100),
      setTimeout(() => { setPhase(4); stopDread(); }, 5600), // the heartbeat STOPS — dead air
      setTimeout(() => { setPhase(5); buzz('dread'); scream(); }, 6300), // SLAM + double scream
      setTimeout(() => onComplete && onComplete(target), 7050),
    ];
    return () => { t.forEach(clearTimeout); stopDread(); };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-hidden select-none pointer-events-auto" aria-hidden style={{ fontFamily: '"VT323", monospace' }}>
      {/* phase 1 — the warning, trembling in out of the black */}
      {phase === 1 && (
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="reveal-text-in text-center text-[#d8d8de] text-[22px] tracking-[0.16em]">{c.line}</div>
        </div>
      )}
      {/* phase 2 — it corrupts, multiplies, whispers. the whole frame trembles. */}
      {phase === 2 && (
        <div className="absolute inset-0 reveal-tremor">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="absolute left-0 right-0 text-center text-[20px] tracking-[0.12em] whitespace-nowrap overflow-hidden"
              style={{ top: `${8 + i * 10}%`, color: '#cfcfd6', opacity: i === 4 ? 0.82 : 0.16, textShadow: '2px 0 rgba(255,0,40,0.5), -2px 0 rgba(0,255,230,0.4)', transform: `translateX(${(i % 2 ? 1 : -1) * i * 1.5}px)` }}>{c.line}</div>
          ))}
          {c.whispers.map((w, i) => (
            <span key={i} className="absolute text-[11px] tracking-[0.2em] text-[#b0b0b8] shock-blink"
              style={{ top: `${(i * 53 + 12) % 86}%`, left: `${(i * 37 + 6) % 76}%`, opacity: 0.5, animationDelay: `${(i % 4) * 0.3}s` }}>{w}</span>
          ))}
          <HorrorImage src={HORROR_SRC.torn} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%]" style={{ aspectRatio: '3 / 4', opacity: 0.16 }} />
          <div className="absolute inset-0 reveal-heart pointer-events-none" />
          <div className="absolute inset-0 shock-rgb-r pointer-events-none" style={{ background: 'rgba(255,0,40,0.05)', mixBlendMode: 'screen' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.4) 0 1px, transparent 1px 3px)' }} />
        </div>
      )}
      {/* phase 3 — it CREEPS toward you, filling the dark, whispering your sentence */}
      {phase === 3 && (
        <div className="absolute inset-0 reveal-tremor">
          <HorrorImage src={HORROR_SRC.mask} className="absolute left-1/2 top-1/2 w-[84%]" style={{ aspectRatio: '3 / 4', animation: 'revealCreepFace 1.2s ease-in forwards' }} />
          {c.whispers.slice(0, 4).map((w, i) => (
            <span key={i} className="absolute text-[11px] tracking-[0.2em] text-[#c8c8d0] shock-blink"
              style={{ top: `${(i * 67 + 8) % 88}%`, left: `${(i * 41 + 5) % 80}%`, opacity: 0.55, animationDelay: `${(i % 3) * 0.25}s` }}>{w}</span>
          ))}
          <div className="absolute inset-0 reveal-heart pointer-events-none" />
        </div>
      )}
      {/* phase 4 — the heartbeat stops. total black. the held breath. (nothing rendered) */}
      {/* phase 5 — the slam */}
      {phase === 5 && (
        <>
          <div className="absolute inset-0 reveal-slam shock-jitter">
            <HorrorImage src={target === 'egodeath' ? HORROR_SRC.hollow : HORROR_SRC.scream} variant="slam" className="w-full h-full" />
          </div>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(236,236,240,0.92)', animation: 'hauntFlash 0.42s ease-out forwards' }} />
        </>
      )}
    </div>
  );
}
