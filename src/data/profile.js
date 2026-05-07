export const DEFAULT_PROFILE = {
  name: 'spectre.eve',
  pronouns: 'she / they',
  bio: 'velvet & venom · brooklyn · soft for cathedrals & cheap red wine',
  tags: ['goth', 'raver', 'smoker', 'NYC'],
  followers: 1284, following: 342, posts: 89,
  status: 'looking for a smoke sesh in bushwick',
  birthday: '1999-10-31', // for memento mori counter
  daysLived: null, // computed at render
  daysExpected: null, // computed at render
  scene: 'NYC',
  joinedScene: '2018-09-15', // for anniversary
  candleLit: { lastBy: 'ash.in.october', avatar: '🕯', at: Date.now() - 1000 * 60 * 60 * 2 }, // 2h ago
};

export const GRAVES = [
  {
    id: 'g1', name: 'Marlowe', kind: 'relationship',
    dates: '2021 — 2024', epitaph: 'three years. a city. a season. ended in the rain.',
    flowers: 12, addedFlowers: ['ash.in.october', 'cryptic.rose', 'lilith_xiv'], visibility: 'friends',
  },
];

export const ANNIVERSARIES = [
  { id: 'a1', date: '2018-09-15', label: 'first show', description: 'Bauhaus tribute at Saint Vitus', visible: true },
  { id: 'a2', date: '2020-03-13', label: 'sober from the hard stuff', description: '', visible: false },
];

export const TRACKER_CATEGORIES = [
  { id: 'cig', label: 'cigarette', glyph: '∽', mode: 'last', defaultPublic: true },
  { id: 'drink', label: 'drink', glyph: '◐', mode: 'last', defaultPublic: true },
  { id: 'sleep', label: 'sleep', glyph: '☽', mode: 'last', defaultPublic: false },
  { id: 'shower', label: 'shower', glyph: '◯', mode: 'last', defaultPublic: false },
  { id: 'ate', label: 'ate', glyph: '✦', mode: 'last', defaultPublic: false },
  { id: 'cried', label: 'cried', glyph: '❀', mode: 'last', defaultPublic: false },
  { id: 'sober', label: 'sober days', glyph: '☩', mode: 'streak', defaultPublic: false },
  { id: 'sex', label: 'sex', glyph: '♡', mode: 'last', defaultPublic: false },
  { id: 'period', label: 'period', glyph: '⊙', mode: 'last', defaultPublic: false },
];

// Mock user tracker state
export const DEFAULT_TRACKERS = {
  cig: { lastAt: Date.now() - 1000 * 60 * 60 * 3, public: true },     // 3h ago
  drink: { lastAt: Date.now() - 1000 * 60 * 60 * 22, public: true },  // 22h ago
  sleep: { lastAt: Date.now() - 1000 * 60 * 60 * 9, public: false },
  cried: { lastAt: Date.now() - 1000 * 60 * 60 * 24 * 4, public: false }, // 4d ago
  sober: { streakStart: Date.now() - 1000 * 60 * 60 * 24 * 47, public: false }, // 47d
};
