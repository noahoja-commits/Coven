// Vercel serverless: permanently delete the CALLER's own account. Runs with the
// service-role key (admin API), so it authenticates the caller and deletes only the
// VERIFIED user id — never an id from the request body. Deleting the auth user
// cascades to profiles + all user-keyed rows (schema.sql ON DELETE CASCADE).
import { createClient } from '@supabase/supabase-js';
import { verifyUser } from './_auth.js';

const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  try {
    const user = await verifyUser(req, supa);
    if (!user) { res.status(401).json({ error: 'unauthorized' }); return; }
    const { error } = await supa.auth.admin.deleteUser(user.id);
    if (error) {
      console.error('delete-account: admin.deleteUser failed', { message: error.message });
      res.status(500).json({ error: 'could not delete account' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('delete-account: unexpected', e?.message);
    res.status(500).json({ error: 'could not delete account' });
  }
}
