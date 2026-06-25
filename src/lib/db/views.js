import { supabase } from '../supabase';

// Record a unique view (idempotent server-side). kind: 'post' | 'story' | 'listing'.
// A module-level guard avoids firing the same RPC twice in a session; the DB unique
// constraint is the real source of truth for the count.
const recorded = new Set();
export async function recordView(kind, id) {
  if (!id) return;
  const key = `${kind}:${id}`;
  if (recorded.has(key)) return;
  recorded.add(key);
  try { await supabase.rpc('record_view', { p_kind: kind, p_id: id }); }
  catch { recorded.delete(key); } // allow a retry on transient failure
}

// Batched unique-view counts for a set of ids of one kind → { [id]: count }.
export async function fetchViewCounts(kind, ids) {
  const list = [...new Set((ids || []).filter(Boolean))];
  if (!list.length) return {};
  const { data, error } = await supabase.rpc('view_counts', { p_kind: kind, p_ids: list });
  if (error) return {};
  const map = {};
  for (const r of data || []) map[r.id] = Number(r.n) || 0;
  return map;
}
