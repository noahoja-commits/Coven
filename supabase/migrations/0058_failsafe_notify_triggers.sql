-- Coven migration 0058 — make notification/push triggers fail-safe.
--
-- BUG: sending a DM (and posting/commenting/following/etc.) runs in ONE transaction with the
-- AFTER INSERT notification triggers. If a notification side-effect RAISES, the whole core write
-- is rolled back. Two unguarded raise points were:
--   * notify_push()  — `perform net.http_post(...)` raises if pg_net's `net` schema is unavailable.
--   * notify_on_dm() — the `insert into notifications` (and siblings) can raise on any DB hiccup.
-- The client swallowed the error, so the user just saw "whisper didn't send" forever.
--
-- FIX: notifications + web-push are BEST-EFFORT. Wrap each trigger's side-effect in
-- `begin … exception when others then null; end;` so a notification failure is skipped, never fatal
-- to the user's action. Purely additive — bodies are otherwise byte-for-byte the originals, so this
-- can only PREVENT rollbacks, never introduce a new failure. Core RLS write policies are untouched.

-- web push (0022) — fire-and-forget POST must never break the notification insert
create or replace function public.notify_push() returns trigger
language plpgsql security definer set search_path = public, net, extensions as $$
declare url text; secret text;
begin
  select value into url    from public.app_config where key = 'push_url';
  select value into secret from public.app_config where key = 'push_secret';
  if url is not null and url <> '' then
    begin
      perform net.http_post(
        url := url,
        body := jsonb_build_object('notification_id', NEW.id),
        headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', coalesce(secret, ''))
      );
    exception when others then
      null; -- push is best-effort; a missing net schema / down endpoint must not break the insert
    end;
  end if;
  return NEW;
end; $$;

-- follow -> notify the followee (0016)
create or replace function public.notify_on_follow() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  begin
    insert into public.notifications(user_id, actor_id, kind)
    values (new.followee_id, new.follower_id, 'follow');
  exception when others then null; end;
  return new;
end; $$;

-- reaction -> notify the post's author (0016)
create or replace function public.notify_on_reaction() returns trigger
language plpgsql security definer set search_path = public as $$
declare author uuid;
begin
  begin
    select author_id into author from public.posts where id = new.post_id;
    if author is not null and author <> new.user_id then
      insert into public.notifications(user_id, actor_id, kind, post_id, reaction)
      values (author, new.user_id, 'react', new.post_id, new.kind);
    end if;
  exception when others then null; end;
  return new;
end; $$;

-- comment -> notify the post's author (0016)
create or replace function public.notify_on_comment() returns trigger
language plpgsql security definer set search_path = public as $$
declare author uuid;
begin
  begin
    select author_id into author from public.posts where id = new.post_id;
    if author is not null and author <> new.author_id then
      insert into public.notifications(user_id, actor_id, kind, post_id, body)
      values (author, new.author_id, 'comment', new.post_id, left(coalesce(new.body, ''), 120));
    end if;
  exception when others then null; end;
  return new;
end; $$;

-- DM -> notify the other members; skip public crews (0016)
create or replace function public.notify_on_dm() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.conversations c where c.id = new.conversation_id and c.is_public) then
    return new;
  end if;
  begin
    insert into public.notifications(user_id, actor_id, kind, conversation_id, body)
    select cm.user_id, new.sender_id, 'dm', new.conversation_id, left(coalesce(new.body, ''), 120)
    from public.conversation_members cm
    where cm.conversation_id = new.conversation_id and cm.user_id <> new.sender_id;
  exception when others then null; end;
  return new;
end; $$;

-- story reaction -> notify the story's author (0020)
create or replace function public.notify_on_story_reaction() returns trigger
language plpgsql security definer set search_path = public as $$
declare author uuid;
begin
  begin
    select author_id into author from public.stories where id = new.story_id;
    if author is not null and author <> new.user_id then
      insert into public.notifications(user_id, actor_id, kind, reaction)
      values (author, new.user_id, 'story_react', new.kind);
    end if;
  exception when others then null; end;
  return new;
end; $$;

-- RSVP -> notify the event host (0032)
create or replace function public.notify_on_rsvp() returns trigger
language plpgsql security definer set search_path = public as $$
declare host uuid; ename text;
begin
  begin
    select host_id, name into host, ename from public.events where id = new.event_id;
    if host is not null and host <> new.user_id then
      insert into public.notifications(user_id, actor_id, kind, body)
      values (host, new.user_id, 'rsvp', left(coalesce(ename, ''), 120));
    end if;
  exception when others then null; end;
  return new;
end; $$;

-- crew join -> notify the crew's creator (public conversations only) (0032)
create or replace function public.notify_on_crew_join() returns trigger
language plpgsql security definer set search_path = public as $$
declare creator uuid; ctitle text; pub boolean;
begin
  begin
    select created_by, title, is_public into creator, ctitle, pub
      from public.conversations where id = new.conversation_id;
    if pub is true and creator is not null and creator <> new.user_id then
      insert into public.notifications(user_id, actor_id, kind, conversation_id, body)
      values (creator, new.user_id, 'crew_join', new.conversation_id, left(coalesce(ctitle, ''), 120));
    end if;
  exception when others then null; end;
  return new;
end; $$;

-- @mention -> notify each mentioned handle (skip anon + self; dedupe) (0032)
create or replace function public.notify_on_mention() returns trigger
language plpgsql security definer set search_path = public as $$
declare h text; target uuid;
begin
  if new.anonymous then return new; end if;
  begin
    for h in
      select distinct lower(m[1]) from regexp_matches(coalesce(new.body, ''), '@([a-zA-Z0-9_.]+)', 'g') as m
    loop
      select id into target from public.profiles where handle = h;
      if target is not null and target <> new.author_id then
        insert into public.notifications(user_id, actor_id, kind, post_id)
        values (target, new.author_id, 'mention', new.id);
      end if;
    end loop;
  exception when others then null; end;
  return new;
end; $$;

-- co-author -> notify the tagged co-author (0047)
create or replace function public.notify_on_coauthor() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  begin
    if new.coauthor_id is not null and new.coauthor_id <> new.author_id and not new.anonymous then
      insert into public.notifications(user_id, actor_id, kind, post_id, body)
      values (new.coauthor_id, new.author_id, 'coauthor', new.id, left(coalesce(new.body, ''), 120));
    end if;
  exception when others then null; end;
  return new;
end; $$;
