import { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { F } from '../../styles/fonts';

// Detect a star-ish sigil: a sizeable single stroke with ~5 sharp corners. Forgiving
// on purpose — this is a discovery, not a test.
function detectStar(pts) {
  if (pts.length < 24) return false;
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  if (w < 70 || h < 70) return false;
  let corners = 0;
  const step = 6;
  for (let i = step; i < pts.length - step; i++) {
    const a = pts[i - step], b = pts[i], c = pts[i + step];
    const v1x = b.x - a.x, v1y = b.y - a.y, v2x = c.x - b.x, v2y = c.y - b.y;
    const m1 = Math.hypot(v1x, v1y), m2 = Math.hypot(v2x, v2y);
    if (m1 < 5 || m2 < 5) continue;
    const cos = (v1x * v2x + v1y * v2y) / (m1 * m2);
    const ang = Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
    if (ang > 52) { corners++; i += step; }
  }
  return corners >= 4 && corners <= 9;
}

const LORE = [
  { h: 'The First Dark', body: 'Before the coven had a name, there was only the hour between the dog and the wolf — the blue minute when the day forgets itself and the night has not yet remembered. Those who could not sleep gathered there. They still do.' },
  { h: 'On the Flame', body: 'A candle is a promise you make to no one. It does not ask why you lit it. It only asks that you return before it gutters. Tend your flame and it will tend you back — this is the whole of the law and the whole of the comfort.' },
  { h: 'The Witching Hour', body: 'At three, the veil is thinnest. Not because the dead draw near, but because at three you are most honestly yourself: too tired to perform, too awake to dream. Whatever you confess at three is true. Confess gently.' },
  { h: 'The Sigil You Drew', body: 'You traced the mark and the dark answered. Most never try. Carry this quietly — a coven is not kept by its walls but by the few who knock in the old way and wait to be let in.' },
];

export function SigilDrawOverlay({ unlocked, onUnlock, onClose }) {
  const canvasRef = useRef(null);
  const ptsRef = useRef([]);
  const drawingRef = useRef(false);
  const [hint, setHint] = useState('trace a sigil in the dark');
  const [showLore, setShowLore] = useState(!!unlocked);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || showLore) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr; c.height = rect.height * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#C9A961'; ctx.shadowColor = 'rgba(201,169,97,0.8)'; ctx.shadowBlur = 8;
  }, [showLore]);

  const ptFrom = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const start = (e) => {
    drawingRef.current = true; ptsRef.current = [ptFrom(e)];
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.beginPath(); ctx.moveTo(ptsRef.current[0].x, ptsRef.current[0].y);
  };
  const move = (e) => {
    if (!drawingRef.current) return;
    const p = ptFrom(e); ptsRef.current.push(p);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(p.x, p.y); ctx.stroke();
  };
  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (detectStar(ptsRef.current)) {
      setHint('the marks align…');
      setTimeout(() => { onUnlock && onUnlock(); setShowLore(true); }, 600);
    } else {
      setHint('the marks did not align. trace again.');
      setTimeout(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }, 700);
    }
  };

  if (showLore) {
    return (
      <div className="absolute inset-0 z-[60] bg-[#0A0608] overflow-y-auto safe-pb animate-fade-in"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #1A0710 0%, #0A0408 60%, #050204 100%)' }}>
        <div className="sticky top-0 bg-black/50 backdrop-blur-md border-b border-[#5B0F1A]/30 safe-pt">
          <div className="px-4 h-[60px] flex items-center justify-between">
            <button onClick={onClose} className="text-[#9E2A33] hover:text-[#C9A961] p-2 -m-1"><X size={20} /></button>
            <div className="text-[#C9A961] text-sm tracking-[0.3em]" style={F.display}>⛧ THE HIDDEN LEAF ⛧</div>
            <span className="w-5" />
          </div>
        </div>
        <div className="px-5 py-6 max-w-md mx-auto space-y-6">
          {LORE.map((s, i) => (
            <div key={i}>
              <h3 className="text-[#C9A961] text-lg mb-1.5" style={F.scripture}>{s.h}</h3>
              <p className="text-[#E8DFD0] text-[15px] leading-relaxed italic" style={F.scripture}>{s.body}</p>
            </div>
          ))}
          <div className="text-center text-[#6B6B6B] text-[10px] uppercase tracking-[0.4em] pt-4" style={F.scriptureSC}>· you may return by the same mark ·</div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[60] bg-[#050204]/95 backdrop-blur-sm flex flex-col animate-fade-in">
      <div className="safe-pt px-4 h-[60px] flex items-center justify-between">
        <button onClick={onClose} className="text-[#9E2A33] hover:text-[#C9A961] p-2 -m-1"><X size={20} /></button>
        <div className="text-[#9E2A33] text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>{hint}</div>
        <span className="w-5" />
      </div>
      <canvas
        ref={canvasRef}
        className="flex-1 w-full touch-none"
        onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end}
      />
      <div className="text-center text-[#6B6B6B] text-[10px] italic pb-6 px-8 safe-pb" style={F.serif}>
        some doors only open to those who know the shape to draw.
      </div>
    </div>
  );
}
