-- SECURITY/PRIVACY: profiles.birthday is a full date of birth — sensitive PII
-- that only the owner needs (memento-mori counter + sun sign). profiles_read is
-- USING(true) (public handles/avatars/bios), so every column, including birthday,
-- was readable by any authenticated user. Column-level grants fix this: replace the
-- blanket table SELECT with per-column SELECT on everything EXCEPT birthday. The
-- owner reads their own birthday through a SECURITY DEFINER rpc.
--
-- (Column privileges are only enforced when there is no table-level SELECT grant,
-- so the table grant must be revoked and re-granted per column.)
revoke select on public.profiles from anon, authenticated;
grant select (id, handle, avatar, avatar_url, bio, city, created_at, is_system, pronouns, scenes, tags)
  on public.profiles to anon, authenticated;

create or replace function public.my_birthday()
returns date
language sql stable security definer set search_path = public as $$
  select birthday from public.profiles where id = auth.uid()
$$;
grant execute on function public.my_birthday() to authenticated;
