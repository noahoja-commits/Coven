// Preset image avatars (custom-drawn "sigil" portraits, stored in /public/avatars).
//
// PLUG-AND-PLAY: an image avatar is just a preset `avatarUrl` that points at a static
// asset. Every place in the app already renders `avatarUrl` as an <img>, so a preset
// avatar shows up everywhere (profile, comments, DMs, search…) with ZERO extra wiring.
//
// To add one once the art is ready:
//   1. drop a square PNG (512×512, transparent or on #0A0A0A) in /public/avatars/
//   2. add a line below: { id, src, label }
// The picker in ProfileEditModal will show it automatically; selecting it sets the
// user's avatarUrl to that path. Empty list = the picker section stays hidden and the
// app falls back to the existing emoji glyphs, so this is safe to leave empty.
export const PRESET_AVATARS = [
  // { id: 'raven',   src: '/avatars/raven.png',   label: 'raven' },
  // { id: 'reaper',  src: '/avatars/reaper.png',  label: 'reaper' },
  // { id: 'moth',    src: '/avatars/moth.png',    label: 'moth' },
];

// True if an avatarUrl is one of our preset assets (vs. a user-uploaded photo).
export function isPresetAvatar(url) {
  return typeof url === 'string' && url.startsWith('/avatars/');
}
