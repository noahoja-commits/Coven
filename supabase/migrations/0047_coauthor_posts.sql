-- Co-signed posts: tag a co-author ("with @handle"); they get a 'coauthor' notification
-- (which also web-pushes via the existing trg_notify_push on notifications inserts).
-- Never on anonymous posts (would unmask). Co-author handle exposed via the feed view.

alter table public.posts add column if not exists coauthor_id uuid references public.profiles(id) on delete set null;
create index if not exists posts_coauthor_idx on public.posts(coauthor_id) where coauthor_id is not null;

create or replace function public.notify_on_coauthor() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if new.coauthor_id is not null and new.coauthor_id <> new.author_id and not new.anonymous then
    insert into public.notifications(user_id, actor_id, kind, post_id, body)
    values (new.coauthor_id, new.author_id, 'coauthor', new.id, left(coalesce(new.body, ''), 120));
  end if;
  return new;
end; $$;
drop trigger if exists trg_notify_coauthor on public.posts;
create trigger trg_notify_coauthor after insert on public.posts
  for each row execute function public.notify_on_coauthor();

-- Re-emit the feed view (0046 shape) with coauthor_id + coauthor_handle appended,
-- both masked for anonymous posts. Stays a definer view, counts denormalized.
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
  where (select count(distinct reports.reporter_id) from public.reports
         where reports.target_kind = 'post' and reports.target_id = p.id) < 3;
