-- Coven migration 0055 — scheduled posts.
-- A post may carry a future scheduled_at; feed_posts hides it until it's due, then
-- the schedule-posts cron clears scheduled_at + bumps created_at so it lands fresh.

alter table public.posts add column if not exists scheduled_at timestamptz;
create index if not exists posts_scheduled_idx on public.posts(scheduled_at) where scheduled_at is not null;

-- Re-emit feed_posts (0047 shape, identical columns) with one added WHERE clause:
-- future-scheduled posts stay hidden until scheduled_at <= now() (so they appear
-- on time even if the publishing cron is late).
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
         p.event_id as event_id,
         case when p.anonymous then null::uuid else p.coauthor_id end as coauthor_id,
         case when p.anonymous then null::text else cpr.handle end as coauthor_handle
  from public.posts p
    join public.profiles pr on pr.id = p.author_id
    left join public.profiles cpr on cpr.id = p.coauthor_id
  where (p.scheduled_at is null or p.scheduled_at <= now())
    and (select count(distinct reports.reporter_id) from public.reports
         where reports.target_kind = 'post' and reports.target_id = p.id) < 3;
