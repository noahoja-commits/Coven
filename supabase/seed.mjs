// Coven — one-time seed of "house" accounts + welcome posts so a brand-new
// user's feed is never empty. Run ONCE after applying schema.sql.
//
//   SUPABASE_URL=https://<ref>.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=<service_role_key> \
//   node supabase/seed.mjs
//
// The service_role key bypasses RLS — keep it OUT of the app/.env and never commit it.
// Idempotent: skips accounts/posts that already exist.

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}
const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const SYSTEM = [
  { handle: 'lilith_xiv',      avatar: '🦇', city: 'Brooklyn',  bio: 'queen of the crypt. bushwick.' },
  { handle: 'ash.in.october',  avatar: '🕯', city: 'Crown Heights', bio: 'thrifting & smoking. always cold.' },
  { handle: 'vesper.exe',      avatar: '✟', city: 'Ridgewood', bio: 'cathedral acoustics in a server room.' },
  { handle: 'cryptic.rose',    avatar: '🌹', city: 'Morningside', bio: 'soft for cheap red wine.' },
  { handle: 'mortis.kvlt',     avatar: '☠', city: 'Bed-Stuy', bio: 'who is rolling.' },
];

const WELCOME_POSTS = [
  { handle: 'vesper.exe',     community: 'general', body: 'the coven is open. light a candle. say something true.' },
  { handle: 'lilith_xiv',     community: 'general', body: 'driving to the crypt @ 10 if anyone wants in. darkwave only.' },
  { handle: 'ash.in.october', community: 'general', body: 'first cold night of the season. cathedrals & cheap wine kind of mood.' },
  { handle: 'cryptic.rose',   community: 'general', body: 'cathedral vespers, then home. who else still goes?' },
  { handle: 'mortis.kvlt',    community: 'general', body: 'show this weekend — basement, no flash, bring cash.' },
];

async function getProfileByHandle(handle) {
  const { data } = await db.from('profiles').select('id').eq('handle', handle).maybeSingle();
  return data?.id || null;
}

async function ensureSystemAccount(acct) {
  const existing = await getProfileByHandle(acct.handle);
  if (existing) { console.log(`· ${acct.handle} exists`); return existing; }

  const email = `${acct.handle.replace(/[^a-z0-9_.]/g, '')}@system.coven.app`;
  const { data: created, error: authErr } = await db.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { system: true, handle: acct.handle },
  });
  if (authErr) throw new Error(`createUser ${acct.handle}: ${authErr.message}`);
  const id = created.user.id;

  const { error: profErr } = await db.from('profiles').insert({
    id, handle: acct.handle, avatar: acct.avatar, city: acct.city, bio: acct.bio,
    tags: ['goth'], scenes: ['goth'], is_system: true,
  });
  if (profErr) throw new Error(`profile ${acct.handle}: ${profErr.message}`);
  console.log(`✓ created ${acct.handle}`);
  return id;
}

function daysFromNow(n) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
const WELCOME_EVENTS = [
  { host: 'lilith_xiv', name: 'Vespers vol. IV', venue: 'The Parish', neighborhood: 'Bushwick', city: 'Brooklyn', date: daysFromNow(5), time: '10PM', cover: 'red', tags: ['darkwave', 'goth', '18+'], description: 'a night of darkwave and candlelight. no flash. dress for the dark.' },
  { host: 'mortis.kvlt', name: 'Basement Rite', venue: 'undisclosed', neighborhood: 'Bed-Stuy', city: 'Brooklyn', date: daysFromNow(9), time: '11PM', cover: 'black', tags: ['industrial', 'noise'], description: 'address by DM. bring cash. no phones on the floor.' },
  { host: 'cryptic.rose', name: 'Cathedral Hours', venue: 'St. Agatha Hall', neighborhood: 'Morningside', city: 'NYC', date: daysFromNow(14), time: '9PM', cover: 'violet', tags: ['ambient', 'ritual'], description: 'ambient vespers under stained glass. seated. silent between sets.' },
];

async function seedEvents(ids) {
  const { count } = await db.from('events').select('id', { count: 'exact', head: true });
  if ((count || 0) > 0) { console.log('· events already present, skipping'); return; }
  for (const e of WELCOME_EVENTS) {
    const host_id = ids[e.host];
    if (!host_id) continue;
    const { error } = await db.from('events').insert({
      host_id, name: e.name, venue: e.venue, neighborhood: e.neighborhood, city: e.city,
      event_date: e.date, event_time: e.time, cover: e.cover, tags: e.tags, description: e.description,
    });
    if (error) throw new Error(`event ${e.name}: ${error.message}`);
    console.log(`✓ event ${e.name}`);
  }
}

async function main() {
  console.log('Seeding system accounts…');
  const ids = {};
  for (const acct of SYSTEM) ids[acct.handle] = await ensureSystemAccount(acct);

  console.log('Seeding welcome posts…');
  // Only seed welcome posts if the system authors currently have none.
  const authorIds = Object.values(ids);
  const { count } = await db
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .in('author_id', authorIds);
  if ((count || 0) > 0) {
    console.log('· welcome posts already present, skipping');
  } else {
    for (const p of WELCOME_POSTS) {
      const author_id = ids[p.handle];
      if (!author_id) continue;
      const { error } = await db.from('posts').insert({
        author_id, community: p.community, body: p.body, kind: 'text',
      });
      if (error) throw new Error(`post by ${p.handle}: ${error.message}`);
      console.log(`✓ post by ${p.handle}`);
    }
  }

  console.log('Seeding events…');
  await seedEvents(ids).catch(e => { if (!/events.*does not exist|find the table/i.test(e.message)) throw e; console.log('· events table not found yet (apply 0002_events.sql first)'); });

  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
