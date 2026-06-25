// HorrorImage — a real photograph rendered as a found-footage horror still. The photo is
// crushed to high-contrast grayscale and layered with grain, scanlines and a heavy vignette
// so it stops reading as "a stock photo" and starts reading as something caught on a bad
// camera in the dark. Sized by the wrapper's className (width); the image fills it.
//
// variant:
//   'lurk' (default) — quiet, sits in a corner / loom; soft murk
//   'slam'           — full-bleed jumpscare; harsher crush + a breath of sick red
const FILTERS = {
  lurk: 'grayscale(1) contrast(1.5) brightness(0.82) blur(0.2px)',
  slam: 'grayscale(1) contrast(1.85) brightness(0.96)',
};

export function HorrorImage({ src, variant = 'lurk', className = '', style, imgStyle }) {
  const filter = FILTERS[variant] || FILTERS.lurk;
  return (
    <div className={`relative overflow-hidden ${className}`} style={style} aria-hidden>
      <img
        src={src} alt="" draggable={false}
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        style={{ filter, ...imgStyle }}
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
      {/* vignette — eats the edges so the face floats out of black */}
      <div className="absolute inset-0 pointer-events-none" style={{
        boxShadow: variant === 'slam'
          ? 'inset 0 0 90px 24px rgba(0,0,0,0.9)'
          : 'inset 0 0 70px 30px rgba(0,0,0,0.95)',
      }} />
      {variant === 'slam' && (
        <div className="absolute inset-0 pointer-events-none mix-blend-multiply" style={{
          background: 'radial-gradient(ellipse at 50% 45%, rgba(120,0,12,0.0) 40%, rgba(90,0,8,0.45) 100%)',
        }} />
      )}
    </div>
  );
}
