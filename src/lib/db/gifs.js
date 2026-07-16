import { supabase } from '../supabase';

// Search (or, with an empty query, trend) GIFs through the server-side Tenor proxy.
// Returns [{ id, url, preview, w, h, alt }]. The Tenor key never touches the client.
export async function searchGifs(query = '') {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess?.session?.access_token;
  const res = await fetch(`/api/gif-search?q=${encodeURIComponent(query)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'gifs unavailable');
  return body.results || [];
}
