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

  // STRIPE_WEBHOOK_SECRET may hold several comma-separated signing secrets — one
  // per Stripe event destination. We use two: the "Your account" destination
  // (checkout.session.completed → tickets) and the "Connected accounts"
  // destination (account.updated → venue payout readiness). Each has its own
  // secret, so try them in turn until one verifies.
  const secrets = (process.env.STRIPE_WEBHOOK_SECRET || '')
    .split(',').map(s => s.trim()).filter(Boolean);

  if (secrets.length === 0) {
    console.error('stripe-webhook: STRIPE_WEBHOOK_SECRET is not configured — dropping event');
    res.status(500).send('Webhook secret not configured');
    return;
  }

  let event, lastErr;
  const raw = await readRawBody(req);
  const sig = req.headers['stripe-signature'];
  for (const secret of secrets) {
    try { event = stripe.webhooks.constructEvent(raw, sig, secret); break; }
    catch (e) { lastErr = e; }
  }
  if (!event) {
    res.status(400).send(`Webhook Error: ${lastErr ? lastErr.message : 'no signing secret configured'}`);
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
