// Apply a .sql file to the Supabase project via the Management API.
//   SUPABASE_PAT=sbp_... node supabase/apply.mjs supabase/migrations/0002_events.sql
// PAT is read from env (never committed). Reusable for every migration.
import { readFileSync } from 'node:fs';

const PAT = process.env.SUPABASE_PAT;
const REF = process.env.SUPABASE_REF || 'vrogmbvhdbporznqduyq';
const file = process.argv[2];
if (!PAT || !file) {
  console.error('usage: SUPABASE_PAT=sbp_... node supabase/apply.mjs <file.sql>');
  process.exit(1);
}

const sql = readFileSync(file, 'utf8');
const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql }),
});
const text = await res.text();
if (!res.ok) { console.error('FAILED', res.status, text); process.exit(1); }
console.log('applied', file, '->', res.status, text.length > 2 ? text.slice(0, 300) : '(ok)');
