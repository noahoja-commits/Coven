-- Coven migration 0052 — DM voice notes.
-- Adds an audio_url column to direct messages so a whisper can carry a recorded
-- voice note alongside (or instead of) its text body, plus a public 'voice'
-- storage bucket for the audio files.
--
-- Note: like every other media bucket here, 'voice' is public-read with an
-- unguessable path (conversation/yyyymm/timestamp-rand). The message *text* stays
-- RLS-protected; if DM voice ever needs true privacy, switch this to a private
-- bucket + signed URLs (a follow-up — kept consistent with the existing pattern here).

alter table public.messages_dm add column if not exists audio_url text;

insert into storage.buckets (id, name, public) values ('voice', 'voice', true)
on conflict (id) do nothing;

drop policy if exists "voice public read" on storage.objects;
drop policy if exists "voice auth insert" on storage.objects;
drop policy if exists "voice auth update" on storage.objects;
create policy "voice public read" on storage.objects for select
  using (bucket_id = 'voice');
create policy "voice auth insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'voice');
create policy "voice auth update" on storage.objects for update to authenticated
  using (bucket_id = 'voice');
