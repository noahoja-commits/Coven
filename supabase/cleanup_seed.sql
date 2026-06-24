-- Coven CLEAN SLATE — remove all seeded "system" accounts (vesper.exe, lilith_xiv,
-- ash.in.october, cryptic.rose, mortis.kvlt) and everything they created: the welcome
-- posts, the 3 sample events, plus any shops/listings, then the auth.users rows.
-- Idempotent: scoped to profiles.is_system = true, which becomes empty after a successful run.
-- One-off cleanup — NOT a schema migration. Do NOT re-run supabase/seed.mjs after this.
do $$
declare sys uuid[];
begin
  select coalesce(array_agg(id), '{}'::uuid[]) into sys from public.profiles where is_system = true;
  if coalesce(array_length(sys, 1), 0) = 0 then
    raise notice 'clean-slate: no system accounts found — nothing to do';
    return;
  end if;
  -- Explicitly clear the big content tables (the rest cascade from profiles/auth.users).
  delete from public.posts    where author_id = any(sys);
  delete from public.events   where host_id   = any(sys);
  delete from public.listings where seller_id = any(sys);
  delete from public.shops    where owner_id  = any(sys);
  -- The profile (cascades remaining user content) then the auth identity.
  delete from public.profiles where id = any(sys);
  delete from auth.users      where id = any(sys);
  raise notice 'clean-slate: removed % seeded system account(s) + their content', array_length(sys, 1);
end $$;
