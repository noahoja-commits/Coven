-- Coven migration 0059 — fix infinite recursion in the DM rate-limit RLS policy.
--
-- BUG (confirmed live in prod): every DM insert failed with
--   HTTP 500 / SQLSTATE 42P17 "infinite recursion detected in policy for relation messages_dm".
-- The `dm_ratelimit` RESTRICTIVE insert policy (introduced in 0030, re-wrapped in 0042) runs
-- `select count(*) from messages_dm ...` INSIDE a policy that is itself ON messages_dm. To
-- evaluate that subquery Postgres re-enters messages_dm's row-security (its SELECT policy
-- msg_read -> is_conv_member), and detects the self-reference as infinite recursion — so the
-- whole INSERT is aborted with 42P17. Reads were unaffected (msg_read on its own is fine),
-- which is exactly why opening a whisper thread worked but sending one never did.
--
-- FIX: compute the per-minute send count in a SECURITY DEFINER helper. The helper runs as the
-- function owner (the `postgres` role, which has BYPASSRLS), so its read of messages_dm does
-- NOT re-enter the table's policies — the recursion is structurally impossible. Behaviour is
-- identical: same 30-messages-per-sender-per-minute ceiling. The permissive msg_insert and
-- restrictive dm_noblock policies are untouched, so authorization + block-safety are preserved.

create or replace function public.dm_sends_last_minute(p_sender uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.messages_dm
  where sender_id = p_sender
    and created_at > now() - interval '1 minute';
$$;

revoke all on function public.dm_sends_last_minute(uuid) from public;
grant execute on function public.dm_sends_last_minute(uuid) to authenticated;

drop policy if exists dm_ratelimit on public.messages_dm;
create policy dm_ratelimit on public.messages_dm
  as restrictive for insert to authenticated
  with check ( public.dm_sends_last_minute((select auth.uid())) < 30 );
