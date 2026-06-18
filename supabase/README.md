# Coven — Supabase setup

One-time backend setup for the multi-user MVP (auth + feed + follows).

## 1. Create the project
- New Supabase project (a **dedicated** Coven project — not the acquisitions-db).
- Copy **Project URL** and the **anon public** key (Settings → API).

## 2. Apply the schema
Paste `schema.sql` into the SQL Editor and run it. Creates: `profiles`, `posts`,
`comments`, `reactions`, `follows`, the `feed_posts` view, the `post_comments`
RPC, all indexes, and RLS policies.

> The SQL editor will flag `feed_posts` as a **SECURITY DEFINER view** — that is
> intentional. It's the controlled public read path that hides anonymous authors;
> the base `posts` table is locked to owners.

## 3. Auth config (Dashboard → Authentication)
- **Providers:** enable **Email**. Magic-link works out of the box; you can leave
  "Confirm email" on. (Password sign-in optional.)
- **URL Configuration → Site URL:** `https://project-tuihx.vercel.app`
- **Redirect URLs:** add **both**
  - `http://localhost:5173`
  - `https://project-tuihx.vercel.app`
  - (and any Vercel preview / custom domain you use)

## 4. App env vars
Local `.env` (gitignored) and Vercel project `project-tuihx` (Production + Preview):
```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```
The anon key is safe to expose — RLS is the security boundary. **Never** put the
`service_role` key in any `VITE_*` var or commit it.

## 5. Seed the house accounts (so the feed isn't empty)
Run once with the **service_role** key (local only, never committed):
```
SUPABASE_URL=https://<ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service_role_key> \
node supabase/seed.mjs
```
Creates 5 system accounts (`lilith_xiv`, `ash.in.october`, `vesper.exe`,
`cryptic.rose`, `mortis.kvlt`) + welcome posts. Idempotent.

New users auto-follow these accounts on signup (handled in the app).
