import { useState, useEffect, useRef } from 'react';
import { buzz } from '../../lib/haptics';
import { GrinningFace } from './ShockOverlay';

// THE HAUNT — when a horror mode is active, the thing doesn't stay put. It follows you across
// every tab and strikes on its own schedule: a face flickers at a random corner, an eye opens
// where you weren't looking, and once in a while it lunges full-screen. Unpredictable by design
// (random timing, position, and form) so it never becomes a loop you can brace for. Suppressed
// inside modals/compose so it never jumpscares you mid-typing.
const HORROR = new Set(['paralysis', 'egodeath']);

export function ShockHaunt({ mode, active = true }) {
  const [app, setApp] = useState(null); // { key, kind, x, y, big }
  const timer = useRef(null);
  const hideTimer = useRef(null);
  const keyRef = useRef(0);
  const on = active && HORROR.has(mode);

  useEffect(() => {
    if (!on) { setApp(null); clearTimeout(timer.current); clearTimeout(hideTimer.current); return undefined; }
    let alive = true;
    const strike = () => {
      if (!alive) return;
      keyRef.current += 1;
      const jump = Math.random() < 0.2; // ~1 in 5 is a full-screen lunge
      const pool = mode === 'egodeath'
        ? ['eye', 'eye', 'face', 'self']
        : ['face', 'eye', 'watch', 'face'];
      const kind = jump ? 'face' : pool[Math.floor(Math.random() * pool.length)];
      setApp({ key: keyRef.current, kind, x: 5 + Math.random() * 78, y: 8 + Math.random() * 72, big: jump });
      if (jump) buzz('dread'); else if (Math.random() < 0.45) buzz('react');
      const dur = jump ? 720 : 1300 + Math.random() * 1500;
      hideTimer.current = setTimeout(() => { if (alive) setApp(null); }, dur);
      timer.current = setTimeout(strike, dur + 3500 + Math.random() * 12000); // 3.5–16s between strikes
    };
    // first strike comes a few seconds after the mode begins
    timer.current = setTimeout(strike, 3000 + Math.random() * 7000);
    return () => { alive = false; clearTimeout(timer.current); clearTimeout(hideTimer.current); };
  }, [on, mode]);

  if (!app) return null;

  if (app.big) {
    return (
      <div key={app.key} className="fixed inset-0 z-[120] pointer-events-none flex items-center justify-center overflow-hidden" aria-hidden>
        <div className="absolute inset-0" style={{ background: 'rgba(220,220,226,0.85)', animation: 'hauntFlash 0.72s ease-out forwards' }} />
        <GrinningFace className="w-[125%] reveal-slam" />
      </div>
    );
  }

  return (
    <div key={app.key} className="fixed z-[120] pointer-events-none -translate-x-1/2 -translate-y-1/2" aria-hidden
      style={{ left: `${app.x}%`, top: `${app.y}%`, animation: 'hauntFade 1.7s ease-in-out forwards' }}>
      {app.kind === 'face' && <GrinningFace className="w-24" style={{ opacity: 0.72 }} />}
      {app.kind === 'eye' && <span className="text-3xl" style={{ opacity: 0.7, filter: 'drop-shadow(0 0 7px rgba(230,235,255,0.6))' }}>👁</span>}
      {app.kind === 'watch' && <span className="text-2xl tracking-[0.3em] text-[#b8b0a8]" style={{ opacity: 0.6, fontFamily: '"VT323", monospace' }}>i see you</span>}
      {app.kind === 'self' && <span className="text-[15vw] leading-none text-white/[0.07]" style={{ fontFamily: '"Grenze Gotisch", serif' }}>I</span>}
    </div>
  );
}
