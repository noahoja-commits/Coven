import { F } from '../../styles/fonts';

// Renders a real uploaded photo (when `kind` is a URL) or one of the stylized
// stand-ins (legacy preset keys).
export function PostImage({ kind }) {
  if (typeof kind === 'string' && /^(https?:|blob:|data:)/.test(kind)) {
    return (
      <div className="relative w-full overflow-hidden bg-[#0A0608] border border-[#1A1A1A]">
        <img src={kind} alt="" loading="lazy" className="w-full h-auto max-h-[80vh] object-contain" />
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
