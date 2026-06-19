// Vercel serverless: start (or resume) a venue's Stripe Connect onboarding.
// Creates an Express connected account (once), stores it, and returns a
// Stripe-hosted onboarding URL the venue completes to enable payouts.
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { verifyUser } from './_auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  try {
    // Authenticate the caller; act only on their own verified id (never the body).
    const user = await verifyUser(req, supa);
    if (!user) { res.status(401).json({ error: 'unauthorized' }); return; }
    const userId = user.id;

    const { data: row } = await supa
      .from('payout_accounts').select('stripe_account_id').eq('user_id', userId).maybeSingle();
    let acctId = row?.stripe_account_id;

    if (!acctId) {
      const acct = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        metadata: { user_id: userId },
      });
      acctId = acct.id;
      await supa.from('payout_accounts').upsert(
        { user_id: userId, stripe_account_id: acctId, payouts_enabled: false, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const link = await stripe.accountLinks.create({
      account: acctId,
      type: 'account_onboarding',
      refresh_url: `${origin}/?connect=refresh`,
      return_url: `${origin}/?connect=done`,
    });
    res.status(200).json({ url: link.url });
  } catch (e) {
    console.error('connect-onboard', e.message);
    res.status(500).json({ error: e.message });
  }
}
