-- Coven migration 0053 — attach a feed post to a story (share-to-story).
-- A story can optionally reference a post; the active_stories view exposes it
-- (plus the author's avatar_url) so the viewer can render the attached post card.

alter table public.stories
  add column if not exists post_id uuid references public.posts(id) on delete set null;

-- create-or-replace can only APPEND view columns, so keep the existing order
-- (…image_url last) and add avatar_url + post_id at the end.
create or replace view public.active_stories as
  select s.id, s.author_id, s.glyph, s.caption, s.bg, s.created_at, s.expires_at,
         p.handle, p.avatar, s.image_url,
         p.avatar_url, s.post_id
    from public.stories s
    join public.profiles p on p.id = s.author_id
   where s.expires_at > now();
