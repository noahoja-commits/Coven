import { supabase } from '../supabase';
import { relativeTime } from '../time';

function hydrate(r, myId) {
  const boostedUntil = r.boosted_until || null;
  return {
    id: r.id,
    name: r.name,
    kind: r.kind || '',
    neighborhood: r.neighborhood || '',
    url: r.url || '',
    blurb: r.blurb || '',
    verified: !!r.verified,
    owner: { user: r.owner_handle, avatar: r.owner_avatar },
    ownerId: r.owner_id,
    mine: !!myId && r.owner_id === myId,
    posted: relativeTime(r.created_at),
    boostedUntil,
    isBoosted: !!boostedUntil && new Date(boostedUntil).getTime() > Date.now(),
  };
}

export async function fetchShops(myId) {
  const { data, error } = await supabase.from('shops_feed').select('*');
  if (error) throw error;
  // Boosted (unexpired) shops pinned to the top, then newest first.
  const now = Date.now();
  const rows = (data || []).slice().sort((a, b) => {
    const aB = a.boosted_until && new Date(a.boosted_until).getTime() > now ? 1 : 0;
    const bB = b.boosted_until && new Date(b.boosted_until).getTime() > now ? 1 : 0;
    if (aB !== bB) return bB - aB;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  return rows.map(r => hydrate(r, myId));
}

// Start a Stripe subscription Checkout to boost (pin) a shop for $40/mo. Redirects to Stripe.
export async function startBoostCheckout(shopId) {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess?.session?.access_token;
  const res = await fetch('/api/boost-checkout', {
    method: 'POST',
    headers: token
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      : { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shopId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error || 'could not start boost checkout');
  window.location.href = data.url;
}

export async function createShop(data, me) {
  const { data: row, error } = await supabase.from('shops').insert({
    owner_id: me.id,
    name: data.name,
    kind: data.kind || '',
    neighborhood: data.neighborhood || '',
    url: data.url || '',
    blurb: data.blurb || '',
  }).select('*').single();
  if (error) throw error;
  return hydrate({ ...row, owner_handle: me.handle, owner_avatar: me.avatar }, me.id);
}

export async function deleteShop(id) {
  const { error } = await supabase.from('shops').delete().eq('id', id);
  if (error) throw error;
}
