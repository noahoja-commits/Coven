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
      .select('id,name,ticketed,price_cents,currency,capacity,host_id')
      .eq('id', eventId)
      .single();
    if (error) {
      console.error('checkout: supabase query error', { code: error.code, message: error.message });
      res.status(502).json({ error: 'database unavailable' });
      return;
    }
    if (!ev) { res.status(404).json({ error: 'event not found' }); return; }
    if (!ev.ticketed || ev.price_cents <= 0) { res.status(400).json({ error: 'not a paid event' }); return; }

    if (ev.capacity != null) {
      const { count } = await supa.from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId).eq('status', 'paid');
      if ((count || 0) >= ev.capacity) { res.status(409).json({ error: 'sold out' }); return; }
    }

    // If the host has connected a payout account, split the payment to them
    // and keep the platform fee. Otherwise the platform collects (manual settle).
    const { data: payout } = await supa.from('payout_accounts')
      .select('stripe_account_id, payouts_enabled').eq('user_id', ev.host_id).maybeSingle();

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const sessionParams = {
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
    };

    if (payout?.payouts_enabled && payout.stripe_account_id) {
      const pct = parseFloat(process.env.PLATFORM_FEE_PERCENT || '5');
      const flat = parseInt(process.env.PLATFORM_FEE_FLAT_CENTS || '0', 10);
      const fee = Math.min(ev.price_cents, Math.round(ev.price_cents * (pct / 100)) + flat);
      sessionParams.payment_intent_data = {
        application_fee_amount: fee,
        transfer_data: { destination: payout.stripe_account_id },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.status(200).json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
