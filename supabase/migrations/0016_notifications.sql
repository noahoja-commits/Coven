-- Coven migration 0016 — real cross-user notifications.
-- Auto-created by SECURITY DEFINER triggers on follows/reactions/comments/DMs,
-- so they can't be forged by clients (no client INSERT policy).

create table if not exists public.notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,  -- recipient
  actor_id        uuid references public.profiles(id) on delete cascade,      -- who did it
  kind            text not null,                                              -- follow|react|comment|dm
  post_id         uuid references public.posts(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  reaction        text,
  body            text,
  read            boolean not null default false,
  created_at      timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;
drop policy if exists notif_read   on public.notifications;
drop policy if exists notif_update on public.notifications;
drop policy if exists notif_delete on public.notifications;
create policy notif_read   on public.notifications for select using (user_id = auth.uid());
create policy notif_update on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notif_delete on public.notifications for delete using (user_id = auth.uid());
grant select, update, delete on public.notifications to authenticated;

-- follow -> notify the followee
create or replace function public.notify_on_follow() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications(user_id, actor_id, kind)
  values (new.followee_id, new.follower_id, 'follow');
  return new;
end; $$;
drop trigger if exists trg_notify_follow on public.follows;
create trigger trg_notify_follow after insert on public.follows
  for each row execute function public.notify_on_follow();

-- reaction -> notify the post's author (skip self)
create or replace function public.notify_on_reaction() returns trigger
language plpgsql security definer set search_path = public as $$
declare author uuid;
begin
  select author_id into author from public.posts where id = new.post_id;
  if author is not null and author <> new.user_id then
    insert into public.notifications(user_id, actor_id, kind, post_id, reaction)
    values (author, new.user_id, 'react', new.post_id, new.kind);
  end if;
  return new;
end; $$;
drop trigger if exists trg_notify_reaction on public.reactions;
create trigger trg_notify_reaction after insert on public.reactions
  for each row execute function public.notify_on_reaction();

-- comment -> notify the post's author (skip self)
create or replace function public.notify_on_comment() returns trigger
language plpgsql security definer set search_path = public as $$
declare author uuid;
begin
  select author_id into author from public.posts where id = new.post_id;
  if author is not null and author <> new.author_id then
    insert into public.notifications(user_id, actor_id, kind, post_id, body)
    values (author, new.author_id, 'comment', new.post_id, left(coalesce(new.body, ''), 120));
  end if;
  return new;
end; $$;
drop trigger if exists trg_notify_comment on public.comments;
create trigger trg_notify_comment after insert on public.comments
  for each row execute function public.notify_on_comment();

-- DM -> notify the other members (skip the sender; skip public crews to avoid spam)
create or replace function public.notify_on_dm() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.conversations c where c.id = new.conversation_id and c.is_public) then
    return new;
  end if;
  insert into public.notifications(user_id, actor_id, kind, conversation_id, body)
  select cm.user_id, new.sender_id, 'dm', new.conversation_id, left(coalesce(new.body, ''), 120)
  from public.conversation_members cm
  where cm.conversation_id = new.conversation_id and cm.user_id <> new.sender_id;
  return new;
end; $$;
drop trigger if exists trg_notify_dm on public.messages_dm;
create trigger trg_notify_dm after insert on public.messages_dm
  for each row execute function public.notify_on_dm();

-- Inbox, joined with the actor's profile for display.
create or replace function public.my_notifications()
returns table (
  id uuid, kind text, actor_handle text, actor_avatar text, actor_avatar_url text,
  post_id uuid, conversation_id uuid, reaction text, body text, read boolean, created_at timestamptz
) language sql stable security definer set search_path = public as $$
  select n.id, n.kind, p.handle, p.avatar, p.avatar_url,
         n.post_id, n.conversation_id, n.reaction, n.body, n.read, n.created_at
  from public.notifications n
  left join public.profiles p on p.id = n.actor_id
  where n.user_id = auth.uid()
  order by n.created_at desc
  limit 100;
$$;
grant execute on function public.my_notifications() to authenticated;

-- Realtime delivery (RLS scopes the stream to the recipient).
do $$ begin
  begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end;
end $$;
