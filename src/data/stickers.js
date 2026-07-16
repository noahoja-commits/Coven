// Built-in "sticker" packs — oversized goth/occult glyphs. Sending a sticker inserts its glyph
// into the composer (it renders big when a message is a lone sticker), so there's no upload,
// no bucket, and no new message type. User-uploaded custom stickers are a fast-follow.
export const STICKER_PACKS = [
  {
    id: 'occult',
    label: 'occult',
    stickers: ['🜏', '☾', '⛧', '✟', '🜍', '🝮', '🔮', '🕯️', '⚰️', '🦇', '🐈‍⬛', '🌙', '💀', '🥀', '⛓️', '🩸'],
  },
  {
    id: 'mood',
    label: 'mood',
    stickers: ['🖤', '😈', '👁️', '🥀', '🕸️', '🗝️', '⚱️', '🧿', '🪦', '⚜️', '☠️', '🌚', '🫀', '🪬', '🃏', '♰'],
  },
  {
    id: 'nature',
    label: 'wilds',
    stickers: ['🌑', '🌘', '🦉', '🐺', '🕷️', '🦂', '🌲', '🍂', '❄️', '⛈️', '🔥', '🌫️', '🪶', '🦴', '🌾', '🍄'],
  },
];

// A lone-sticker message: 1–3 glyphs and nothing else → render oversized in the bubble.
export function isStickerMessage(body) {
  if (!body) return false;
  const t = body.trim();
  // No latin letters/digits, short — treat as a sticker (emoji/glyph only).
  if (/[a-z0-9]/i.test(t)) return false;
  return [...t].length > 0 && [...t].length <= 4;
}
