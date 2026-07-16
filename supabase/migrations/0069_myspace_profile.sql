-- Coven migration 0069 — old-web ("MySpace") profile config, publicly visible.
--
-- The retro profile layout (PR: opt-in settings.myspaceProfile) needs a place to store the
-- user's editable blurbs + a curated Top Friends list, AND a way for OTHER users to read them.
-- Config lives in profile_state under a new 'myspace' key (owner-locked by RLS like the other
-- blobs). This migration extends the existing public_shrine() SECURITY DEFINER rpc to also
-- return a sanitized `myspace` slice so visitors can see it — resolving the curated top-friend
-- handles to {handle, avatar, avatarUrl} server-side (all public fields).
--
-- Fail-open: pre-migration the rpc simply omits `myspace` and the card renders without the
-- extra sections. No new table, no RLS change (profile_state already owner-locked; the rpc is
-- the only public read path, exactly like graves/trackers/nowPlaying above).

create or replace function public.public_shrine(p_user uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
select jsonb_build_object(
  'graves', coalesce((
    select jsonb_agg(
             (g - 'private') || jsonb_build_object(
               'candles', (select count(*) from public.grave_tributes t
                           where t.owner_id = p_user and t.grave_id = g->>'id' and t.kind = 'candle'),
               'tributeFlowers', (select count(*) from public.grave_tributes t
                                  where t.owner_id = p_user and t.grave_id = g->>'id' and t.kind = 'flower'))
           )
    from jsonb_array_elements(coalesce(
           (select value from public.profile_state where user_id = p_user and key = 'graves'),
           '[]'::jsonb)) g
    where coalesce((g->>'private')::boolean, false) = false
      and coalesce(g->>'visibility', 'friends') <> 'private'
  ), '[]'::jsonb),
  'trackers', coalesce((
    select jsonb_object_agg(e.k, e.v)
    from jsonb_each(coalesce(
           (select value from public.profile_state where user_id = p_user and key = 'trackers'),
           '{}'::jsonb)) as e(k, v)
    where coalesce((e.v->>'public')::boolean, false)
  ), '{}'::jsonb),
  'anniversaries', coalesce((
    select jsonb_agg(a)
    from jsonb_array_elements(coalesce(
           (select value->'anniversaries' from public.profile_state where user_id = p_user and key = 'clientSync'),
           '[]'::jsonb)) a
    where coalesce((a->>'visible')::boolean, false)
  ), '[]'::jsonb),
  'nowPlaying', (select value->'nowPlaying' from public.profile_state where user_id = p_user and key = 'clientSync'),
  'pinnedPostId', (select value->'pinnedPostId' from public.profile_state where user_id = p_user and key = 'clientSync'),
  'highlights', coalesce(
    (select value->'storyHighlights' from public.profile_state where user_id = p_user and key = 'clientSync'),
    '[]'::jsonb),
  -- NEW: old-web profile config. Blurbs are plain text; top-friend handles are resolved to
  -- public profile fields (capped at 8, order preserved) so the visitor can render + tap them.
  'myspace', (
    select case when ms.value is null then null else jsonb_build_object(
      'about', left(coalesce(ms.value->>'about', ''), 1500),
      'want',  left(coalesce(ms.value->>'want', ''), 1500),
      'top', coalesce((
        select jsonb_agg(jsonb_build_object('handle', pr.handle, 'avatar', pr.avatar, 'avatarUrl', pr.avatar_url)
                         order by t.ord)
        from (
          select h.value #>> '{}' as handle, h.ordinality as ord
          from jsonb_array_elements(coalesce(ms.value->'top', '[]'::jsonb)) with ordinality as h(value, ordinality)
          limit 8
        ) t
        join public.profiles pr on pr.handle = t.handle
      ), '[]'::jsonb)
    ) end
    from (select value from public.profile_state where user_id = p_user and key = 'myspace') ms
  )
);
$$;

revoke all on function public.public_shrine(uuid) from public;
grant execute on function public.public_shrine(uuid) to authenticated;
