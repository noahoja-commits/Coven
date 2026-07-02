-- Coven migration 0062 — edit your own posts and comments.
--
-- Neither posts nor comments had an UPDATE policy, so RLS silently blocked any edit. This adds:
--   * edited_at columns (posts, comments) so the UI can show a quiet "· edited" mark.
--   * owner-scoped UPDATE policies (bind author_id to auth.uid(), and keep it bound in WITH CHECK
--     so an edit can never reassign authorship).
--   * comments_delete already exists (0042). Re-emit feed_posts + post_comments to expose edited_at.
-- Only body/edited_at are meant to change; the policies don't restrict columns, but the client
-- only sends those two.

alter table public.posts    add column if not exists edited_at timestamptz;
alter table public.comments add column if not exists edited_at timestamptz;

drop policy if exists posts_update on public.posts;
create policy posts_update on public.posts
  for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

drop policy if exists comments_update on public.comments;
create policy comments_update on public.comments
  for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

-- Re-emit feed_posts (0055 shape) + edited_at.
create or replace view public.feed_posts as
  select p.id, p.kind, p.body, p.community, p.anonymous, p.img, p.event, p.poll, p.quoted, p.created_at,
         p.edited_at,
         case when p.anonymous then null::uuid else p.author_id end as author_id_public,
         case when p.anonymous then 'anonymous'::text else pr.handle end as handle,
         case when p.anonymous then '✟'::text else pr.avatar end as avatar,
         p.react_bat::bigint   as bat,
         p.react_fire::bigint  as fire,
         p.react_skull::bigint as skull,
         p.react_smoke::bigint as smoke,
         p.comment_count::bigint as comment_count,
         case when p.anonymous then null::text else pr.avatar_url end as avatar_url,
         p.event_id as event_id,
         case when p.anonymous then null::uuid else p.coauthor_id end as coauthor_id,
         case when p.anonymous then null::text else cpr.handle end as coauthor_handle
  from public.posts p
    join public.profiles pr on pr.id = p.author_id
    left join public.profiles cpr on cpr.id = p.coauthor_id
  where (p.scheduled_at is null or p.scheduled_at <= now())
    and (select count(distinct reports.reporter_id) from public.reports
         where reports.target_kind = 'post' and reports.target_id = p.id) < 3;

-- Re-emit post_comments (0051 shape) + edited_at.
create or replace function public.post_comments(p_post_id uuid)
returns table (id uuid, post_id uuid, author_id uuid, parent_id uuid, body text,
               created_at timestamptz, edited_at timestamptz, handle text, avatar text, avatar_url text, reactions jsonb)
language sql stable security definer set search_path = public as $$
  select c.id, c.post_id, c.author_id, c.parent_id, c.body, c.created_at, c.edited_at,
         pr.handle, pr.avatar, pr.avatar_url,
         coalesce((
           select jsonb_object_agg(s.kind, s.n)
           from (
             select cr.kind, count(*)::int as n
             from public.comment_reactions cr
             where cr.comment_id = c.id
             group by cr.kind
           ) s
         ), '{}'::jsonb) as reactions
  from public.comments c
  join public.profiles pr on pr.id = c.author_id
  where c.post_id = p_post_id
  order by c.created_at asc
$$;
grant execute on function public.post_comments(uuid) to authenticated, anon;
