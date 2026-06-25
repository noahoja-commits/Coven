-- Comment reactions — mirrors the post `reactions` table. One row per (comment, user, kind).
-- Counts are exposed through the post_comments RPC (security definer); a soul can read/insert/
-- delete only its OWN reaction rows (so myReactions works without leaking who-reacted-what).
create table if not exists public.comment_reactions (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id    uuid not null references auth.users(id)     on delete cascade,
  kind       text not null,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id, kind)
);
alter table public.comment_reactions enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='comment_reactions' and policyname='read own comment reactions') then
    create policy "read own comment reactions" on public.comment_reactions for select to authenticated using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='comment_reactions' and policyname='insert own comment reaction') then
    create policy "insert own comment reaction" on public.comment_reactions for insert to authenticated with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='comment_reactions' and policyname='delete own comment reaction') then
    create policy "delete own comment reaction" on public.comment_reactions for delete to authenticated using (user_id = auth.uid());
  end if;
end $$;

create index if not exists comment_reactions_comment_idx on public.comment_reactions (comment_id);

-- Recreate post_comments to also return a {kind: count} jsonb of reactions per comment.
drop function if exists public.post_comments(uuid);
create or replace function public.post_comments(p_post_id uuid)
returns table (id uuid, post_id uuid, author_id uuid, parent_id uuid, body text,
               created_at timestamptz, handle text, avatar text, avatar_url text, reactions jsonb)
language sql stable security definer set search_path = public as $$
  select c.id, c.post_id, c.author_id, c.parent_id, c.body, c.created_at,
         pr.handle, pr.avatar, pr.avatar_url,
         coalesce((
           select jsonb_object_agg(s.kind, s.n)
           from (
             select cr.kind, count(*)::int as n
             from public.comment_reactions cr
             where cr.comment_id = c.id
             group by cr.kind
           ) s
         ), '{}'::jsonb) as reactions
  from public.comments c
  join public.profiles pr on pr.id = c.author_id
  where c.post_id = p_post_id
  order by c.created_at asc
$$;
grant execute on function public.post_comments(uuid) to authenticated, anon;
