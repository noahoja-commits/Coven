import { useState, useEffect } from 'react';
import { F } from '../../styles/fonts';

// Renders real uploaded media (when `kind` is a URL — image or video) or one of
// the stylized stand-ins (legacy preset keys).
export function PostImage({ kind }) {
  if (typeof kind === 'string' && /^(https?:|blob:|data:)/.test(kind)) {
    const isVideo = /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(kind);
    return (
      <div className="relative w-full overflow-hidden bg-[#0A0608] border border-[#1A1A1A]">
        {isVideo ? (
          <video src={kind} controls playsInline preload="metadata" className="post-media w-full h-auto max-h-[80vh] object-contain bg-black" />
        ) : (
          <img src={kind} alt="" loading="lazy" className="post-media w-full h-auto max-h-[80vh] object-contain" />
        )}
      </div>
    );
  }
  if (kind === 'velvet') {
    return (
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#0F0608]">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 30% 20%, #3B0A12 0%, #1A0408 45%, #0A0204 100%)'
        }} />
        <svg viewBox="0 0 100 125" className="absolute inset-0 w-full h-full opacity-90">
          <defs>
            <radialGradient id="vel1" cx="50%" cy="35%">
              <stop offset="0%" stopColor="#5B0F1A" />
              <stop offset="60%" stopColor="#2A0710" />
              <stop offset="100%" stopColor="#0A0204" />
            </radialGradient>
          </defs>
          <ellipse cx="50" cy="55" rx="38" ry="50" fill="url(#vel1)" />
          {Array.from({ length: 14 }).map((_, i) => (
            <path key={i}
              d={`M ${20 + i * 4.5} 30 Q ${22 + i * 4.5} 65, ${18 + i * 4.5} 110`}
              stroke="#1A0408" strokeWidth="0.6" fill="none" opacity="0.6" />
          ))}
          <ellipse cx="50" cy="40" rx="6" ry="8" fill="#0A0204" opacity="0.7" />
        </svg>
        <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm" style={F.mono}>
          <span className="text-[#F5F1E8] text-xs">35mm · pushed</span>
        </div>
      </div>
    );
  }
  if (kind === 'cathedral') {
    return (
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#0A0608]">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, #2A1A2E 0%, #1A0F1F 40%, #08040A 100%)'
        }} />
        <svg viewBox="0 0 100 125" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B1F3F" />
              <stop offset="100%" stopColor="#0A0610" />
            </linearGradient>
          </defs>
          <rect width="100" height="125" fill="url(#sky)" />
          <path d="M 20 125 L 20 70 L 25 65 L 30 70 L 30 50 L 35 45 L 40 50 L 40 30 L 45 20 L 50 12 L 55 20 L 60 30 L 60 50 L 65 45 L 70 50 L 70 70 L 75 65 L 80 70 L 80 125 Z"
            fill="#050304" />
          <path d="M 48 12 L 50 4 L 52 12" stroke="#050304" strokeWidth="0.5" fill="#050304" />
          <rect x="44" y="55" width="3" height="8" fill="#5B0F1A" opacity="0.7" />
          <rect x="48" y="55" width="3" height="8" fill="#5B0F1A" opacity="0.5" />
          <rect x="52" y="55" width="3" height="8" fill="#5B0F1A" opacity="0.7" />
          <circle cx="50" cy="38" r="3" fill="#3B0A12" opacity="0.6" />
          <circle cx="78" cy="22" r="6" fill="#F5F1E8" opacity="0.85" />
          <circle cx="76" cy="20" r="5" fill="#1A0F1F" />
        </svg>
        <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm" style={F.mono}>
          <span className="text-[#F5F1E8] text-xs">manhattan · 8:42pm</span>
        </div>
      </div>
    );
  }
  return null;
}

// Film grain overlay (use with mix-blend-overlay)
export function GrainOverlay({ opacity = 0.07 }) {
  return (
    <div className="absolute inset-0 pointer-events-none mix-blend-overlay"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`,
      }} />
  );
}

// Coarse halftone "print" texture — riso/xerox feel, a sibling to GrainOverlay.
// Two offset dot screens via CSS gradients (no external assets). pointer-events-none.
export function HalftoneOverlay({ opacity = 0.12 }) {
  return (
    <div className="absolute inset-0 pointer-events-none mix-blend-overlay"
      style={{
        opacity,
        backgroundImage:
          'radial-gradient(rgba(255,255,255,0.9) 0.6px, transparent 0.9px), radial-gradient(rgba(0,0,0,0.6) 0.5px, transparent 0.8px)',
        backgroundSize: '4px 4px, 4px 4px',
        backgroundPosition: '0 0, 2px 2px',
        transform: 'translateZ(0)',
      }} />
  );
}

// Living ember/candle glow — a slow breathing light behind everything, for depth.
// Self-contained: rides the time-of-day curve internally so it stays in sync with the
// app's "vampire hours" without depending on the livingTheme setting. No App.jsx hooks.
export function AmbientGlow() {
  const [hour, setHour] = useState(() => new Date().getHours() + new Date().getMinutes() / 60);
  useEffect(() => {
    const t = setInterval(() => setHour(new Date().getHours() + new Date().getMinutes() / 60), 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);
  // 0..1 intensity: dramatic at night, but ALWAYS strongly present (never a midday whisper).
  const witching = hour >= 2.5 && hour < 4.5;
  let intensity;
  if (witching) intensity = 1;
  else if (hour < 7) intensity = 0.95;   // deep night → dawn
  else if (hour < 17) intensity = 0.72;  // day — still very present
  else intensity = 0.9;                  // dusk into night

  return (
    <div className="ambient-glow absolute inset-0 pointer-events-none z-10 overflow-hidden"
      style={{ opacity: 0.6 * intensity, mixBlendMode: 'screen' }}>
      {/* warm ember, lower-left, breathing */}
      <div className="absolute -left-[22%] bottom-[4%] w-[90%] h-[68%] ambient-breathe"
        style={{ background: 'radial-gradient(ellipse at center, rgba(200,16,46,0.7), rgba(139,0,0,0.32) 42%, transparent 70%)' }} />
      {/* second oxblood bloom, bottom-center, for a deep red floor */}
      <div className="absolute left-[15%] -bottom-[18%] w-[70%] h-[55%] ambient-breathe"
        style={{ background: 'radial-gradient(ellipse at center, rgba(139,0,0,0.5), transparent 68%)', animationDelay: '-8s' }} />
      {/* cool violet counter-light, upper-right, drifting + offset phase */}
      <div className="absolute -right-[15%] top-[4%] w-[78%] h-[60%] ambient-drift"
        style={{ background: 'radial-gradient(ellipse at center, rgba(123,44,191,0.42), rgba(43,7,16,0.12) 50%, transparent 72%)' }} />
    </div>
  );
}
