export const POSTS = [
  {
    id: 'p1', kind: 'text', user: 'lilith_xiv', avatar: '🦇', time: '4m',
    community: 'general', body: 'tonight at the crypt. one seat in my car from bushwick. dm if u smoke',
    reactions: { bat: 12, fire: 4, skull: 8, smoke: 23 }, comments: 7,
  },
  {
    id: 'p2', kind: 'photo', user: 'ash.in.october', avatar: '🕯', time: '21m',
    community: 'fashion', body: 'thrifted velvet. $12 at the salvation army on flatbush.',
    img: 'velvet', reactions: { bat: 47, fire: 89, skull: 12, smoke: 3 }, comments: 24,
  },
  {
    id: 'p3', kind: 'event', user: 'mortuary.dj', avatar: '⚰', time: '1h',
    community: 'partying',
    event: {
      name: 'SPECTRES vol. IV', venue: 'The Mortuary', date: 'sat may 9 · 11pm',
      tags: ['darkwave', 'ebm', '21+'], going: 184,
    },
    reactions: { bat: 203, fire: 156, skull: 88, smoke: 41 }, comments: 62,
  },
  {
    id: 'p4', kind: 'text', user: 'vesper.exe', avatar: '✟', time: '2h',
    community: 'general', body: 'why does every "goth" makeup tutorial start with a full beat. some of us just want a smudged eye and a cigarette',
    reactions: { bat: 89, fire: 12, skull: 144, smoke: 67 }, comments: 38,
  },
  {
    id: 'p5', kind: 'photo', user: 'cryptic.rose', avatar: '🌹', time: '3h',
    community: 'goth', body: 'st. john the divine at dusk. nothing like it.',
    img: 'cathedral', reactions: { bat: 312, fire: 28, skull: 19, smoke: 4 }, comments: 41,
  },
  {
    id: 'p6', kind: 'text', user: 'blackvelvet_99', avatar: '🩸', time: '5h',
    community: 'music', body: 'drab majesty new record might genuinely be their best. fight me',
    reactions: { bat: 67, fire: 41, skull: 8, smoke: 12 }, comments: 89,
  },
];

export const STORIES = [
  { user: 'you', avatar: '+', live: false, self: true },
  { user: 'lilith_xiv', avatar: '🦇', live: true },
  { user: 'ash.in.october', avatar: '🕯', live: true },
  { user: 'vesper.exe', avatar: '✟', live: false },
  { user: 'mortis.kvlt', avatar: '☠', live: true },
  { user: 'cryptic.rose', avatar: '🌹', live: false },
  { user: 'blackvelvet', avatar: '🩸', live: false },
];

export const CONVERSATIONS = [
  { id: 'c1', user: 'lilith_xiv', avatar: '🦇', last: 'one seat. you in?', time: '2m', unread: 2 },
  { id: 'c2', user: 'ash.in.october', avatar: '🕯', last: 'sent you the link to the velvet shop', time: '14m', unread: 0 },
  { id: 'c3', user: 'the crypt crew', avatar: '✟', last: 'mortis: who\u2019s rolling', time: '23m', unread: 5, group: true },
  { id: 'c4', user: 'vesper.exe', avatar: '✟', last: 'lol fair', time: '1h', unread: 0 },
  { id: 'c5', user: 'mortuary.dj', avatar: '⚰', last: 'guestlist + 1 you got it', time: '3h', unread: 0 },
  { id: 'c6', user: 'cryptic.rose', avatar: '🌹', last: 'photo', time: '6h', unread: 0 },
  { id: 'c7', user: 'blackvelvet_99', avatar: '🩸', last: 'no but really tho', time: '1d', unread: 0 },
];
