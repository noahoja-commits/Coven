<!-- Coven PR — keep it short, but don't skip the checklist. See CLAUDE.md for the why. -->

## What & why
<!-- One or two lines: what this changes and the reason. -->

## How I verified
<!-- What you actually did to confirm it works (not just that it builds). -->

---

### Checklist
- [ ] **It actually mounts** — ran `npm run dev` (or the Vercel **preview URL**) and loaded the app; console is clean. (A green `npm run build` does NOT prove this.)
- [ ] Pulled latest `main` into this branch; no unresolved conflicts.
- [ ] **No secrets committed** — `.env` stays gitignored; no service-role/Stripe/VAPID/push keys in the client bundle.
- [ ] Touched `src/App.jsx`? Flagged it so we don't both edit the hub at once.

### Shared backend — only if this PR touches it (these hit the one production DB/Stripe/env)
- [ ] **Announced to the team before applying** (DB/Stripe/env can't be branch-isolated).
- [ ] New migration: number agreed (no collision), applied via `apply.mjs`, and the new table has **RLS on** with write policies bound to `auth.uid()`.
- [ ] Reads of sensitive data go through a sanitizing view / rpc (not raw tables); no PII newly exposed.
- [ ] `api/` change still authenticates the caller via `verifyUser` and acts on the verified user (never a body `userId`).
- [ ] Realtime needed? Added the table to the `supabase_realtime` publication.

### Notes for reviewer
<!-- Migrations to run, env vars to set, anything to watch in prod, etc. -->
