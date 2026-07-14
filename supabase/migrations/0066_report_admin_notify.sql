-- Coven migration 0066 — alert the operator the moment a report lands.
-- Minimal path: insert a notifications row for the admin; trg_notify_push (0022/0058)
-- already web-pushes every notifications insert. Zero new endpoints, zero new env.

-- Admin recipient. Derived in-database from the operator's auth email (already the
-- public DMCA contact in docs/report-triage.md) so no uuid is hardcoded in git.
-- To change admins later: update app_config set value = '<uuid>' where key = 'admin_user_id';
insert into public.app_config (key, value)
select 'admin_user_id', u.id::text
from auth.users u
where lower(u.email) = 'noahoja@gmail.com'
on conflict (key) do update set value = excluded.value;

create or replace function public.notify_on_report() returns trigger
language plpgsql security definer set search_path = public as $$
declare admin uuid;
begin
  begin  -- best-effort (0058 pattern): an alert failure must never block the report insert
    select value::uuid into admin from public.app_config where key = 'admin_user_id';
    if admin is not null then
      insert into public.notifications (user_id, actor_id, kind, body)
      values (admin, new.reporter_id, 'report',
              left(new.target_kind || ' · ' || coalesce(nullif(new.reason, ''), 'no reason'), 160));
    end if;
  exception when others then null; end;
  return new;
end; $$;

drop trigger if exists trg_notify_on_report on public.reports;
create trigger trg_notify_on_report after insert on public.reports
  for each row execute function public.notify_on_report();
