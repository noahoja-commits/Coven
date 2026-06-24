// Vercel serverless function: create a Stripe SUBSCRIPTION Checkout Session that boosts
// (pins) a shop in the Oddities Merchants directory for $40/month. Platform revenue —
// no Connect / no application fee. The shop owner is verified server-side.
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { verifyUser } from './_auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const BOOST_PRICE_CENTS = 4000; // $40 / month

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  try {
    const user = await verifyUser(req, supa);
    if (!user) { res.status(401).json({ error: 'unauthorized' }); return; }
    const { shopId } = req.body || {};
    if (!shopId) { res.status(400).json({ error: 'shopId required' }); return; }

    // The boost is attributed to the verified owner of the shop, never the request body.
    const { data: shop, error } = await supa
      .from('shops').select('id,name,owner_id').eq('id', shopId).maybeSingle();
    if (error) {
      console.error('boost-checkout: supabase query error', { code: error.code, message: error.message });
      res.status(502).json({ error: 'database unavailable' });
      return;
    }
    if (!shop) { res.status(404).json({ error: 'shop not found' }); return; }
    if (shop.owner_id !== user.id) { res.status(403).json({ error: 'not your shop' }); return; }

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const meta = { kind: 'boost', shop_id: shop.id, owner_id: user.id };
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: BOOST_PRICE_CENTS,
          recurring: { interval: 'month' },
          product_data: { name: `Coven — Store Boost · ${shop.name}` },
        },
      }],
      client_reference_id: user.id,
      metadata: meta,
      // Mirror metadata onto the subscription so later customer.subscription.* webhook
      // events (which carry the subscription, not the session) can resolve the shop.
      subscription_data: { metadata: meta },
      success_url: `${origin}/?boost=success`,
      cancel_url: `${origin}/?boost=cancel`,
    });
    res.status(200).json({ url: session.url });
  } catch (e) {
    console.error('boost-checkout', e.message);
    res.status(500).json({ error: 'boost unavailable' });
  }
}
