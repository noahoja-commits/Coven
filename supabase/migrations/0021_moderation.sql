-- Coven migration 0021 — moderation: block (two-way hide) + report.

create table if not exists public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
alter table public.blocks enable row level security;
drop policy if exists blocks_read   on public.blocks;
drop policy if exists blocks_insert on public.blocks;
drop policy if exists blocks_delete on public.blocks;
-- both parties can see the relationship (so each side can hide the other)
create policy blocks_read   on public.blocks for select using (blocker_id = auth.uid() or blocked_id = auth.uid());
create policy blocks_insert on public.blocks for insert with check (blocker_id = auth.uid());
create policy blocks_delete on public.blocks for delete using (blocker_id = auth.uid());
grant select, insert, delete on public.blocks to authenticated;

create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_kind text not null check (target_kind in ('post','user')),
  target_id   uuid not null,
  reason      text,
  created_at  timestamptz not null default now()
);
alter table public.reports enable row level security;
drop policy if exists reports_insert on public.reports;
drop policy if exists reports_read   on public.reports;
create policy reports_insert on public.reports for insert with check (reporter_id = auth.uid());
create policy reports_read   on public.reports for select using (reporter_id = auth.uid());
grant select, insert on public.reports to authenticated;

-- All user ids in a block relationship with me (either direction).
create or replace function public.my_blocked_ids()
returns table (id uuid)
language sql stable security definer set search_path = public as $$
  select blocked_id from public.blocks where blocker_id = auth.uid()
  union
  select blocker_id from public.blocks where blocked_id = auth.uid();
$$;
grant execute on function public.my_blocked_ids() to authenticated;
