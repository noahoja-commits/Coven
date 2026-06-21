-- Coven migration 0032 — broaden notifications: event RSVPs, crew joins, @mentions.
-- Same SECURITY DEFINER pattern as 0016 (clients can't forge). Web-push fires for free:
-- trg_notify_push (0022) already POSTs on every notifications insert.

-- RSVP -> notify the event host (skip self). Event name stashed in body (no event_id col).
create or replace function public.notify_on_rsvp() returns trigger
language plpgsql security definer set search_path = public as $$
declare host uuid; ename text;
begin
  select host_id, name into host, ename from public.events where id = new.event_id;
  if host is not null and host <> new.user_id then
    insert into public.notifications(user_id, actor_id, kind, body)
    values (host, new.user_id, 'rsvp', left(coalesce(ename, ''), 120));
  end if;
  return new;
end; $$;
drop trigger if exists trg_notify_rsvp on public.event_rsvps;
create trigger trg_notify_rsvp after insert on public.event_rsvps
  for each row execute function public.notify_on_rsvp();

-- Crew join -> notify the crew's creator (public conversations only; skip self).
create or replace function public.notify_on_crew_join() returns trigger
language plpgsql security definer set search_path = public as $$
declare creator uuid; ctitle text; pub boolean;
begin
  select created_by, title, is_public into creator, ctitle, pub
    from public.conversations where id = new.conversation_id;
  if pub is true and creator is not null and creator <> new.user_id then
    insert into public.notifications(user_id, actor_id, kind, conversation_id, body)
    values (creator, new.user_id, 'crew_join', new.conversation_id, left(coalesce(ctitle, ''), 120));
  end if;
  return new;
end; $$;
drop trigger if exists trg_notify_crew_join on public.conversation_members;
create trigger trg_notify_crew_join after insert on public.conversation_members
  for each row execute function public.notify_on_crew_join();

-- @mention -> notify each mentioned handle (skip anonymous posts + self; dedupe).
create or replace function public.notify_on_mention() returns trigger
language plpgsql security definer set search_path = public as $$
declare h text; target uuid;
begin
  if new.anonymous then return new; end if;
  for h in
    select distinct lower(m[1]) from regexp_matches(coalesce(new.body, ''), '@([a-zA-Z0-9_.]+)', 'g') as m
  loop
    select id into target from public.profiles where handle = h;
    if target is not null and target <> new.author_id then
      insert into public.notifications(user_id, actor_id, kind, post_id)
      values (target, new.author_id, 'mention', new.id);
    end if;
  end loop;
  return new;
end; $$;
drop trigger if exists trg_notify_mention on public.posts;
create trigger trg_notify_mention after insert on public.posts
  for each row execute function public.notify_on_mention();
