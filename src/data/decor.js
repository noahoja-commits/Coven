// Profile decorations — an avatar border frame + a header banner. Stored on the
// profile as decor:{ border, banner } and rendered on the profile + other users'.

export const BORDERS = [
  { id: 'none', label: 'none' },
  { id: 'oxblood', label: 'oxblood' },
  { id: 'gilded', label: 'gilded' },
  { id: 'bone', label: 'bone' },
  { id: 'thorns', label: 'thorns' },
];

export const BANNERS = [
  { id: 'none', label: 'none' },
  { id: 'blood', label: 'blood' },
  { id: 'mist', label: 'mist' },
  { id: 'cathedral', label: 'cathedral' },
  { id: 'moon', label: 'moonlit' },
];

export function borderStyle(id) {
  switch (id) {
    case 'oxblood': return { boxShadow: '0 0 0 2px #8B0000, 0 0 14px rgba(139,0,0,0.5)' };
    case 'gilded': return { boxShadow: '0 0 0 2px #C9A961, 0 0 14px rgba(201,169,97,0.45)' };
    case 'bone': return { boxShadow: '0 0 0 2px #D8C7A8' };
    case 'thorns': return { boxShadow: '0 0 0 2px #2E3B2A, 0 0 0 4px #0A0A0A, 0 0 10px rgba(60,80,55,0.5)' };
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
