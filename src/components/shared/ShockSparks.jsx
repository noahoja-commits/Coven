import { useEffect, useRef, useState } from 'react';

// Reactive taps: every tap leaves an ephemeral, mode-themed mark at the touch point.
// Mounted only while a shock mode is active. pointer-events-none, capped + auto-removed.
const kindFor = (mode) => {
  if (mode === 'inferno') return 'ember';
  if (['glitch', 'dead-channel', 'emergency', 'insomnia'].includes(mode)) return 'glitch';
  if (['spatter', 'scream', 'void', 'rebirth', 'reliquary'].includes(mode)) return 'splat';
  return 'sigil';
};

const CFG = {
  splat: { n: 7, color: '#7a0000', size: 7 },
  ember: { n: 7, color: '#ff8c00', size: 4 },
  glitch: { n: 5, color: '#00ffe6', size: 5 },
};

function Burst({ x, y, kind }) {
  if (kind === 'sigil') {
    return (
      <span className="absolute shock-spark-pop"
        style={{ left: x, top: y, color: '#C8102E', fontSize: 22, textShadow: '0 0 10px rgba(200,16,46,0.9)' }}>⛧</span>
    );
  }
  const c = CFG[kind];
  return (
    <span className="absolute" style={{ left: x, top: y }}>
      {Array.from({ length: c.n }).map((_, i) => (
        <span key={i} className="absolute rounded-full shock-spark-burst"
          style={{
            width: c.size, height: c.size, marginLeft: -c.size / 2, marginTop: -c.size / 2,
            background: c.color, '--a': `${Math.round((360 / c.n) * i)}deg`,
          }} />
      ))}
    </span>
  );
}

export function ShockSparks({ mode }) {
  const [sparks, setSparks] = useState([]);
  const idRef = useRef(0);
  const timers = useRef([]);
  const kind = kindFor(mode);
  useEffect(() => {
    const onDown = (e) => {
      const x = e.clientX, y = e.clientY;
      if (x == null || y == null) return;
      const id = ++idRef.current;
      setSparks((s) => [...s.slice(-7), { id, x, y }]);
      const t = setTimeout(() => {
        setSparks((s) => s.filter((p) => p.id !== id));
        timers.current = timers.current.filter((x) => x !== t);
      }, 850);
      timers.current.push(t);
    };
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none z-40" aria-hidden>
      {sparks.map((p) => <Burst key={p.id} x={p.x} y={p.y} kind={kind} />)}
    </div>
  );
}
