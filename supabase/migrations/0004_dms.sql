-- Coven migration 0004 — real multi-user direct messages (1:1 + group) + realtime.

create table if not exists public.conversations (
  id          uuid primary key default gen_random_uuid(),
  is_group    boolean not null default false,
  title       text,
  dm_key      text unique,                      -- "minId:maxId" for 1:1; null for groups
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  joined_at       timestamptz not null default now(),
  last_read_at    timestamptz not null default now(),
  buried          boolean not null default false,
  primary key (conversation_id, user_id)
);
create index if not exists conv_members_user_idx on public.conversation_members (user_id);

create table if not exists public.messages_dm (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid references public.profiles(id) on delete set null,
  body            text not null,
  created_at      timestamptz not null default now()
);
create index if not exists messages_dm_conv_idx on public.messages_dm (conversation_id, created_at);

-- Membership check as a SECURITY DEFINER fn to keep RLS policies simple (no recursion).
create or replace function public.is_conv_member(p_conv uuid, p_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.conversation_members where conversation_id = p_conv and user_id = p_uid);
$$;

alter table public.conversations        enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages_dm          enable row level security;

drop policy if exists conv_read   on public.conversations;
drop policy if exists cm_read     on public.conversation_members;
drop policy if exists cm_update   on public.conversation_members;
drop policy if exists msg_read    on public.messages_dm;
drop policy if exists msg_insert  on public.messages_dm;

create policy conv_read  on public.conversations        for select using (public.is_conv_member(id, auth.uid()));
create policy cm_read    on public.conversation_members for select using (public.is_conv_member(conversation_id, auth.uid()));
create policy cm_update  on public.conversation_members for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy msg_read   on public.messages_dm for select using (public.is_conv_member(conversation_id, auth.uid()));
create policy msg_insert on public.messages_dm for insert with check (sender_id = auth.uid() and public.is_conv_member(conversation_id, auth.uid()));
-- conversations / conversation_members are written only via the SECURITY DEFINER RPCs below.

-- 1:1: idempotent get-or-create by a sorted id pair.
create or replace function public.get_or_create_dm(p_other uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); k text; cid uuid;
begin
  if me is null or p_other is null or me = p_other then raise exception 'invalid dm'; end if;
  k := least(me::text, p_other::text) || ':' || greatest(me::text, p_other::text);
  select id into cid from public.conversations where dm_key = k;
  if cid is null then
    insert into public.conversations(is_group, dm_key, created_by) values (false, k, me) returning id into cid;
    insert into public.conversation_members(conversation_id, user_id) values (cid, me), (cid, p_other);
  end if;
  return cid;
end; $$;

create or replace function public.create_group(p_title text, p_members uuid[])
returns uuid language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); cid uuid; m uuid;
begin
  if me is null then raise exception 'auth required'; end if;
  insert into public.conversations(is_group, title, created_by)
    values (true, coalesce(nullif(btrim(p_title), ''), 'whisper circle'), me) returning id into cid;
  insert into public.conversation_members(conversation_id, user_id) values (cid, me);
  foreach m in array coalesce(p_members, '{}') loop
    if m <> me then
      insert into public.conversation_members(conversation_id, user_id) values (cid, m) on conflict do nothing;
    end if;
  end loop;
  return cid;
end; $$;

-- The whole inbox in one call: other party / title, last message, unread, buried.
create or replace function public.my_conversations()
returns table (
  id uuid, is_group boolean, title text, buried boolean,
  other_handle text, other_avatar text,
  last_body text, last_at timestamptz, unread int
) language sql stable security definer set search_path = public as $$
  select
    c.id, c.is_group, c.title, cm.buried,
    o.handle, o.avatar,
    lm.body, lm.created_at,
    (select count(*)::int from public.messages_dm m
       where m.conversation_id = c.id and m.created_at > cm.last_read_at and m.sender_id <> auth.uid()) as unread
  from public.conversations c
  join public.conversation_members cm on cm.conversation_id = c.id and cm.user_id = auth.uid()
  left join lateral (
    select p.handle, p.avatar from public.conversation_members m2
    join public.profiles p on p.id = m2.user_id
    where m2.conversation_id = c.id and m2.user_id <> auth.uid()
    order by m2.joined_at limit 1
  ) o on not c.is_group
  left join lateral (
    select body, created_at from public.messages_dm
    where conversation_id = c.id order by created_at desc limit 1
  ) lm on true
  order by lm.created_at desc nulls last;
$$;

grant execute on function public.get_or_create_dm(uuid)   to authenticated;
grant execute on function public.create_group(text, uuid[]) to authenticated;
grant execute on function public.my_conversations()        to authenticated;

-- Realtime for live message delivery (RLS still applies to what each client receives).
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'messages_dm') then
    alter publication supabase_realtime add table public.messages_dm;
  end if;
end $$;
