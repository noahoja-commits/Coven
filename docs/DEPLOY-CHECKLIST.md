# Coven — deploy checklist (2026-07-16 feature drop)

Everything below is what turns the seven feature PRs from this drop into a live,
working app. Nothing here was auto-applied — migrations, Stripe dashboard, and env
vars all need a human (prod DB writes and dashboards can't be done by the agent).

Work top-to-bottom. Each feature **fails open** until its migration/env is in place,
so the order between features doesn't matter — but within a feature, merge the PR
before applying its migration.

---

## 1. Merge the PRs

| PR | Feature | Migration | Env needed |
|----|---------|-----------|-----------|
| #23 | Voice DMs fixed (Safari MIME + surfaced errors) | — | — |
| #24 | MySpace profiles (retro layout + blurbs + top friends) | `0069` | — |
| #25 | Analytics/"self" tab 501 hardening | — | — |
| #26 | Oddities purchasing (Stripe Connect) | `0070` | Stripe webhook (§3) |
| #27 | GIFs + stickers | `0071` | `TENOR_KEY` |
| #28 | 1:1 live voice/video calls | — | camera CSP (in PR); optional TURN |

> Merge into `main` on GitHub. Each was built on its own branch with a green Vercel
> preview and a Playwright suite. `main` and prod were never touched directly.

---

## 2. Apply migrations (after the matching PR is merged)

Run each once, in order. `SUPABASE_PAT` is in the local `.env`.

```bash
cd ~/OneDrive/Desktop/Random/coven

SUPABASE_PAT=$(sed -n 's/^SUPABASE_PAT=//p' .env | tr -d '\r') node supabase/apply.mjs supabase/migrations/0069_myspace_profile.sql
SUPABASE_PAT=$(sed -n 's/^SUPABASE_PAT=//p' .env | tr -d '\r') node supabase/apply.mjs supabase/migrations/0070_oddity_orders.sql
SUPABASE_PAT=$(sed -n 's/^SUPABASE_PAT=//p' .env | tr -d '\r') node supabase/apply.mjs supabase/migrations/0071_dm_images.sql
```

Each should print `201`. What they do:
- **0069** — extends the `public_shrine` RPC so others can see your MySpace blurbs + top friends.
- **0070** — `oddity_orders` table (buyer/seller read own; webhook-only writes, like tickets).
- **0071** — adds `messages_dm.image_url` for GIFs/stickers in DMs.

> Already applied earlier this session: `0067` (admin core), `0068` (admin hardening).

---

## 3. Stripe dashboard (unblocks BOTH boosts and oddities purchasing)

Boosts have never recorded a single subscription — the cause is webhook events, not
code. Fix once and it powers oddities checkout too.

**Stripe Dashboard → Developers → Webhooks → your LIVE endpoint** — confirm it sends:
- [ ] `checkout.session.completed`  (tickets, boosts, oddity purchases)
- [ ] `customer.subscription.updated`  (boost renewals)
- [ ] `customer.subscription.deleted`  (boost cancellations)
- [ ] `charge.refunded`  (ticket + oddity refunds → returns item to market)
- [ ] `account.updated`  (seller/host Connect payout readiness)

Then verify the endpoint's **signing secret** is in the `STRIPE_WEBHOOK_SECRET` env
var (comma-separated if you have both an account + connected-accounts destination).

**Connect (for oddities payouts + "getting sellers on Stripe"):** the live restricted
key needs Connect write permissions enabled. Sellers onboard themselves via
**Settings → get paid** (same `payout_accounts` flow event hosts use). A seller who
hasn't connected still sells — the platform collects and you settle off-platform.

---

## 4. Environment variables (Vercel → project → Settings → Environment Variables)

- [ ] **`TENOR_KEY`** — a free Google Tenor API key. Lights up the GIF tab. Without
      it, stickers still work and the GIF tab shows a clean "not set up" message.
- [ ] **`VITE_TURN_URL`, `VITE_TURN_USER`, `VITE_TURN_CRED`** *(optional but recommended
      for calls)* — a TURN relay (free tier from Metered.ca or Twilio). Without TURN,
      calls connect on most networks but can fail on symmetric/mobile NATs. These are
      `VITE_`-prefixed (client-read) — a TURN credential is meant to be reachable by the
      browser, but prefer short-lived/rotating creds.
- (already set) `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_*`,
  `PLATFORM_FEE_PERCENT`, `VAPID_PRIVATE_KEY`, `PUSH_SECRET`.

---

## 5. Security follow-up (from the admin audit earlier this session)

- [ ] **Lower the access-token TTL** — Supabase → Auth → Settings → JWT expiry (e.g.
      15 min). A banned/hacked account's *already-issued* access token keeps working
      until it expires; the admin "banish" kills the refresh token immediately but the
      live token lingers up to the TTL. Shorter TTL shrinks that window. (The panel copy
      already states this honestly.)

---

## 6. Data cleanup

- [ ] Delete the two test rites **"Hehehehe"** and **"Jfkr"** — open each in-app (you're
      the host) → **delete event**.

---

## 7. Two-device / live checks the agent can't do

These are device- and network-dependent (media + WebRTC can't run headless):
- [ ] **Voice DMs** — record + send a voice note on a phone; it should play. If it
      fails you now get a visible red error (screenshot it).
- [ ] **Calls** — ring between two devices/accounts; accept, check two-way audio (and
      video for a video call), then hang up.
- [ ] **Oddities purchase** — buy a test listing end-to-end; confirm the item leaves the
      market and the seller gets the "sold" notification.
- [ ] **Boosts** — after §3, boost a shop and confirm it pins.
- [ ] **MySpace** — Settings → Appearance → "Old-web profiles" on → set your blurbs +
      top friends → view another profile.

---

_Built 2026-07-16. Admins seeded: `noahoja@gmail.com`, `colinhealey941@gmail.com`._
