import { supabase } from '../supabase';

// Admin data layer. Every read here is gated server-side (RLS own-row or an is_admin()
// SECURITY DEFINER check inside the RPC) — the client checks are UX, not security.

// Am I an admin? RLS on admin_users only ever returns the caller's own row.
// Degrades to false pre-migration (table absent → error → false).
export async function fetchIsAdmin(myId) {
  if (!myId) return false;
  const { data, error } = await supabase.from('admin_users')
    .select('user_id').eq('user_id', myId).maybeSingle();
  return !error && !!data;
}

// Presence heartbeat — own row only. Called on login + every couple of minutes + on
// tab focus. Failing silently is correct: presence is best-effort telemetry.
export async function heartbeat(myId) {
  if (!myId) return;
  try {
    await supabase.from('presence').upsert(
      { user_id: myId, last_seen_at: new Date().toISOString(), ua: (navigator.userAgent || '').slice(0, 120) },
      { onConflict: 'user_id' },
    );
  } catch { /* pre-migration or offline — fine */ }
}

// Roster of everyone with a heartbeat, newest first. Empty for non-admins (gated in SQL).
export async function fetchAdminPresence() {
  const { data, error } = await supabase.rpc('admin_presence');
  if (error) return [];
  return (data || []).map(r => ({
    userId: r.user_id,
    handle: r.handle,
    avatar: r.avatar,
    avatarUrl: r.avatar_url,
    lastSeenAt: r.last_seen_at,
    ua: r.ua || '',
    joinedAt: r.joined_at,
    bannedUntil: r.banned_until,
    isAdmin: !!r.is_admin_user,
  }));
}

// Open reports queue with content previews. Empty for non-admins.
export async function fetchAdminReports() {
  const { data, error } = await supabase.rpc('admin_reports');
  if (error) return [];
  return (data || []).map(r => ({
    id: r.id,
    kind: r.target_kind,
    targetId: r.target_id,
    reason: r.reason || '',
    createdAt: r.created_at,
    count: r.report_count || 1,
    preview: r.preview || '',
    handle: r.target_handle || '',
  }));
}

export async function resolveReport(reportId) {
  const { data, error } = await supabase.rpc('admin_resolve_report', { p_id: reportId });
  if (error || data !== true) throw new Error('resolve failed');
}

// kind: 'post' | 'comment' | 'event' — hard delete via admin-gated definer RPC.
export async function adminRemoveContent(kind, id) {
  const fn = { post: 'admin_remove_post', comment: 'admin_remove_comment', event: 'admin_remove_event' }[kind];
  if (!fn) throw new Error('unknown content kind');
  const { data, error } = await supabase.rpc(fn, { p_id: id });
  if (error || data !== true) throw new Error('remove failed');
}

// Server-side account actions: 'signout' | 'ban' | 'unban'. The endpoint re-verifies
// the caller is an admin with the service role before touching anything.
export async function adminUserAction(action, userId) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const res = await fetch('/api/admin-user', {
    method: 'POST',
    headers: token
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      : { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, userId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `admin action failed (${res.status})`);
  }
}
