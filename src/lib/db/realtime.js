import { supabase } from '../supabase';

// Build a SELF-HEALING realtime subscription.
//
// Supabase channels die permanently on a terminal CHANNEL_ERROR / TIMED_OUT (a network blip, a
// laptop sleep/wake, a dropped WebSocket). With a bare `.subscribe()` there's no recovery, so live
// DMs / the notification bell / the "out tonight" map silently stop updating until a full page
// reload. This wraps the channel so that on a terminal drop it tears the channel down and rebuilds
// it with capped exponential backoff.
//
// `build()` must return a configured-but-not-yet-subscribed channel, e.g.
//   resilientChannel(() => supabase.channel('x').on('postgres_changes', {...}, cb))
// Returns an unsubscribe function.
//
// Note: we intentionally do NOT reconnect on 'CLOSED' — that also fires during our own normal
// teardown, and the `closed` guard below means an unexpected server close simply stops (a fresh
// mount re-subscribes). We recover from the two states that represent an unexpected live failure.
export function resilientChannel(build) {
  let ch;
  let closed = false;
  let attempt = 0;
  let retry;

  const connect = () => {
    ch = build();
    ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') { attempt = 0; return; }
      if (closed) return;
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        try { supabase.removeChannel(ch); } catch { /* noop */ }
        const delay = Math.min(30000, 1000 * 2 ** attempt);
        attempt += 1;
        clearTimeout(retry);
        retry = setTimeout(connect, delay);
      }
    });
  };

  connect();

  return () => {
    closed = true;
    clearTimeout(retry);
    try { supabase.removeChannel(ch); } catch { /* noop */ }
  };
}
