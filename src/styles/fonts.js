// Font stack and design tokens for Coven

// Core faces used across the whole app — loaded eagerly from index.html <head> (the render
// path), so they don't wait on the JS bundle. KEEP THE index.html <link> IN SYNC WITH THIS.
export const CORE_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&family=Cinzel:wght@400;500;600;700&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Manrope:wght@300;400;500;600;700&family=Shippori+Mincho:wght@400;600&family=VT323&family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&display=swap';

// Display faces used ONLY by shock modes (the shock-type-* classes). Lazy-loaded the first
// time a shock mode activates (see App.jsx) so the ~95% who never open one don't pay for them.
export const SHOCK_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Grenze+Gotisch:wght@400;500;600;700&family=Pirata+One&family=New+Rocker&family=Metal+Mania&display=swap';

export const F = {
  brand: { fontFamily: '"UnifrakturCook", serif', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.6)' },
  display: { fontFamily: '"Cinzel", serif', letterSpacing: '0.1em', fontWeight: 600 },
  displayOrnate: { fontFamily: '"Cinzel Decorative", "Cinzel", serif', letterSpacing: '0.04em', fontWeight: 700 },
  kanji: { fontFamily: '"Shippori Mincho", serif' },
  serif: { fontFamily: '"Cormorant Garamond", serif' },
  ui: { fontFamily: '"Manrope", sans-serif' },
  mono: { fontFamily: '"VT323", monospace', letterSpacing: '0.04em' },
  scripture: { fontFamily: '"IM Fell English", serif' },
  scriptureSC: { fontFamily: '"IM Fell English SC", serif' },
};

// Color palette
export const C = {
  bg: '#0A0A0A',
  surface1: '#141414',
  surface2: '#1A1A1A',
  surface3: '#242424',
  border: '#2A2A2A',
  text: '#F5F1E8',
  textMuted: '#A8A29E',
  textFaint: '#6B6B6B',
  oxblood: '#8B0000',
  oxbloodDark: '#5B0F1A',
  blood: '#9E2A33',                  // muted oxblood-crimson — HEAT/desire (vs structural oxblood)
  bloodGlow: 'rgba(158,42,51,0.55)',
  violet: '#5E3B73',
  gold: '#C9A961',
  goldDark: '#A89968',
  parchment: '#EDE0C2',
  parchmentDark: '#2A1808',
};
