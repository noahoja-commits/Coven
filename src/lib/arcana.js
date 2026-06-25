// Custom Major Arcana card art (hand-made, stored in /public/arcana).
//
// Each soul is deterministically dealt a Major Arcana card (see arcanaFor in Sigils.jsx).
// By default ArcanaCard draws an engraved unicode symbol. Drop a real illustration in
// /public/arcana and the card renders the art instead.
//
// PLUG-AND-PLAY: art for a card lives at /arcana/<slug>.jpg where <slug> is the card
// name kebab-cased, e.g. "THE HIGH PRIESTESS" -> /arcana/the-high-priestess.jpg.
// To turn art on for a card:
//   1. drop a portrait image (~832×1216, the 5:8 card ratio) in /public/arcana/
//   2. add its UPPERCASE name to ARCANA_ART_READY below
// Cards not listed here keep the existing engraved-symbol look, so you can ship the 22
// one at a time. Empty set = nothing changes.

// The 22 names, for reference (must match arcanaFor's output exactly, UPPERCASE):
//   THE FOOL · THE MAGICIAN · THE HIGH PRIESTESS · THE EMPRESS · THE EMPEROR
//   THE HIEROPHANT · THE LOVERS · THE CHARIOT · STRENGTH · THE HERMIT
//   WHEEL OF FORTUNE · JUSTICE · THE HANGED MAN · DEATH · TEMPERANCE
//   THE DEVIL · THE TOWER · THE STAR · THE MOON · THE SUN · JUDGEMENT · THE WORLD

export const ARCANA_ART_READY = new Set([
  // 'THE FOOL', 'DEATH', 'THE MOON', ...
]);

export function arcanaSlug(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Returns the public path to a card's art, or null if no art is ready for it yet.
export function arcanaArtFor(name) {
  if (!ARCANA_ART_READY.has(String(name || '').toUpperCase())) return null;
  return `/arcana/${arcanaSlug(name)}.jpg`;
}
