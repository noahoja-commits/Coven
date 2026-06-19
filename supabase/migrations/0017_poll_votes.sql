-- Coven migration 0017 — persistent poll votes (were optimistic-only, lost on reload).
-- One vote per user per poll; changing your pick updates the row.

create table if not exists public.poll_votes (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  option_id  text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.poll_votes enable row level security;
drop policy if exists poll_read   on public.poll_votes;
drop policy if exists poll_insert on public.poll_votes;
drop policy if exists poll_update on public.poll_votes;
drop policy if exists poll_delete on public.poll_votes;
create policy poll_read   on public.poll_votes for select using (true);
create policy poll_insert on public.poll_votes for insert with check (user_id = auth.uid());
create policy poll_update on public.poll_votes for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy poll_delete on public.poll_votes for delete using (user_id = auth.uid());
grant select, insert, update, delete on public.poll_votes to authenticated;

create or replace view public.poll_tallies as
  select post_id, option_id, count(*)::int as votes
  from public.poll_votes
  group by post_id, option_id;
grant select on public.poll_tallies to anon, authenticated;
