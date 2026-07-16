-- Coven migration 0074 — expose the full MySpace profile to visitors.
--
-- Extends public_shrine's `myspace` slice (0069/0072) with the rest of the layout:
-- details/interests, a blog, a profile song (real audio url), and custom theme colors. All
-- stored in the owner-locked profile_state 'myspace' blob; this makes them visible to others,
-- sanitized. Fail-open: pre-migration the rpc omits them and the card renders without them.

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
      ), '[]'::jsonb),
      -- NEW: details/interests (free text, each capped), a blog, a real audio song, theme colors.
      'details', jsonb_build_object(
        'music',   left(coalesce(ms.value#>>'{details,music}', ''), 600),
        'movies',  left(coalesce(ms.value#>>'{details,movies}', ''), 600),
        'books',   left(coalesce(ms.value#>>'{details,books}', ''), 600),
        'heroes',  left(coalesce(ms.value#>>'{details,heroes}', ''), 600),
        'general', left(coalesce(ms.value#>>'{details,general}', ''), 600)),
      'blog', coalesce((
        select jsonb_agg(jsonb_build_object('title', left(coalesce(b.value->>'title',''),120),
                 'body', left(coalesce(b.value->>'body',''),4000), 'at', b.value->>'at') order by b.ord)
        from (
          select e.value, e.ordinality as ord
          from jsonb_array_elements(coalesce(ms.value->'blog', '[]'::jsonb)) with ordinality as e(value, ordinality)
          limit 20
        ) b
      ), '[]'::jsonb),
      'song', case when ms.value->'song'->>'url' ~* '^https://'
        then jsonb_build_object('url', ms.value->'song'->>'url',
               'artist', left(coalesce(ms.value->'song'->>'artist',''),120),
               'track',  left(coalesce(ms.value->'song'->>'track',''),120))
        else null end,
      'theme', jsonb_build_object(
        'accent', case when ms.value->'theme'->>'accent' ~* '^#[0-9a-f]{6}$' then ms.value->'theme'->>'accent' else null end,
        'bg',     case when ms.value->'theme'->>'bg' ~* '^#[0-9a-f]{6}$' then ms.value->'theme'->>'bg' else null end)
    ) end
    from (select value from public.profile_state where user_id = p_user and key = 'myspace') ms
  )
);
$$;

revoke all on function public.public_shrine(uuid) from public;
grant execute on function public.public_shrine(uuid) to authenticated;
