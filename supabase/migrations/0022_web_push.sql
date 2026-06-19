-- Coven migration 0022 — closed-app web push.
-- Stores each device's push subscription; on a new notification, pg_net POSTs
-- to /api/push which sends the actual web-push.

create table if not exists public.push_subscriptions (
  endpoint   text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);
create index if not exists push_subs_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;
drop policy if exists psub_read   on public.push_subscriptions;
drop policy if exists psub_write  on public.push_subscriptions;
drop policy if exists psub_delete on public.push_subscriptions;
create policy psub_read   on public.push_subscriptions for select using (user_id = auth.uid());
create policy psub_write  on public.push_subscriptions for insert with check (user_id = auth.uid());
create policy psub_delete on public.push_subscriptions for delete using (user_id = auth.uid());
grant select, insert, delete on public.push_subscriptions to authenticated;

-- Service-only key/value config (push endpoint URL + shared secret). RLS on, no
-- policies = only the service role / SECURITY DEFINER functions can read it.
create table if not exists public.app_config (
  key text primary key,
  value text
);
alter table public.app_config enable row level security;

-- pg_net for outbound HTTP from the trigger.
create extension if not exists pg_net;

-- On a new notification, fire-and-forget a POST to the push endpoint.
create or replace function public.notify_push() returns trigger
language plpgsql security definer set search_path = public, net, extensions as $$
declare url text; secret text;
begin
  select value into url    from public.app_config where key = 'push_url';
  select value into secret from public.app_config where key = 'push_secret';
  if url is not null and url <> '' then
    perform net.http_post(
      url := url,
      body := jsonb_build_object('notification_id', NEW.id),
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', coalesce(secret, ''))
    );
  end if;
  return NEW;
end; $$;
drop trigger if exists trg_notify_push on public.notifications;
create trigger trg_notify_push after insert on public.notifications
  for each row execute function public.notify_push();
