-- Pre-launch scaling (40k): the feed_posts view re-aggregated the ENTIRE reactions
-- and comments tables (GROUP BY) on every feed read. Denormalize per-post counts onto
-- posts, maintain them with triggers, backfill, and rewrite the view to just read them.
-- The client (hydratePost) already reads bat/fire/skull/smoke/comment_count by name —
-- no app change. feed_posts stays owner=postgres with NO security_invoker so it keeps
-- bypassing the own-read-only RLS on posts (it's the public, anon-masking read path).

-- 1) Denormalized count columns.
alter table public.posts
  add column if not exists react_bat     integer not null default 0,
  add column if not exists react_fire    integer not null default 0,
  add column if not exists react_skull   integer not null default 0,
  add column if not exists react_smoke   integer not null default 0,
  add column if not exists comment_count integer not null default 0;

-- 2) Trigger: keep reaction counts current (reactions are insert/delete only — one row
--    per (post,user,kind), so no UPDATE path).
create or replace function public.posts_reaction_count() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  pid   uuid := coalesce(NEW.post_id, OLD.post_id);
  k     text := coalesce(NEW.kind, OLD.kind);
  delta int  := case when TG_OP = 'INSERT' then 1 else -1 end;
begin
  update public.posts set
    react_bat   = greatest(0, react_bat   + (case when k = 'bat'   then delta else 0 end)),
    react_fire  = greatest(0, react_fire  + (case when k = 'fire'  then delta else 0 end)),
    react_skull = greatest(0, react_skull + (case when k = 'skull' then delta else 0 end)),
    react_smoke = greatest(0, react_smoke + (case when k = 'smoke' then delta else 0 end))
  where id = pid;
  return null;
end;
$$;
drop trigger if exists trg_reaction_count on public.reactions;
create trigger trg_reaction_count after insert or delete on public.reactions
  for each row execute function public.posts_reaction_count();

-- 3) Trigger: keep comment counts current.
create or replace function public.posts_comment_count() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = NEW.post_id;
  else
    update public.posts set comment_count = greatest(0, comment_count - 1) where id = OLD.post_id;
  end if;
  return null;
end;
$$;
drop trigger if exists trg_comment_count on public.comments;
create trigger trg_comment_count after insert or delete on public.comments
  for each row execute function public.posts_comment_count();

-- 4) Backfill (absolute SET — overwrites anything the triggers did during this txn).
update public.posts p set
  react_bat     = (select count(*) from public.reactions r where r.post_id = p.id and r.kind = 'bat'),
  react_fire    = (select count(*) from public.reactions r where r.post_id = p.id and r.kind = 'fire'),
  react_skull   = (select count(*) from public.reactions r where r.post_id = p.id and r.kind = 'skull'),
  react_smoke   = (select count(*) from public.reactions r where r.post_id = p.id and r.kind = 'smoke'),
  comment_count = (select count(*) from public.comments  c where c.post_id = p.id);

-- 5) Support the feed view's report auto-hide check (was a seq scan per post).
create index if not exists reports_target_idx on public.reports(target_kind, target_id);

-- 6) Rewrite feed_posts to READ the columns (no aggregation). Same column names/order/types
--    (counts cast to bigint to match the prior view) so CREATE OR REPLACE succeeds. No
--    security_invoker → stays a definer view (bypasses posts own-read RLS), anon still masked.
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
         case when p.anonymous then null::text else pr.avatar_url end as avatar_url
  from public.posts p
    join public.profiles pr on pr.id = p.author_id
  where (select count(distinct reports.reporter_id) from public.reports
         where reports.target_kind = 'post' and reports.target_id = p.id) < 3;
