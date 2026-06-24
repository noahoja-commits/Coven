-- Event recap thread: link a post to an event so photos/comments collect there after
-- the rite. Adds posts.event_id + an index, and exposes event_id in the feed_posts view
-- (appended column — CREATE OR REPLACE allows adding columns at the end).

alter table public.posts add column if not exists event_id uuid references public.events(id) on delete set null;
create index if not exists posts_event_idx on public.posts(event_id) where event_id is not null;

-- Re-emit the 0041 denormalized feed view with event_id appended. Stays a definer view
-- (no security_invoker), anon still masked, counts read from the columns.
create or replace view public.feed_posts as
  select p.id, p.kind, p.body, p.community, p.anonymous, p.img, p.event, p.poll, p.quoted, p.created_at,
         case when p.anonymous then null::uuid else p.author_id end as author_id_public,
         case when p.anonymous then 'anonymous'::text else pr.handle end as handle,
         case when p.anonymous then '✟'::text else pr.avatar end as avatar,
         p.react_bat::bigint   as bat,
         p.react_fire::bigint  as fire,
         p.react_skull::bigint as skull,
         p.react_smoke::bigint as smoke,
         p.comment_count::bigint as comment_count,
         case when p.anonymous then null::text else pr.avatar_url end as avatar_url,
         p.event_id as event_id
  from public.posts p
    join public.profiles pr on pr.id = p.author_id
  where (select count(distinct reports.reporter_id) from public.reports
         where reports.target_kind = 'post' and reports.target_id = p.id) < 3;
