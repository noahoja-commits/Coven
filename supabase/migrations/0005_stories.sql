-- Coven migration 0005 — ephemeral stories (24h).

create table if not exists public.stories (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references public.profiles(id) on delete cascade,
  glyph       text not null default '✦',
  caption     text not null default '',
  bg          text not null default 'red',
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '24 hours'
);
create index if not exists stories_active_idx on public.stories (expires_at);
create index if not exists stories_author_idx on public.stories (author_id, created_at);

create or replace view public.active_stories as
select s.id, s.author_id, s.glyph, s.caption, s.bg, s.created_at, s.expires_at,
       p.handle, p.avatar
from public.stories s
join public.profiles p on p.id = s.author_id
where s.expires_at > now();
grant select on public.active_stories to anon, authenticated;

alter table public.stories enable row level security;
drop policy if exists stories_read   on public.stories;
drop policy if exists stories_insert on public.stories;
drop policy if exists stories_delete on public.stories;
create policy stories_read   on public.stories for select using (true);
create policy stories_insert on public.stories for insert with check (author_id = auth.uid());
create policy stories_delete on public.stories for delete using (author_id = auth.uid());
