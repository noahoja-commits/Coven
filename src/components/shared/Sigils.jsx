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
function TripleMoon(p) {
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

export function NavSigil({ name, size = 18, ...rest }) {
  const Glyph = SIGILS[name] || Pentacle;
  return <Glyph width={size} height={size} {...rest} />;
}

// A horizontal ornamental rule with a centered sigil — replaces plain divider lines
// on the dark surfaces to carry the grimoire feel beyond the reader.
export function OrnamentRule({ glyph = '⛧', className = '', color = '#5B0F1A', tint = '#A89968' }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-[1px] flex-1 max-w-[80px]" style={{ background: `linear-gradient(to right, transparent, ${color})` }} />
      <span className="text-[11px]" style={{ color: tint }}>{glyph}</span>
      <span className="h-[1px] flex-1 max-w-[80px]" style={{ background: `linear-gradient(to left, transparent, ${color})` }} />
    </div>
  );
}
