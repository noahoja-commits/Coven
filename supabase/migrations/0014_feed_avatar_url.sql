-- Expose the author's avatar_url through feed_posts (nulled for anonymous posts,
-- like handle/avatar) so the feed can show uploaded profile photos.
create or replace view public.feed_posts as
 SELECT p.id, p.kind, p.body, p.community, p.anonymous, p.img, p.event, p.poll, p.quoted, p.created_at,
    CASE WHEN p.anonymous THEN NULL::uuid ELSE p.author_id END AS author_id_public,
    CASE WHEN p.anonymous THEN 'anonymous'::text ELSE pr.handle END AS handle,
    CASE WHEN p.anonymous THEN '✟'::text ELSE pr.avatar END AS avatar,
    COALESCE(r.bat, 0::bigint) AS bat,
    COALESCE(r.fire, 0::bigint) AS fire,
    COALESCE(r.skull, 0::bigint) AS skull,
    COALESCE(r.smoke, 0::bigint) AS smoke,
    COALESCE(c.cnt, 0::bigint) AS comment_count,
    CASE WHEN p.anonymous THEN NULL::text ELSE pr.avatar_url END AS avatar_url
   FROM posts p
     JOIN profiles pr ON pr.id = p.author_id
     LEFT JOIN ( SELECT reactions.post_id,
            count(*) FILTER (WHERE reactions.kind = 'bat'::text) AS bat,
            count(*) FILTER (WHERE reactions.kind = 'fire'::text) AS fire,
            count(*) FILTER (WHERE reactions.kind = 'skull'::text) AS skull,
            count(*) FILTER (WHERE reactions.kind = 'smoke'::text) AS smoke
           FROM reactions GROUP BY reactions.post_id) r ON r.post_id = p.id
     LEFT JOIN ( SELECT comments.post_id, count(*) AS cnt
           FROM comments GROUP BY comments.post_id) c ON c.post_id = p.id;

grant select on public.feed_posts to anon, authenticated;
