-- Expose the other party's avatar_url through my_conversations so DM lists/threads
-- can show profile photos.
drop function if exists public.my_conversations();
create or replace function public.my_conversations()
returns table (
  id uuid, is_group boolean, title text, buried boolean,
  other_handle text, other_avatar text,
  last_body text, last_at timestamptz, unread int, glyph text, other_avatar_url text
) language sql stable security definer set search_path = public as $$
  select
    c.id, c.is_group, c.title, cm.buried,
    o.handle, o.avatar,
    lm.body, lm.created_at,
    (select count(*)::int from public.messages_dm m
       where m.conversation_id = c.id and m.created_at > cm.last_read_at and m.sender_id <> auth.uid()) as unread,
    c.glyph, o.avatar_url
  from public.conversations c
  join public.conversation_members cm on cm.conversation_id = c.id and cm.user_id = auth.uid()
  left join lateral (
    select p.handle, p.avatar, p.avatar_url from public.conversation_members m2
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
grant execute on function public.my_conversations() to authenticated;
