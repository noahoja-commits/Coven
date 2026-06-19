-- Expose story image_url through the active_stories view.
create or replace view public.active_stories as
 SELECT s.id, s.author_id, s.glyph, s.caption, s.bg, s.created_at, s.expires_at,
    p.handle, p.avatar,
    s.image_url
   FROM stories s
     JOIN profiles p ON p.id = s.author_id
  WHERE s.expires_at > now();
