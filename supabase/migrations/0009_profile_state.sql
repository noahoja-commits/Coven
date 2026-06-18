-- Coven migration 0009 — per-user profile depth (graves, trackers, sigils, reflections).
-- Each feature is a small JSON blob the client updates wholesale; one owned row per (user, key).

create table if not exists public.profile_state (
  user_id    uuid not null references auth.users(id) on delete cascade,
  key        text not null,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.profile_state enable row level security;

drop policy if exists "own state read"   on public.profile_state;
drop policy if exists "own state insert" on public.profile_state;
drop policy if exists "own state update" on public.profile_state;
drop policy if exists "own state delete" on public.profile_state;

create policy "own state read"   on public.profile_state for select using (user_id = auth.uid());
create policy "own state insert" on public.profile_state for insert with check (user_id = auth.uid());
create policy "own state update" on public.profile_state for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own state delete" on public.profile_state for delete using (user_id = auth.uid());

grant select, insert, update, delete on public.profile_state to authenticated;
