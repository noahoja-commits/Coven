// Self-declared profile archetypes. Each maps to a glyph, an accent (badge color),
// and one of the existing shrine themes (oxblood/violet/gold/silver/cathedral) that
// gets applied when you pick it. Label-only, public.
export const ARCHETYPES = [
  { id: 'witch',     label: 'Witch',     glyph: '☾',  shrineTheme: 'violet',    accent: '#7B2CBF' },
  { id: 'vampire',   label: 'Vampire',   glyph: '🜃',  shrineTheme: 'oxblood',   accent: '#8B0000' },
  { id: 'occultist', label: 'Occultist', glyph: '⛧',  shrineTheme: 'oxblood',   accent: '#C8102E' },
  { id: 'mystic',    label: 'Mystic',    glyph: '✶',  shrineTheme: 'gold',      accent: '#C9A961' },
  { id: 'cleric',    label: 'Cleric',    glyph: '✝',  shrineTheme: 'cathedral', accent: '#A89968' },
  { id: 'raver',     label: 'Raver',     glyph: '◈',  shrineTheme: 'violet',    accent: '#B048C8' },
  { id: 'doomer',    label: 'Doomer',    glyph: '☁',  shrineTheme: 'silver',    accent: '#6E6E7E' },
  { id: 'wraith',    label: 'Wraith',    glyph: '☠',  shrineTheme: 'silver',    accent: '#8A8A8A' },
  { id: 'romantic',  label: 'Romantic',  glyph: '🥀', shrineTheme: 'oxblood',   accent: '#C8102E' },
];

export const archetypeById = (id) => ARCHETYPES.find(a => a.id === id) || null;
