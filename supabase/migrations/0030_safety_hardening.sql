-- Coven migration 0030 — invisible safety hardening:
-- storage limits, real server-side block enforcement, anti-abuse rate limits,
-- and report-threshold auto-hide. No client/UI changes.

-- ── A. Storage bucket limits (server-enforced) ───────────────────────────────
update storage.buckets
  set file_size_limit = 31457280, -- 30MB (covers video)
      allowed_mime_types = array['image/jpeg','image/png','image/gif','image/webp','image/svg+xml',
                                 'video/mp4','video/webm','video/quicktime','video/ogg']
  where id = 'post-images';
update storage.buckets
  set file_size_limit = 26214400, -- 25MB
      allowed_mime_types = array['image/jpeg','image/png','image/gif','image/webp','image/svg+xml']
  where id in ('avatars','story-images','listing-images','venue-maps');

-- ── B. Helpers (SECURITY DEFINER so they bypass the strict per-table RLS) ─────
create or replace function public.blocked_between(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;
grant execute on function public.blocked_between(uuid, uuid) to authenticated;

create or replace function public.post_author(p uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select author_id from public.posts where id = p;
$$;
grant execute on function public.post_author(uuid) to authenticated;

-- ── C. Block enforcement — RESTRICTIVE insert policies (ANDed on top of existing) ─
drop policy if exists follows_noblock on public.follows;
create policy follows_noblock on public.follows as restrictive for insert to authenticated
  with check (not public.blocked_between(auth.uid(), followee_id));

drop policy if exists reactions_noblock on public.reactions;
create policy reactions_noblock on public.reactions as restrictive for insert to authenticated
  with check (not public.blocked_between(auth.uid(), public.post_author(post_id)));

drop policy if exists comments_noblock on public.comments;
create policy comments_noblock on public.comments as restrictive for insert to authenticated
  with check (not public.blocked_between(auth.uid(), public.post_author(post_id)));

drop policy if exists dm_noblock on public.messages_dm;
create policy dm_noblock on public.messages_dm as restrictive for insert to authenticated
  with check (not exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = messages_dm.conversation_id
      and cm.user_id <> auth.uid()
      and public.blocked_between(auth.uid(), cm.user_id)
  ));

-- ── D. Anti-abuse rate limits — RESTRICTIVE insert policies (generous ceilings) ─
drop policy if exists posts_ratelimit on public.posts;
create policy posts_ratelimit on public.posts as restrictive for insert to authenticated
  with check ((select count(*) from public.posts
               where author_id = auth.uid() and created_at > now() - interval '1 minute') < 10);

drop policy if exists dm_ratelimit on public.messages_dm;
create policy dm_ratelimit on public.messages_dm as restrictive for insert to authenticated
  with check ((select count(*) from public.messages_dm
               where sender_id = auth.uid() and created_at > now() - interval '1 minute') < 30);

drop policy if exists follows_ratelimit on public.follows;
create policy follows_ratelimit on public.follows as restrictive for insert to authenticated
  with check ((select count(*) from public.follows
               where follower_id = auth.uid() and created_at > now() - interval '1 minute') < 30);

-- ── E. Report auto-hide — recreate feed_posts (verbatim from 0014) + threshold ─
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
           FROM comments GROUP BY comments.post_id) c ON c.post_id = p.id
  WHERE (SELECT count(DISTINCT reporter_id) FROM public.reports
         WHERE target_kind = 'post' AND target_id = p.id) < 3;
grant select on public.feed_posts to anon, authenticated;
