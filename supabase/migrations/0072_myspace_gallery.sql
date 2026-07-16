-- Coven migration 0072 — expose the old-web profile GALLERY (photos/videos) to visitors.
--
-- The gallery lives in the profile_state 'myspace' blob (owner-locked). This extends the
-- public_shrine SECURITY DEFINER rpc's `myspace` slice to also return a sanitized `gallery`
-- array (each {url, type}, capped at 12, order preserved) so other users can see it. Fail-open:
-- pre-migration the rpc just omits gallery and the card renders without it. The self view works
-- without this migration (own profile_state is directly readable).
--
-- Only http(s) urls are surfaced (a stored value can't inject anything the img/video tag will
-- fetch off-policy; the CSP img-src/media-src already restrict to https:).

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
      ), '[]'::jsonb),
      -- NEW: photo/video gallery, sanitized to {url,type}, https-only, capped at 12, ordered.
      'gallery', coalesce((
        select jsonb_agg(jsonb_build_object('url', gg.url,
                 'type', case when gg.type in ('image','video') then gg.type else 'image' end)
                 order by gg.ord)
        from (
          select e.value->>'url' as url, e.value->>'type' as type, e.ordinality as ord
          from jsonb_array_elements(coalesce(ms.value->'gallery', '[]'::jsonb)) with ordinality as e(value, ordinality)
          where e.value->>'url' ~* '^https://'
          limit 12
        ) gg
      ), '[]'::jsonb)
    ) end
    from (select value from public.profile_state where user_id = p_user and key = 'myspace') ms
  )
);
$$;

revoke all on function public.public_shrine(uuid) from public;
grant execute on function public.public_shrine(uuid) to authenticated;
