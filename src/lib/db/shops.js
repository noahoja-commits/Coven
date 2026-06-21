import { supabase } from '../supabase';
import { relativeTime } from '../time';

function hydrate(r, myId) {
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
  };
}

export async function fetchShops(myId) {
  const { data, error } = await supabase
    .from('shops_feed').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(r => hydrate(r, myId));
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
