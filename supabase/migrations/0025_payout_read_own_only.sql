-- SECURITY FIX: payout_accounts had a SELECT policy of USING (true), so every
-- authenticated user could read everyone's stripe_account_id + payout status.
-- Lock reads to the owner. (Server endpoints use the service role and bypass RLS,
-- so platform payout logic is unaffected; the client only ever reads its own row.)
drop policy if exists payout_read on public.payout_accounts;
create policy payout_read on public.payout_accounts
  for select using (user_id = auth.uid());
