import { supabase } from '../supabase';

export async function fetchPayoutStatus(myId) {
  const { data, error } = await supabase
    .from('payout_accounts').select('stripe_account_id, payouts_enabled').eq('user_id', myId).maybeSingle();
  if (error) throw error;
  return { hasAccount: !!data?.stripe_account_id, enabled: !!data?.payouts_enabled };
}

// Starts (or resumes) Stripe-hosted onboarding by redirecting to the account link.
export async function startPayoutSetup(userId) {
  const res = await fetch('/api/connect-onboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error || 'could not start payout setup');
  window.location.href = data.url;
}
