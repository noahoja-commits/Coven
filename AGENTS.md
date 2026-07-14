# Coven — agent instructions

**Read `CLAUDE.md` in this directory — it is the single source of truth** for stack,
architecture, hard-won gotchas, and the collaboration rules (branch + PR only, never
push `main`, coordinate all DB/Stripe/env changes). It is kept current; this file is
just a pointer so agent tooling that looks for `AGENTS.md` finds the guide.

Non-negotiables (duplicated here because they protect production):

- `main` deploys to production on push. **Never commit or push to `main` directly.**
- The Supabase database is a **single shared PRODUCTION instance** — migrations are
  sequentially numbered, announced before applying, one person at a time.
- Stripe is in **LIVE mode**. Never complete a test purchase.
- Never commit secrets; `.env` is gitignored and stays that way.
