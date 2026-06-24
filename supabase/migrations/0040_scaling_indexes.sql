-- Pre-launch scaling (40k users): index the hot reactions(user_id) lookup, the
-- unindexed foreign keys (seq scans on join + slow/locking cascade deletes), the
-- feed keyset cursor, and the active_tonight filter. All non-destructive + idempotent.
-- NOTE: at current size these build instantly; once a table is large, rebuild big
-- indexes with CREATE INDEX CONCURRENTLY (outside a transaction) instead.

-- Hot path: every feed load fetches the viewer's OWN reactions by user_id. The PK
-- leads with post_id, so a user_id filter currently seq-scans reactions.
create index if not exists reactions_user_idx on public.reactions(user_id);

-- Unindexed foreign keys.
create index if not exists comments_author_idx        on public.comments(author_id);
create index if not exists comments_parent_idx        on public.comments(parent_id);
create index if not exists conversations_created_by_idx on public.conversations(created_by);
create index if not exists events_host_idx            on public.events(host_id);
create index if not exists messages_dm_sender_idx     on public.messages_dm(sender_id);
create index if not exists notifications_actor_idx    on public.notifications(actor_id);
create index if not exists reports_reporter_idx       on public.reports(reporter_id);
create index if not exists shops_owner_idx            on public.shops(owner_id);
create index if not exists venue_maps_created_by_idx  on public.venue_maps(created_by);

-- Sparse (mostly-NULL) FK columns → partial indexes (smaller, faster).
create index if not exists messages_dm_forwarded_idx  on public.messages_dm(forwarded_post_id) where forwarded_post_id is not null;
create index if not exists notifications_post_idx     on public.notifications(post_id) where post_id is not null;
create index if not exists notifications_conv_idx     on public.notifications(conversation_id) where conversation_id is not null;

-- Feed keyset pagination cursor (created_at, id) — matches the .or() keyset in fetchFeed.
create index if not exists posts_created_id_idx on public.posts(created_at desc, id desc);

-- active_tonight filters tonight_pins by expires_at > now().
create index if not exists tonight_pins_expires_idx on public.tonight_pins(expires_at);
