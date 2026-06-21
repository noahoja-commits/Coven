// Altar objects you EARN through practice, then arrange on your profile shrine.
// `check(state)` uses the same state shape as achievements.js (posts/me/sigils/etc.).
export const SHRINE_OBJECTS = [
  { id: 'candle', glyph: '🕯', name: 'votive candle', desc: 'speak once into the dark', check: ({ posts, me }) => (posts || []).some(p => p.user === me) },
  { id: 'feather', glyph: '🪶', name: 'raven feather', desc: 'follow another soul', check: ({ following }) => Object.keys(following || {}).length >= 1 },
  { id: 'rose', glyph: '🥀', name: 'dried rose', desc: 'write to yourself five times', check: ({ reflections }) => (reflections || []).length >= 5 },
  { id: 'bone', glyph: '🦴', name: 'small bone', desc: 'light a candle for the dead', check: ({ graves }) => (graves || []).some(g => g.candleLitAt) },
  { id: 'skull', glyph: '💀', name: 'memento skull', desc: 'lay something to rest', check: ({ graves }) => (graves || []).length >= 1 },
  { id: 'chalice', glyph: '🍷', name: 'chalice', desc: 'keep the rite seven days', check: ({ ritual }) => (ritual?.streak || 0) >= 7 },
  { id: 'dagger', glyph: '🗡', name: 'athame', desc: 'seal three sigils', check: ({ sigils }) => (sigils || []).length >= 3 },
  { id: 'moth', glyph: '🦋', name: "death's-head moth", desc: 'carry three stones', check: ({ crystals }) => (crystals || []).length >= 3 },
  { id: 'vial', glyph: '⚗', name: 'glass vial', desc: 'ask the deck or the pendulum', check: ({ divinationLog }) => (divinationLog || []).length >= 1 },
  { id: 'bell', glyph: '🔔', name: 'brass bell', desc: 'join two scenes', check: ({ communityMembership }) => Object.values(communityMembership || {}).filter(Boolean).length >= 2 },
];

export function earnedShrine(state) {
  return SHRINE_OBJECTS.filter(o => { try { return o.check(state); } catch { return false; } });
}
