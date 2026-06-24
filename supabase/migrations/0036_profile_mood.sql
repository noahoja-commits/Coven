-- Profile mood: a self-set, public, expiring state (sober/drunk/high/cursed/…) shown
-- as a label + aura on the profile. Public jsonb column. Because profiles uses
-- column-level SELECT grants (see 0026), the new column MUST be granted explicitly
-- or it won't be readable.

alter table public.profiles add column if not exists mood jsonb not null default '{}'::jsonb;
grant select (mood) on public.profiles to anon, authenticated;
