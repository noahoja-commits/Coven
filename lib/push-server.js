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
