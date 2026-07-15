-- 0067: admin core — multi-admin roles, presence, moderation tooling, richer notifications.
--
-- 1) admin_users table (replaces the single app_config admin_user_id as the source of truth;
--    the app_config row is kept as a legacy fallback for the report trigger).
-- 2) presence heartbeat table — own-row write only; admins read via a gated RPC. Deliberately
--    NOT a profiles column: last-seen must never be readable by regular users (ghost mode).
-- 3) Moderation: reports gain resolved_at/resolved_by; admin-gated SECURITY DEFINER RPCs to
--    read the queue, resolve reports, and remove any post/comment/event.
-- 4) Report notifications now fan out to ALL admins (0066 notified one).
-- 5) New notification kinds (trigger-minted per the 0066 pattern, never client-inserted):
--    ticket_sale (→ event host), event_change / event_cancelled (→ RSVPs + ticket holders).

-- ── 1) admins ────────────────────────────────────────────────────────────────
create table if not exists public.admin_users (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
drop policy if exists admin_users_read_own on public.admin_users;
create policy admin_users_read_own on public.admin_users
  for select using (user_id = (select auth.uid()));
-- No client write policies: membership changes happen via SQL / service role only.

insert into public.admin_users (user_id)
select id from auth.users where email in ('noahoja@gmail.com', 'colinhealey941@gmail.com')
on conflict (user_id) do nothing;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.admin_users where user_id = auth.uid()) $$;

-- ── 2) presence ──────────────────────────────────────────────────────────────
create table if not exists public.presence (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  ua           text
);
alter table public.presence enable row level security;
drop policy if exists presence_insert_own on public.presence;
drop policy if exists presence_update_own on public.presence;
drop policy if exists presence_read_own   on public.presence;
create policy presence_insert_own on public.presence
  for insert with check (user_id = (select auth.uid()));
create policy presence_update_own on public.presence
  for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy presence_read_own on public.presence
  for select using (user_id = (select auth.uid())); -- upsert round-trip only; admins use the RPC

-- Admin roster: everyone with a heartbeat, newest first, with ban state from auth.users.
create or replace function public.admin_presence()
returns table (user_id uuid, handle text, avatar text, avatar_url text,
               last_seen_at timestamptz, ua text, joined_at timestamptz,
               banned_until timestamptz, is_admin_user boolean)
language sql stable security definer set search_path = public as $$
  select p.user_id, pr.handle, pr.avatar, pr.avatar_url,
         p.last_seen_at, p.ua, pr.created_at,
         u.banned_until, exists (select 1 from public.admin_users a where a.user_id = p.user_id)
  from public.presence p
  join public.profiles pr on pr.id = p.user_id
  join auth.users u on u.id = p.user_id
  where public.is_admin()
  order by p.last_seen_at desc
  limit 200
$$;

-- ── 3) moderation ────────────────────────────────────────────────────────────
alter table public.reports add column if not exists resolved_at timestamptz;
alter table public.reports add column if not exists resolved_by uuid references public.profiles(id);

-- Open-reports queue with a content preview. Gated inside (empty for non-admins).
create or replace function public.admin_reports()
returns table (id uuid, target_kind text, target_id uuid, reason text, created_at timestamptz,
               report_count bigint, preview text, target_handle text)
language sql stable security definer set search_path = public as $$
  select r.id, r.target_kind, r.target_id, r.reason, r.created_at,
         (select count(distinct r2.reporter_id) from public.reports r2
            where r2.target_kind = r.target_kind and r2.target_id = r.target_id),
         case
           when r.target_kind = 'post' then (select left(coalesce(p.body, '(no text)'), 140) from public.posts p where p.id = r.target_id)
           when r.target_kind = 'user' then (select left(coalesce(pr.bio, '(no bio)'), 140) from public.profiles pr where pr.id = r.target_id)
         end,
         case
           when r.target_kind = 'post' then (select pr.handle from public.posts p join public.profiles pr on pr.id = p.author_id where p.id = r.target_id)
           when r.target_kind = 'user' then (select pr.handle from public.profiles pr where pr.id = r.target_id)
         end
  from public.reports r
  where public.is_admin() and r.resolved_at is null
  order by r.created_at desc
  limit 100
$$;

create or replace function public.admin_resolve_report(p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then return false; end if;
  update public.reports set resolved_at = now(), resolved_by = auth.uid() where id = p_id;
  return true;
end $$;

create or replace function public.admin_remove_post(p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then return false; end if;
  delete from public.posts where id = p_id;
  return true;
end $$;

create or replace function public.admin_remove_comment(p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then return false; end if;
  delete from public.comments where id = p_id;
  return true;
end $$;

create or replace function public.admin_remove_event(p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then return false; end if;
  delete from public.events where id = p_id;
  return true;
end $$;

-- ── 4) report alert → ALL admins ─────────────────────────────────────────────
create or replace function public.notify_on_report()
returns trigger language plpgsql security definer set search_path = public as $$
declare a record; legacy uuid; notified boolean := false;
begin
  begin
    for a in select user_id from public.admin_users loop
      insert into public.notifications (user_id, actor_id, kind, body)
      values (a.user_id, new.reporter_id, 'report', left(new.target_kind || ' · ' || coalesce(new.reason, ''), 160));
      notified := true;
    end loop;
    if not notified then -- pre-seed fallback: the 0066 single admin
      select value::uuid into legacy from public.app_config where key = 'admin_user_id';
      if legacy is not null then
        insert into public.notifications (user_id, actor_id, kind, body)
        values (legacy, new.reporter_id, 'report', left(new.target_kind || ' · ' || coalesce(new.reason, ''), 160));
      end if;
    end if;
  exception when others then null; -- never block the report itself
  end;
  return new;
end $$;
-- (trigger from 0066 already points at notify_on_report(); replacing the function is enough)

-- ── 5) new notification kinds ────────────────────────────────────────────────
-- Ticket sold → the host. actor = buyer, body = event name.
create or replace function public.notify_on_ticket_sale()
returns trigger language plpgsql security definer set search_path = public as $$
declare h uuid; ev_name text;
begin
  begin
    select host_id, name into h, ev_name from public.events where id = new.event_id;
    if h is not null and h <> new.buyer_id then
      insert into public.notifications (user_id, actor_id, kind, body)
      values (h, new.buyer_id, 'ticket_sale', left(coalesce(ev_name, 'your rite'), 160));
    end if;
  exception when others then null;
  end;
  return new;
end $$;
drop trigger if exists trg_notify_ticket_sale on public.tickets;
create trigger trg_notify_ticket_sale
  after insert on public.tickets
  for each row when (new.status = 'paid')
  execute function public.notify_on_ticket_sale();

-- Event details changed → everyone going (RSVPs + paid ticket holders), not the host.
create or replace function public.notify_on_event_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare who record;
begin
  begin
    for who in
      select user_id from public.event_rsvps where event_id = new.id
      union
      select buyer_id from public.tickets where event_id = new.id and status = 'paid'
    loop
      if who.user_id <> new.host_id then
        insert into public.notifications (user_id, actor_id, kind, body)
        values (who.user_id, new.host_id, 'event_change', left(coalesce(new.name, 'a rite'), 160));
      end if;
    end loop;
  exception when others then null;
  end;
  return new;
end $$;
drop trigger if exists trg_notify_event_change on public.events;
create trigger trg_notify_event_change
  after update on public.events
  for each row when (
    old.event_date is distinct from new.event_date or
    old.event_time is distinct from new.event_time or
    old.venue      is distinct from new.venue or
    old.name       is distinct from new.name
  )
  execute function public.notify_on_event_change();

-- Event deleted → everyone going. BEFORE delete so the cascading rsvp/ticket rows still exist.
create or replace function public.notify_on_event_cancel()
returns trigger language plpgsql security definer set search_path = public as $$
declare who record;
begin
  begin
    for who in
      select user_id from public.event_rsvps where event_id = old.id
      union
      select buyer_id from public.tickets where event_id = old.id and status = 'paid'
    loop
      if who.user_id <> old.host_id then
        insert into public.notifications (user_id, actor_id, kind, body)
        values (who.user_id, old.host_id, 'event_cancelled', left(coalesce(old.name, 'a rite'), 160));
      end if;
    end loop;
  exception when others then null;
  end;
  return old;
end $$;
drop trigger if exists trg_notify_event_cancel on public.events;
create trigger trg_notify_event_cancel
  before delete on public.events
  for each row
  execute function public.notify_on_event_cancel();
