-- Coven migration 0065 — record Terms of Service acceptance (version + timestamp).
-- Written by the owner at onboarding (insert) and at re-acceptance (update).
-- NOTE: 0026 replaced profiles' table-level SELECT with a column whitelist, so new
-- columns MUST be added to the grant or clients get 42501 reading them.
alter table public.profiles
  add column if not exists tos_version text,
  add column if not exists tos_accepted_at timestamptz;

grant select (tos_version, tos_accepted_at) on public.profiles to authenticated;

-- INSERT/UPDATE grants are table-level (0026 only touched SELECT) and the existing
-- own-row RLS update policy binds to auth.uid() — no policy changes needed.
-- Deliberately NO backfill: existing users record a genuine acceptance via the
-- in-app TermsGate on next open.
