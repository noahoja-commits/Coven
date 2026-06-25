// Monochrome, etched line-sigils for the post reactions — replacing the full-colour
// emoji (🦇🔥💀💨) that read as cartoonish. Same 24×24 / currentColor / stroke contract
// as the nav sigils, so they inherit text colour + size and stay visually of-a-piece.
const C = {
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
};

// bat — a spread-wing silhouette with ears (the "haunt" / like). Filled reads far more
// clearly as a bat than a thin outline at icon sizes.
export function Bat(p) {
  return (
    <svg {...C} {...p} fill="currentColor" stroke="none" strokeWidth="0">
      <path d="M12 9.6c-.7-.9-1-2-.8-3.1-.4.5-.6 1.1-.7 1.8-.6-.6-1-1.4-1.1-2.3-.5 1-.6 2.1-.4 3.1-1.3-1-3-1.3-4.6-.8.9.2 1.5.8 1.8 1.7-1-.2-2 0-2.9.6 1.2.1 2 .7 2.4 1.8.6-.3 1.3-.4 2-.2 1 .3 1.8 1 2.2 2 .3-.7.8-1.2 1.4-1.5.6.3 1.1.8 1.4 1.5.4-1 1.2-1.7 2.2-2 .7-.2 1.4-.1 2 .2.4-1.1 1.2-1.7 2.4-1.8-.9-.6-1.9-.8-2.9-.6.3-.9.9-1.5 1.8-1.7-1.6-.5-3.3-.2-4.6.8.2-1 .1-2.1-.4-3.1-.1.9-.5 1.7-1.1 2.3-.1-.7-.3-1.3-.7-1.8.2 1.1-.1 2.2-.8 3.1z" />
    </svg>
  );
}

// flame — a single candle tongue (heat / fire)
export function Flame(p) {
  return (
    <svg {...C} {...p}>
      <path d="M12 3c2.5 4 4.5 6.5 4.5 10.5a4.5 4.5 0 1 1-9 0C7.5 9.5 9.5 7 12 3z" />
      <path d="M12 10c1 2 1.5 3 1.5 4.4a1.5 1.5 0 1 1-3 0c0-1.2.5-2 1.5-4.4z" strokeWidth="1.1" opacity="0.7" />
    </svg>
  );
}

// skull — cranium, hollow sockets, a small triangular nose, teeth (dread / dead)
export function Skull(p) {
  return (
    <svg {...C} {...p}>
      <path d="M12 3c-4.4 0-7 3-7 7 0 2 .9 3.6 2 4.6V17c0 1 .7 1.6 1.8 1.6h6.4c1.1 0 1.8-.6 1.8-1.6v-2.4c1.1-1 2-2.6 2-4.6 0-4-2.6-7-7-7z" />
      <circle cx="9" cy="11" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1.7" fill="currentColor" stroke="none" />
      <path d="M12 13.2l-1 2.1h2z" fill="currentColor" stroke="none" />
      <path d="M9.6 18.6v1.4M12 18.6v1.4M14.4 18.6v1.4" strokeWidth="1.1" />
    </svg>
  );
}

// smoke — rising, coiling tendrils (the "smoke" react)
export function Smoke(p) {
  return (
    <svg {...C} {...p}>
      <path d="M8.5 20c0-2.6 3.5-2.8 3.5-5.4 0-2.2-3-2.4-3-4.6 0-2 2-2.7 3.6-2" />
      <path d="M13.5 20c0-1.8 2.6-2 2.6-3.8 0-1.5-2-1.7-2-3.2 0-1.3 1.2-1.8 2.3-1.4" strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
}

// rose — a coiled bloom on a thorned stem (mourning / tenderness)
export function Rose(p) {
  return (
    <svg {...C} {...p}>
      <path d="M12 4.5c-2 0-3.3 1.4-3.3 3.2 0 1.9 1.5 3.3 3.3 3.3s3.3-1.4 3.3-3.3c0-1.8-1.3-3.2-3.3-3.2z" />
      <path d="M12 6.4c-1 0-1.6.8-1.6 1.7 0 .9.7 1.6 1.6 1.6" strokeWidth="1.1" opacity="0.75" />
      <path d="M12 11v8.5" />
      <path d="M12 14.2c-1.8.1-3-.9-3.2-2.6 1.8-.1 3 .8 3.2 2.6z" />
      <path d="M12 16.6c1.8.1 3-.9 3.2-2.6-1.8-.1-3 .8-3.2 2.6z" />
    </svg>
  );
}

// candle — a lit taper (vigil / remembrance)
export function Candle(p) {
  return (
    <svg {...C} {...p}>
      <path d="M12 5c1.3 1.6 2 2.6 2 3.8a2 2 0 1 1-4 0C10 7.6 10.7 6.6 12 5z" />
      <path d="M10 11h4v8.5h-4z" />
      <path d="M9 19.5h6" />
    </svg>
  );
}

// keyed by the reaction field names used on posts (post.reactions.bat / fire / skull / smoke)
export const REACTION_GLYPHS = { bat: Bat, fire: Flame, skull: Skull, smoke: Smoke };

// story reactions are stored by their original emoji "kind" — map each to a sigil so we
// can render them monochrome without changing the data model.
export const STORY_GLYPH_FOR = { '🦇': Bat, '🔥': Flame, '💀': Skull, '🥀': Rose, '🕯': Candle };
