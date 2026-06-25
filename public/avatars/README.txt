Preset avatar art goes here.

- square, 512×512 px
- PNG, transparent background or solid #0A0A0A
- one file per avatar, e.g. raven.png, reaper.png, moth.png

Then register it in src/lib/avatars.js (PRESET_AVATARS):
  { id: 'raven', src: '/avatars/raven.png', label: 'raven' }

It then appears in the profile editor's portrait picker and renders everywhere
(profile, comments, DMs) automatically — selecting it just sets the user's avatarUrl.
