// Achievements are derived from state. Each has a check fn → boolean.

export const ACHIEVEMENTS = [
  { id: 'first-post', glyph: '✦', name: 'first words', desc: 'speak once into the dark', check: ({ posts, me }) => posts.some(p => p.user === me) },
  { id: 'sealed-sigil', glyph: '⛧', name: 'sealed', desc: 'seal your first sigil', check: ({ sigils }) => sigils.length > 0 },
  { id: 'three-sigils', glyph: '⛧', name: 'pact', desc: 'seal three sigils', check: ({ sigils }) => sigils.length >= 3 },
  { id: 'crystal-carrier', glyph: '◆', name: 'crystal carrier', desc: 'carry three stones', check: ({ crystals }) => crystals.length >= 3 },
  { id: 'streak-7', glyph: '☩', name: 'one week', desc: 'mark the ritual seven days', check: ({ ritual }) => (ritual?.streak || 0) >= 7 },
  { id: 'streak-30', glyph: '☩', name: 'one moon', desc: 'thirty days of the ritual', check: ({ ritual }) => (ritual?.streak || 0) >= 30 },
  { id: 'crew-member', glyph: '✟', name: 'gathered', desc: 'join a crew', check: ({ communityMembership }) => Object.values(communityMembership || {}).filter(Boolean).length >= 2 },
  { id: 'confessor', glyph: '☩', name: 'confessor', desc: 'speak with no name', check: ({ posts }) => posts.some(p => p.anonymous) },
  { id: 'reflector', glyph: '✎', name: 'reflector', desc: 'write to yourself five times', check: ({ reflections }) => reflections.length >= 5 },
  { id: 'lit-candle', glyph: '🕯', name: 'mourner', desc: 'light a candle for the dead', check: ({ graves }) => graves.some(g => g.candleLitAt) },
  { id: 'bookmark-3', glyph: '✦', name: 'archivist', desc: 'save three posts', check: ({ bookmarks }) => Object.keys(bookmarks || {}).length >= 3 },
  { id: 'sigil-journal', glyph: '⛧', name: 'unbroken', desc: 'a sigil sealed and another sealed and another', check: ({ sigils }) => sigils.length >= 5 },
  { id: 'oracle-asked', glyph: '✦', name: 'questioner', desc: 'ask the deck a question', check: ({ divinationLog }) => divinationLog.some(d => d.kind === 'oracle') },
  { id: 'pendulum-asked', glyph: '◯', name: 'consultant', desc: 'consult the pendulum', check: ({ divinationLog }) => divinationLog.some(d => d.kind === 'pendulum') },
  { id: 'follower', glyph: '☥', name: 'fellow', desc: 'follow another soul', check: ({ following }) => Object.keys(following).length >= 1 },
  { id: 'tag-poster', glyph: '#', name: 'taxonomist', desc: 'use a hashtag', check: ({ posts, me }) => posts.some(p => p.user === me && /#[a-zA-Z0-9_]+/.test(p.body || '')) },
];

export function earnedAchievements(state) {
  return ACHIEVEMENTS.filter(a => {
    try { return a.check(state); } catch { return false; }
  });
}
