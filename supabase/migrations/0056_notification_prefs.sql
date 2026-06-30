-- Coven migration 0056 — per-category push notification preferences.
-- notification_prefs maps a notification KIND -> false to mute it (absent/true = send).
-- api/_push.sendToUser already honors this gate; this just provides the column.
-- The owner can write it through the existing profiles UPDATE policy (bound to auth.uid()).

alter table public.profiles
  add column if not exists notification_prefs jsonb not null default '{}'::jsonb;
