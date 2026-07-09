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

// Apply a store-boost subscription's state to the shop + bookkeeping table. Pins the shop
// (boosted_until = paid period end) while the sub is in good standing; clears it otherwise.
async function applyBoost(sub, extra = {}) {
  const shopId = sub.metadata?.shop_id;
  const ownerId = sub.metadata?.owner_id;
  if (!shopId || !ownerId) return;
  const active = sub.status === 'active' || sub.status === 'trialing';
  // The current billing-period end moved from the Subscription object to its line items
  // in Stripe API version 2025-03-31.basil (the installed SDK pins 2026-05-27.dahlia), so
  // `sub.current_period_end` is undefined on retrieve/SDK-shaped events. Read it from the
  // item, falling back to the top-level field for webhook payloads pinned to an older
  // dashboard API version. Without this, periodEnd was always null and an active boost
  // wrote boosted_until = null — the paid shop was never actually pinned.
  const periodEndTs = sub.items?.data?.[0]?.current_period_end ?? sub.current_period_end;
  const periodEnd = periodEndTs ? new Date(periodEndTs * 1000).toISOString() : null;
  await supa.from('store_subscriptions').upsert({
    owner_id: ownerId,
    shop_id: shopId,
    stripe_customer_id: extra.customerId || (typeof sub.customer === 'string' ? sub.customer : sub.customer?.id) || null,
    stripe_subscription_id: sub.id,
    status: sub.status,
    current_period_end: periodEnd,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'stripe_subscription_id' });
  await supa.from('shops').update({ boosted_until: active ? periodEnd : null }).eq('id', shopId);
}

async function endBoost(sub) {
  const shopId = sub.metadata?.shop_id;
  await supa.from('store_subscriptions')
    .update({ status: 'canceled', updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', sub.id);
  if (shopId) await supa.from('shops').update({ boosted_until: null }).eq('id', shopId);
}

// Authoritative oversell guard. The pre-checkout capacity count (api/checkout.js) is TOCTOU:
// two concurrent buyers — or one stale open Checkout tab — can both pass it and both pay. So
// the webhook is the final gate. After a ticket is minted we recount PAID tickets in creation
// order; if THIS ticket landed beyond capacity, we refund it (reversing the transfer + fee when
// it was a Connect destination charge). The charge.refunded handler then flips it to 'refunded'
// so it never counts at the door. Best-effort — a refund failure must never block recording the
// sale, and ordering by (created_at, id) means only the genuinely-overflow tickets get refunded.
async function enforceCapacity(ticket, paymentIntentId) {
  try {
    if (!ticket?.event_id) return;
    const { data: ev } = await supa.from('events').select('capacity').eq('id', ticket.event_id).maybeSingle();
    if (!ev || ev.capacity == null) return;
    const { data: paid } = await supa.from('tickets')
      .select('id, created_at').eq('event_id', ticket.event_id).eq('status', 'paid')
      .order('created_at', { ascending: true }).order('id', { ascending: true });
    const rank = (paid || []).findIndex(t => t.id === ticket.id);
    if (rank < 0 || rank < ev.capacity) return; // within capacity (or already gone)
    if (!paymentIntentId) return;
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    const isConnect = !!pi.transfer_data?.destination;
    await stripe.refunds.create(isConnect
      ? { payment_intent: paymentIntentId, reverse_transfer: true, refund_application_fee: true }
      : { payment_intent: paymentIntentId });
    console.error('stripe-webhook: refunded oversold ticket', { ticket: ticket.id, event: ticket.event_id, rank, capacity: ev.capacity });
  } catch (e) {
    console.error('stripe-webhook: capacity enforcement failed', e.message);
  }
}

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
      const piId = typeof s.payment_intent === 'string' ? s.payment_intent : null;
      const { data: ticket, error } = await supa.from('tickets').upsert({
        event_id: s.metadata.event_id,
        buyer_id: s.metadata.buyer_id || null,
        buyer_email: s.customer_details?.email || null,
        amount_cents: s.amount_total || 0,
        currency: s.currency || 'usd',
        status: 'paid',
        stripe_session_id: s.id,
        stripe_payment_intent: piId,
      }, { onConflict: 'stripe_session_id' }).select('id, event_id, created_at').maybeSingle();
      if (error) { res.status(500).json({ error: error.message }); return; }
      await enforceCapacity(ticket, piId); // refund + flag anything that oversold past capacity
    } else if (s.metadata?.kind === 'boost' && s.subscription) {
      // A store-boost subscription was purchased — fetch the sub for its period end, then pin the shop.
      try {
        const subId = typeof s.subscription === 'string' ? s.subscription : s.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subId);
        if (!sub.metadata?.shop_id) sub.metadata = { ...sub.metadata, ...s.metadata };
        await applyBoost(sub, { customerId: typeof s.customer === 'string' ? s.customer : s.customer?.id });
      } catch (e) { console.error('boost activate', e.message); }
    }
  } else if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object;
    if (sub.metadata?.kind === 'boost') await applyBoost(sub);
  } else if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    if (sub.metadata?.kind === 'boost') await endBoost(sub);
  } else if (event.type === 'account.updated') {
    // A venue's Connect onboarding progressed — sync their payout readiness.
    const acct = event.data.object;
    const enabled = !!(acct.charges_enabled && acct.payouts_enabled);
    await supa.from('payout_accounts')
      .update({ payouts_enabled: enabled, updated_at: new Date().toISOString() })
      .eq('stripe_account_id', acct.id);
  } else if (event.type === 'charge.refunded') {
    // A ticket charge was refunded (full or partial) — flip the ticket so it stops
    // counting as paid / valid at the door. Matched by payment intent.
    const charge = event.data.object;
    const pi = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
    if (pi) {
      const { error } = await supa.from('tickets')
        .update({ status: 'refunded' })
        .eq('stripe_payment_intent', pi);
      if (error) { res.status(500).json({ error: error.message }); return; }
    }
  }

  res.status(200).json({ received: true });
}
