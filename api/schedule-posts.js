// Vercel cron: publishes posts that are due for scheduling.
// Runs every 15 minutes. Sets scheduled_at to NULL for posts where
// scheduled_at <= now(), making them visible in the feed_posts view.
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (!process.env.CRON_SECRET || req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) {
    res.status(401).json({ error: 'unauthorized' }); return;
  }

  try {
    const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Publish everything due: clear scheduled_at and bump created_at so the post
    // lands fresh at the top of the feed at publish time. .lte() already excludes
    // NULL rows (null <= x is null), so unscheduled posts are untouched.
    const nowIso = new Date().toISOString();
    const { data, error } = await supa
      .from('posts')
      .update({ scheduled_at: null, created_at: nowIso })
      .lte('scheduled_at', nowIso)
      .select('id');

    if (error) throw error;

    res.status(200).json({ published: data?.length || 0 });
  } catch (e) {
    console.error('schedule-posts', e?.message || e || 'Unknown error');
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
}
