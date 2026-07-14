// Vercel serverless: permanently delete the CALLER's own account. Runs with the
// service-role key (admin API), so it authenticates the caller and deletes only the
// VERIFIED user id — never an id from the request body. Deleting the auth user
// cascades to profiles + all user-keyed rows (schema.sql ON DELETE CASCADE).
import { createClient } from '@supabase/supabase-js';
import { verifyUser } from './_auth.js';

const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Buckets keyed by user-id prefix. DB rows cascade on user deletion but Storage
// objects don't — without this purge they'd be orphaned forever. The `voice` bucket
// is keyed by CONVERSATION id (ChatThread.jsx), not user id, so its objects can't be
// attributed here and are left behind; MediaRecorder blobs carry no GPS/EXIF, so the
// residual is content retention, not location leakage.
const USER_BUCKETS = ['post-images', 'story-images', 'avatars', 'listing-images', 'venue-maps'];

async function purgeUserStorage(userId) {
  for (const bucket of USER_BUCKETS) {
    try {
      let offset = 0;
      for (;;) {
        const { data: objects, error } = await supa.storage.from(bucket).list(userId, { limit: 100, offset });
        if (error || !objects?.length) break;
        const { error: rmError } = await supa.storage.from(bucket)
          .remove(objects.map((o) => `${userId}/${o.name}`));
        if (rmError) { console.error('delete-account: storage remove failed', { bucket, message: rmError.message }); break; }
        if (objects.length < 100) break;
        offset += objects.length;
      }
    } catch (e) {
      console.error('delete-account: storage purge failed', { bucket, message: e?.message });
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  try {
    const user = await verifyUser(req, supa);
    if (!user) { res.status(401).json({ error: 'unauthorized' }); return; }
    // Best-effort storage purge FIRST (after deleteUser the prefix is unowned but
    // objects persist). A storage failure must never block the deletion itself —
    // removing the auth user is the legal priority.
    await purgeUserStorage(user.id);
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
