// Best-effort client error breadcrumb. Fire-and-forget POST to /api/log-error so we can
// spot breakages before users report them. FULLY guarded — the logger can never throw or
// block the app; if the endpoint is missing/offline it silently no-ops.
let sent = 0;
export function logError(msg, extra) {
  try {
    if (sent > 30) return;            // crude rate-limit per session
    sent += 1;
    const body = JSON.stringify({
      msg: String(msg || 'error').slice(0, 500),
      stack: extra && extra.stack ? String(extra.stack).slice(0, 2000) : undefined,
      where: extra && extra.where ? String(extra.where).slice(0, 200) : undefined,
      url: typeof location !== 'undefined' ? location.pathname + location.search : undefined,
      ts: Date.now(),
    });
    if (typeof fetch === 'function') {
      fetch('/api/log-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
    }
  } catch { /* never throw */ }
}
