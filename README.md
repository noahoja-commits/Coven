# Coven

A goth/occult **social network** — a Progressive Web App built with React + Vite, backed by
Supabase (auth, database, realtime, storage) and Stripe for event ticketing.
Live at **[project-tuihx.vercel.app](https://project-tuihx.vercel.app)**.

## Quick start

```bash
npm install
npm run dev      # open the printed http://localhost:PORT
```

That's it to run it locally. `npm run build` makes the production build.

## 👉 Read `CLAUDE.md` first

**[`CLAUDE.md`](./CLAUDE.md) is the real guide** — it has the architecture, where everything
lives, the security model, the gotchas, and **how we work together**. If you're new to
coding or git, it has a "New here? Start with this" section written for you. Your Claude
Code also reads it automatically every session.

## Working together (the short version)

- **Never push straight to `main`** (it's the live site). Work on a **branch**, open a **Pull Request**.
- **Run the app and check it works** before opening a PR — a green build isn't proof.
- **Never commit secrets.** `.env` is gitignored; keep keys out of the code and out of chat.
- **Don't change the database, Stripe, or env vars alone** — they're shared and live; coordinate first.

Everything else is in `CLAUDE.md`. When in doubt, ask. 🦇
