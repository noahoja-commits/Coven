import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { buzz } from '../../lib/haptics';
import { CatFamiliar, DemonFamiliar } from './Familiars';

// A small black cat (your familiar) that slowly pads around the screen. Tap to feed it —
// it purrs, hearts rise, and its hunger resets. Hunger creeps back over hours. Purely whimsy;
// floats above content (z-45) but below toasts, and hides itself while an overlay is open.
// EASTER EGG: tap it 6 times quickly and it turns into a little demon. Then keep tapping —
// anger it five times and it drags you under (onSummon('paralysis')). Leave it be and it calms.
export function FloatingCat({ active = true, onSummon }) {
  const [pos, setPos] = useState({ x: 18, y: 70 });
  const [facing, setFacing] = useState(1); // 1 = facing right, -1 = left
  const [purr, setPurr] = useState(false);
  const [hearts, setHearts] = useState(0); // bump to retrigger the heart burst
  const [fedAt, setFedAt] = useLocalStorage('catFedAt', 0);
  const [demon, setDemon] = useState(false);
  const [anger, setAnger] = useState(0); // 0–4; at 5 it summons
  const [fx, setFx] = useState(null); // { key, glyph } transform poof

  // Wander: every few seconds, amble to a new spot near the bottom of the screen.
  useEffect(() => {
    if (!active) return;
    const step = () => {
      setPos(prev => {
        const nx = Math.max(6, Math.min(82, prev.x + (Math.random() * 36 - 18)));
        setFacing(nx >= prev.x ? 1 : -1);
        const ny = Math.max(55, Math.min(82, prev.y + (Math.random() * 16 - 8)));
        return { x: nx, y: ny };
      });
    };
    const t = setInterval(step, 5000);
    return () => clearInterval(t);
  }, [active]);

  const purrTimer = useRef(null);
  const tapsRef = useRef(0);
  const tapTimer = useRef(null);
  const fxKey = useRef(0);
  const angerRef = useRef(0);
  const calmTimer = useRef(null);

  const feed = () => {
    setFedAt(Date.now());
    setHearts(h => h + 1);
    setPurr(true);
    clearTimeout(purrTimer.current);
    purrTimer.current = setTimeout(() => setPurr(false), 2000);
  };

  const poof = (glyph) => { fxKey.current += 1; setFx({ key: fxKey.current, glyph }); };

  const onTap = () => {
    if (demon) {
      // anger it. five times and it drags you under; leave it be and it calms back to a cat.
      const a = angerRef.current + 1;
      angerRef.current = a;
      clearTimeout(calmTimer.current);
      if (a >= 5) {
        angerRef.current = 0; setAnger(0); setDemon(false);
        buzz('secret'); poof('☠');
        onSummon && onSummon('paralysis');
        return;
      }
      setAnger(a);
      buzz(a >= 3 ? 'secret' : 'react');
      poof(a >= 3 ? '⛧' : '🔥');
      calmTimer.current = setTimeout(() => { angerRef.current = 0; setAnger(0); setDemon(false); poof('💨'); }, 6000);
      return;
    }
    feed();
    tapsRef.current += 1;
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapsRef.current = 0; }, 1500); // streak resets if you dawdle
    if (tapsRef.current >= 6) {
      tapsRef.current = 0;
      clearTimeout(tapTimer.current);
      buzz('secret');
      angerRef.current = 0; setAnger(0);
      setDemon(true);
      setPurr(false);
      poof('🔥');
    }
  };

  useEffect(() => () => { clearTimeout(purrTimer.current); clearTimeout(tapTimer.current); clearTimeout(calmTimer.current); }, []);

  if (!active) return null;

  // Hungry if not fed in the last ~8 hours — a faint "?" appears (cats only).
  const hungry = !demon && Date.now() - (fedAt || 0) > 8 * 60 * 60 * 1000;

  return (
    <button
      onClick={onTap}
      aria-label={demon ? 'a furious little demon — careful' : 'feed the familiar'}
      className="fixed z-[45] pointer-events-auto select-none"
      style={{
        left: `${pos.x}%`, top: `${pos.y}%`,
        transition: 'left 4.5s ease-in-out, top 4.5s ease-in-out',
        fontSize: '1.4rem', lineHeight: 1,
        filter: demon
          ? `drop-shadow(0 0 ${6 + anger * 5}px rgba(200,16,46,${Math.min(1, 0.6 + anger * 0.1)})) drop-shadow(0 1px 2px rgba(0,0,0,0.7))`
          : 'drop-shadow(0 1px 2px rgba(0,0,0,0.7))',
      }}>
      <span style={{ display: 'inline-block', transform: `scaleX(${facing})` }} className={`${purr || demon ? 'animate-pulse-slow' : ''} ${demon && anger >= 3 ? 'reveal-tremor' : ''}`}>
        {demon ? <DemonFamiliar size={32} /> : <CatFamiliar size={30} glow={purr} />}
      </span>
      {hungry && !purr && <span className="absolute -top-2 -right-1 text-[10px] text-[#C8102E]/70">?</span>}
      {purr && !demon && (
        <span key={hearts} className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs" style={{ animation: 'likeBurst 1.6s ease-out forwards' }}>🤍</span>
      )}
      {fx && (
        <span key={fx.key} className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm pointer-events-none" style={{ animation: 'likeBurst 1.4s ease-out forwards' }}>{fx.glyph}</span>
      )}
    </button>
  );
}
