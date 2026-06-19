-- Coven migration 0012 — real image uploads for posts, stories, avatars, listings.
-- posts.img already exists. Add the missing image columns + public storage buckets.

alter table public.stories  add column if not exists image_url  text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.listings add column if not exists image_url  text;

insert into storage.buckets (id, name, public) values
  ('post-images',    'post-images',    true),
  ('story-images',   'story-images',   true),
  ('avatars',        'avatars',        true),
  ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

-- Public read + authenticated write for the media buckets. (Bucket is not
-- sensitive; the content is meant to be seen. Owner namespacing is by path.)
drop policy if exists "media public read"   on storage.objects;
drop policy if exists "media auth insert"   on storage.objects;
drop policy if exists "media auth update"   on storage.objects;
create policy "media public read" on storage.objects for select
  using (bucket_id in ('post-images','story-images','avatars','listing-images'));
create policy "media auth insert" on storage.objects for insert to authenticated
  with check (bucket_id in ('post-images','story-images','avatars','listing-images'));
create policy "media auth update" on storage.objects for update to authenticated
  using (bucket_id in ('post-images','story-images','avatars','listing-images'));
