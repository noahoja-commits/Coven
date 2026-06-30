-- 0057_scale_indexes.sql — pre-launch index pass for the 40k hardening.
--
-- Scope note: 0040_scaling_indexes.sql already indexed the obvious hot paths (feed
-- ordering, messages_dm.conversation_id, notifications.user_id, follows, reactions,
-- etc.), so this migration only adds what is GENUINELY still missing:
--
--   1. pg_trgm GIN on profiles(handle,bio) — the one missing hot-path index. searchProfiles
--      does `handle ILIKE '%q%' OR bio ILIKE '%q%'` (leading wildcard), which is a full
--      sequential scan of profiles on every keystroke without a trigram index.
--
--   2. FK-cascade covers for *viewer_id / user_id* columns that are NOT the leading column
--      of their table's primary key. These reference profiles/auth.users ON DELETE CASCADE;
--      without a covering index, deleting an account sequentially scans each table. (Columns
--      that ARE the leading PK column — post_views.post_id, conversation_members.conversation_id —
--      are already covered and were intentionally left out. conversation_members.user_id already
--      has conv_members_user_idx.)
--
-- Plain CREATE INDEX (not CONCURRENTLY): the Management API runs this file in one transaction
-- where CONCURRENTLY is illegal, and the tables are tiny pre-launch so the brief lock is
-- negligible — the point is to have these in place before the 40k arrive. All IF NOT EXISTS
-- so the migration is idempotent.

create extension if not exists pg_trgm;

create index if not exists profiles_handle_trgm
  on public.profiles using gin (handle gin_trgm_ops);
create index if not exists profiles_bio_trgm
  on public.profiles using gin (bio gin_trgm_ops);

-- FK-cascade covers (account-deletion / GDPR erase performance at scale)
create index if not exists message_reactions_user_idx on public.message_reactions (user_id);
create index if not exists comment_reactions_user_idx on public.comment_reactions (user_id);
create index if not exists post_views_viewer_idx      on public.post_views      (viewer_id);
create index if not exists story_views_viewer_idx     on public.story_views     (viewer_id);
create index if not exists listing_views_viewer_idx   on public.listing_views   (viewer_id);
