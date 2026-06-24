-- Profile archetype: a self-declared identity (Witch/Vampire/Occultist/…) shown as a
-- badge; picking one also applies a matching shrine theme. Public label-only column.
-- profiles uses column-level grants (0026) so the new column MUST be granted explicitly.

alter table public.profiles add column if not exists archetype text;
grant select (archetype) on public.profiles to anon, authenticated;
