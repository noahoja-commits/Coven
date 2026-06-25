import { useState, useEffect } from 'react';
import { buzz } from '../../lib/haptics';
import { GrinningFace } from './ShockOverlay';

// THE FORBIDDEN REVEAL — the intro that plays when a hidden horror mode is summoned. The dread
// lives in the build-up, not the payoff: the screen cuts to black, a warning trembles in, then it
// corrupts and multiplies and whispers, then a sudden, total silence — then the slam. Worse than
// the mode it opens. ~5.5s, then onComplete(target) hands you over to the mode.
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

export function ForbiddenReveal({ target = 'paralysis', onComplete }) {
  const [phase, setPhase] = useState(0); // 0 cut · 1 warn · 2 corrupt · 3 silence · 4 slam
  const c = CONTENT[target] || CONTENT.paralysis;

  useEffect(() => {
    buzz('secret');
    const t = [
      setTimeout(() => { setPhase(1); buzz('react'); }, 650),
      setTimeout(() => { setPhase(2); buzz('react'); }, 2600),
      setTimeout(() => setPhase(3), 4300),
      setTimeout(() => { setPhase(4); buzz('dread'); }, 4900),
      setTimeout(() => onComplete && onComplete(target), 5550),
    ];
    return () => t.forEach(clearTimeout);
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
          {/* a face resolving out of the dark, almost subliminal */}
          <GrinningFace className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[56%]" style={{ opacity: 0.12 }} />
          <div className="absolute inset-0 reveal-heart pointer-events-none" />
          <div className="absolute inset-0 shock-rgb-r pointer-events-none" style={{ background: 'rgba(255,0,40,0.05)', mixBlendMode: 'screen' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.4) 0 1px, transparent 1px 3px)' }} />
        </div>
      )}
      {/* phase 3 — total silence, total black. the held breath. */}
      {/* (nothing rendered — the bare black root IS the silence) */}
      {/* phase 4 — the slam */}
      {phase === 4 && (
        <>
          <div className="absolute inset-0" style={{ background: 'rgba(232,232,236,0.96)' }} />
          <GrinningFace className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] reveal-slam" />
        </>
      )}
    </div>
  );
}
