-- DM message reactions — react (bat/fire/skull/smoke) to a single whisper.
-- Gated by conversation membership via the existing is_conv_member() helper (0004).

create table if not exists public.message_reactions (
  message_id uuid not null references public.messages_dm(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  kind       text not null check (kind in ('bat','fire','skull','smoke')),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, kind)
);

create index if not exists message_reactions_msg_idx on public.message_reactions(message_id);

alter table public.message_reactions enable row level security;

drop policy if exists mr_read   on public.message_reactions;
drop policy if exists mr_insert on public.message_reactions;
drop policy if exists mr_delete on public.message_reactions;

-- Read/insert only within a conversation you belong to (don't leak who's in a thread).
create policy mr_read on public.message_reactions for select
  using (public.is_conv_member(
    (select conversation_id from public.messages_dm where id = message_id), auth.uid()));

create policy mr_insert on public.message_reactions for insert
  with check (user_id = auth.uid() and public.is_conv_member(
    (select conversation_id from public.messages_dm where id = message_id), auth.uid()));

create policy mr_delete on public.message_reactions for delete
  using (user_id = auth.uid());

-- Live-update reaction chips for the other party.
alter publication supabase_realtime add table public.message_reactions;
