-- Coven migration 0020 — story reactions (one per viewer per story) + notify author.

create table if not exists public.story_reactions (
  story_id   uuid not null references public.stories(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null,
  created_at timestamptz not null default now(),
  primary key (story_id, user_id)
);

alter table public.story_reactions enable row level security;
drop policy if exists sr_read   on public.story_reactions;
drop policy if exists sr_insert on public.story_reactions;
drop policy if exists sr_update on public.story_reactions;
drop policy if exists sr_delete on public.story_reactions;
create policy sr_read   on public.story_reactions for select using (true);
create policy sr_insert on public.story_reactions for insert with check (user_id = auth.uid());
create policy sr_update on public.story_reactions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sr_delete on public.story_reactions for delete using (user_id = auth.uid());
grant select, insert, update, delete on public.story_reactions to authenticated;

-- notify the story's author (skip self)
create or replace function public.notify_on_story_reaction() returns trigger
language plpgsql security definer set search_path = public as $$
declare author uuid;
begin
  select author_id into author from public.stories where id = new.story_id;
  if author is not null and author <> new.user_id then
    insert into public.notifications(user_id, actor_id, kind, reaction)
    values (author, new.user_id, 'story_react', new.kind);
  end if;
  return new;
end; $$;
drop trigger if exists trg_notify_story_reaction on public.story_reactions;
create trigger trg_notify_story_reaction after insert on public.story_reactions
  for each row execute function public.notify_on_story_reaction();

-- reactions on a story, with reactor profile (for the author to see who reacted)
create or replace function public.story_reactors(p_story_id uuid)
returns table (user_id uuid, kind text, handle text, avatar text, avatar_url text)
language sql stable security definer set search_path = public as $$
  select sr.user_id, sr.kind, p.handle, p.avatar, p.avatar_url
  from public.story_reactions sr
  join public.profiles p on p.id = sr.user_id
  where sr.story_id = p_story_id
  order by sr.created_at desc
$$;
grant execute on function public.story_reactors(uuid) to authenticated;
