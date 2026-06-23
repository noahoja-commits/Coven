// Font stack and design tokens for Coven

export const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&family=Cinzel:wght@400;500;600;700&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Manrope:wght@300;400;500;600;700&family=Shippori+Mincho:wght@400;600&family=VT323&family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&display=swap';

export const F = {
  brand: { fontFamily: '"UnifrakturCook", serif', fontWeight: 700, textShadow: '0 0 18px rgba(200,16,46,0.45), 0 1px 2px rgba(0,0,0,0.5)' },
  display: { fontFamily: '"Cinzel", serif', letterSpacing: '0.1em', fontWeight: 600, textShadow: '0 0 10px rgba(200,16,46,0.3)' },
  displayOrnate: { fontFamily: '"Cinzel Decorative", "Cinzel", serif', letterSpacing: '0.04em', fontWeight: 700, textShadow: '0 0 12px rgba(200,16,46,0.38)' },
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
  blood: '#C8102E',                  // bright crimson — HEAT/desire (vs structural oxblood)
  bloodGlow: 'rgba(200,16,46,0.85)',
  violet: '#7B2CBF',
  gold: '#C9A961',
  goldDark: '#A89968',
  parchment: '#EDE0C2',
  parchmentDark: '#2A1808',
};
