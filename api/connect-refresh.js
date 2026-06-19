// Vercel serverless: pull a venue's Connect account status straight from Stripe
// and sync it to the DB. Called when the venue returns from onboarding so their
// payout readiness updates instantly instead of waiting on the account.updated webhook.
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
    // Authenticate the caller; sync only their own verified account (never the body).
    const user = await verifyUser(req, supa);
    if (!user) { res.status(401).json({ error: 'unauthorized' }); return; }
    const userId = user.id;

    const { data: row } = await supa
      .from('payout_accounts').select('stripe_account_id').eq('user_id', userId).maybeSingle();
    if (!row?.stripe_account_id) { res.status(200).json({ hasAccount: false, enabled: false }); return; }

    const acct = await stripe.accounts.retrieve(row.stripe_account_id);
    const enabled = !!(acct.charges_enabled && acct.payouts_enabled);
    await supa.from('payout_accounts')
      .update({ payouts_enabled: enabled, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    res.status(200).json({ hasAccount: true, enabled });
  } catch (e) {
    console.error('connect-refresh', e.message);
    res.status(500).json({ error: e.message });
  }
}
