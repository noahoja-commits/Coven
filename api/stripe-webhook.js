// Vercel serverless function: Stripe webhook. Verifies the signature, then on a
// completed checkout writes the paid TICKET to Supabase (service role bypasses RLS,
// so this is the only place tickets are minted). Raw body required for signature.
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export const config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return; }

  let event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(
      raw, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (e) {
    res.status(400).send(`Webhook Error: ${e.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    if (s.metadata?.event_id) {
      const { error } = await supa.from('tickets').upsert({
        event_id: s.metadata.event_id,
        buyer_id: s.metadata.buyer_id || null,
        buyer_email: s.customer_details?.email || null,
        amount_cents: s.amount_total || 0,
        currency: s.currency || 'usd',
        status: 'paid',
        stripe_session_id: s.id,
        stripe_payment_intent: typeof s.payment_intent === 'string' ? s.payment_intent : null,
      }, { onConflict: 'stripe_session_id' });
      if (error) { res.status(500).json({ error: error.message }); return; }
    }
  } else if (event.type === 'account.updated') {
    // A venue's Connect onboarding progressed — sync their payout readiness.
    const acct = event.data.object;
    const enabled = !!(acct.charges_enabled && acct.payouts_enabled);
    await supa.from('payout_accounts')
      .update({ payouts_enabled: enabled, updated_at: new Date().toISOString() })
      .eq('stripe_account_id', acct.id);
  }

  res.status(200).json({ received: true });
}
