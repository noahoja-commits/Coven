import { useState, useEffect, useRef } from 'react';
import { buzz } from '../../lib/haptics';
import { GrinningFace } from './ShockOverlay';
import { scream, whisper } from '../../lib/horror';

// THE HAUNT — when a horror mode is active, the thing hunts you across every tab. Quick strikes
// (a face at a random corner, an eye, the dissolving I, a UI-CORRUPTION flash that knows your
// name) on a random schedule, ~1 in 3 a full-screen lunge with a scream — AND a lingering watcher
// that fades into a corner and just stays, watching, for half a minute at a time. No safe corner.
const HORROR = new Set(['paralysis', 'egodeath']);

export function ShockHaunt({ mode, name = 'you', active = true }) {
  const [app, setApp] = useState(null);   // quick strike
  const [lurk, setLurk] = useState(null); // the lingering watcher
  const timer = useRef(null);
  const hideTimer = useRef(null);
  const lurkTimer = useRef(null);
  const lurkHide = useRef(null);
  const keyRef = useRef(0);
  const on = active && HORROR.has(mode);
  const who = String(name || 'you').toLowerCase();
  const CORRUPT = [`i see you, ${who}`, 'behind you', "don't look back", 'get out', `${who}, wake up`, 'it is in here with you', 'look behind you'];

  useEffect(() => {
    if (!on) {
      setApp(null); setLurk(null);
      clearTimeout(timer.current); clearTimeout(hideTimer.current); clearTimeout(lurkTimer.current); clearTimeout(lurkHide.current);
      return undefined;
    }
    let alive = true;

    const strike = () => {
      if (!alive) return;
      keyRef.current += 1;
      const r = Math.random();
      const jump = r < 0.3;                 // ~1 in 3 lunges
      const corruptHit = !jump && r < 0.52; // a UI-corruption flash
      let kind;
      if (jump) kind = 'face';
      else if (corruptHit) kind = 'corrupt';
      else kind = (mode === 'egodeath' ? ['eye', 'eye', 'self', 'face'] : ['face', 'eye', 'watch', 'face'])[Math.floor(Math.random() * 4)];
      setApp({ key: keyRef.current, kind, x: 5 + Math.random() * 78, y: 8 + Math.random() * 72, big: jump, text: kind === 'corrupt' ? CORRUPT[Math.floor(Math.random() * CORRUPT.length)] : '' });
      if (jump) { buzz('dread'); scream(); } else { buzz('react'); if (Math.random() < 0.5) whisper(); }
      const dur = jump ? 800 : kind === 'corrupt' ? 540 : 1200 + Math.random() * 1500;
      hideTimer.current = setTimeout(() => { if (alive) setApp(null); }, dur);
      timer.current = setTimeout(strike, dur + 1500 + Math.random() * 5000); // 1.5–7s between strikes
    };
    timer.current = setTimeout(strike, 1500 + Math.random() * 4000);

    // the lingering watcher — fades into a corner and stays for 14–34s, then is gone when you look back
    const lurkCycle = () => {
      if (!alive) return;
      const corner = [{ x: 6, y: 14 }, { x: 80, y: 15 }, { x: 7, y: 74 }, { x: 82, y: 72 }][Math.floor(Math.random() * 4)];
      setLurk({ key: keyRef.current + 1000, ...corner, kind: Math.random() < 0.5 ? 'eyes' : 'face' });
      buzz('react');
      const stay = 14000 + Math.random() * 20000;
      lurkHide.current = setTimeout(() => { if (alive) setLurk(null); }, stay);
      lurkTimer.current = setTimeout(lurkCycle, stay + 6000 + Math.random() * 16000);
    };
    lurkTimer.current = setTimeout(lurkCycle, 6000 + Math.random() * 10000);

    return () => { alive = false; clearTimeout(timer.current); clearTimeout(hideTimer.current); clearTimeout(lurkTimer.current); clearTimeout(lurkHide.current); };
  }, [on, mode, who]);

  return (
    <>
      {/* the lingering watcher — in the corner of your eye, and it won't leave */}
      {lurk && (
        <div key={lurk.key} className="fixed z-[118] pointer-events-none" aria-hidden
          style={{ left: `${lurk.x}%`, top: `${lurk.y}%`, animation: 'lurkIn 2.6s ease-out forwards' }}>
          {lurk.kind === 'eyes'
            ? <span className="text-xl" style={{ filter: 'drop-shadow(0 0 8px rgba(230,235,255,0.7))', letterSpacing: '0.18em' }}>👁👁</span>
            : <GrinningFace className="w-16" style={{ opacity: 0.55 }} />}
        </div>
      )}
      {/* quick strikes */}
      {app && (app.big ? (
        <div key={app.key} className="fixed inset-0 z-[120] pointer-events-none flex items-center justify-center overflow-hidden" aria-hidden>
          <div className="absolute inset-0" style={{ background: 'rgba(222,222,228,0.9)', animation: 'hauntFlash 0.78s ease-out forwards' }} />
          <GrinningFace className="w-[170%] reveal-slam" />
        </div>
      ) : app.kind === 'corrupt' ? (
        <div key={app.key} className="fixed inset-0 z-[120] pointer-events-none flex items-center justify-center overflow-hidden reveal-tremor px-4" aria-hidden>
          <div className="text-center text-[9vw] leading-[0.9] font-bold uppercase tracking-tight"
            style={{ color: '#e8e8ee', fontFamily: '"VT323", monospace', textShadow: '4px 0 rgba(255,0,40,0.7), -4px 0 rgba(0,255,230,0.6)', opacity: 0.86 }}>{app.text}</div>
        </div>
      ) : (
        <div key={app.key} className="fixed z-[120] pointer-events-none -translate-x-1/2 -translate-y-1/2" aria-hidden
          style={{ left: `${app.x}%`, top: `${app.y}%`, animation: 'hauntFade 1.7s ease-in-out forwards' }}>
          {app.kind === 'face' && <GrinningFace className="w-32" style={{ opacity: 0.78 }} />}
          {app.kind === 'eye' && <span className="text-3xl" style={{ opacity: 0.7, filter: 'drop-shadow(0 0 7px rgba(230,235,255,0.6))' }}>👁</span>}
          {app.kind === 'watch' && <span className="text-xl tracking-[0.25em] text-[#b8b0a8]" style={{ opacity: 0.62, fontFamily: '"VT323", monospace' }}>i see you, {who}</span>}
          {app.kind === 'self' && <span className="text-[15vw] leading-none text-white/[0.07]" style={{ fontFamily: '"Grenze Gotisch", serif' }}>I</span>}
        </div>
      ))}
    </>
  );
}
