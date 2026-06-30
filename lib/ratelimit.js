// Lightweight in-memory sliding-window rate limiter for serverless functions.
//
// Scope: this is a PER-INSTANCE guard (Vercel may run several function instances), so it
// is a first line of defense against abuse / runaway cost — NOT a globally-consistent
// limit. It's chosen deliberately: zero dependencies, zero provisioning, safe on the
// current plan. Fluid Compute reuses warm instances, so a rapid burst from one caller
// typically lands on the same instance and is caught. For hard global guarantees, back
// this with Upstash Redis (the documented upgrade path) — same call sites, swap the impl.

const buckets = new Map(); // key -> number[] of recent hit timestamps (ms)

/**
 * Record a hit for `key` and report whether it's within the limit.
 * @param {string} key                 - e.g. `checkout:<userId>`.
 * @param {object} [opts]
 * @param {number} [opts.limit=30]     - max hits allowed per window.
 * @param {number} [opts.windowMs=60000] - sliding window length.
 * @returns {boolean} true if allowed, false if over the limit (caller should 429).
 */
export function rateLimit(key, { limit = 30, windowMs = 60000 } = {}) {
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter(t => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent); // keep the trimmed window; still over limit
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  // Opportunistic cleanup so an instance that sees many distinct keys doesn't grow forever.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k);
    }
  }
  return true;
}
