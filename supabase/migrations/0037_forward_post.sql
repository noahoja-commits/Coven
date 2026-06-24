-- Send post to DM: forward a feed post into a whisper. One nullable reference column
-- on messages_dm. on delete set null keeps threads intact if the post is later removed
-- (the client renders "post removed"). The forwarded preview is read client-side from
-- the public feed_posts view, so anonymous authors stay masked.

alter table public.messages_dm
  add column if not exists forwarded_post_id uuid references public.posts(id) on delete set null;
