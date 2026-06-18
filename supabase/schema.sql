-- Coven — multi-user MVP schema (Supabase / Postgres)
-- Apply in the Supabase SQL editor (or via the Supabase MCP) on a NEW project.
-- Entities: profiles, posts, comments, reactions, follows + feed_posts view.
-- Security boundary = anon key + RLS. NEVER ship the service_role key to the client.

-- ───────────────────────────────────────────────────────────────────────────
-- PROFILES  (id = auth.users.id — the canonical identity)
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  handle      text not null,
  avatar      text not null default '✦',
  pronouns    text default '',
  bio         text default '',
  city        text default '',
  birthday    date,
  tags        text[] not null default '{}',
  scenes      text[] not null default '{}',
  is_system   boolean not null default false,
  created_at  timestamptz not null default now(),
  constraint profiles_handle_format check (handle ~ '^[a-z0-9_.]{2,20}$')
);
-- Case-insensitive handle uniqueness (Lilith_XIV and lilith_xiv collide)
create unique index if not exists profiles_handle_lower_key
  on public.profiles (lower(handle));

-- ───────────────────────────────────────────────────────────────────────────
-- POSTS
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references public.profiles(id) on delete cascade,
  kind        text not null default 'text',          -- text|photo|event|poll|repost
  body        text default '',
  community   text not null default 'general',        -- slug; communities stay static seed
  anonymous   boolean not null default false,
  img         text,
  event       jsonb,
  poll        jsonb,
  quoted      jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_idx      on public.posts (author_id);
create index if not exists posts_community_idx    on public.posts (community, created_at desc);

-- ───────────────────────────────────────────────────────────────────────────
-- COMMENTS  (single-level nesting — UI groups replies by parent_id)
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  parent_id   uuid references public.comments(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_id, created_at);

-- ───────────────────────────────────────────────────────────────────────────
-- REACTIONS  (idempotent: toggle = insert/delete)
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.reactions (
  post_id     uuid not null references public.posts(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  kind        text not null check (kind in ('bat','fire','skull','smoke')),
  created_at  timestamptz not null default now(),
  primary key (post_id, user_id, kind)
);
create index if not exists reactions_post_idx on public.reactions (post_id);

-- ───────────────────────────────────────────────────────────────────────────
-- FOLLOWS
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  followee_id  uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, followee_id),
  constraint follows_no_self check (follower_id <> followee_id)
);
create index if not exists follows_followee_idx on public.follows (followee_id);

-- ───────────────────────────────────────────────────────────────────────────
-- FEED VIEW  (the ONLY public read path for posts)
-- SECURITY DEFINER (default view behaviour, owned by postgres) so it can read
-- all posts while the base table stays locked to owners — and it NULLS the
-- author identity for anonymous posts so the real author never leaks.
-- ───────────────────────────────────────────────────────────────────────────
create or replace view public.feed_posts as
select
  p.id,
  p.kind,
  p.body,
  p.community,
  p.anonymous,
  p.img,
  p.event,
  p.poll,
  p.quoted,
  p.created_at,
  case when p.anonymous then null        else p.author_id end as author_id_public,
  case when p.anonymous then 'anonymous' else pr.handle  end as handle,
  case when p.anonymous then '✟'          else pr.avatar  end as avatar,
  coalesce(r.bat,   0) as bat,
  coalesce(r.fire,  0) as fire,
  coalesce(r.skull, 0) as skull,
  coalesce(r.smoke, 0) as smoke,
  coalesce(c.cnt,   0) as comment_count
from public.posts p
join public.profiles pr on pr.id = p.author_id
left join (
  select post_id,
         count(*) filter (where kind = 'bat')   as bat,
         count(*) filter (where kind = 'fire')  as fire,
         count(*) filter (where kind = 'skull') as skull,
         count(*) filter (where kind = 'smoke') as smoke
  from public.reactions
  group by post_id
) r on r.post_id = p.id
left join (
  select post_id, count(*) as cnt
  from public.comments
  group by post_id
) c on c.post_id = p.id;

grant select on public.feed_posts to anon, authenticated;

-- ───────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ───────────────────────────────────────────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.posts     enable row level security;
alter table public.comments  enable row level security;
alter table public.reactions enable row level security;
alter table public.follows   enable row level security;

-- profiles: world-readable; write only your own row
drop policy if exists profiles_read   on public.profiles;
drop policy if exists profiles_insert on public.profiles;
drop policy if exists profiles_update on public.profiles;
create policy profiles_read   on public.profiles for select using (true);
create policy profiles_insert on public.profiles for insert with check (id = auth.uid());
create policy profiles_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- posts: DIRECT reads limited to your own rows (insert-returning + ownership);
-- everyone reads the feed/others via the feed_posts view, which hides anon identity.
drop policy if exists posts_read   on public.posts;
drop policy if exists posts_insert on public.posts;
drop policy if exists posts_delete on public.posts;
create policy posts_read   on public.posts for select using (author_id = auth.uid());
create policy posts_insert on public.posts for insert with check (author_id = auth.uid());
create policy posts_delete on public.posts for delete using (author_id = auth.uid());

-- comments: world-readable; insert/delete your own
drop policy if exists comments_read   on public.comments;
drop policy if exists comments_insert on public.comments;
drop policy if exists comments_delete on public.comments;
create policy comments_read   on public.comments for select using (true);
create policy comments_insert on public.comments for insert with check (author_id = auth.uid());
create policy comments_delete on public.comments for delete using (author_id = auth.uid());

-- reactions: world-readable (counts); insert/delete your own
drop policy if exists reactions_read   on public.reactions;
drop policy if exists reactions_insert on public.reactions;
drop policy if exists reactions_delete on public.reactions;
create policy reactions_read   on public.reactions for select using (true);
create policy reactions_insert on public.reactions for insert with check (user_id = auth.uid());
create policy reactions_delete on public.reactions for delete using (user_id = auth.uid());

-- follows: world-readable; insert/delete only as the follower
drop policy if exists follows_read   on public.follows;
drop policy if exists follows_insert on public.follows;
drop policy if exists follows_delete on public.follows;
create policy follows_read   on public.follows for select using (true);
create policy follows_insert on public.follows for insert with check (follower_id = auth.uid());
create policy follows_delete on public.follows for delete using (follower_id = auth.uid());

-- ───────────────────────────────────────────────────────────────────────────
-- RPC: comments for a post, joined to author handle/avatar (public read).
-- Lets the client load a thread in one call with display fields.
-- ───────────────────────────────────────────────────────────────────────────
create or replace function public.post_comments(p_post_id uuid)
returns table (
  id uuid, post_id uuid, author_id uuid, parent_id uuid,
  body text, created_at timestamptz, handle text, avatar text
)
language sql stable security definer set search_path = public as $$
  select c.id, c.post_id, c.author_id, c.parent_id, c.body, c.created_at,
         pr.handle, pr.avatar
  from public.comments c
  join public.profiles pr on pr.id = c.author_id
  where c.post_id = p_post_id
  order by c.created_at asc
$$;
grant execute on function public.post_comments(uuid) to anon, authenticated;
