// Vercel serverless: geocode a venue/address string to coordinates for the event map.
// GET /api/geocode?q=The Parish, Bushwick  (requires a Coven session)
// Returns { lat, lng } or { lat: null, lng: null }. Best-effort — never throws to the client,
// so a failed geocode never blocks event creation (the host can also drop a precise pin).
//
// Server-side (not a client fetch) so the browser CSP stays tight and we can send the
// descriptive User-Agent OpenStreetMap's Nominatim usage policy requires.
import { createClient } from '@supabase/supabase-js';
import { verifyUser } from './_auth.js';
import { rateLimit } from '../lib/ratelimit.js';

const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'method not allowed' }); return; }
  const user = await verifyUser(req, supa);
  if (!user) { res.status(401).json({ error: 'unauthorized' }); return; }
  // Cap per-user geocode calls — this drives an outbound request on the user's behalf.
  if (!rateLimit(`geocode:${user.id}`, { limit: 15, windowMs: 60000 })) {
    res.status(429).json({ error: 'too many requests — try again in a moment' }); return;
  }

  const q = (req.query?.q || '').toString().trim().slice(0, 200);
  if (!q) { res.status(400).json({ error: 'q query parameter required' }); return; }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Coven/1.0 (event geocoding; +https://project-tuihx.vercel.app)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) { res.status(200).json({ lat: null, lng: null }); return; }
    const arr = await r.json();
    const hit = Array.isArray(arr) ? arr[0] : null;
    const lat = hit && parseFloat(hit.lat);
    const lng = hit && parseFloat(hit.lon);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      res.status(200).json({ lat, lng });
    } else {
      res.status(200).json({ lat: null, lng: null });
    }
  } catch {
    // Geocoding is best-effort; a timeout/error must never block hosting an event.
    res.status(200).json({ lat: null, lng: null });
  }
}
