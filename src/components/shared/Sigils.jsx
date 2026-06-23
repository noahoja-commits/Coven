import { F } from '../../styles/fonts';

// Hand-built occult sigils — used for the bottom nav and as ornamental rules.
// All are stroke-based on a 24x24 grid (lucide-compatible) and use currentColor,
// so they inherit text color + size and render identically on every device
// (no exotic unicode that depends on the font).

const COMMON = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

// feed → pentacle (the home star)
function Pentacle(p) {
  return (
    <svg {...COMMON} {...p}>
      <circle cx="12" cy="12" r="10.5" />
      <path d="M12 3 L17.29 19.28 L3.44 9.22 L20.56 9.22 L6.71 19.28 Z" strokeWidth="1.2" />
    </svg>
  );
}

// scenes → triple moon (the coven: a circle flanked by two crescents)
export function TripleMoon(p) {
  return (
    <svg {...COMMON} {...p}>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M7 6.5 A5.5 5.5 0 0 0 7 17.5" />
      <path d="M17 6.5 A5.5 5.5 0 0 1 17 17.5" />
    </svg>
  );
}

// map → crossed circle (the alchemical mark for earth / ground / place)
function CrossedCircle(p) {
  return (
    <svg {...COMMON} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 4 V20 M4 12 H20" strokeWidth="1.2" />
    </svg>
  );
}

// rites → a candle flame (the gatherings are lit)
function Flame(p) {
  return (
    <svg {...COMMON} {...p}>
      <path d="M12 3 C 14.5 7, 16.5 9.5, 16.5 13.5 A 4.5 4.5 0 1 1 7.5 13.5 C 7.5 9.5, 9.5 7, 12 3 Z" />
      <path d="M12 9.5 C 13 11.5, 13.5 12.5, 13.5 14 A 1.5 1.5 0 1 1 10.5 14 C 10.5 12.8, 11 12, 12 9.5 Z" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

// fits → a coathanger rendered as a sigil
function Hanger(p) {
  return (
    <svg {...COMMON} {...p}>
      <path d="M3.5 19 L12 12 L20.5 19" />
      <path d="M3 19 H21" strokeWidth="1.2" />
      <path d="M12 12 V8.6 A1.7 1.7 0 1 0 10.4 7" />
    </svg>
  );
}

// self → the sun mark (circle + point: the self, the spirit)
function SunMark(p) {
  return (
    <svg {...COMMON} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

const SIGILS = {
  home: Pentacle,
  communities: TripleMoon,
  map: CrossedCircle,
  events: Flame,
  fits: Hanger,
  profile: SunMark,
};

// ── Occult iconography set — custom decorative glyphs drawn from the reference deck.
// Same 24x24 / currentColor / stroke contract as the nav sigils, so they inherit color
// and size anywhere and stay visually consistent with the rest of the mark.

// sacred heart pierced with crossed daggers
export function SacredHeart(p) {
  return (
    <svg {...COMMON} {...p}>
      <path d="M12 20 C 4.5 14, 3.5 8.5, 7.5 6.6 C 9.8 5.5, 11.4 7, 12 8.6 C 12.6 7, 14.2 5.5, 16.5 6.6 C 20.5 8.5, 19.5 14, 12 20 Z" />
      <path d="M12 2.5 V21.5" strokeWidth="1" opacity="0.7" />
      <path d="M7 4.5 L17 18.5 M17 4.5 L7 18.5" strokeWidth="1" opacity="0.55" />
    </svg>
  );
}

// crown of thorns — a woven ring with outward barbs
export function CrownOfThorns(p) {
  return (
    <svg {...COMMON} {...p}>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 5 L12 2.5 M19 12 L21.5 12 M12 19 L12 21.5 M5 12 L2.5 12 M16.95 7.05 L18.7 5.3 M16.95 16.95 L18.7 18.7 M7.05 16.95 L5.3 18.7 M7.05 7.05 L5.3 5.3" strokeWidth="1" opacity="0.8" />
    </svg>
  );
}

// the all-seeing eye in a radiant triangle
export function AllSeeingEye(p) {
  return (
    <svg {...COMMON} {...p}>
      <path d="M12 3 L21 19 H3 Z" />
      <path d="M6.5 14 C 8.6 11, 15.4 11, 17.5 14 C 15.4 17, 8.6 17, 6.5 14 Z" strokeWidth="1.2" />
      <circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ouroboros — the serpent devouring its tail (eternity / streak)
export function Ouroboros(p) {
  return (
    <svg {...COMMON} {...p}>
      <path d="M14 5.2 A 7.5 7.5 0 1 0 19 12.5" strokeWidth="1.4" />
      <path d="M14 5.2 L17.6 4 L17 7.8 Z" fill="currentColor" stroke="none" opacity="0.9" />
      <circle cx="18.4" cy="11.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

// claw mark — three raking slashes (DMs / whispers ornament)
export function ClawMark(p) {
  return (
    <svg {...COMMON} {...p}>
      <path d="M7 3 C 8.5 8, 9 13, 8.5 21" />
      <path d="M12 3 C 13.5 8, 13.5 13, 12.5 21" />
      <path d="M17 3 C 18 8, 17.5 13, 16 21" />
    </svg>
  );
}

// Lookup registry (mirrors SIGILS) so glyphs can be referenced by name from data.
export const OCCULT = {
  sacredHeart: SacredHeart,
  crownOfThorns: CrownOfThorns,
  allSeeingEye: AllSeeingEye,
  ouroboros: Ouroboros,
  clawMark: ClawMark,
};

// A wax-seal stamp — an oxblood disc with an embossed sigil, for things that are "sealed".
export function WaxSeal({ size = 44, glyph = '⛧', className = '' }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 44 44" width={size} height={size} className="absolute inset-0"
        style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))' }}>
        <circle cx="22" cy="22" r="20" fill="#5B0F1A" />
        <circle cx="22" cy="22" r="20" fill="none" stroke="#3B0A12" strokeWidth="2" />
        <circle cx="22" cy="22" r="16" fill="none" stroke="#8B0000" strokeWidth="0.8" strokeDasharray="1.5 2.5" opacity="0.7" />
      </svg>
      <span className="relative" style={{ fontSize: size * 0.42, color: '#C9A961', opacity: 0.75 }}>{glyph}</span>
    </div>
  );
}

export function NavSigil({ name, size = 18, ...rest }) {
  const Glyph = SIGILS[name] || Pentacle;
  return <Glyph width={size} height={size} {...rest} />;
}

// Reusable film/paper grain — the same feTurbulence noise the overlays hand-roll, as
// one absolute layer. Drop it BEHIND content (it's pointer-events-none, low opacity).
const GRAIN_URI = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.85'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")";
export function Grain({ opacity = 0.05, className = '' }) {
  return <div aria-hidden className={`absolute inset-0 pointer-events-none mix-blend-overlay ${className}`} style={{ opacity, backgroundImage: GRAIN_URI }} />;
}

// The 22 Major Arcana — each soul is dealt a stable card from their handle, so the
// profile reads like a tarot card (purely cosmetic, deterministic, no backend).
const ARCANA = [
  'THE FOOL', 'THE MAGICIAN', 'THE HIGH PRIESTESS', 'THE EMPRESS', 'THE EMPEROR',
  'THE HIEROPHANT', 'THE LOVERS', 'THE CHARIOT', 'STRENGTH', 'THE HERMIT',
  'WHEEL OF FORTUNE', 'JUSTICE', 'THE HANGED MAN', 'DEATH', 'TEMPERANCE',
  'THE DEVIL', 'THE TOWER', 'THE STAR', 'THE MOON', 'THE SUN',
  'JUDGEMENT', 'THE WORLD',
];
const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI',
  'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

export function arcanaFor(seed) {
  let h = 0;
  const s = String(seed || 'soul');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % ARCANA.length;
  return { numeral: ROMAN[idx], name: ARCANA[idx] };
}

// An ornate inset frame that turns a (relative, overflow-hidden) profile header into a
// tarot arcana card. Purely decorative: pointer-events-none, sits BEHIND the existing
// buttons/avatar/stats, never alters layout. The arcana numeral/name is surfaced
// separately by the screen (replacing its '· self ·' label) so it can't collide here.
export function TarotFrame({ gold = '#C9A961', oxblood = '#5B0F1A' }) {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none" aria-hidden>
      <div className="absolute inset-[6px]" style={{ border: `1px solid ${gold}55` }} />
      <div className="absolute inset-[9px]" style={{ border: `1px solid ${oxblood}66` }} />
      <span className="absolute top-[3px] left-[4px] text-[10px]" style={{ color: `${gold}99` }}>⛧</span>
      <span className="absolute top-[3px] right-[4px] text-[10px]" style={{ color: `${gold}99` }}>⛧</span>
      <span className="absolute bottom-[3px] left-[4px] text-[10px]" style={{ color: `${gold}99` }}>⛧</span>
      <span className="absolute bottom-[3px] right-[4px] text-[10px]" style={{ color: `${gold}99` }}>⛧</span>
    </div>
  );
}

// An engraved filigree frame — a richer sibling to TarotFrame. Four mirrored
// scrollwork corners + a faint inner liner. Decorative only: pointer-events-none,
// sits BEHIND content, never alters layout. Hand-drawn SVG (no external assets).
function FiligreeCorner({ gold, transform }) {
  return (
    <g transform={transform} fill="none" stroke={gold} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
      <path d="M2 16 C 2 7, 7 2, 16 2" />
      <path d="M2 10 C 2 5, 5 2, 10 2" opacity="0.55" />
      <path d="M6 16 C 6 10, 10 6, 16 6 C 12 6, 9 9, 9 13" />
      <circle cx="3.4" cy="3.4" r="1.2" fill={gold} stroke="none" />
    </g>
  );
}
export function OrnateFrame({ gold = '#C9A961', oxblood = '#5B0F1A', inset = 6, glow = false }) {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none" aria-hidden
      style={glow ? { filter: `drop-shadow(0 0 6px ${gold}40)` } : undefined}>
      <div className="absolute" style={{ inset, border: `1px solid ${gold}40` }} />
      <div className="absolute" style={{ inset: inset + 3, border: `1px solid ${oxblood}66` }} />
      <svg className="absolute top-0 left-0" width="30" height="30" viewBox="0 0 28 28"><FiligreeCorner gold={gold} /></svg>
      <svg className="absolute top-0 right-0" width="30" height="30" viewBox="0 0 28 28"><FiligreeCorner gold={gold} transform="scale(-1,1) translate(-28,0)" /></svg>
      <svg className="absolute bottom-0 left-0" width="30" height="30" viewBox="0 0 28 28"><FiligreeCorner gold={gold} transform="scale(1,-1) translate(0,-28)" /></svg>
      <svg className="absolute bottom-0 right-0" width="30" height="30" viewBox="0 0 28 28"><FiligreeCorner gold={gold} transform="scale(-1,-1) translate(-28,-28)" /></svg>
    </div>
  );
}

// Editorial censor stamp — purely cosmetic zine chrome (NOT an age check; see AgeGate for that).
export function RestrictedStamp({ label = 'RESTRICTED', age = '18+', color = '#8B0000', rotate = -6, className = '' }) {
  return (
    <span aria-hidden className={`inline-flex items-center gap-1 px-1.5 py-0.5 align-middle ${className}`}
      style={{ border: `1.5px solid ${color}`, color, transform: `rotate(${rotate}deg)`, opacity: 0.9 }}>
      <span className="text-[9px] font-bold leading-none" style={F.ui}>R</span>
      <span className="text-[7px] tracking-[0.2em] leading-none" style={F.ui}>{label} · {age}</span>
    </span>
  );
}

// Editorial barcode divider — deterministic bar widths from a seed. Sibling to OrnamentRule.
export function BarcodeDivider({ seed = 'coven', className = '', color = '#6B6B6B' }) {
  let h = 0; const s = String(seed); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  const bars = Array.from({ length: 28 }, (_, i) => 1 + (Math.abs(h >> i) % 3));
  return (
    <div className={`flex items-end gap-[2px] h-4 ${className}`} aria-hidden>
      {bars.map((w, i) => <span key={i} style={{ width: w, height: i % 4 ? '100%' : '70%', background: color, opacity: 0.5 }} />)}
    </div>
  );
}

// A horizontal ornamental rule with a centered sigil — replaces plain divider lines
// on the dark surfaces to carry the grimoire feel beyond the reader.
// glyph may be a string (emoji/unicode) OR a sigil component (e.g. SacredHeart).
export function OrnamentRule({ glyph = '⛧', className = '', color = '#5B0F1A', tint = '#A89968' }) {
  const Glyph = typeof glyph === 'function' ? glyph : null;
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-[1px] flex-1 max-w-[80px]" style={{ background: `linear-gradient(to right, transparent, ${color})` }} />
      {Glyph ? <Glyph width={14} height={14} style={{ color: tint }} /> : <span className="text-[11px]" style={{ color: tint }}>{glyph}</span>}
      <span className="h-[1px] flex-1 max-w-[80px]" style={{ background: `linear-gradient(to left, transparent, ${color})` }} />
    </div>
  );
}
