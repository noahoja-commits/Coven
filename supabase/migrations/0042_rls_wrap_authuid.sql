-- Pre-launch scaling (40k): wrap auth.uid() -> (select auth.uid()) in every RLS policy so it
-- evaluates ONCE per query (cached initplan) instead of per row (Supabase's #1 RLS scaling lever).
-- Generated from pg_policies — pure expression wrap; cmd/roles/permissive/logic all unchanged.
-- 82 policies. Idempotent: drop policy if exists + create.

drop policy if exists blocks_delete on public.blocks;
create policy blocks_delete on public.blocks as permissive for delete to public using ((blocker_id = (select auth.uid())));

drop policy if exists blocks_insert on public.blocks;
create policy blocks_insert on public.blocks as permissive for insert to public with check ((blocker_id = (select auth.uid())));

drop policy if exists blocks_read on public.blocks;
create policy blocks_read on public.blocks as permissive for select to public using (((blocker_id = (select auth.uid())) OR (blocked_id = (select auth.uid()))));

drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments as permissive for delete to public using ((author_id = (select auth.uid())));

drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments as permissive for insert to public with check ((author_id = (select auth.uid())));

drop policy if exists comments_noblock on public.comments;
create policy comments_noblock on public.comments as restrictive for insert to authenticated with check ((NOT blocked_between((select auth.uid()), post_author(post_id))));

drop policy if exists cmem_delete on public.community_members;
create policy cmem_delete on public.community_members as permissive for delete to public using ((user_id = (select auth.uid())));

drop policy if exists cmem_insert on public.community_members;
create policy cmem_insert on public.community_members as permissive for insert to public with check ((user_id = (select auth.uid())));

drop policy if exists cmem_read on public.community_members;
create policy cmem_read on public.community_members as permissive for select to public using ((user_id = (select auth.uid())));

drop policy if exists cm_read on public.conversation_members;
create policy cm_read on public.conversation_members as permissive for select to public using (is_conv_member(conversation_id, (select auth.uid())));

drop policy if exists cm_update on public.conversation_members;
create policy cm_update on public.conversation_members as permissive for update to public using ((user_id = (select auth.uid()))) with check ((user_id = (select auth.uid())));

drop policy if exists conv_read on public.conversations;
create policy conv_read on public.conversations as permissive for select to public using (is_conv_member(id, (select auth.uid())));

drop policy if exists rsvps_delete on public.event_rsvps;
create policy rsvps_delete on public.event_rsvps as permissive for delete to public using ((user_id = (select auth.uid())));

drop policy if exists rsvps_insert on public.event_rsvps;
create policy rsvps_insert on public.event_rsvps as permissive for insert to public with check ((user_id = (select auth.uid())));

drop policy if exists rsvps_read on public.event_rsvps;
create policy rsvps_read on public.event_rsvps as permissive for select to public using ((user_id = (select auth.uid())));

drop policy if exists events_delete on public.events;
create policy events_delete on public.events as permissive for delete to public using ((host_id = (select auth.uid())));

drop policy if exists events_insert on public.events;
create policy events_insert on public.events as permissive for insert to public with check ((host_id = (select auth.uid())));

drop policy if exists events_update on public.events;
create policy events_update on public.events as permissive for update to public using ((host_id = (select auth.uid()))) with check ((host_id = (select auth.uid())));

drop policy if exists follows_delete on public.follows;
create policy follows_delete on public.follows as permissive for delete to public using ((follower_id = (select auth.uid())));

drop policy if exists follows_insert on public.follows;
create policy follows_insert on public.follows as permissive for insert to public with check ((follower_id = (select auth.uid())));

drop policy if exists follows_noblock on public.follows;
create policy follows_noblock on public.follows as restrictive for insert to authenticated with check ((NOT blocked_between((select auth.uid()), followee_id)));

drop policy if exists follows_ratelimit on public.follows;
create policy follows_ratelimit on public.follows as restrictive for insert to authenticated with check ((( SELECT count(*) AS count
   FROM follows follows_1
  WHERE ((follows_1.follower_id = (select auth.uid())) AND (follows_1.created_at > (now() - '00:01:00'::interval)))) < 30));

drop policy if exists follows_read on public.follows;
create policy follows_read on public.follows as permissive for select to public using (((follower_id = (select auth.uid())) OR (followee_id = (select auth.uid()))));

drop policy if exists listings_delete on public.listings;
create policy listings_delete on public.listings as permissive for delete to public using ((seller_id = (select auth.uid())));

drop policy if exists listings_insert on public.listings;
create policy listings_insert on public.listings as permissive for insert to public with check ((seller_id = (select auth.uid())));

drop policy if exists listings_update on public.listings;
create policy listings_update on public.listings as permissive for update to public using ((seller_id = (select auth.uid()))) with check ((seller_id = (select auth.uid())));

drop policy if exists mr_delete on public.message_reactions;
create policy mr_delete on public.message_reactions as permissive for delete to public using ((user_id = (select auth.uid())));

drop policy if exists mr_insert on public.message_reactions;
create policy mr_insert on public.message_reactions as permissive for insert to public with check (((user_id = (select auth.uid())) AND is_conv_member(( SELECT messages_dm.conversation_id
   FROM messages_dm
  WHERE (messages_dm.id = message_reactions.message_id)), (select auth.uid()))));

drop policy if exists mr_read on public.message_reactions;
create policy mr_read on public.message_reactions as permissive for select to public using (is_conv_member(( SELECT messages_dm.conversation_id
   FROM messages_dm
  WHERE (messages_dm.id = message_reactions.message_id)), (select auth.uid())));

drop policy if exists dm_noblock on public.messages_dm;
create policy dm_noblock on public.messages_dm as restrictive for insert to authenticated with check ((NOT (EXISTS ( SELECT 1
   FROM conversation_members cm
  WHERE ((cm.conversation_id = messages_dm.conversation_id) AND (cm.user_id <> (select auth.uid())) AND blocked_between((select auth.uid()), cm.user_id))))));

drop policy if exists dm_ratelimit on public.messages_dm;
create policy dm_ratelimit on public.messages_dm as restrictive for insert to authenticated with check ((( SELECT count(*) AS count
   FROM messages_dm messages_dm_1
  WHERE ((messages_dm_1.sender_id = (select auth.uid())) AND (messages_dm_1.created_at > (now() - '00:01:00'::interval)))) < 30));

drop policy if exists msg_insert on public.messages_dm;
create policy msg_insert on public.messages_dm as permissive for insert to public with check (((sender_id = (select auth.uid())) AND is_conv_member(conversation_id, (select auth.uid()))));

drop policy if exists msg_read on public.messages_dm;
create policy msg_read on public.messages_dm as permissive for select to public using (is_conv_member(conversation_id, (select auth.uid())));

drop policy if exists notif_delete on public.notifications;
create policy notif_delete on public.notifications as permissive for delete to public using ((user_id = (select auth.uid())));

drop policy if exists notif_read on public.notifications;
create policy notif_read on public.notifications as permissive for select to public using ((user_id = (select auth.uid())));

drop policy if exists notif_update on public.notifications;
create policy notif_update on public.notifications as permissive for update to public using ((user_id = (select auth.uid()))) with check ((user_id = (select auth.uid())));

drop policy if exists payout_read on public.payout_accounts;
create policy payout_read on public.payout_accounts as permissive for select to public using ((user_id = (select auth.uid())));

drop policy if exists poll_delete on public.poll_votes;
create policy poll_delete on public.poll_votes as permissive for delete to public using ((user_id = (select auth.uid())));

drop policy if exists poll_insert on public.poll_votes;
create policy poll_insert on public.poll_votes as permissive for insert to public with check ((user_id = (select auth.uid())));

drop policy if exists poll_update on public.poll_votes;
create policy poll_update on public.poll_votes as permissive for update to public using ((user_id = (select auth.uid()))) with check ((user_id = (select auth.uid())));

drop policy if exists posts_delete on public.posts;
create policy posts_delete on public.posts as permissive for delete to public using ((author_id = (select auth.uid())));

drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts as permissive for insert to public with check ((author_id = (select auth.uid())));

drop policy if exists posts_ratelimit on public.posts;
create policy posts_ratelimit on public.posts as restrictive for insert to authenticated with check ((( SELECT count(*) AS count
   FROM posts posts_1
  WHERE ((posts_1.author_id = (select auth.uid())) AND (posts_1.created_at > (now() - '00:01:00'::interval)))) < 10));

drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts as permissive for select to public using ((author_id = (select auth.uid())));

drop policy if exists "own state delete" on public.profile_state;
create policy "own state delete" on public.profile_state as permissive for delete to public using ((user_id = (select auth.uid())));

drop policy if exists "own state insert" on public.profile_state;
create policy "own state insert" on public.profile_state as permissive for insert to public with check ((user_id = (select auth.uid())));

drop policy if exists "own state read" on public.profile_state;
create policy "own state read" on public.profile_state as permissive for select to public using ((user_id = (select auth.uid())));

drop policy if exists "own state update" on public.profile_state;
create policy "own state update" on public.profile_state as permissive for update to public using ((user_id = (select auth.uid()))) with check ((user_id = (select auth.uid())));

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles as permissive for insert to public with check ((id = (select auth.uid())));

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles as permissive for update to public using ((id = (select auth.uid()))) with check ((id = (select auth.uid())));

drop policy if exists psub_delete on public.push_subscriptions;
create policy psub_delete on public.push_subscriptions as permissive for delete to public using ((user_id = (select auth.uid())));

drop policy if exists psub_read on public.push_subscriptions;
create policy psub_read on public.push_subscriptions as permissive for select to public using ((user_id = (select auth.uid())));

drop policy if exists psub_update on public.push_subscriptions;
create policy psub_update on public.push_subscriptions as permissive for update to public using ((user_id = (select auth.uid()))) with check ((user_id = (select auth.uid())));

drop policy if exists psub_write on public.push_subscriptions;
create policy psub_write on public.push_subscriptions as permissive for insert to public with check ((user_id = (select auth.uid())));

drop policy if exists reactions_delete on public.reactions;
create policy reactions_delete on public.reactions as permissive for delete to public using ((user_id = (select auth.uid())));

drop policy if exists reactions_insert on public.reactions;
create policy reactions_insert on public.reactions as permissive for insert to public with check ((user_id = (select auth.uid())));

drop policy if exists reactions_noblock on public.reactions;
create policy reactions_noblock on public.reactions as restrictive for insert to authenticated with check ((NOT blocked_between((select auth.uid()), post_author(post_id))));

drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports as permissive for insert to public with check ((reporter_id = (select auth.uid())));

drop policy if exists reports_read on public.reports;
create policy reports_read on public.reports as permissive for select to public using ((reporter_id = (select auth.uid())));

drop policy if exists shops_delete on public.shops;
create policy shops_delete on public.shops as permissive for delete to public using ((owner_id = (select auth.uid())));

drop policy if exists shops_insert on public.shops;
create policy shops_insert on public.shops as permissive for insert to public with check ((owner_id = (select auth.uid())));

drop policy if exists shops_update on public.shops;
create policy shops_update on public.shops as permissive for update to public using ((owner_id = (select auth.uid()))) with check ((owner_id = (select auth.uid())));

drop policy if exists stories_delete on public.stories;
create policy stories_delete on public.stories as permissive for delete to public using ((author_id = (select auth.uid())));

drop policy if exists stories_insert on public.stories;
create policy stories_insert on public.stories as permissive for insert to public with check ((author_id = (select auth.uid())));

drop policy if exists sr_delete on public.story_reactions;
create policy sr_delete on public.story_reactions as permissive for delete to public using ((user_id = (select auth.uid())));

drop policy if exists sr_insert on public.story_reactions;
create policy sr_insert on public.story_reactions as permissive for insert to public with check ((user_id = (select auth.uid())));

drop policy if exists sr_update on public.story_reactions;
create policy sr_update on public.story_reactions as permissive for update to public using ((user_id = (select auth.uid()))) with check ((user_id = (select auth.uid())));

drop policy if exists tickets_read on public.tickets;
create policy tickets_read on public.tickets as permissive for select to public using (((buyer_id = (select auth.uid())) OR (EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = tickets.event_id) AND (e.host_id = (select auth.uid())))))));

drop policy if exists tickets_update on public.tickets;
create policy tickets_update on public.tickets as permissive for update to public using ((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = tickets.event_id) AND (e.host_id = (select auth.uid())))))) with check ((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = tickets.event_id) AND (e.host_id = (select auth.uid()))))));

drop policy if exists tg_delete on public.tonight_geo;
create policy tg_delete on public.tonight_geo as permissive for delete to public using ((user_id = (select auth.uid())));

drop policy if exists tg_insert on public.tonight_geo;
create policy tg_insert on public.tonight_geo as permissive for insert to public with check ((user_id = (select auth.uid())));

drop policy if exists tg_select on public.tonight_geo;
create policy tg_select on public.tonight_geo as permissive for select to public using ((user_id = (select auth.uid())));

drop policy if exists tg_update on public.tonight_geo;
create policy tg_update on public.tonight_geo as permissive for update to public using ((user_id = (select auth.uid()))) with check ((user_id = (select auth.uid())));

drop policy if exists tonight_delete on public.tonight_pins;
create policy tonight_delete on public.tonight_pins as permissive for delete to public using ((user_id = (select auth.uid())));

drop policy if exists tonight_insert on public.tonight_pins;
create policy tonight_insert on public.tonight_pins as permissive for insert to public with check ((user_id = (select auth.uid())));

drop policy if exists tonight_update on public.tonight_pins;
create policy tonight_update on public.tonight_pins as permissive for update to public using ((user_id = (select auth.uid()))) with check ((user_id = (select auth.uid())));

drop policy if exists venue_maps_delete on public.venue_maps;
create policy venue_maps_delete on public.venue_maps as permissive for delete to public using ((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = venue_maps.event_id) AND (e.host_id = (select auth.uid()))))));

drop policy if exists venue_maps_update on public.venue_maps;
create policy venue_maps_update on public.venue_maps as permissive for update to public using ((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = venue_maps.event_id) AND (e.host_id = (select auth.uid()))))));

drop policy if exists venue_maps_write on public.venue_maps;
create policy venue_maps_write on public.venue_maps as permissive for insert to public with check ((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = venue_maps.event_id) AND (e.host_id = (select auth.uid()))))));

drop policy if exists venue_pins_delete on public.venue_pins;
create policy venue_pins_delete on public.venue_pins as permissive for delete to public using ((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = venue_pins.event_id) AND (e.host_id = (select auth.uid()))))));

drop policy if exists venue_pins_update on public.venue_pins;
create policy venue_pins_update on public.venue_pins as permissive for update to public using ((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = venue_pins.event_id) AND (e.host_id = (select auth.uid()))))));

drop policy if exists venue_pins_write on public.venue_pins;
create policy venue_pins_write on public.venue_pins as permissive for insert to public with check ((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = venue_pins.event_id) AND (e.host_id = (select auth.uid()))))));
