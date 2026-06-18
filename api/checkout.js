// Vercel serverless function: create a Stripe Checkout Session for an event ticket.
// Secret keys live ONLY here (server-side). Returns the hosted checkout URL.
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  try {
    const { eventId, buyerId } = req.body || {};
    if (!eventId) { res.status(400).json({ error: 'eventId required' }); return; }

    const { data: ev, error } = await supa
      .from('events')
      .select('id,name,ticketed,price_cents,currency,capacity')
      .eq('id', eventId)
      .single();
    if (error || !ev) { res.status(404).json({ error: 'event not found' }); return; }
    if (!ev.ticketed || ev.price_cents <= 0) { res.status(400).json({ error: 'not a paid event' }); return; }

    if (ev.capacity != null) {
      const { count } = await supa.from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId).eq('status', 'paid');
      if ((count || 0) >= ev.capacity) { res.status(409).json({ error: 'sold out' }); return; }
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: ev.currency || 'usd',
          unit_amount: ev.price_cents,
          product_data: { name: `Ticket — ${ev.name}` },
        },
      }],
      metadata: { event_id: ev.id, buyer_id: buyerId || '' },
      success_url: `${origin}/?ticket=success&event=${ev.id}`,
      cancel_url: `${origin}/?ticket=cancel`,
    });
    res.status(200).json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
