import { supabase } from '../supabase';
import { relativeTime } from '../time';

const SHAPE = { clothing: 'dress', jewelry: 'jewelry', ritual: 'pentacle', art: 'art', books: 'book', records: 'record', curio: 'orb' };
const PALETTES = ['oxblood', 'black', 'silver', 'midnight', 'bone'];
function paletteFor(id) {
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTES[h % PALETTES.length];
}

function hydrate(r, myId) {
  return {
    id: r.id,
    title: r.title,
    kind: r.kind || 'sale',
    price: Math.round((r.price_cents || 0) / 100),
    priceMode: r.price_mode,
    condition: r.condition,
    category: r.category,
    description: r.description,
    storyBehind: r.story_behind,
    seller: { user: r.seller_handle, avatar: r.seller_avatar },
    sellerId: r.seller_id,
    mine: !!myId && r.seller_id === myId,
    imageUrl: r.image_url || null,
    photo: { shape: SHAPE[r.category] || 'book', palette: paletteFor(r.id) },
    tags: [],
    posted: relativeTime(r.created_at),
  };
}

export async function fetchListings(myId, { limit = 100 } = {}) {
  // Newest-first, capped. The marketplace was loaded in full on every open; the cap is a
  // runaway guard (full infinite-scroll for the marketplace is a fast-follow if needed).
  const { data, error } = await supabase
    .from('listings_feed').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data || []).map(r => hydrate(r, myId));
}

export async function createListing(data, me) {
  const { data: row, error } = await supabase.from('listings').insert({
    seller_id: me.id,
    title: data.title,
    // Only send kind for non-sale listings so plain wares still post even before
    // migration 0028 adds the column (the column defaults to 'sale').
    ...(data.kind && data.kind !== 'sale' ? { kind: data.kind } : {}),
    price_cents: Math.round((parseFloat(data.price) || 0) * 100),
    price_mode: data.priceMode || 'firm',
    condition: data.condition || 'used',
    category: data.category || 'curio',
    description: data.description || '',
    story_behind: data.storyBehind || '',
    image_url: data.image_url || null,
  }).select('*').single();
  if (error) throw error;
  return hydrate({ ...row, seller_handle: me.handle, seller_avatar: me.avatar }, me.id);
}

export async function deleteListing(id) {
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw error;
}

// Mark your listing sold — reuses the existing status column; the listings_feed view filters
// status='active', so a sold item simply leaves the marketplace (kept in the table for history).
export async function markListingSold(id) {
  const { error } = await supabase.from('listings').update({ status: 'sold' }).eq('id', id);
  if (error) throw error;
}

// Buy an oddity — kicks off Stripe Checkout (redirects to the hosted page). The buyer is taken
// from the verified session server-side; the seller is paid via Connect (or platform-collect).
export async function startListingCheckout(listingId) {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess?.session?.access_token;
  const res = await fetch('/api/listing-checkout', {
    method: 'POST',
    headers: token
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      : { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listingId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error || 'could not start checkout');
  window.location.href = data.url;
}
