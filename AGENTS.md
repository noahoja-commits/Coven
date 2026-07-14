# Coven — agent notes

**Read `CLAUDE.md` first** — it is the full project guide (stack, architecture, security model,
collaboration rules). This file mirrors the session learnings for agents that look for AGENTS.md.

## Hard-won gotchas (mirror of CLAUDE.md — keep in sync)

- A green `npm run build` does NOT mean the app works — always run `npm run dev` and confirm the app mounts with a clean console.
- The Supabase DB is a single shared PRODUCTION instance; migrations are sequentially numbered and must be announced/coordinated.
- New `profiles` columns are invisible to clients until granted: 0026 made `profiles` SELECT a column whitelist — a new column needs BOTH `grant select (new_col)` in the migration AND a `PROFILE_COLS_*` entry in `src/lib/db/profiles.js` with a pre-migration fallback tier (see tos_/mood/decor pattern).
- Never rasterize SVG through `compress()` in `storage.js` — its catch-all falls back to the ORIGINAL file when canvas fails (`foreignObject` taints it), silently uploading scriptable markup. `uploadImage` rejects SVG on purpose.
- Video GPS lives in mp4 `moov`→`udta` (`©xyz`/`loci`) and `moov`→`meta`; `stripVideoLocation` renames those boxes to `free` in place (no re-encode) and fails open. New mp4-family uploads only.
- TermsGate: `tos_version === undefined` → 0065 columns not deployed (fail open, hide gate); `null`/stale → block until accepted. Bump `TERMS_VERSION` + label together in `src/lib/legal.js`.
- Claude auto-mode cannot perform prod writes (live posts, `apply.mjs` migrations, Stripe actions) — a human runs those; agents prep exact commands and verify afterwards.

## Session Log

- 2026-07-14: [Decisions] Legal-hardening pass (two paired Claude sessions, frontend/backend split): PR #14 records ToS acceptance (`tos_version`/`tos_accepted_at` at onboarding + `TermsGate` re-acceptance for existing users/version bumps, no backfill — real timestamps only); PR #15 strips video GPS client-side + rejects SVG uploads; PR #16 migrations 0065 (tos columns + column grant) & 0066 (report → admin push via existing `notify_push` trigger, zero new endpoints) + delete-account now purges the user's Storage objects. Merge order #16 → #14 → #15; both frontend PRs fail open pre-migration.
- 2026-07-14: [Verification] Full audit + live walkthrough: RLS enabled 37/37 tables (`app_config` zero-policy by design); Stripe webhook signature-verified, no card data touches Coven; every `api/` fn auth-enforced (verifyUser ×8); live console clean (single cosmetic maplibre `wood-pattern` warn); prod-uploaded images confirmed EXIF-free; location sharing verified opt-in. Legal docs are solid but **not attorney-reviewed** — get a lawyer before scale.
- 2026-07-14: [Known gaps, deliberate] `voice` bucket is conversation-keyed so delete-account can't purge it per-user; GIFs and pre-existing videos keep their metadata (only new mp4-family uploads are stripped); client errors go to ephemeral Vercel logs only (`api/log-error.js`, no durable store); reports below the 3-reporter auto-hide now push the admin but review itself is still the `docs/report-triage.md` runbook.
