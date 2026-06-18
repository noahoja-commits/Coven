import { supabase } from '../supabase';

// Kick off Stripe Checkout for an event ticket (redirects to the hosted page).
export async function startCheckout(eventId, buyerId) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, buyerId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error || 'could not start checkout');
  window.location.href = data.url;
}

// Tickets the current user has bought (RLS: own only).
export async function fetchMyTickets(myId) {
  const { data, error } = await supabase
    .from('tickets')
    .select('id, amount_cents, currency, status, checked_in_at, created_at, event:events(id,name,event_date,venue,cover)')
    .eq('buyer_id', myId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Tickets for an event (RLS: only the event's host can read these).
export async function fetchEventTickets(eventId) {
  const { data, error } = await supabase
    .from('tickets')
    .select('id, amount_cents, currency, status, checked_in_at, created_at, buyer_email, buyer:profiles(handle,avatar)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function checkInTicket(id) {
  const at = new Date().toISOString();
  const { error } = await supabase.from('tickets').update({ checked_in_at: at }).eq('id', id);
  if (error) throw error;
  return at;
}
