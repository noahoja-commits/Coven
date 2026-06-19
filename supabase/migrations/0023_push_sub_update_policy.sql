-- push_subscriptions upsert re-subscribe needs UPDATE (the first subscribe is an
-- INSERT, but every later enablePush() call conflicts on endpoint -> UPDATE).
-- Without this policy RLS silently blocks the re-upsert.
drop policy if exists psub_update on push_subscriptions;
create policy psub_update on push_subscriptions
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
