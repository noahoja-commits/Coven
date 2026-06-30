// Vercel serverless: fetch Open Graph metadata from a URL for link previews.
// GET /api/link-preview?url=https://example.com  (requires a Coven session)
// Returns { url, title, description, image, siteName } or { error: '...' }.
//
// SSRF hardening: requires auth (not an open proxy); resolves the hostname and
// rejects any private/reserved/loopback/link-local IP (incl. the 169.254.169.254
// cloud-metadata address); follows redirects MANUALLY, re-validating every hop;
// rejects numeric/alt-encoded IP hosts; caps the response body. See assertPublicHost.
import dns from 'node:dns/promises';
import net from 'node:net';
import { createClient } from '@supabase/supabase-js';
import { verifyUser } from './_auth.js';
import { rateLimit } from '../lib/ratelimit.js';

const MAX_BYTES = 512 * 1024;     // enough to reach <head> OG tags
const MAX_REDIRECTS = 3;

function ipToLong(ip) { return ip.split('.').reduce((a, o) => ((a << 8) + Number(o)) >>> 0, 0); }
function inRange(ip, cidr, bits) { return (ipToLong(ip) >>> (32 - bits)) === (ipToLong(cidr) >>> (32 - bits)); }

function isPrivateV4(ip) {
  return (
    inRange(ip, '0.0.0.0', 8) ||
    inRange(ip, '10.0.0.0', 8) ||
    inRange(ip, '100.64.0.0', 10) ||   // CGNAT
    inRange(ip, '127.0.0.0', 8) ||     // loopback
    inRange(ip, '169.254.0.0', 16) ||  // link-local incl. cloud metadata 169.254.169.254
    inRange(ip, '172.16.0.0', 12) ||   // 172.16–172.31 (Docker's 172.17 etc.)
    inRange(ip, '192.0.0.0', 24) ||
    inRange(ip, '192.168.0.0', 16) ||
    inRange(ip, '198.18.0.0', 15) ||   // benchmarking
    inRange(ip, '224.0.0.0', 4) ||     // multicast
    inRange(ip, '240.0.0.0', 4)        // reserved
  );
}
// Expand an IPv6 string to its 16 bytes (handles ::, a trailing dotted-quad, zone id).
// Returns null if it can't be parsed (caller treats that as blocked).
function v6ToBytes(ip) {
  ip = ip.split('%')[0].toLowerCase();
  let head, tail;
  if (ip.includes('::')) {
    const [h, t] = ip.split('::');
    head = h ? h.split(':') : [];
    tail = t ? t.split(':') : [];
  } else { head = ip.split(':'); tail = []; }
  const expand = (arr) => arr.flatMap(g => {
    if (g.includes('.')) {                       // trailing dotted-quad counts as 2 hextets
      const o = g.split('.').map(Number);
      if (o.length !== 4 || o.some(x => Number.isNaN(x) || x > 255)) return ['zzzz'];
      return [(((o[0] << 8) | o[1]) >>> 0).toString(16), (((o[2] << 8) | o[3]) >>> 0).toString(16)];
    }
    return [g];
  });
  head = expand(head); tail = expand(tail);
  const missing = 8 - (head.length + tail.length);
  if (missing < 0) return null;
  const groups = [...head, ...Array(missing).fill('0'), ...tail];
  if (groups.length !== 8) return null;
  const bytes = [];
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    const n = parseInt(g, 16);
    bytes.push((n >> 8) & 0xff, n & 0xff);
  }
  return bytes;
}
// Parse to bytes and check ranges, so hex IPv4-mapped (::ffff:7f00:1), NAT64, and dotted
// forms are all caught — not just the literal dotted-decimal ::ffff:127.0.0.1.
function isPrivateV6(ip) {
  const b = v6ToBytes(ip);
  if (!b) return true;                                                  // unparseable → block
  if (b.every(x => x === 0)) return true;                               // :: unspecified
  if (b.slice(0, 15).every(x => x === 0) && b[15] === 1) return true;   // ::1 loopback
  if (b[0] === 0xfe && (b[1] & 0xc0) === 0x80) return true;             // fe80::/10 link-local
  if ((b[0] & 0xfe) === 0xfc) return true;                              // fc00::/7 unique-local
  const mapped = b.slice(0, 10).every(x => x === 0) && b[10] === 0xff && b[11] === 0xff; // ::ffff:0:0/96
  const nat64  = b[0] === 0 && b[1] === 0x64 && b[2] === 0xff && b[3] === 0x9b && b.slice(4, 12).every(x => x === 0); // 64:ff9b::/96
  const compat = b.slice(0, 12).every(x => x === 0);                   // ::/96 (deprecated v4-compatible)
  if (mapped || nat64 || compat) return isPrivateV4(`${b[12]}.${b[13]}.${b[14]}.${b[15]}`);
  return false;                                                         // global unicast
}
function isBlockedIp(ip) {
  const fam = net.isIP(ip);
  if (fam === 4) return isPrivateV4(ip);
  if (fam === 6) return isPrivateV6(ip);
  return true; // not a valid IP literal → block
}

// Throws if the hostname is (or resolves to) a non-public address.
async function assertPublicHost(hostname) {
  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) throw new Error('blocked host');
    return;
  }
  // Numeric/hex-only "hostnames" are decimal/hex IP tricks (e.g. 2130706433 = 127.0.0.1).
  if (/^\d+$/.test(hostname) || /^0x[0-9a-f]+$/i.test(hostname)) throw new Error('blocked host');
  // NOTE (accepted residual): this vets the DNS answer, but fetch() re-resolves at connect time,
  // so a low-TTL rebinding domain could in theory connect to a different IP than we vetted.
  // Mitigated by: the auth gate, the html-only content-type gate (blocks cloud-metadata JSON/text
  // exfil), manual per-hop redirect re-validation, and the body size cap. The complete fix is to
  // pin the connection to a vetted IP (custom node:https lookup) — deferred as low practical risk
  // on this serverless deployment.
  const records = await dns.lookup(hostname, { all: true });
  if (!records.length) throw new Error('unresolvable host');
  for (const r of records) if (isBlockedIp(r.address)) throw new Error('blocked host');
}

// Fetch following redirects manually, re-validating the host of every hop.
async function safeFetch(startUrl) {
  let url = startUrl;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('bad protocol');
    await assertPublicHost(parsed.hostname);
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Coven/1.0 (link-preview; +https://project-tuihx.vercel.app)', 'Accept': 'text/html' },
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
    });
    if (resp.status >= 300 && resp.status < 400) {
      const loc = resp.headers.get('location');
      if (!loc) throw new Error('redirect without location');
      url = new URL(loc, url).href; // re-validated at the top of the next iteration
      continue;
    }
    return resp;
  }
  throw new Error('too many redirects');
}

async function readCapped(resp, maxBytes) {
  const reader = resp.body?.getReader?.();
  if (!reader) return (await resp.text()).slice(0, maxBytes);
  let received = 0; const chunks = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.length;
    chunks.push(Buffer.from(value));
    if (received >= maxBytes) { try { await reader.cancel(); } catch { /* noop */ } break; }
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'method not allowed' }); return; }

  // Require an authenticated Coven user — this must not be an open SSRF proxy.
  const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const user = await verifyUser(req, supa);
  if (!user) { res.status(401).json({ error: 'unauthorized' }); return; }
  // This endpoint drives outbound fetches on the user's behalf — cap per-user fetch
  // amplification (the SSRF hardening already restricts WHERE it can fetch).
  if (!rateLimit(`linkpreview:${user.id}`, { limit: 30, windowMs: 60000 })) {
    res.status(429).json({ error: 'too many requests — try again in a moment' }); return;
  }

  const url = req.query?.url;
  if (!url || typeof url !== 'string') { res.status(400).json({ error: 'url query parameter required' }); return; }
  try {
    const p = new URL(url);
    if (p.protocol !== 'http:' && p.protocol !== 'https:') { res.status(400).json({ error: 'only http/https urls are supported' }); return; }
  } catch {
    res.status(400).json({ error: 'invalid url' }); return;
  }

  try {
    const response = await safeFetch(url);
    if (!response.ok) { res.status(422).json({ error: `remote server returned ${response.status}` }); return; }
    const ctype = response.headers.get('content-type') || '';
    if (!/text\/html|application\/xhtml/i.test(ctype)) { res.status(415).json({ error: 'not an html page' }); return; }

    const html = await readCapped(response, MAX_BYTES);
    const og = { url, title: '', description: '', image: '', siteName: '' };
    og.title       = extractMeta(html, 'og:title')       || extractMeta(html, 'twitter:title')       || extractTitle(html) || '';
    og.description = extractMeta(html, 'og:description') || extractMeta(html, 'twitter:description') || extractDesc(html)  || '';
    og.image       = extractMeta(html, 'og:image')       || extractMeta(html, 'twitter:image')       || '';
    og.siteName    = extractMeta(html, 'og:site_name')   || extractDomain(url);

    if (og.image && !og.image.startsWith('http')) {
      try { og.image = new URL(og.image, url).href; } catch { og.image = ''; }
    }
    // The preview image is rendered by the browser; make sure it isn't an internal URL either.
    if (og.image) {
      try { await assertPublicHost(new URL(og.image).hostname); } catch { og.image = ''; }
    }
    og.title       = (og.title || '').slice(0, 200);
    og.description = (og.description || '').slice(0, 400);

    res.status(200).json(og);
  } catch (e) {
    const msg = e?.message || '';
    if (/blocked host|unresolvable host|bad protocol|too many redirects|redirect without location/.test(msg)) {
      res.status(400).json({ error: 'invalid url' }); return;
    }
    if (e.name === 'TimeoutError' || e.code === 'ETIMEDOUT' || e.code === 'ENOTFOUND') {
      res.status(408).json({ error: 'timeout fetching url' }); return;
    }
    console.error('link-preview', msg);
    res.status(502).json({ error: 'failed to fetch url' });
  }
}

function extractMeta(html, property) {
  const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${escapeRegex(property)}["'][^>]+content=["']([^"']*)["']`, 'i');
  const match = html.match(regex);
  if (match) return decodeHtml(match[1]);
  const regex2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escapeRegex(property)}["']`, 'i');
  const match2 = html.match(regex2);
  if (match2) return decodeHtml(match2[1]);
  return null;
}
function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? decodeHtml(match[1].trim()) : null;
}
function extractDesc(html) {
  const match = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  return match ? decodeHtml(match[1]) : null;
}
function extractDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}
function decodeHtml(str) {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");
}
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
