import { useEffect, useRef } from 'react';

// A floating sigil shown only while a shock mode is active.
//   tap        = next mode
//   double-tap = open the picker
//   long-press = shuffle to a random mode
// Self-contained (its own refs) — no App hooks-order risk.
export function ShockQuickSwitch({ onNext, onShuffle, onPicker }) {
  const longRef = useRef(null);
  const didLong = useRef(false);
  const lastTap = useRef(0);
  const singleRef = useRef(null);
  const canceled = useRef(false);

  // Clear pending tap/long-press timers on unmount (the button unmounts when an overlay
  // opens) so a stray timer can't fire onNext/onShuffle after the user navigated away.
  useEffect(() => () => { clearTimeout(longRef.current); clearTimeout(singleRef.current); }, []);

  const onDown = (e) => {
    e.stopPropagation();
    didLong.current = false;
    canceled.current = false;
    longRef.current = setTimeout(() => { didLong.current = true; onShuffle?.(); }, 480);
  };
  const onUp = (e) => {
    e.stopPropagation();
    clearTimeout(longRef.current);
    if (didLong.current || canceled.current) return;
    const now = Date.now();
    if (now - lastTap.current < 300) {
      clearTimeout(singleRef.current);
      lastTap.current = 0;
      onPicker?.();
    } else {
      lastTap.current = now;
      singleRef.current = setTimeout(() => onNext?.(), 300);
    }
  };

  return (
    <button
      aria-label="switch shock mode"
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerLeave={() => { canceled.current = true; clearTimeout(longRef.current); }}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed bottom-24 right-4 z-40 w-11 h-11 rounded-full flex items-center justify-center select-none shock-qs"
      style={{
        background: 'radial-gradient(circle at 50% 38%, rgba(46,0,0,0.94), rgba(8,0,0,0.94))',
        border: '1px solid #5B0F1A',
        color: '#9E2A33',
        fontSize: '20px',
        lineHeight: 1,
        textShadow: '0 0 8px rgba(158,42,51,0.9)',
      }}
    >⛧</button>
  );
}
