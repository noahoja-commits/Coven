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
    price: Math.round((r.price_cents || 0) / 100),
    priceMode: r.price_mode,
    condition: r.condition,
    category: r.category,
    description: r.description,
    storyBehind: r.story_behind,
    seller: { user: r.seller_handle, avatar: r.seller_avatar },
    sellerId: r.seller_id,
    mine: !!myId && r.seller_id === myId,
    photo: { shape: SHAPE[r.category] || 'book', palette: paletteFor(r.id) },
    tags: [],
    posted: relativeTime(r.created_at),
  };
}

export async function fetchListings(myId) {
  const { data, error } = await supabase
    .from('listings_feed').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(r => hydrate(r, myId));
}

export async function createListing(data, me) {
  const { data: row, error } = await supabase.from('listings').insert({
    seller_id: me.id,
    title: data.title,
    price_cents: Math.round((parseFloat(data.price) || 0) * 100),
    price_mode: data.priceMode || 'firm',
    condition: data.condition || 'used',
    category: data.category || 'curio',
    description: data.description || '',
    story_behind: data.storyBehind || '',
  }).select('*').single();
  if (error) throw error;
  return hydrate({ ...row, seller_handle: me.handle, seller_avatar: me.avatar }, me.id);
}

export async function deleteListing(id) {
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw error;
}
