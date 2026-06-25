// Self-set profile moods — edgy current states shown as a label + aura glow.
// color drives the aura around the avatar; glyph prefixes the label.
// Glyphs are monochrome text marks (alchemical / astrological / occult) so they inherit
// the mood colour and never render as a cartoonish colour-emoji.
export const MOODS = [
  { id: 'sober', label: 'sober', glyph: '⊙', color: '#8A8A8A' },
  { id: 'drunk', label: 'drunk', glyph: '🜄', color: '#7A1020' },        // alchemical water
  { id: 'high', label: 'high', glyph: '🜁', color: '#3E7A5A' },          // alchemical air
  { id: 'wired', label: 'wired', glyph: 'ϟ', color: '#C8A02E' },         // koppa / lightning
  { id: 'euphoric', label: 'euphoric', glyph: '✺', color: '#7E5A8E' },
  { id: 'in-love', label: 'in love', glyph: '♡', color: '#9E2A33' },    // outline heart
  { id: 'dissociating', label: 'dissociating', glyph: '◌', color: '#5A5A8A' },
  { id: 'numb', label: 'numb', glyph: '∅', color: '#4A4A4A' },
  { id: 'feral', label: 'feral', glyph: '🜂', color: '#6E2A0A' },         // alchemical fire
  { id: 'haunted', label: 'haunted', glyph: '◉', color: '#3A2A5A' },     // the watching eye
  { id: 'cursed', label: 'cursed', glyph: '⛧', color: '#5B0F1A' },
  { id: 'grieving', label: 'grieving', glyph: '†', color: '#2A2A3A' },   // dagger / mourning
];

// TTL options for how long a mood lingers.
export const MOOD_TTLS = [
  { id: '6h', label: '6 hours', ms: 1000 * 60 * 60 * 6 },
  { id: '12h', label: '12 hours', ms: 1000 * 60 * 60 * 12 },
  { id: '24h', label: 'a day', ms: 1000 * 60 * 60 * 24 },
];

// A mood is "active" only while set and unexpired. Treat an expired mood as none
// (no server cleanup needed).
export function moodActive(mood) {
  return !!(mood && mood.label && (!mood.expiresAt || mood.expiresAt > Date.now()));
}
