// Quiet client-error breadcrumb sink. The client (logError) best-effort POSTs render
// crashes + unhandled rejections here so breakages show up in the Vercel function logs
// before users report them. No DB, no secrets, never throws. Crude in-memory rate-limit.
let hits = [];

export default function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  try {
    const now = Date.now();
    hits = hits.filter((t) => now - t < 60000);
    if (hits.length > 120) { res.status(204).end(); return; } // shed load if flooded
    hits.push(now);

    const b = (req.body && typeof req.body === 'object') ? req.body : {};
    console.error('[client-error]', JSON.stringify({
      msg: String(b.msg || '').slice(0, 500),
      where: b.where ? String(b.where).slice(0, 200) : undefined,
      url: b.url ? String(b.url).slice(0, 300) : undefined,
      ts: b.ts,
      stack: b.stack ? String(b.stack).slice(0, 1500) : undefined,
    }));
  } catch { /* never throw on the log path */ }
  res.status(204).end();
}
