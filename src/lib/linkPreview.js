// Client-side link preview helper with caching and debouncing.
// Fetches Open Graph metadata from the Vercel serverless endpoint (which requires
// a Coven session — we attach the access token below).
import { supabase } from './supabase';

const cache = new Map(); // url → { title, description, image, siteName }

/**
 * Fetch link preview metadata for a URL.
 * Results are cached in-memory for the session (Map, LRU ~50 entries).
 * @param {string} url - The URL to preview.
 * @returns {Promise<{url:string, title:string, description:string, image:string, siteName:string}|null>}
 */
export async function fetchLinkPreview(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Basic URL validation
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  } catch {
    return null; // not a valid URL
  }

  // Check cache
  if (cache.has(trimmed)) return cache.get(trimmed);

  // Evict oldest entries if cache is large
  if (cache.size > 50) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = {};
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
    const res = await fetch(`/api/link-preview?url=${encodeURIComponent(trimmed)}`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;

    // Only cache if we got at least a title
    if (data.title) {
      cache.set(trimmed, data);
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Check if a string contains a standalone URL (not in the middle of text).
 * Returns the URL or null.
 */
export function extractUrl(text) {
  if (!text) return null;
  // Match URLs at the start or surrounded by whitespace/line breaks
  const match = text.match(
    /(?:^|[\s\n\r])https?:\/\/[^\s\n\r]{3,}/i
  );
  if (!match) return null;
  const url = match[0].trim();
  // Must have a valid TLD or be a well-formed URL
  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    return null;
  }
}
