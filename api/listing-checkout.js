// Vercel serverless function: create a Stripe Checkout Session to BUY an oddity (listing).
// Mirrors api/checkout.js (event tickets): the seller receives the money via their Connect
// payout account with the platform fee taken out; if they haven't connected, the platform
// collects (manual settle). The buyer is the verified caller, never the request body.
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { verifyUser } from './_auth.js';
import { rateLimit } from '../lib/ratelimit.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  try {
    const user = await verifyUser(req, supa);
    if (!user) { res.status(401).json({ error: 'unauthorized' }); return; }
    if (!rateLimit(`listing-checkout:${user.id}`, { limit: 10, windowMs: 60000 })) {
      res.status(429).json({ error: 'too many requests — try again in a moment' }); return;
    }
    const buyerId = user.id;
    const { listingId } = req.body || {};
    if (!listingId) { res.status(400).json({ error: 'listingId required' }); return; }

    const { data: listing, error } = await supa
      .from('listings')
      .select('id, title, price_cents, currency, status, seller_id')
      .eq('id', listingId)
      .maybeSingle();
    if (error) {
      console.error('listing-checkout: supabase query error', { code: error.code, message: error.message });
      res.status(502).json({ error: 'database unavailable' });
      return;
    }
    if (!listing) { res.status(404).json({ error: 'listing not found' }); return; }
    if (listing.status && listing.status !== 'active') { res.status(409).json({ error: 'already sold' }); return; }
    if (!listing.price_cents || listing.price_cents <= 0) { res.status(400).json({ error: 'this item has no set price — whisper the seller instead' }); return; }
    if (listing.seller_id === buyerId) { res.status(400).json({ error: "you can't buy your own listing" }); return; }

    // First-pass sold guard (authoritative gate is the webhook). If a paid order already exists
    // for this one-of-a-kind item, don't even open checkout.
    const { count: paidCount } = await supa.from('oddity_orders')
      .select('id', { count: 'exact', head: true })
      .eq('listing_id', listing.id).eq('status', 'paid');
    if ((paidCount || 0) > 0) { res.status(409).json({ error: 'already sold' }); return; }

    // Seller payout account (same table as event hosts). Enabled → split to them + platform fee;
    // otherwise the platform collects and settles with the seller off-platform.
    const { data: payout } = await supa.from('payout_accounts')
      .select('stripe_account_id, payouts_enabled').eq('user_id', listing.seller_id).maybeSingle();

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const sessionParams = {
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: listing.currency || 'usd',
          unit_amount: listing.price_cents,
          product_data: { name: `Oddity — ${listing.title}` },
        },
      }],
      metadata: { listing_id: listing.id, buyer_id: buyerId || '', seller_id: listing.seller_id || '' },
      // Short payable window shrinks the chance a stale open tab pays after someone else buys it;
      // the webhook still refunds any second payment authoritatively.
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${origin}/?listing=success&oddity=${listing.id}`,
      cancel_url: `${origin}/?listing=cancel&oddity=${listing.id}`,
    };

    if (payout?.payouts_enabled && payout.stripe_account_id) {
      const pct = parseFloat(process.env.PLATFORM_FEE_PERCENT || '10');
      const flat = parseInt(process.env.PLATFORM_FEE_FLAT_CENTS || '0', 10);
      const fee = Math.min(listing.price_cents, Math.round(listing.price_cents * (pct / 100)) + flat);
      sessionParams.payment_intent_data = {
        application_fee_amount: fee,
        transfer_data: { destination: payout.stripe_account_id },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.status(200).json({ url: session.url });
  } catch (e) {
    console.error('listing-checkout', e.message);
    res.status(500).json({ error: 'checkout unavailable' });
  }
}
