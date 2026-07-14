# Coven — agent notes

**Read `CLAUDE.md` first** — it is the full project guide (stack, architecture, security model,
collaboration rules). This file mirrors the session learnings for agents that look for AGENTS.md.

## Non-negotiables (they protect production)

- `main` deploys to production on push. **Never commit or push to `main` directly** — branch + PR only.
- The Supabase database is a **single shared PRODUCTION instance** — migrations are sequentially
  numbered, announced before applying, one person at a time.
- Stripe is in **LIVE mode**. Never complete a test purchase.
- Never commit secrets; `.env` is gitignored and stays that way.

## Hard-won gotchas (mirror of CLAUDE.md — keep in sync)

- A green `npm run build` does NOT mean the app works — always run `npm run dev` and confirm the app mounts with a clean console.
- New `profiles` columns are invisible to clients until granted: 0026 made `profiles` SELECT a column whitelist — a new column needs BOTH `grant select (new_col)` in the migration AND a `PROFILE_COLS_*` entry in `src/lib/db/profiles.js` with a pre-migration fallback tier (see tos_/mood/decor pattern).
- Never rasterize SVG through `compress()` in `storage.js` — its catch-all falls back to the ORIGINAL file when canvas fails (`foreignObject` taints it), silently uploading scriptable markup. `uploadImage` rejects SVG on purpose.
- Video GPS lives in mp4 `moov`→`udta` (`©xyz`/`loci`) and `moov`→`meta`; `stripVideoLocation` renames those boxes to `free` in place (no re-encode) and fails open. New mp4-family uploads only.
- TermsGate: `tos_version === undefined` → 0065 columns not deployed (fail open, hide gate); `null`/stale → block until accepted. Bump `TERMS_VERSION` + label together in `src/lib/legal.js`.
- New alert type = one DB trigger, not a new endpoint: `notifications.kind` is unconstrained and `trg_notify_push` web-pushes every insert — add a trigger inserting a notifications row + a `kind` case in `api/push.js` and `src/lib/db/notifications.js` (see 0066).
- Storage does NOT cascade on user deletion — `api/delete-account.js` purges the user-keyed buckets in `USER_BUCKETS`; a new user-keyed bucket must be added there. The `voice` bucket is conversation-keyed and can't be purged per-user.
- `supabase/apply.mjs` doubles as a read-only SQL audit runner (returns JSON) but truncates output to ~300 chars — write compact aggregates, not row dumps.
- Claude auto-mode cannot perform prod writes (live posts, `apply.mjs` migrations, Stripe actions) unless the human explicitly green-lights them in the moment; agents prep exact commands and verify afterwards.
- Two Claude sessions on one machine: the second works in a `git worktree` so the shared checkout's branch never flips underneath the first.

## Session Log

- 2026-07-14: [Decisions] Legal-hardening pass (two paired Claude sessions, frontend/backend split): PR #14 records ToS acceptance (`tos_version`/`tos_accepted_at` at onboarding + `TermsGate` re-acceptance for existing users/version bumps, no backfill — real timestamps only); PR #15 strips video GPS client-side + rejects SVG uploads; PR #16 migrations 0065 (tos columns + column grant) & 0066 (report → admin push via existing `notify_push` trigger, zero new endpoints) + delete-account now purges the user's Storage objects. Merge order #16 → #14 → #15; both frontend PRs fail open pre-migration.
- 2026-07-14: [Verification] Full audit + live walkthrough: RLS enabled 37/37 tables (`app_config` zero-policy by design); Stripe webhook signature-verified, no card data touches Coven; every `api/` fn auth-enforced (verifyUser ×8); live console clean (single cosmetic maplibre `wood-pattern` warn); prod-uploaded images confirmed EXIF-free; location sharing verified opt-in. Legal docs are solid but **not attorney-reviewed** — get a lawyer before scale.
- 2026-07-14: [Known gaps, deliberate] `voice` bucket is conversation-keyed so delete-account can't purge it per-user; GIFs and pre-existing videos keep their metadata (only new mp4-family uploads are stripped); client errors go to ephemeral Vercel logs only (`api/log-error.js`, no durable store); reports below the 3-reporter auto-hide now push the admin but review itself is still the `docs/report-triage.md` runbook.
