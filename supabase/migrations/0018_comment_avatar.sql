-- Expose comment authors' avatar_url so comments can show profile photos.
drop function if exists public.post_comments(uuid);
create or replace function public.post_comments(p_post_id uuid)
returns table (id uuid, post_id uuid, author_id uuid, parent_id uuid, body text,
               created_at timestamptz, handle text, avatar text, avatar_url text)
language sql stable security definer set search_path = public as $$
  select c.id, c.post_id, c.author_id, c.parent_id, c.body, c.created_at,
         pr.handle, pr.avatar, pr.avatar_url
  from public.comments c
  join public.profiles pr on pr.id = c.author_id
  where c.post_id = p_post_id
  order by c.created_at asc
$$;
grant execute on function public.post_comments(uuid) to authenticated, anon;
