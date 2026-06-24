-- Who's-going mutuals: surface YOUR mutuals (you follow them AND they follow you)
-- in an event's attendee list — flagged + ordered first. Extends event_attendees
-- with an is_mutual flag relative to the caller. SECURITY DEFINER (reads the follow
-- graph, which is otherwise locked to own edges) but only emits a boolean per attendee.

create or replace function public.event_attendees_with_mutuals(p_event_id uuid)
returns table(user_id uuid, handle text, avatar text, created_at timestamptz, is_mutual boolean)
language sql stable security definer set search_path = public as $$
  with me as (select (select auth.uid()) as uid),
       my_following as (select f.followee_id from public.follows f, me where f.follower_id = me.uid),
       my_followers as (select f.follower_id from public.follows f, me where f.followee_id = me.uid)
  select rs.user_id, pr.handle, pr.avatar, rs.created_at,
         (rs.user_id in (select followee_id from my_following)
          and rs.user_id in (select follower_id from my_followers)) as is_mutual
  from public.event_rsvps rs
  join public.profiles pr on pr.id = rs.user_id
  where rs.event_id = p_event_id
  order by is_mutual desc, rs.created_at desc
$$;
grant execute on function public.event_attendees_with_mutuals(uuid) to authenticated;
