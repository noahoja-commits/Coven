// One-off: add the store-boost subscription events to your Stripe webhook endpoint(s) so
// renewals/cancellations keep the shop pin in sync. Idempotent — safe to re-run.
//
//   STRIPE_SECRET_KEY=sk_live_xxx node scripts/setup-stripe-webhook.mjs
//
// (Use your LIVE secret key from the Stripe dashboard → Developers → API keys. It is only
//  read locally here; nothing is stored or committed.)
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('Set STRIPE_SECRET_KEY (your live secret key) and re-run, e.g.:');
  console.error('  STRIPE_SECRET_KEY=sk_live_xxx node scripts/setup-stripe-webhook.mjs');
  process.exit(1);
}
const stripe = new Stripe(key);

// The two events the webhook handler (api/stripe-webhook.js) implements for boosts.
const NEEDED = ['customer.subscription.updated', 'customer.subscription.deleted'];

const eps = await stripe.webhookEndpoints.list({ limit: 100 });
if (!eps.data.length) {
  console.log('No webhook endpoints found on this account — create one first (Dashboard → Developers → Webhooks).');
  process.exit(0);
}

for (const ep of eps.data) {
  const cur = ep.enabled_events || [];
  if (cur.includes('*')) {
    console.log(`• ${ep.url} — already receives ALL events ('*'); nothing to add.`);
    continue;
  }
  const missing = NEEDED.filter(e => !cur.includes(e));
  if (!missing.length) {
    console.log(`• ${ep.url} — already has the subscription events. ✓`);
    continue;
  }
  const updated = await stripe.webhookEndpoints.update(ep.id, { enabled_events: [...cur, ...missing] });
  console.log(`✓ ${ep.url} — added: ${missing.join(', ')}  (now listening to ${updated.enabled_events.length} events)`);
}
console.log('Done. Store-boost renewals & cancellations will now update the pin.');
