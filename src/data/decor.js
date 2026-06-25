// Profile decorations — an avatar border frame + a header banner. Stored on the
// profile as decor:{ border, banner } and rendered on the profile + other users'.

export const BORDERS = [
  { id: 'none', label: 'none' },
  { id: 'oxblood', label: 'oxblood' },
  { id: 'gilded', label: 'gilded' },
  { id: 'bone', label: 'bone' },
  { id: 'thorns', label: 'thorns' },
  { id: 'amethyst', label: 'amethyst' },
  { id: 'silver', label: 'silver' },
];

export const BANNERS = [
  { id: 'none', label: 'none' },
  { id: 'blood', label: 'blood' },
  { id: 'mist', label: 'mist' },
  { id: 'cathedral', label: 'cathedral' },
  { id: 'moon', label: 'moonlit' },
];

// Layered box-shadows build a framed ring: a thin dark liner, the colored band,
// a second dark liner, then an outer glow — reads as a carved frame, not a flat stroke.
export function borderStyle(id) {
  switch (id) {
    case 'oxblood': return { boxShadow: '0 0 0 1px rgba(0,0,0,0.85), 0 0 0 3px #8B0000, 0 0 0 4px rgba(0,0,0,0.6), 0 0 16px rgba(139,0,0,0.55)' };
    case 'gilded': return { boxShadow: '0 0 0 1px #6B5418, 0 0 0 3px #C9A961, 0 0 0 4px #6B5418, 0 0 18px rgba(201,169,97,0.5)' };
    case 'bone': return { boxShadow: '0 0 0 1px #8A7A5C, 0 0 0 3px #D8C7A8, 0 0 0 4px #4A4030, 0 0 8px rgba(216,199,168,0.3)' };
    case 'thorns': return { boxShadow: '0 0 0 1px #0A0A0A, 0 0 0 2px #2E3B2A, 0 0 0 4px #0A0A0A, 0 0 0 5px #3C4A35, 0 0 12px rgba(60,80,55,0.55)' };
    case 'amethyst': return { boxShadow: '0 0 0 1px rgba(0,0,0,0.8), 0 0 0 3px #5E3B73, 0 0 0 4px rgba(0,0,0,0.5), 0 0 18px rgba(94,59,115,0.55)' };
    case 'silver': return { boxShadow: '0 0 0 1px #3A3A40, 0 0 0 3px #B8BAC2, 0 0 0 4px #3A3A40, 0 0 14px rgba(184,186,194,0.4)' };
    default: return {};
  }
}

export function bannerStyle(id) {
  switch (id) {
    case 'blood': return { background: 'linear-gradient(180deg, #5B0F1A 0%, #2A0710 60%, transparent 100%)' };
    case 'mist': return { background: 'linear-gradient(180deg, #3A3A45 0%, #14141A 60%, transparent 100%)' };
    case 'cathedral': return { background: 'linear-gradient(180deg, #2D0F3F 0%, #14081F 60%, transparent 100%)' };
    case 'moon': return { background: 'linear-gradient(180deg, #1A1A2E 0%, #0E0E1A 60%, transparent 100%)' };
    default: return null;
  }
}
