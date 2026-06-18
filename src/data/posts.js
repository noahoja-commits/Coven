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

// MESSAGES[conversationId] = [{ id, from, body, time }]
// 'me' = current user. Otherwise from = handle.
export const MESSAGES = {
  c1: [
    { id: 'm1', from: 'lilith_xiv', body: 'going to the crypt tonight. spectres vol IV', time: '11:42' },
    { id: 'm2', from: 'me', body: 'wait fr? thought that was next week', time: '11:43' },
    { id: 'm3', from: 'lilith_xiv', body: 'no tn. mortuary.dj is opening', time: '11:43' },
    { id: 'm4', from: 'lilith_xiv', body: 'driving from bushwick around 10', time: '11:44' },
    { id: 'm5', from: 'lilith_xiv', body: 'one seat. you in?', time: '11:44' },
  ],
  c2: [
    { id: 'm1', from: 'me', body: 'where did you get that velvet jacket', time: '09:12' },
    { id: 'm2', from: 'ash.in.october', body: 'salvation army on flatbush. $12', time: '09:15' },
    { id: 'm3', from: 'ash.in.october', body: 'they had like three more in different sizes', time: '09:15' },
    { id: 'm4', from: 'me', body: 'going tomorrow', time: '09:16' },
    { id: 'm5', from: 'ash.in.october', body: 'sent you the link to the velvet shop', time: '09:46' },
  ],
  c3: [
    { id: 'm1', from: 'mortis.kvlt', body: 'spectres tonight. who is rolling', time: '10:01' },
    { id: 'm2', from: 'vesper.exe', body: 'me obviously', time: '10:02' },
    { id: 'm3', from: 'cryptic.rose', body: 'i can drive 4', time: '10:04' },
    { id: 'm4', from: 'blackvelvet_99', body: 'in', time: '10:05' },
    { id: 'm5', from: 'mortis.kvlt', body: 'who is rolling', time: '10:37' },
  ],
  c4: [
    { id: 'm1', from: 'vesper.exe', body: 'that makeup tutorial post was so real', time: '08:30' },
    { id: 'm2', from: 'me', body: 'lmao i felt that one in my bones', time: '08:31' },
    { id: 'm3', from: 'vesper.exe', body: 'lol fair', time: '08:31' },
  ],
  c5: [
    { id: 'm1', from: 'me', body: 'yo any chance of +1 for tonight', time: '07:50' },
    { id: 'm2', from: 'mortuary.dj', body: 'guestlist + 1 you got it', time: '07:55' },
  ],
  c6: [
    { id: 'm1', from: 'cryptic.rose', body: 'photo', time: '05:10' },
    { id: 'm2', from: 'cryptic.rose', body: '[photo: st. john the divine at dusk]', time: '05:10' },
  ],
  c7: [
    { id: 'm1', from: 'me', body: 'drab majesty record is mid', time: 'yesterday' },
    { id: 'm2', from: 'blackvelvet_99', body: 'no but really tho', time: 'yesterday' },
  ],
};
