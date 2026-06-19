import { supabase } from '../supabase';

// VAPID public key is not secret (it's the application server key sent to the
// push service). The private key lives only in the server (VAPID_PRIVATE_KEY).
const VAPID_PUBLIC = 'BJvKOjGluah854Raon-oa790O523DqelcqKhpACc4fBf05qclYJbO9mf2srhijr3p0X1ABbrX4sv6PyvLGNsjS8';

function urlB64ToUint8Array(b64) {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4);
  const base64 = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function pushSupported() {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window;
}

// Ask permission, subscribe via the service worker, and save the subscription.
// Returns the string 'ok' when push is active, otherwise a human-readable reason
// the caller can surface (so on-device failures aren't silent). Idempotent.
export async function enablePush(userId) {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return 'no service worker — open the installed app, not the Safari tab';
  }
  if (typeof window === 'undefined' || !('PushManager' in window)) {
    return 'push unsupported — on iPhone, Add to Home Screen and open from that icon (needs iOS 16.4+)';
  }
  if (!('Notification' in window)) return 'no Notification API on this device';
  if (!userId) return 'not signed in';
  try {
    if (Notification.permission === 'denied') {
      return 'notifications are blocked — enable them for this app in your device Settings';
    }
    if (Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return 'permission not granted';
    }
    const reg = await navigator.serviceWorker.ready;
    if (!reg || !reg.pushManager) return 'service worker has no pushManager (stale SW — reinstall the app)';
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC),
      });
    }
    const json = sub.toJSON();
    const { error } = await supabase.from('push_subscriptions').upsert({
      endpoint: sub.endpoint,
      user_id: userId,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    }, { onConflict: 'endpoint' });
    if (error) return 'could not save subscription: ' + error.message;
    return 'ok';
  } catch (e) {
    return 'subscribe failed: ' + (e && e.message ? e.message : String(e));
  }
}
