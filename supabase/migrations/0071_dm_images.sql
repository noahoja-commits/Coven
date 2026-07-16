-- Coven migration 0071 — images in DMs (GIFs + stickers).
--
-- messages_dm carried only text (body, NOT NULL) + an optional audio_url. GIFs and image
-- stickers need a media url. Add image_url; a GIF/sticker message still carries a short body
-- placeholder (like voice notes send '🎙️ voice note') since body stays NOT NULL.
--
-- No RLS change: the existing messages_dm policies already scope send/read to the conversation's
-- members; a new nullable column inherits them. Posts already carry GIFs via posts.img + kind,
-- so no posts change is needed.

alter table public.messages_dm add column if not exists image_url text;
