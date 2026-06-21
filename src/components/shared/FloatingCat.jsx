import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

// A small black cat (your familiar) that slowly pads around the screen. Tap to feed it —
// it purrs, hearts rise, and its hunger resets. Hunger creeps back over hours. Purely whimsy;
// floats above content (z-45) but below toasts, and hides itself while an overlay is open.
export function FloatingCat({ active = true }) {
  const [pos, setPos] = useState({ x: 18, y: 70 });
  const [facing, setFacing] = useState(1); // 1 = facing right, -1 = left
  const [purr, setPurr] = useState(false);
  const [hearts, setHearts] = useState(0); // bump to retrigger the heart burst
  const [fedAt, setFedAt] = useLocalStorage('catFedAt', 0);

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
  const feed = () => {
    setFedAt(Date.now());
    setHearts(h => h + 1);
    setPurr(true);
    clearTimeout(purrTimer.current);
    purrTimer.current = setTimeout(() => setPurr(false), 2000);
  };
  useEffect(() => () => clearTimeout(purrTimer.current), []);

  if (!active) return null;

  // Hungry if not fed in the last ~8 hours — a faint "?" appears.
  const hungry = Date.now() - (fedAt || 0) > 8 * 60 * 60 * 1000;

  return (
    <button
      onClick={feed}
      aria-label="feed the familiar"
      className="fixed z-[45] pointer-events-auto select-none"
      style={{
        left: `${pos.x}%`, top: `${pos.y}%`,
        transition: 'left 4.5s ease-in-out, top 4.5s ease-in-out',
        fontSize: '1.4rem', lineHeight: 1,
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.7))',
      }}>
      <span style={{ display: 'inline-block', transform: `scaleX(${facing})` }} className={purr ? 'animate-pulse-slow' : ''}>🐈‍⬛</span>
      {hungry && !purr && <span className="absolute -top-2 -right-1 text-[10px] text-[#A89968]/70">?</span>}
      {purr && (
        <span key={hearts} className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs animate-fade-in" style={{ animation: 'likeBurst 1.6s ease-out forwards' }}>🤍</span>
      )}
    </button>
  );
}
