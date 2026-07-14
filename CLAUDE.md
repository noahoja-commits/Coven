# Coven — project guide for Claude Code

A goth/occult **social-network PWA**. Single-page React app with a real Supabase
backend (auth, Postgres + RLS, realtime, storage) and Vercel serverless functions
for Stripe payments and web push. Live at **project-tuihx.vercel.app**.

> This file is the shared brain for everyone working here (humans + their Claude Code).
> Keep it committed and up to date. **Never put secrets in this file** — it's in git.

> **Note to Claude:** a collaborator on this repo may be new to coding/git. Explain your
> reasoning in plain language, prefer small reversible steps, and confirm before anything
> that touches the shared production database, Stripe, env vars, or `main`.

## New here? Start with this (especially if you're new to coding)

Welcome. You don't need to be an expert — Claude Code does the heavy lifting. Your job is to
**describe what you want in plain English, review what Claude does, and follow a few safety rules
so nobody's work gets lost.** Read this once; it'll save you a lot of confusion.

**The one mental model:** `main` is the live website (real users, real money). You never edit it
directly. You make a **copy (a "branch")**, do your work there, and open a **Pull Request (PR)** to
merge it back after a quick review. Branches are cheap and safe — breaking your own branch is fine,
that's what it's for. Breaking `main` is what we're avoiding.

**Your normal day, step by step:**
```
git checkout main && git pull origin main     # get everyone's latest work
git checkout -b feature/short-name             # make your own branch to work on
# ...ask Claude to make the change, then TRY IT: npm run dev, open it, click around...
git add -A && git commit -m "what you did"     # save a checkpoint
git push origin feature/short-name             # upload your branch
# then open a Pull Request on GitHub and tell your partner to review it
```

**Golden rules (when in doubt, stop and ask your partner):**
- **Always work on a branch, never commit straight to `main`.**
- **Before opening a PR, actually run the app** (`npm run dev`) and confirm your change works and the
  page isn't broken — a successful build is NOT proof it works.
- **Never share or commit secrets/passwords/keys.** If Claude or anyone asks you to paste a key into
  the code, that's wrong — stop.
- **Don't touch the database, Stripe, or environment variables on your own.** These are *shared and
  live* — one wrong move affects everyone. Always coordinate with your partner first.
- **`git pull` before you start each session** so you're building on the latest code.
- **If something looks scary or git complains, don't force it** — paste the message to Claude or your
  partner and ask. Almost nothing is unrecoverable if you stop early; forcing things is what causes loss.

**Working well with Claude Code:**
- Tell it the goal, not the steps ("add a back button to the events screen" beats "edit line 40").
- Ask it to **explain** anything you don't understand — "why did you change this?" is a great question.
- Ask it to **verify** its work (run the app, run a check) before you trust it.
- Small changes are easier to review and safer than giant ones. Prefer many small PRs.

## Stack
- **Frontend:** React 18 + Vite 5 + Tailwind 3 + lucide-react. PWA via `vite-plugin-pwa` (Workbox).
- **Backend:** Supabase (Postgres, Row-Level Security, Auth = email+password, Realtime, Storage).
- **Serverless:** Vercel functions in `api/` (Stripe Checkout/Connect, Stripe webhook, web push).
- **Payments:** Stripe (Checkout + Connect destination charges). Webhook mints tickets.

## Run / build / deploy
- `npm install`
- `npm run dev` — Vite dev server (tries :5173, then next free port). **Use this to verify the app actually mounts.**
- `npm run build` — production build (also what Vercel runs).
- **Deploy = `git push origin main`.** Vercel auto-builds on push to `main` and deploys to production. Branches/PRs get their own **preview URL** automatically.
- Env vars live in Vercel (production) and a local `.env` (gitignored). The client build needs `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Server functions read `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VAPID_PRIVATE_KEY`, `PUSH_SECRET` from `process.env`.

## Architecture / where things live
- **`src/App.jsx`** — the central hub: nearly all top-level state + handlers + the auth gate live here. There is **no router**; navigation is state-based (tabs + overlays). This file is large and conflict-prone — coordinate before two people edit it at once.
- **`src/lib/db/*.js`** — the data layer. Each file wraps Supabase calls for one domain and **hydrates raw DB rows into client-shaped objects** (e.g. `posts.js`, `dm.js`, `notifications.js`, `profiles.js`, `events.js`, `tickets.js`, `payouts.js`, `tonight.js`, `storage.js`). Always go through this layer; match the existing hydrate pattern.
- **`src/components/<feature>/`** — UI grouped by feature (`feed`, `map`, `events`, `profile`, `communities`, `oddities`, `fashion`, `festival`, `coven` portals, `auth`, `onboarding`, `settings`, `shared`, `trackers`, `library`).
- **`src/auth/AuthProvider.jsx`** — session/auth context (login, signup, password recovery, session cleanup).
- **`src/lib/supabase.js`** — the configured Supabase client (anon key only).
- **`api/`** — Vercel serverless: `checkout.js`, `connect-onboard.js`, `connect-refresh.js`, `stripe-webhook.js`, `push.js`, and `_auth.js` (shared JWT verifier; `_`-prefixed files aren't routes).
- **`supabase/migrations/`** — numbered SQL migrations. **`supabase/apply.mjs`** applies them via the Management API: `SUPABASE_PAT=sbp_... node supabase/apply.mjs supabase/migrations/<file>.sql`.

## Hard-won gotchas (read these)
- **A green `npm run build` does NOT mean the app works.** Vite builds fine even with runtime errors (e.g. a missing hook import) that black-screen the whole app. **Always verify it actually mounts** — run the dev server and load it in a browser (check the console) before declaring done.
- **The Supabase database is a single shared PRODUCTION instance.** There is no per-developer DB. A migration or data change hits everyone instantly. See collaboration rules below.
- **Migrations are sequentially numbered.** Two people creating `00NN_*.sql` at once collide. Coordinate the next number.
- **Raw tables are RLS-locked; public reads come from SECURITY DEFINER views** (`feed_posts`, `event_feed`, `listings_feed`, `active_stories`, `active_tonight`, `poll_tallies`) that sanitize data. Example: the `posts` table is own-read-only and `feed_posts` masks the author of anonymous posts — **never expose a raw `author_id` for anonymous content.**
- **Security model (don't regress it):**
  - The client uses **only the anon key**. Never ship the service-role key or any secret to the client bundle.
  - `api/` payment functions run with the **service role (bypass RLS)** — they MUST authenticate the caller with `verifyUser` (`api/_auth.js`) and act on the **verified** user id, never a `userId`/`buyerId` from the request body.
  - Every table write policy binds the actor column to `auth.uid()`. New tables need RLS + matching `with check` / `using` policies.
  - `profiles.birthday` is column-locked to the owner — read your own via the `my_birthday()` rpc; **don't `select('*')` on `profiles`**, use explicit columns (see `PROFILE_COLS` in `profiles.js`).
  - `app_config` (push secret) is service-only (RLS on, no policies). Don't add client-readable policies.
- **Realtime:** new tables aren't auto-streamed. To get `postgres_changes`, add the table to the publication: `alter publication supabase_realtime add table public.<t>;` (see migration 0024).
- **Stripe is currently in LIVE mode.** Checkout/tickets work (platform-collect). Connect payout onboarding needs the restricted key's Connect permissions enabled in the Stripe dashboard. The webhook (`STRIPE_WEBHOOK_SECRET`) must match the **live** endpoint or paid tickets won't be recorded.
- After a deploy, the PWA service worker auto-reloads clients (`controllerchange` handler in `main.jsx`) — but a phone may still need one cache clear/reinstall to pick up a brand-new SW.
- **A NEW `profiles` column is invisible to clients until you extend the column whitelist.** 0026 replaced profiles' table-level SELECT with `grant select (col, ...)`, so every migration adding a profiles column must include `grant select (new_col) on public.profiles to authenticated` or reads fail with 42501 (INSERT/UPDATE grants are still table-level — only SELECT is whitelisted). See 0065.
- **New alert type = one DB trigger, not a new endpoint.** `notifications.kind` is unconstrained text and `trg_notify_push` (0022/0058) web-pushes EVERY notifications insert. To alert someone about anything: trigger inserts a notifications row, add a `kind` body case to `api/push.js` and `src/lib/db/notifications.js`. See 0066 (report → admin).
- **Storage does NOT cascade on user deletion** (DB rows do). `api/delete-account.js` purges the 5 user-id-keyed buckets (`USER_BUCKETS`) before `deleteUser` — **a new user-keyed bucket must be added to that list.** The `voice` bucket is conversation-keyed and can't be purged per-user (documented limitation).
- `supabase/apply.mjs` doubles as a read-only SQL runner for audits (returns JSON) but truncates output to ~300 chars — write compact aggregate queries (`string_agg`, `count`, `exists`), not row dumps.
- Two Claude sessions on one machine: the second one should work in a `git worktree` (`git worktree add ../coven-backend -b <branch> origin/main`) so the shared checkout's branch never changes under the first.

## How we work together (collaboration rules)

The frontend is safe to parallelize; the **shared backend is where you can clobber each other.** Follow these:

1. **Never push straight to `main`.** Branch per task, open a Pull Request, review, merge.
   ```
   git pull origin main
   git checkout -b feature/<thing>
   # work, commit
   git push origin feature/<thing>      # then open a PR on GitHub
   ```
   - Pushing to `main` deploys to production immediately — PRs keep that gated and reviewed.
   - Each PR gets a Vercel **preview URL** to test in isolation. Use it.
2. **Pull before you start, push often.** Don't build on stale `main`.
3. **Avoid simultaneous edits to `src/App.jsx`** (the hub) — announce it; it's the worst merge-conflict surface.
4. **Database / Stripe / env changes are coordinated, one person at a time.** They hit the single shared prod backend and can't be branch-isolated. Announce before you:
   - apply a migration (and agree on the next number),
   - change Vercel env vars,
   - touch Stripe dashboard config or run anything that writes/deletes prod data.
5. **Secrets are shared securely (password manager), never committed and never pasted in chat.** `.env` is gitignored; keep it that way.
6. **Write decisions down in the repo** (this file, code comments, PR descriptions) — not in a local Claude memory, which doesn't transfer between machines/people.
