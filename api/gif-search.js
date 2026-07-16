// Vercel serverless: GIF search/trending proxy for Tenor. The Tenor key lives ONLY here
// (server-side) — the client calls this same-origin endpoint, so no third-party host has to
// be added to the CSP connect-src, and the key never ships in the bundle. Content filter is
// forced to 'high' (strict) since this feeds a social app.
import { verifyUser } from './_auth.js';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '../lib/ratelimit.js';

const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  try {
    // Signed-in users only (keeps the proxy from being an open Tenor relay), and rate-limited.
    const user = await verifyUser(req, supa);
    if (!user) { res.status(401).json({ error: 'unauthorized' }); return; }
    if (!rateLimit(`gif:${user.id}`, { limit: 40, windowMs: 60000 })) {
      res.status(429).json({ error: 'slow down a moment' }); return;
    }
    const key = process.env.TENOR_KEY;
    if (!key) { res.status(503).json({ error: 'gifs not configured', results: [] }); return; }

    const q = (req.query?.q || '').toString().slice(0, 80).trim();
    const limit = Math.min(Math.max(parseInt(req.query?.limit, 10) || 24, 1), 40);
    const base = q
      ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}`
      : 'https://tenor.googleapis.com/v2/featured?';
    const url = `${base}&key=${encodeURIComponent(key)}&client_key=coven&limit=${limit}`
      + '&media_filter=tinygif,gif&contentfilter=high&ar_range=all';

    const r = await fetch(url);
    if (!r.ok) { console.error('gif-search: tenor', r.status); res.status(502).json({ error: 'gif source unavailable', results: [] }); return; }
    const data = await r.json();
    const results = (data.results || []).map(g => {
      const mf = g.media_formats || {};
      const full = mf.gif || {};
      const prev = mf.tinygif || mf.gif || {};
      return {
        id: g.id,
        url: full.url || prev.url,
        preview: prev.url || full.url,
        w: (prev.dims && prev.dims[0]) || 200,
        h: (prev.dims && prev.dims[1]) || 200,
        alt: (g.content_description || 'gif').slice(0, 80),
      };
    }).filter(x => x.url);

    // Short cache — trending/searches are fine slightly stale, and it trims Tenor calls.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ results });
  } catch (e) {
    console.error('gif-search', e.message);
    res.status(500).json({ error: 'gif search failed', results: [] });
  }
}
