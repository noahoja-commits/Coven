// Mock notifications. In real app these come from a backend.

export const NOTIFICATIONS = [
  { id: 'n1', kind: 'reaction', user: 'lilith_xiv', avatar: '🦇', text: 'reacted 🦇 to your post', time: '3m', target: 'your post about the cathedral', read: false },
  { id: 'n2', kind: 'follow', user: 'mortis.kvlt', avatar: '☠', text: 'followed you', time: '12m', read: false },
  { id: 'n3', kind: 'dm', user: 'cryptic.rose', avatar: '🌹', text: 'sent you a whisper', time: '23m', read: false },
  { id: 'n4', kind: 'reply', user: 'vesper.exe', avatar: '✟', text: 'replied to your marginalia in Genesis', time: '1h', read: false },
  { id: 'n5', kind: 'event', avatar: '◈', text: 'SPECTRES vol. IV starts in 3 hours', time: '1h', read: false },
  { id: 'n6', kind: 'crew', user: 'the crypt crew', avatar: '✟', text: 'mortis: who\u2019s rolling', time: '2h', read: true },
  { id: 'n7', kind: 'oddity', user: 'blackvelvet_99', avatar: '🩸', text: 'asked about your Joy Division listing', time: '3h', read: true },
  { id: 'n8', kind: 'candle', user: 'ash.in.october', avatar: '🕯', text: 'lit your candle', time: '5h', read: true },
  { id: 'n9', kind: 'tonight', user: 'lilith_xiv', avatar: '🦇', text: 'is heading out tonight', time: '6h', read: true },
  { id: 'n10', kind: 'reaction', user: 'mortuary.dj', avatar: '⚰', text: 'reacted 🔥 to your post', time: '8h', read: true },
  { id: 'n11', kind: 'vespers', avatar: '✟', text: 'today\u2019s vespers passage is ready', time: '1d', read: true },
];
