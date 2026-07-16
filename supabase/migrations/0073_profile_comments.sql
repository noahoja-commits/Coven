-- Coven migration 0073 — profile comments / testimonials wall (cross-user, MySpace-style).
--
-- Modeled on grave_tributes (0061): a cross-user "leave something on someone's profile" table.
-- Anyone can read a wall; you can only post AS yourself; the author OR the wall owner can delete
-- (owner moderates their own wall). A SECURITY DEFINER reader returns each comment with the
-- author's public handle/avatar so the client needs no ambiguous embed.

create table if not exists public.profile_comments (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles(id) on delete cascade,  -- whose wall
  author_id  uuid references public.profiles(id) on delete set null,          -- who wrote it
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists profile_comments_owner_idx on public.profile_comments(owner_id, created_at desc);

alter table public.profile_comments enable row level security;

drop policy if exists profile_comments_read   on public.profile_comments;
drop policy if exists profile_comments_insert on public.profile_comments;
drop policy if exists profile_comments_delete on public.profile_comments;
create policy profile_comments_read on public.profile_comments
  for select using (true); -- a profile wall is public, like grave tributes
create policy profile_comments_insert on public.profile_comments
  for insert to authenticated with check (author_id = (select auth.uid()));
create policy profile_comments_delete on public.profile_comments
  for delete to authenticated using (author_id = (select auth.uid()) or owner_id = (select auth.uid()));

grant select, insert, delete on public.profile_comments to authenticated;

-- Live wall updates (postgres_changes needs the table in the publication).
do $$ begin
  alter publication supabase_realtime add table public.profile_comments;
exception when duplicate_object then null; end $$;

-- Read a wall with author handle/avatar resolved (SECURITY DEFINER so the column-whitelisted
-- profiles table doesn't block the join).
create or replace function public.profile_wall(p_owner uuid)
returns table (id uuid, body text, created_at timestamptz, author_id uuid, author_handle text, author_avatar text, author_avatar_url text)
language sql stable security definer set search_path = public as $$
  select c.id, c.body, c.created_at, c.author_id, pr.handle, pr.avatar, pr.avatar_url
  from public.profile_comments c
  left join public.profiles pr on pr.id = c.author_id
  where c.owner_id = p_owner
  order by c.created_at desc
  limit 200
$$;
revoke all on function public.profile_wall(uuid) from public;
grant execute on function public.profile_wall(uuid) to authenticated;
