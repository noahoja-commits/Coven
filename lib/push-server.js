// Shared utilities for Coven serverless functions (api/*.js).
// Centralises VAPID setup, Supabase service-role client, and push-send logic.
// Lives OUTSIDE api/ and without a '_' prefix on purpose: Vercel did NOT bundle the
// transitive node_module deps (web-push, supabase) of a '_'-prefixed api/ helper, so
// importing this from there crashed every function on load (FUNCTION_INVOCATION_FAILED).
// Imported via '../lib/push-server.js' by push/digest/event-reminder/event-reminders-cron.

import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// VAPID public key is not secret — it's the application server key sent to the
// push service. The private key lives only in environment (VAPID_PRIVATE_KEY).
const VAPID_PUBLIC = 'BJvKOjGluah854Raon-oa790O523DqelcqKhpACc4fBf05qclYJbO9mf2srhijr3p0X1ABbrX4sv6PyvLGNsjS8';

let supa = null;

/** Get or create the cached service-role Supabase client. */
export function getSupa() {
  if (!supa) {
    supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return supa;
}

/** Initialise webpush VAPID details. Throws if VAPID_PRIVATE_KEY is missing. */
export function initVapid() {
  if (!process.env.VAPID_PRIVATE_KEY) throw new Error('VAPID_PRIVATE_KEY not configured');
  webpush.setVapidDetails('mailto:noahoja@gmail.com', VAPID_PUBLIC, process.env.VAPID_PRIVATE_KEY);
}

/**
 * Check that the request carries a valid CRON_SECRET bearer token.
 * Returns true if authorised; sends a 401 response and returns false if not.
 */
export function checkCronAuth(req, res) {
  if (!process.env.CRON_SECRET || req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) {
    res.status(401).json({ error: 'unauthorized' });
    return false;
  }
  return true;
}

/**
 * Send a push notification to every subscription owned by a user.
 * Skips if the user has muted the given notification kind (preference gate).
 *
 * @param {string} userId       - The recipient's user ID.
 * @param {object} payload      - `{ title, body, tag, url }` for the push.
 * @param {string} [kind]       - Notification kind for preference gating (e.g. 'digest', 'event_reminder').
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - Optional abort signal.
 * @returns {Promise<{sent: number, errors: Array, skipped: boolean}>}
 */
export async function sendToUser(userId, payload, kind, { signal } = {}) {
  // Preference gate — inline so callers don't need a separate shouldSend call
  if (kind) {
    try {
      const supa = getSupa();
      const { data: pref } = await supa
        .from('profiles')
        .select('notification_prefs')
        .eq('id', userId)
        .single();
      if (pref?.notification_prefs && pref.notification_prefs[kind] === false) {
        return { sent: 0, errors: [], skipped: true };
      }
    } catch {
      // Pre-migration: column doesn't exist yet — send the push
    }
  }

  const supa = getSupa();
  const { data: subs } = await supa
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId);

  let sent = 0;
  const errors = [];
  const body = JSON.stringify(payload);

  for (const s of (subs || [])) {
    if (signal?.aborted) break;
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        body
      );
      sent++;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) {
        try { await supa.from('push_subscriptions').delete().eq('endpoint', s.endpoint); }
        catch (delErr) { errors.push({ type: 'cleanup', endpoint: s.endpoint?.slice(0, 40), error: delErr?.message }); }
      } else {
        errors.push({ type: 'send', endpoint: s.endpoint?.slice(0, 40), status: e.statusCode, error: e?.message });
      }
    }
  }

  return { sent, errors, skipped: false };
}

/** Split an array into chunks of at most `size`. */
function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Run `worker` over `items` with at most `limit` running at once (a bounded promise
 * pool). Used so bulk push sends don't fire all at once (memory/socket blowup) nor
 * run fully serially (timeout). Worker errors are the worker's own responsibility.
 */
async function runPool(items, limit, worker) {
  let i = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx]);
    }
  });
  await Promise.all(runners);
}

/**
 * Bulk push to many users with BATCHED preference/subscription reads and BOUNDED send
 * concurrency. This is the fan-out path for crons (digest, event reminders): the old
 * pattern was `for (user) await sendToUser(...)` — 2 DB queries per user plus fully
 * serial sends, which blows Vercel's function timeout well before 40k subscribers.
 * Here prefs and subscriptions are each loaded in a few chunked `.in(...)` queries and
 * sends run through a concurrency pool, with one batched cleanup of stale endpoints.
 *
 * @param {Array<{userId: string, payload: object}>} recipients - one entry per user
 *        (deduped here defensively; first payload wins if a user repeats).
 * @param {string} [kind] - notification kind for preference gating (e.g. 'digest').
 * @param {object} [options]
 * @param {number} [options.concurrency=25] - max simultaneous web-push sends.
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{ usersSent: number, pushesSent: number, errors: number }>}
 */
export async function sendToUsers(recipients, kind, { concurrency = 25, signal } = {}) {
  const supa = getSupa();

  // Dedup recipients by userId (first payload wins) so a user gets at most one push.
  const byUser = new Map();
  for (const r of recipients || []) {
    if (r && r.userId && !byUser.has(r.userId)) byUser.set(r.userId, r.payload);
  }
  const ids = [...byUser.keys()];
  if (!ids.length) return { usersSent: 0, pushesSent: 0, errors: 0 };

  // 1. Batch-load preferences → set of userIds who muted this kind.
  const muted = new Set();
  if (kind) {
    for (const chunk of chunkArray(ids, 500)) {
      if (signal?.aborted) break;
      try {
        const { data } = await supa.from('profiles').select('id, notification_prefs').in('id', chunk);
        (data || []).forEach(p => { if (p.notification_prefs && p.notification_prefs[kind] === false) muted.add(p.id); });
      } catch { /* pre-migration: notification_prefs column absent → nobody muted */ }
    }
  }

  // 2. Batch-load every subscription for these users → userId → [subs].
  const subsByUser = {};
  for (const chunk of chunkArray(ids, 500)) {
    if (signal?.aborted) break;
    const { data } = await supa
      .from('push_subscriptions').select('user_id, endpoint, p256dh, auth').in('user_id', chunk);
    (data || []).forEach(s => { (subsByUser[s.user_id] ||= []).push(s); });
  }

  // 3. Flatten to a send list (skip muted users + users with no live subscription).
  const jobs = [];
  const eligible = new Set();
  for (const [userId, payload] of byUser) {
    if (muted.has(userId)) continue;
    const subs = subsByUser[userId];
    if (!subs?.length) continue;
    eligible.add(userId);
    const body = JSON.stringify(payload);
    for (const s of subs) jobs.push({ sub: s, body });
  }

  // 4. Send with bounded concurrency; collect stale endpoints for one batched delete.
  let pushesSent = 0, errors = 0;
  const stale = [];
  await runPool(jobs, concurrency, async ({ sub, body }) => {
    if (signal?.aborted) return;
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, body);
      pushesSent++;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) stale.push(sub.endpoint);
      else errors++;
    }
  });

  // 5. Prune dead subscriptions in one query (not one-per-failure).
  if (stale.length) {
    try { await supa.from('push_subscriptions').delete().in('endpoint', stale); } catch { /* best effort */ }
  }

  return { usersSent: eligible.size, pushesSent, errors };
}
