// Vercel serverless: admin actions on a user account — force sign-out (kills all refresh
// tokens; access tokens die within the hour) and ban/unban (blocks future logins).
// Runs with the service-role key, so it (1) authenticates the caller, (2) verifies the
// VERIFIED caller id is in admin_users — never trusts anything from the body about who
// is asking — and only then acts on the target id.
import { createClient } from '@supabase/supabase-js';
import { verifyUser } from './_auth.js';

const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// GoTrue's "log out everywhere" for an arbitrary user isn't exposed by supabase-js —
// hit the admin REST endpoint directly. Invalidates every refresh token for the user.
async function adminLogout(userId) {
  const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${userId}/logout`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  if (!r.ok && r.status !== 404) throw new Error(`logout failed (${r.status})`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  try {
    const user = await verifyUser(req, supa);
    if (!user) { res.status(401).json({ error: 'unauthorized' }); return; }

    const { data: adminRow } = await supa.from('admin_users')
      .select('user_id').eq('user_id', user.id).maybeSingle();
    if (!adminRow) { res.status(403).json({ error: 'not an admin' }); return; }

    const { action, userId } = req.body || {};
    if (!userId || typeof userId !== 'string') { res.status(400).json({ error: 'userId required' }); return; }

    if (action === 'signout') {
      await adminLogout(userId);
      res.status(200).json({ ok: true });
      return;
    }

    if (action === 'ban') {
      // Self-ban is blocked so a mistap can't lock the last responder out mid-incident.
      // Banning ANOTHER admin is allowed on purpose — that's the hacked-admin response.
      if (userId === user.id) { res.status(400).json({ error: "can't ban yourself" }); return; }
      const { error } = await supa.auth.admin.updateUserById(userId, { ban_duration: '87600h' }); // ~10y
      if (error) throw error;
      await adminLogout(userId); // ban blocks refresh; this kills the sessions right now
      res.status(200).json({ ok: true });
      return;
    }

    if (action === 'unban') {
      const { error } = await supa.auth.admin.updateUserById(userId, { ban_duration: 'none' });
      if (error) throw error;
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: 'unknown action' });
  } catch (e) {
    console.error('admin-user failed:', e?.message);
    res.status(500).json({ error: 'admin action failed' });
  }
}
