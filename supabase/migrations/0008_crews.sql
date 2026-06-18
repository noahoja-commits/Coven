-- Coven migration 0008 — crews (public, joinable group spaces) on the DM infra.
-- A crew is a public group conversation with a glyph + description.

alter table public.conversations add column if not exists glyph       text;
alter table public.conversations add column if not exists description text;
alter table public.conversations add column if not exists is_public   boolean not null default false;

-- my_conversations: also return the crew glyph (appended column).
drop function if exists public.my_conversations();
create or replace function public.my_conversations()
returns table (
  id uuid, is_group boolean, title text, buried boolean,
  other_handle text, other_avatar text,
  last_body text, last_at timestamptz, unread int, glyph text
) language sql stable security definer set search_path = public as $$
  select
    c.id, c.is_group, c.title, cm.buried,
    o.handle, o.avatar,
    lm.body, lm.created_at,
    (select count(*)::int from public.messages_dm m
       where m.conversation_id = c.id and m.created_at > cm.last_read_at and m.sender_id <> auth.uid()) as unread,
    c.glyph
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

-- Public crew directory (anyone can browse) + whether the caller is in it.
create or replace function public.list_crews()
returns table (id uuid, name text, glyph text, description text, member_count int, is_member boolean)
language sql stable security definer set search_path = public as $$
  select c.id, c.title, c.glyph, c.description,
    (select count(*)::int from public.conversation_members m where m.conversation_id = c.id) as member_count,
    exists(select 1 from public.conversation_members m where m.conversation_id = c.id and m.user_id = auth.uid()) as is_member
  from public.conversations c
  where c.is_public = true
  order by member_count desc, c.created_at desc;
$$;

create or replace function public.create_crew(p_name text, p_glyph text, p_description text)
returns uuid language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); cid uuid;
begin
  if me is null then raise exception 'auth required'; end if;
  insert into public.conversations(is_group, is_public, title, glyph, description, created_by)
    values (true, true, coalesce(nullif(btrim(p_name), ''), 'a crew'), coalesce(nullif(p_glyph, ''), '✦'), coalesce(p_description, ''), me)
    returning id into cid;
  insert into public.conversation_members(conversation_id, user_id) values (cid, me);
  return cid;
end; $$;

create or replace function public.join_crew(p_conv uuid)
returns void language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'auth required'; end if;
  if not exists (select 1 from public.conversations where id = p_conv and is_public) then raise exception 'not a public crew'; end if;
  insert into public.conversation_members(conversation_id, user_id) values (p_conv, me) on conflict do nothing;
end; $$;

create or replace function public.leave_crew(p_conv uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.conversation_members where conversation_id = p_conv and user_id = auth.uid();
end; $$;

grant execute on function public.list_crews()              to authenticated;
grant execute on function public.create_crew(text,text,text) to authenticated;
grant execute on function public.join_crew(uuid)           to authenticated;
grant execute on function public.leave_crew(uuid)          to authenticated;
