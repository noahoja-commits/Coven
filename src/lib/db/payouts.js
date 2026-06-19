import { supabase } from '../supabase';

// Auth headers for our serverless endpoints: they verify this token server-side
// and act on the verified user, so a userId can't be spoofed via the body.
async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

export async function fetchPayoutStatus(myId) {
  const { data, error } = await supabase
    .from('payout_accounts').select('stripe_account_id, payouts_enabled').eq('user_id', myId).maybeSingle();
  if (error) throw error;
  return { hasAccount: !!data?.stripe_account_id, enabled: !!data?.payouts_enabled };
}

// Pulls live status from Stripe (and syncs the DB) — instant, no webhook wait.
export async function refreshPayoutStatus() {
  const res = await fetch('/api/connect-refresh', {
    method: 'POST',
    headers: await authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'refresh failed');
  return { hasAccount: !!data.hasAccount, enabled: !!data.enabled };
}

// Starts (or resumes) Stripe-hosted onboarding by redirecting to the account link.
export async function startPayoutSetup() {
  const res = await fetch('/api/connect-onboard', {
    method: 'POST',
    headers: await authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error || 'could not start payout setup');
  window.location.href = data.url;
}
