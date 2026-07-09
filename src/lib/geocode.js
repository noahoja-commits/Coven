import { supabase } from './supabase';

// Geocode a venue/address string → { lat, lng } via the auth-gated /api/geocode endpoint
// (server proxies OpenStreetMap). Best-effort: returns null on anything less than a hit, so a
// missed geocode never blocks hosting an event — it just won't get a map pin.
export async function geocodeVenue(query) {
  const q = (query || '').trim();
  if (!q) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = {};
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`, { headers, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const d = await res.json();
    return (typeof d.lat === 'number' && typeof d.lng === 'number') ? { lat: d.lat, lng: d.lng } : null;
  } catch {
    return null;
  }
}
