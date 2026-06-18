// Mock user profiles for known handles. Anything not listed gets a stub.

export const USERS = {
  'lilith_xiv': {
    handle: 'lilith_xiv', avatar: '🦇', pronouns: 'she / her',
    bio: 'queen of the crypt. bushwick.',
    tags: ['darkwave', 'driving', 'NYC'],
    scene: 'Brooklyn', joinedAt: '2019-10-31',
    followers: 4821, following: 219,
  },
  'ash.in.october': {
    handle: 'ash.in.october', avatar: '🕯', pronouns: 'they / them',
    bio: 'velvet, candles, thrift. the holy trinity.',
    tags: ['fashion', 'thrift', 'romantic'],
    scene: 'Brooklyn', joinedAt: '2020-04-15',
    followers: 2410, following: 308,
  },
  'mortuary.dj': {
    handle: 'mortuary.dj', avatar: '⚰', pronouns: 'he / him',
    bio: 'opens for the abyss. darkwave / ebm. residency at The Mortuary.',
    tags: ['dj', 'darkwave', 'ebm'],
    scene: 'Brooklyn', joinedAt: '2017-06-13',
    followers: 9120, following: 88,
  },
  'vesper.exe': {
    handle: 'vesper.exe', avatar: '✟', pronouns: 'she / they',
    bio: 'smudged eye / cigarette / cathedral. unbothered.',
    tags: ['goth', 'smoker', 'cynic'],
    scene: 'NYC', joinedAt: '2021-02-02',
    followers: 1620, following: 401,
  },
  'cryptic.rose': {
    handle: 'cryptic.rose', avatar: '🌹', pronouns: 'she / her',
    bio: 'romantic decay. photography. cathedrals at dusk.',
    tags: ['photo', 'romantic', 'soft'],
    scene: 'Manhattan', joinedAt: '2018-11-01',
    followers: 5402, following: 142,
  },
  'blackvelvet_99': {
    handle: 'blackvelvet_99', avatar: '🩸', pronouns: 'they / them',
    bio: 'drab majesty truther. record store loiterer.',
    tags: ['music', 'records', 'opinionated'],
    scene: 'PDX', joinedAt: '2019-08-08',
    followers: 988, following: 712,
  },
  'mortis.kvlt': {
    handle: 'mortis.kvlt', avatar: '☠', pronouns: 'he / him',
    bio: 'who’s rolling. always.',
    tags: ['nightlife', 'partying'],
    scene: 'Brooklyn', joinedAt: '2017-10-31',
    followers: 3200, following: 1102,
  },
  'parish.nyc': {
    handle: 'parish.nyc', avatar: '☩', pronouns: 'they / them',
    bio: 'curates funeral mass at saint vitus.',
    tags: ['doom', 'curator'],
    scene: 'Brooklyn', joinedAt: '2018-05-20',
    followers: 1840, following: 290,
  },
};

export function getUser(handle) {
  return USERS[handle] || {
    handle, avatar: '✦', pronouns: '',
    bio: '',
    tags: [],
    scene: '', joinedAt: null,
    followers: Math.floor(Math.random() * 500),
    following: Math.floor(Math.random() * 300),
  };
}

// Mock "tonight" statuses — who's out and what they're up to
export const TONIGHT_OUT = [
  { handle: 'lilith_xiv', avatar: '🦇', status: 'driving to the crypt @ 10', neighborhood: 'bushwick' },
  { handle: 'mortis.kvlt', avatar: '☠', status: 'who is rolling', neighborhood: 'bed-stuy' },
  { handle: 'cryptic.rose', avatar: '🌹', status: 'cathedral vespers, then home', neighborhood: 'morningside' },
  { handle: 'ash.in.october', avatar: '🕯', status: 'thrifting & smoking', neighborhood: 'crown heights' },
  { handle: 'vesper.exe', avatar: '✟', status: 'in bed but down to be talked out of it', neighborhood: 'LES' },
];

// Deterministic mock public-tracker log per user
export function getUserTrackers(handle) {
  const seed = handle.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const all = [
    { id: 'cig', label: 'cigarette', glyph: '∽', hoursAgo: 1 + (seed % 8) },
    { id: 'drink', label: 'drink', glyph: '◐', hoursAgo: 4 + (seed % 20) },
    { id: 'sleep', label: 'sleep', glyph: '☽', hoursAgo: 7 + (seed % 5) },
    { id: 'cried', label: 'cried', glyph: '❀', hoursAgo: 24 + (seed % 96) },
    { id: 'ate', label: 'ate', glyph: '✦', hoursAgo: 2 + (seed % 6) },
    { id: 'sober', label: 'sober', glyph: '☩', hoursAgo: 24 * (10 + seed % 60), streak: true },
  ];
  // Pick a deterministic subset of 3
  return all.filter((_, i) => (seed + i) % 2 === 0).slice(0, 3);
}
