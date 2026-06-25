import { GHOUL_VIDEO } from '../../lib/horrorAssets';

// A horror VIDEO rendered as a found-footage still-in-motion — the moving ghoul that looms
// during the paralysis scare. Same crush/grain/scanline/vignette stack as HorrorImage, so it
// reads like something caught on a bad camera in the dark rather than a clean clip.
// Autoplays muted + loops (browsers allow muted autoplay); pointer-events-none, aria-hidden.
const FILTERS = {
  lurk: 'grayscale(1) contrast(1.5) brightness(0.8) blur(0.2px)',
  slam: 'grayscale(1) contrast(1.8) brightness(0.95)',
};

export function HorrorVideo({ src = GHOUL_VIDEO, variant = 'slam', className = '', style }) {
  const filter = FILTERS[variant] || FILTERS.slam;
  return (
    <div className={`relative overflow-hidden ${className}`} style={style} aria-hidden>
      <video
        src={src} autoPlay muted loop playsInline preload="auto"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        style={{ filter }}
      />
      {/* grain */}
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay" style={{
        opacity: 0.5,
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.8'/></svg>\")",
        backgroundSize: '160px 160px',
      }} />
      {/* scanlines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.32) 0 1px, transparent 1px 3px)',
        opacity: 0.55,
      }} />
      {/* vignette — eats the edges so it floats out of black */}
      <div className="absolute inset-0 pointer-events-none" style={{
        boxShadow: variant === 'slam' ? 'inset 0 0 90px 24px rgba(0,0,0,0.9)' : 'inset 0 0 80px 34px rgba(0,0,0,0.95)',
      }} />
    </div>
  );
}
