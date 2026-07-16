-- 0068: harden the 0067 admin surface against an adversarial review.
--
-- 1) admin_reports() de-anonymized authors of anonymous posts (joined author_id → handle
--    with no `anonymous` check), breaking the product's core anonymity guarantee even though
--    only admins saw it. Now masks the handle for anonymous posts.
-- 2) Report spam → push flood: notify_on_report fired an admin notification (each web-pushed)
--    for EVERY report insert. A hostile account could report thousands of (even fake) targets
--    and bury the queue + spam every admin's device. Now: (a) the target must actually exist,
--    (b) admins are notified only on the FIRST report of a target and again when it crosses the
--    3-distinct-reporter auto-hide threshold — at most 2 pushes per real target, zero for fakes.
-- 3) admin_reports() returned one row PER report; genuine distinct targets could be pushed past
--    the 100-row cap by a single spammed target. Now grouped to one row per distinct target.
-- 4) Presence rows were client-writable with an arbitrary last_seen_at/ua — a user could forge
--    "here now" forever. A BEFORE trigger now stamps last_seen_at = now() and bounds ua server-side.

-- ── 1 & 3) reports queue: mask anonymous authors, one row per target ──────────
create or replace function public.admin_reports()
returns table (id uuid, target_kind text, target_id uuid, reason text, created_at timestamptz,
               report_count bigint, preview text, target_handle text)
language sql stable security definer set search_path = public as $$
  select distinct on (r.target_kind, r.target_id)
         r.id, r.target_kind, r.target_id, r.reason, r.created_at,
         (select count(distinct r2.reporter_id) from public.reports r2
            where r2.target_kind = r.target_kind and r2.target_id = r.target_id and r2.resolved_at is null),
         case
           when r.target_kind = 'post' then (select left(coalesce(p.body, '(no text)'), 140) from public.posts p where p.id = r.target_id)
           when r.target_kind = 'user' then (select left(coalesce(pr.bio, '(no bio)'), 140) from public.profiles pr where pr.id = r.target_id)
         end,
         case
           -- Never expose the author of an anonymous post (see feed_posts masking, 0030/0041).
           when r.target_kind = 'post' then (
             select case when p.anonymous then null else pr.handle end
             from public.posts p join public.profiles pr on pr.id = p.author_id where p.id = r.target_id)
           when r.target_kind = 'user' then (select pr.handle from public.profiles pr where pr.id = r.target_id)
         end
  from public.reports r
  where public.is_admin() and r.resolved_at is null
  order by r.target_kind, r.target_id, r.created_at desc
$$;

-- Dismiss resolves the WHOLE target (all its unresolved reports), matching the grouped view.
create or replace function public.admin_resolve_report(p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare k text; t uuid;
begin
  if not public.is_admin() then return false; end if;
  select target_kind, target_id into k, t from public.reports where id = p_id;
  if k is null then return false; end if;
  update public.reports set resolved_at = now(), resolved_by = auth.uid()
    where target_kind = k and target_id = t and resolved_at is null;
  return true;
end $$;

-- ── 2) report alert: real targets only, at most twice per target ──────────────
create or replace function public.notify_on_report()
returns trigger language plpgsql security definer set search_path = public as $$
declare a record; legacy uuid; notified boolean := false; n_reporters int; dup int; target_exists boolean;
begin
  begin
    -- Forged/fake targets never generate admin noise.
    if new.target_kind = 'post' then
      select exists(select 1 from public.posts where id = new.target_id) into target_exists;
    elsif new.target_kind = 'user' then
      select exists(select 1 from public.profiles where id = new.target_id) into target_exists;
    else target_exists := false; end if;
    if not target_exists then return new; end if;

    -- Same account re-reporting the same target (with no unique constraint on the table) must
    -- never re-notify — otherwise a single hacked account flood-pushes every admin. Only a
    -- reporter's FIRST report of a target is allowed past here.
    select count(*) into dup from public.reports
      where target_kind = new.target_kind and target_id = new.target_id and reporter_id = new.reporter_id;
    if dup > 1 then return new; end if;

    -- Now this is a genuinely new reporter for the target. Notify only on the first distinct
    -- reporter and again the moment it crosses the 3-distinct-reporter auto-hide line — the two
    -- moments that actually warrant attention. (Each distinct reporter passes here once, so the
    -- =3 case fires exactly once.)
    select count(distinct reporter_id) into n_reporters from public.reports
      where target_kind = new.target_kind and target_id = new.target_id and resolved_at is null;
    if n_reporters <> 1 and n_reporters <> 3 then return new; end if;

    for a in select user_id from public.admin_users loop
      insert into public.notifications (user_id, actor_id, kind, body)
      values (a.user_id, new.reporter_id, 'report',
              left(new.target_kind || ' · ' || coalesce(new.reason, '') || (case when n_reporters = 3 then ' · ⚠ auto-hidden' else '' end), 160));
      notified := true;
    end loop;
    if not notified then
      select value::uuid into legacy from public.app_config where key = 'admin_user_id';
      if legacy is not null then
        insert into public.notifications (user_id, actor_id, kind, body)
        values (legacy, new.reporter_id, 'report', left(new.target_kind || ' · ' || coalesce(new.reason, ''), 160));
      end if;
    end if;
  exception when others then null;
  end;
  return new;
end $$;

-- ── 4) presence integrity: server stamps the timestamp, not the client ────────
create or replace function public.presence_stamp()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.last_seen_at := now();
  new.ua := left(coalesce(new.ua, ''), 160);
  return new;
end $$;
drop trigger if exists trg_presence_stamp on public.presence;
create trigger trg_presence_stamp before insert or update on public.presence
  for each row execute function public.presence_stamp();
