// Self-declared profile archetypes. Each maps to a glyph, an accent (badge color),
// and one of the existing shrine themes (oxblood/violet/gold/silver/cathedral) that
// gets applied when you pick it. Label-only, public.
// Glyphs are monochrome text marks so the badge inherits the accent colour instead of
// rendering as a cartoonish colour-emoji.
export const ARCHETYPES = [
  { id: 'witch',     label: 'Witch',     glyph: '☾',  shrineTheme: 'violet',    accent: '#5E3B73' },
  { id: 'vampire',   label: 'Vampire',   glyph: '🜃',  shrineTheme: 'oxblood',   accent: '#8B0000' }, // alchemical earth
  { id: 'occultist', label: 'Occultist', glyph: '⛧',  shrineTheme: 'oxblood',   accent: '#9E2A33' },
  { id: 'mystic',    label: 'Mystic',    glyph: '✶',  shrineTheme: 'gold',      accent: '#C9A961' },
  { id: 'cleric',    label: 'Cleric',    glyph: '†',  shrineTheme: 'cathedral', accent: '#A89968' },
  { id: 'raver',     label: 'Raver',     glyph: '◈',  shrineTheme: 'violet',    accent: '#7E5A8E' },
  { id: 'doomer',    label: 'Doomer',    glyph: '⛆',  shrineTheme: 'silver',    accent: '#6E6E7E' }, // rain
  { id: 'wraith',    label: 'Wraith',    glyph: '☥',  shrineTheme: 'silver',    accent: '#8A8A8A' }, // ankh
  { id: 'romantic',  label: 'Romantic',  glyph: '❦',  shrineTheme: 'oxblood',   accent: '#9E2A33' }, // floral heart
];

export const archetypeById = (id) => ARCHETYPES.find(a => a.id === id) || null;
