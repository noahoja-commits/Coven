-- Coven migration 0007 — venue payout accounts (Stripe Connect).
-- A host links their bank via Stripe-hosted onboarding; ticket sales for their
-- events then auto-split to their connected account (platform keeps a fee).

create table if not exists public.payout_accounts (
  user_id           uuid primary key references public.profiles(id) on delete cascade,
  stripe_account_id text unique,
  payouts_enabled   boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists payout_accounts_acct_idx on public.payout_accounts (stripe_account_id);

alter table public.payout_accounts enable row level security;
-- World-readable so the app can tell whether a host can sell paid tickets and
-- show the current user their own status. WRITES happen only via the service
-- role (the onboarding function + the Connect webhook) — no client write policy,
-- so a user cannot fake payouts_enabled on themselves.
drop policy if exists payout_read on public.payout_accounts;
create policy payout_read on public.payout_accounts for select using (true);
